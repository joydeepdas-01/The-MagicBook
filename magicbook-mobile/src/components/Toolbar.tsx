import React from 'react';
import type { Tool } from '../types.ts';
import { audioManager } from '../utils/audio.ts';

interface ToolbarProps {
  currentTool: Tool;
  onSelectTool: (tool: Tool) => void;
  brushSize: number;
  onChangeBrushSize: (size: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onSave: () => void;
  onShare: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  brushSize,
  onChangeBrushSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onSave,
  onShare,
}) => {
  const tools: { id: Tool; label: string; icon: string; bg: string }[] = [
    { id: 'fill', label: 'Bucket', icon: '🪣', bg: 'from-amber-400 to-orange-500' },
    { id: 'brush', label: 'Brush', icon: '🖌️', bg: 'from-blue-400 to-indigo-600' },
    { id: 'rainbow', label: 'Rainbow', icon: '🌈', bg: 'from-pink-400 via-purple-500 to-cyan-400' },
    { id: 'eraser', label: 'Eraser', icon: '🧹', bg: 'from-rose-400 to-red-600' },
    { id: 'picker', label: 'Dropper', icon: '💧', bg: 'from-teal-400 to-emerald-600' },
  ];

  return (
    <div className="bg-indigo-900/90 backdrop-blur-md border-t border-indigo-700/50 px-2 py-1.5 flex items-center justify-between gap-1 shrink-0 z-20 shadow-lg overflow-x-auto">
      {/* Tool buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {tools.map((t) => {
          const isActive = currentTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                audioManager.play('color');
                onSelectTool(t.id);
              }}
              className={`kid-btn relative flex flex-col items-center justify-center w-11 h-12 sm:w-13 sm:h-13 rounded-2xl cursor-pointer transition-all ${
                isActive
                  ? `bg-gradient-to-b ${t.bg} text-white shadow-md ring-2 ring-white scale-105 font-bold`
                  : 'bg-indigo-950/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/40'
              }`}
              title={t.label}
            >
              <span className="text-xl sm:text-2xl leading-none">{t.icon}</span>
              <span className="text-[10px] leading-tight mt-0.5 font-medium">{t.label}</span>
              {isActive && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full ring-2 ring-indigo-900 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Brush Size selector (active for brush, rainbow, eraser) */}
      {(currentTool === 'brush' || currentTool === 'rainbow' || currentTool === 'eraser') && (
        <div className="flex items-center gap-1 bg-indigo-950/80 border border-indigo-700/60 rounded-xl px-1.5 py-1">
          {[
            { size: 6, label: 'S', dot: 'w-2 h-2' },
            { size: 16, label: 'M', dot: 'w-3.5 h-3.5' },
            { size: 30, label: 'L', dot: 'w-5 h-5' },
          ].map((b) => (
            <button
              key={b.size}
              onClick={() => {
                audioManager.play('tap');
                onChangeBrushSize(b.size);
              }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition ${
                brushSize === b.size
                  ? 'bg-amber-400 text-indigo-950 shadow font-bold'
                  : 'bg-indigo-900/60 text-indigo-300 hover:bg-indigo-800'
              }`}
              title={`Brush Size ${b.label}`}
            >
              <span className={`${b.dot} rounded-full bg-current`} />
            </button>
          ))}
        </div>
      )}

      {/* Action buttons (Undo, Redo, Reset, Save, Share) */}
      <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
        {/* Undo */}
        <button
          onClick={() => {
            if (canUndo) {
              audioManager.play('tap');
              onUndo();
            }
          }}
          disabled={!canUndo}
          className={`kid-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg border cursor-pointer ${
            canUndo
              ? 'bg-indigo-800 hover:bg-indigo-700 border-indigo-500 text-white'
              : 'bg-indigo-950/40 border-indigo-900 text-indigo-700 cursor-not-allowed'
          }`}
          title="Undo"
        >
          ↩️
        </button>

        {/* Redo */}
        <button
          onClick={() => {
            if (canRedo) {
              audioManager.play('tap');
              onRedo();
            }
          }}
          disabled={!canRedo}
          className={`kid-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg border cursor-pointer ${
            canRedo
              ? 'bg-indigo-800 hover:bg-indigo-700 border-indigo-500 text-white'
              : 'bg-indigo-950/40 border-indigo-900 text-indigo-700 cursor-not-allowed'
          }`}
          title="Redo"
        >
          ↪️
        </button>

        {/* Clear/Reset */}
        <button
          onClick={() => {
            audioManager.play('clear');
            onReset();
          }}
          className="kid-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-rose-900/70 hover:bg-rose-800 border border-rose-500/60 text-rose-200 cursor-pointer"
          title="Clear & Reset Page"
        >
          🗑️
        </button>

        {/* Save */}
        <button
          onClick={() => {
            audioManager.play('sparkle');
            onSave();
          }}
          className="kid-btn flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl shadow border border-emerald-300 cursor-pointer"
          title="Save to Gallery"
        >
          <span>💾</span>
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Download/Share */}
        <button
          onClick={() => {
            audioManager.play('tap');
            onShare();
          }}
          className="kid-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-sky-600 hover:bg-sky-500 border border-sky-300 text-white cursor-pointer shadow"
          title="Download / Share PNG"
        >
          📤
        </button>
      </div>
    </div>
  );
};

