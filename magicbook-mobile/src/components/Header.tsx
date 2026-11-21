import React from 'react';
import { audioManager } from '../utils/audio.ts';
import type { BookInfo } from '../types.ts';

interface HeaderProps {
  currentBook: BookInfo;
  currentPageIndex: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenBooks: () => void;
  onOpenGallery: () => void;
  onOpenParental: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBook,
  currentPageIndex,
  soundEnabled,
  onToggleSound,
  onOpenBooks,
  onOpenGallery,
  onOpenParental,
}) => {
  return (
    <header className="safe-top bg-indigo-900/90 backdrop-blur-md border-b border-indigo-700/50 px-3 py-2 flex items-center justify-between text-white shrink-0 z-20 shadow-md">
      {/* Left: App Logo & Books Library Picker */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            audioManager.play('tap');
            onOpenBooks();
          }}
          className="kid-btn flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm px-3 py-1.5 rounded-full shadow-lg border border-pink-400/40 cursor-pointer"
          title="Open Books Library"
        >
          <span className="text-base sm:text-lg">📚</span>
          <span className="hidden xs:inline">Library</span>
        </button>

        {/* Current Book & Page badge */}
        <div className="flex items-center gap-1 bg-indigo-950/70 border border-indigo-600/40 rounded-full px-2.5 py-1 text-xs sm:text-sm">
          <span>{currentBook.icon}</span>
          <span className="font-semibold text-amber-300 truncate max-w-[100px] sm:max-w-[140px]">
            {currentBook.title}
          </span>
          <span className="text-indigo-300 text-[10px] sm:text-xs font-mono ml-0.5">
            {currentPageIndex + 1}/{currentBook.pagesCount}
          </span>
        </div>
      </div>

      {/* Center: Title & Original Logo */}
      <div className="hidden md:flex items-center gap-2">
        <img src="/logo.png" alt="The MagicBook" className="w-7 h-7 object-contain drop-shadow" />
        <h1 className="font-black text-lg lg:text-xl tracking-wide bg-gradient-to-r from-amber-300 via-pink-400 to-sky-300 bg-clip-text text-transparent">
          The MagicBook ✨
        </h1>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Gallery button */}
        <button
          onClick={() => {
            audioManager.play('tap');
            onOpenGallery();
          }}
          className="kid-btn flex items-center gap-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-amber-950 font-bold text-xs sm:text-sm px-2.5 py-1.5 rounded-full shadow border border-amber-300 cursor-pointer"
          title="Saved Artworks Gallery"
        >
          <span className="text-sm sm:text-base">🖼️</span>
          <span className="hidden sm:inline">Gallery</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className={`kid-btn w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border text-sm sm:text-base cursor-pointer shadow ${
            soundEnabled
              ? 'bg-emerald-600 border-emerald-400 text-white'
              : 'bg-slate-700 border-slate-500 text-slate-400'
          }`}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Parental / About */}
        <button
          onClick={() => {
            audioManager.play('tap');
            onOpenParental();
          }}
          className="kid-btn w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-indigo-800/80 hover:bg-indigo-700 active:bg-indigo-900 border border-indigo-500/50 text-indigo-200 cursor-pointer text-sm sm:text-base shadow"
          title="Parental Settings & About"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
};

