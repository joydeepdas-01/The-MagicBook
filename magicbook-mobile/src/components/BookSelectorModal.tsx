import React, { useState } from 'react';
import type { BookInfo } from '../types.ts';
import { audioManager } from '../utils/audio.ts';

interface BookSelectorModalProps {
  books: BookInfo[];
  currentBookId: string;
  currentPageIndex: number;
  onSelectPage: (bookId: string, pageIndex: number) => void;
  onClose: () => void;
}

export const BookSelectorModal: React.FC<BookSelectorModalProps> = ({
  books,
  currentBookId,
  currentPageIndex,
  onSelectPage,
  onClose,
}) => {
  const [selectedBookId, setSelectedBookId] = useState(currentBookId);
  const activeBook = books.find((b) => b.id === selectedBookId) || books[0];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-indigo-950 border-2 border-indigo-500/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-indigo-900/90 border-b border-indigo-700/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-300">
                Choose a Picture Book
              </h2>
              <p className="text-xs text-indigo-300 font-medium">
                155 Fun Coloring Pages Across 7 Books!
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

        {/* Books Selector Carousel / Tabs */}
        <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto bg-indigo-900/50 border-b border-indigo-800/80 shrink-0 no-scrollbar">
          {books.map((b) => {
            const isCurrent = b.id === selectedBookId;
            return (
              <button
                key={b.id}
                onClick={() => {
                  audioManager.play('tap');
                  setSelectedBookId(b.id);
                }}
                className={`kid-btn shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-bold border cursor-pointer transition ${
                  isCurrent
                    ? 'bg-amber-400 border-amber-300 text-indigo-950 shadow-md scale-105'
                    : 'bg-indigo-950/80 border-indigo-700 text-indigo-200 hover:bg-indigo-800'
                }`}
              >
                <span className="text-base sm:text-lg">{b.icon}</span>
                <span>{b.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20">
                  {b.pagesCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Pages Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 bg-slate-900/60">
          {activeBook.pages.map((p, idx) => {
            const isThisPage =
              activeBook.id === currentBookId && idx === currentPageIndex;
            return (
              <button
                key={p.filename}
                onClick={() => {
                  audioManager.play('page');
                  onSelectPage(activeBook.id, idx);
                  onClose();
                }}
                className={`kid-btn group relative flex flex-col items-center bg-white rounded-2xl p-2 border-3 cursor-pointer shadow-md transition hover:scale-105 active:scale-95 ${
                  isThisPage
                    ? 'border-amber-400 ring-4 ring-amber-300/60'
                    : 'border-indigo-300/40 hover:border-indigo-400'
                }`}
              >
                {/* Thumbnail Image */}
                <div className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                  <img
                    src={p.url}
                    alt={p.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain pointer-events-none group-hover:scale-110 transition duration-200"
                  />
                </div>

                {/* Page Number Label */}
                <span className="mt-1 text-[11px] sm:text-xs font-bold text-slate-700 truncate w-full text-center">
                  Page {idx + 1}
                </span>

                {isThisPage && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-amber-200">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-indigo-950 border-t border-indigo-800 flex items-center justify-between text-xs text-indigo-300 shrink-0">
          <span>
            Book: <strong className="text-amber-300">{activeBook.title}</strong>
          </span>
          <span>{activeBook.pagesCount} total coloring pictures</span>
        </div>
      </div>
    </div>
  );
};

