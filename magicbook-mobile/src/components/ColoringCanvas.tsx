import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { Tool } from '../types.ts';
import { scanlineFloodFill, rgbToHex } from '../utils/floodFill.ts';
import { audioManager } from '../utils/audio.ts';

export interface ColoringCanvasRef {
  undo: () => void;
  redo: () => void;
  reset: () => void;
  exportDataURL: () => string;
}

interface ColoringCanvasProps {
  pageUrl: string;
  currentTool: Tool;
  currentColor: string;
  brushSize: number;
  onColorPicked: (color: string) => void;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const MAX_HISTORY = 20;

export const ColoringCanvas = forwardRef<ColoringCanvasRef, ColoringCanvasProps>(
  (
    {
      pageUrl,
      currentTool,
      currentColor,
      brushSize,
      onColorPicked,
      onHistoryChange,
      onPrevPage,
      onNextPage,
      hasPrev,
      hasNext,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const outlineImageRef = useRef<HTMLImageElement | null>(null);
    const isDrawingRef = useRef(false);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);
    const rainbowHueRef = useRef(0);

    // Keep refs for active tools & callbacks to NEVER re-trigger useEffect on state changes!
    const toolRef = useRef(currentTool);
    toolRef.current = currentTool;

    const colorRef = useRef(currentColor);
    colorRef.current = currentColor;

    const brushSizeRef = useRef(brushSize);
    brushSizeRef.current = brushSize;

    const onHistoryChangeRef = useRef(onHistoryChange);
    onHistoryChangeRef.current = onHistoryChange;

    const onColorPickedRef = useRef(onColorPicked);
    onColorPickedRef.current = onColorPicked;

    const historyStackRef = useRef<ImageData[]>([]);
    const redoStackRef = useRef<ImageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Track the URL of the currently loaded page so we NEVER reload the same page!
    const loadedPageUrlRef = useRef<string | null>(null);

    const updateHistoryButtons = useCallback(() => {
      onHistoryChangeRef.current(
        historyStackRef.current.length > 1,
        redoStackRef.current.length > 0
      );
    }, []);

    const pushHistory = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyStackRef.current.push(snapshot);
      if (historyStackRef.current.length > MAX_HISTORY) {
        historyStackRef.current.shift();
      }
      redoStackRef.current = [];
      updateHistoryButtons();
    }, [updateHistoryButtons]);

    // Re-draw black outline over brush strokes so child never covers line art
    const restoreOutlinesOverColor = useCallback(() => {
      const canvas = canvasRef.current;
      const img = outlineImageRef.current;
      if (!canvas || !img) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    }, []);

    // Load template outline page ONLY when pageUrl actually changes!
    useEffect(() => {
      if (!pageUrl) return;

      // Crucial guard: NEVER re-run if this page is already loaded!
      if (loadedPageUrlRef.current === pageUrl) {
        return;
      }
      loadedPageUrlRef.current = pageUrl;

      setIsLoading(true);
      historyStackRef.current = [];
      redoStackRef.current = [];
      updateHistoryButtons();

      const img = new Image();
      // Notice: Do NOT set crossOrigin = 'anonymous' on local bundle assets!
      img.src = pageUrl;

      img.onload = () => {
        outlineImageRef.current = img;
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 800;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Fill background with clean solid white
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw original line art
        ctx.drawImage(img, 0, 0);

        // Ensure white pixels are solid opaque white (#FFFFFF)
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);

        // Save initial state to history stack
        historyStackRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
        updateHistoryButtons();
        setIsLoading(false);
      };

      img.onerror = (e) => {
        console.error('Failed to load coloring outline:', pageUrl, e);
        setIsLoading(false);
      };
    }, [pageUrl, updateHistoryButtons]);

    // Imperative methods for Toolbar
    useImperativeHandle(ref, () => ({
      undo: () => {
        if (historyStackRef.current.length <= 1) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const current = historyStackRef.current.pop()!;
        redoStackRef.current.push(current);

        const prev = historyStackRef.current[historyStackRef.current.length - 1];
        ctx.putImageData(prev, 0, 0);
        updateHistoryButtons();
      },
      redo: () => {
        if (redoStackRef.current.length === 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const next = redoStackRef.current.pop()!;
        historyStackRef.current.push(next);
        ctx.putImageData(next, 0, 0);
        updateHistoryButtons();
      },
      reset: () => {
        const canvas = canvasRef.current;
        const img = outlineImageRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        historyStackRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
        redoStackRef.current = [];
        updateHistoryButtons();
      },
      exportDataURL: () => {
        const canvas = canvasRef.current;
        if (!canvas) return '';
        return canvas.toDataURL('image/png');
      },
    }));

    // Map screen/touch coordinates to canvas pixel space
    const getCanvasPos = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((clientX - rect.left) * scaleX);
      const y = Math.floor((clientY - rect.top) * scaleY);
      return {
        x: Math.max(0, Math.min(canvas.width - 1, x)),
        y: Math.max(0, Math.min(canvas.height - 1, y)),
      };
    };

    // Pointer Down (Mouse / Touch)
    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const activeTool = toolRef.current;
      const activeColor = colorRef.current;
      const activeSize = brushSizeRef.current;

      const pos = getCanvasPos(e.clientX, e.clientY);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      if (activeTool === 'picker') {
        const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
        audioManager.play('color');
        onColorPickedRef.current(hex);
        return;
      }

      if (activeTool === 'fill') {
        const filled = scanlineFloodFill(ctx, pos.x, pos.y, activeColor);
        if (filled) {
          audioManager.play('fill');
          pushHistory();
        }
        return;
      }

      // Drawing tools (brush, rainbow, eraser)
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}

      isDrawingRef.current = true;
      lastPosRef.current = pos;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = activeSize;

      if (activeTool === 'eraser') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
      } else if (activeTool === 'rainbow') {
        rainbowHueRef.current = (rainbowHueRef.current + 25) % 360;
        const rainbowColor = `hsl(${rainbowHueRef.current}, 100%, 50%)`;
        ctx.strokeStyle = rainbowColor;
        ctx.fillStyle = rainbowColor;
      } else {
        ctx.strokeStyle = activeColor;
        ctx.fillStyle = activeColor;
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, activeSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      restoreOutlinesOverColor();
    };

    // Pointer Move
    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || !lastPosRef.current) return;
      const activeTool = toolRef.current;
      const activeColor = colorRef.current;
      const activeSize = brushSizeRef.current;

      const pos = getCanvasPos(e.clientX, e.clientY);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = activeSize;

      if (activeTool === 'eraser') {
        ctx.strokeStyle = '#FFFFFF';
      } else if (activeTool === 'rainbow') {
        rainbowHueRef.current = (rainbowHueRef.current + 12) % 360;
        ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 100%, 50%)`;
      } else {
        ctx.strokeStyle = activeColor;
      }

      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();

      lastPosRef.current = pos;
      restoreOutlinesOverColor();
    };

    // Pointer Up
    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        lastPosRef.current = null;
        restoreOutlinesOverColor();
        audioManager.play('brush');
        pushHistory();
      }
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    };

    return (
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-slate-900/90 select-none">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-30">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-amber-300 font-bold text-sm tracking-wide">
              Loading Picture... ✨
            </p>
          </div>
        )}

        {/* Previous Page Overlay Button */}
        {hasPrev && (
          <button
            onClick={() => {
              audioManager.play('page');
              onPrevPage();
            }}
            className="kid-btn absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-indigo-700/80 hover:bg-indigo-600 active:bg-indigo-800 text-white font-black text-xl sm:text-2xl shadow-2xl border-2 border-indigo-300 flex items-center justify-center cursor-pointer backdrop-blur-sm"
            title="Previous Page"
          >
            ◀
          </button>
        )}

        {/* Next Page Overlay Button */}
        {hasNext && (
          <button
            onClick={() => {
              audioManager.play('page');
              onNextPage();
            }}
            className="kid-btn absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-indigo-700/80 hover:bg-indigo-600 active:bg-indigo-800 text-white font-black text-xl sm:text-2xl shadow-2xl border-2 border-indigo-300 flex items-center justify-center cursor-pointer backdrop-blur-sm"
            title="Next Page"
          >
            ▶
          </button>
        )}

        {/* Canvas Frame with Realistic Paper Shadow & Border */}
        <div className="relative max-w-full max-h-full flex items-center justify-center rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 bg-gradient-to-br from-amber-100 to-amber-200 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-4 border-amber-300/80">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="bg-white rounded-xl sm:rounded-2xl cursor-crosshair touch-none object-contain max-w-[92vw] sm:max-w-[85vw] max-h-[70vh] sm:max-h-[72vh] shadow-inner"
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>
    );
  }
);
