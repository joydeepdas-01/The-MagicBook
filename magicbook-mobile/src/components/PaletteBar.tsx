import React, { useState } from 'react';
import { audioManager } from '../utils/audio.ts';

interface PaletteBarProps {
  currentColor: string;
  onSelectColor: (color: string) => void;
  recentColors: string[];
}

const DEFAULT_PALETTE = [
  '#FF0000', // Red
  '#FF5722', // Deep Orange
  '#FF9800', // Orange
  '#FFEB3B', // Yellow
  '#C6FF00', // Lime
  '#4CAF50', // Green
  '#009688', // Teal
  '#00BCD4', // Cyan
  '#2196F3', // Light Blue
  '#3F51B5', // Indigo
  '#9C27B0', // Purple
  '#E91E63', // Pink
  '#FF4081', // Hot Pink
  '#795548', // Brown
  '#8D6E63', // Light Brown
  '#FFCC80', // Peach / Skin tone
  '#FFE0B2', // Pale skin tone
  '#607D8B', // Blue Grey
  '#9E9E9E', // Grey
  '#FFFFFF', // White
  '#000000', // Black
  '#1B5E20', // Dark Forest Green
  '#0D47A1', // Navy Blue
  '#4A148C', // Dark Violet
];

export const PaletteBar: React.FC<PaletteBarProps> = ({
  currentColor,
  onSelectColor,
  recentColors,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customHex, setCustomHex] = useState(currentColor);

  return (
    <div className="bg-indigo-950/95 border-t border-indigo-800/60 px-2 py-2 flex flex-col gap-1.5 shrink-0 z-20 safe-bottom">
      {/* Scrollable Color Swatches */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar">
        {/* Custom Color Picker Button */}
        <button
          onClick={() => {
            audioManager.play('tap');
            setShowCustomPicker(!showCustomPicker);
          }}
          className="kid-btn shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-rose-500 via-amber-400 to-indigo-500 border-2 border-white shadow-md cursor-pointer"
          title="Custom Color Wheel"
        >
          <span className="text-sm sm:text-base drop-shadow">🎨</span>
        </button>

        {/* Selected Color Preview with Ring */}
        <div
          className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white shadow-inner ring-2 ring-amber-400"
          style={{ backgroundColor: currentColor }}
          title={`Active: ${currentColor}`}
        />

        <div className="w-[1px] h-6 bg-indigo-700/60 shrink-0" />

        {/* Recent Colors (if any) */}
        {recentColors.length > 0 && (
          <>
            <div className="flex items-center gap-1.5 shrink-0">
              {recentColors.slice(0, 5).map((col, idx) => (
                <button
                  key={`recent-${idx}-${col}`}
                  onClick={() => {
                    audioManager.play('color');
                    onSelectColor(col);
                  }}
                  className={`kid-btn shrink-0 w-7 h-7 rounded-full border border-white/60 shadow cursor-pointer transition ${
                    currentColor.toLowerCase() === col.toLowerCase()
                      ? 'scale-125 ring-2 ring-white z-10'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col }}
                  title={`Recent: ${col}`}
                />
              ))}
            </div>
            <div className="w-[1px] h-6 bg-indigo-700/60 shrink-0" />
          </>
        )}

        {/* Standard Palette Swatches */}
        <div className="flex items-center gap-2 shrink-0">
          {DEFAULT_PALETTE.map((col) => {
            const isSelected = currentColor.toLowerCase() === col.toLowerCase();
            return (
              <button
                key={col}
                onClick={() => {
                  audioManager.play('color');
                  onSelectColor(col);
                }}
                className={`kid-btn shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 cursor-pointer shadow-sm transition-all ${
                  isSelected
                    ? 'border-white scale-125 ring-2 ring-amber-300 z-10 shadow-lg'
                    : 'border-white/40 hover:scale-110 active:scale-95'
                }`}
                style={{ backgroundColor: col }}
                title={col}
              />
            );
          })}
        </div>
      </div>

      {/* Custom Color Modal Popup */}
      {showCustomPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-indigo-900 border-2 border-indigo-400 rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-amber-300 flex items-center gap-2">
                <span>🎨</span> Pick Any Color
              </h3>
              <button
                onClick={() => setShowCustomPicker(false)}
                className="w-8 h-8 rounded-full bg-indigo-950 hover:bg-indigo-800 flex items-center justify-center text-sm font-bold text-indigo-300"
              >
                ✕
              </button>
            </div>

            {/* Native HTML Color Input */}
            <div className="flex items-center gap-3 bg-indigo-950/80 p-3 rounded-2xl border border-indigo-700">
              <input
                type="color"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                className="w-16 h-16 rounded-xl cursor-pointer border-0 bg-transparent"
              />
              <div className="flex flex-col">
                <span className="text-xs text-indigo-300 font-medium">Selected Color</span>
                <span className="font-mono text-lg font-bold text-amber-400 uppercase">
                  {customHex}
                </span>
              </div>
            </div>

            {/* Quick Pastel & Neon Presets */}
            <div>
              <span className="text-xs text-indigo-300 font-medium block mb-1.5">
                Fun Presets:
              </span>
              <div className="grid grid-cols-6 gap-2">
                {[
                  '#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#FF78C4', '#E0C3FC',
                  '#FF9F45', '#98D8AA', '#B983FF', '#9370DB', '#00F5FF', '#FF1493',
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCustomHex(c)}
                    className="w-8 h-8 rounded-full border border-white/80 shadow"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => {
                audioManager.play('color');
                onSelectColor(customHex);
                setShowCustomPicker(false);
              }}
              className="kid-btn w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg border border-emerald-300 text-base cursor-pointer"
            >
              Use This Color ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

