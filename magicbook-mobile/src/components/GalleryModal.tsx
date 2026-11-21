import React, { useState } from 'react';
import type { SavedArtwork } from '../types.ts';
import { audioManager } from '../utils/audio.ts';

interface GalleryModalProps {
  artworks: SavedArtwork[];
  onDeleteArtwork: (id: string) => void;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  artworks,
  onDeleteArtwork,
  onClose,
}) => {
  const [selectedArtwork, setSelectedArtwork] = useState<SavedArtwork | null>(null);

  const handleDownload = (art: SavedArtwork) => {
    audioManager.play('tap');
    const a = document.createElement('a');
    a.href = art.dataUrl;
    a.download = `MagicBook_${art.title.replace(/\s+/g, '_')}_${art.timestamp}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-indigo-950 border-2 border-amber-400/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-indigo-900/90 border-b border-indigo-700/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🖼️</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-300">
                My Colored Artworks
              </h2>
              <p className="text-xs text-indigo-300 font-medium">
                {artworks.length} saved masterpiece{artworks.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="kid-btn w-9 h-9 rounded-full bg-indigo-800 hover:bg-indigo-700 border border-indigo-500 text-indigo-200 flex items-center justify-center font-bold text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Gallery Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900/60">
          {artworks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <span className="text-5xl mb-3">🎨</span>
              <h3 className="font-bold text-lg text-amber-300 mb-1">
                No Saved Pictures Yet!
              </h3>
              <p className="text-xs text-indigo-300 max-w-xs">
                Color any picture and tap the <strong>💾 Save</strong> button in the toolbar to save your colored artwork here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {artworks.map((art) => (
                <div
                  key={art.id}
                  className="bg-white rounded-2xl p-2.5 shadow-lg border-2 border-indigo-200 flex flex-col group relative"
                >
                  <div
                    onClick={() => {
                      audioManager.play('tap');
                      setSelectedArtwork(art);
                    }}
                    className="aspect-square bg-slate-50 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center mb-2"
                  >
                    <img
                      src={art.dataUrl}
                      alt={art.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition"
                    />
                  </div>

                  <span className="font-bold text-xs text-slate-800 truncate mb-1">
                    {art.title}
                  </span>
                  <span className="text-[10px] text-slate-500 mb-2">
                    {new Date(art.timestamp).toLocaleDateString()}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 mt-auto">
                    <button
                      onClick={() => handleDownload(art)}
                      className="kid-btn flex-1 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center gap-1"
                      title="Download image"
                    >
                      <span>📥</span> Save
                    </button>
                    <button
                      onClick={() => {
                        audioManager.play('clear');
                        onDeleteArtwork(art.id);
                      }}
                      className="kid-btn px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[11px]"
                      title="Delete picture"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fullscreen Preview Lightbox */}
        {selectedArtwork && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-60 flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-lg border border-slate-600 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            <div className="max-w-2xl max-h-[75vh] bg-white rounded-3xl p-3 shadow-2xl mb-4 flex items-center justify-center">
              <img
                src={selectedArtwork.dataUrl}
                alt={selectedArtwork.title}
                className="max-h-full max-w-full object-contain rounded-2xl"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownload(selectedArtwork)}
                className="kid-btn px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 font-bold text-sm text-white shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>📥</span> Download Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

