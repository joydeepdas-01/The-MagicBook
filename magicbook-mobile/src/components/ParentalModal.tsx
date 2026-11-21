import React, { useState } from 'react';
import { audioManager } from '../utils/audio.ts';

interface ParentalModalProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClearAllArtworks: () => void;
  onClose: () => void;
}

export const ParentalModal: React.FC<ParentalModalProps> = ({
  soundEnabled,
  onToggleSound,
  onClearAllArtworks,
  onClose,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [num1] = useState(Math.floor(Math.random() * 8) + 4);
  const [num2] = useState(Math.floor(Math.random() * 8) + 3);
  const [answerInput, setAnswerInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answerInput, 10) === num1 + num2) {
      audioManager.play('cheer');
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      audioManager.play('tap');
      setErrorMsg('Incorrect answer. Please try again!');
      setAnswerInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-indigo-950 border-2 border-indigo-400 rounded-3xl w-full max-w-md shadow-2xl text-white overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-indigo-900/90 border-b border-indigo-700/60 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
            <span>🛡️</span> Parental Settings & Info
          </h2>
          <button
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="kid-btn w-8 h-8 rounded-full bg-indigo-800 hover:bg-indigo-700 border border-indigo-500 text-indigo-200 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {!isUnlocked ? (
            /* Parental Gate Challenge */
            <form onSubmit={handleVerify} className="bg-indigo-900/50 p-4 rounded-2xl border border-indigo-700/70 flex flex-col gap-3">
              <p className="text-xs text-indigo-200">
                To protect settings from little fingers, please solve this quick question:
              </p>
              <div className="text-center font-black text-xl text-amber-300 py-1">
                {num1} + {num2} = ?
              </div>
              <input
                type="number"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Enter answer"
                className="w-full text-center py-2 bg-indigo-950 border border-indigo-500 rounded-xl font-bold text-lg text-white outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
              {errorMsg && (
                <span className="text-rose-400 text-xs font-bold text-center">
                  {errorMsg}
                </span>
              )}
              <button
                type="submit"
                className="kid-btn w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm rounded-xl cursor-pointer"
              >
                Unlock Parental Controls 🔓
              </button>
            </form>
          ) : (
            /* Unlocked Controls */
            <div className="flex flex-col gap-3 bg-indigo-900/40 p-4 rounded-2xl border border-indigo-700">
              <h3 className="font-bold text-amber-300 text-sm">Parental Controls (Unlocked)</h3>
              
              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-200">Sound Effects & Audio:</span>
                <button
                  onClick={onToggleSound}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {soundEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Reset Data */}
              <div className="flex items-center justify-between pt-2 border-t border-indigo-800">
                <span className="text-xs text-indigo-200">Clear All Saved Artworks:</span>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all saved pictures?')) {
                      onClearAllArtworks();
                      audioManager.play('clear');
                      alert('All saved artworks cleared.');
                    }
                  }}
                  className="px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Clear Gallery
                </button>
              </div>
            </div>
          )}

          {/* App Provenance & Credits */}
          <div className="bg-indigo-950/60 p-3.5 rounded-2xl border border-indigo-800/80 text-[11px] text-indigo-300 leading-relaxed">
            <p className="font-bold text-amber-300 mb-1">
              About The MagicBook 🪄
            </p>
            <p className="mb-2">
              Originally created in 2008 by <strong>NirP Software</strong> (UK) for Windows desktop (VB6).
            </p>
            <p>
              Re-engineered for <strong>Android & Modern Mobile</strong> using <strong>REA</strong>, featuring:
            </p>
            <ul className="list-disc list-inside mt-1 text-indigo-200 space-y-0.5">
              <li>155 original outline coloring pages across 7 books</li>
              <li>26 authentic retro sound effects extracted from the 2008 binary</li>
              <li>Touch-optimized scanline flood fill & smooth freehand brush</li>
              <li>Android APK ready via Capacitor & installable full-screen PWA</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

