import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { BookInfo, Tool, SavedArtwork } from './types.ts';
import { Header } from './components/Header.tsx';
import { Toolbar } from './components/Toolbar.tsx';
import { PaletteBar } from './components/PaletteBar.tsx';
import { ColoringCanvas, type ColoringCanvasRef } from './components/ColoringCanvas.tsx';
import { BookSelectorModal } from './components/BookSelectorModal.tsx';
import { GalleryModal } from './components/GalleryModal.tsx';
import { ParentalModal } from './components/ParentalModal.tsx';
import { audioManager } from './utils/audio.ts';

export const App: React.FC = () => {
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [currentBookId, setCurrentBookId] = useState<string>('animals-1');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  const [currentTool, setCurrentTool] = useState<Tool>('fill');
  const [currentColor, setCurrentColor] = useState<string>('#FF5722');
  const [recentColors, setRecentColors] = useState<string[]>(['#FF5722', '#4CAF50', '#2196F3', '#FFEB3B']);
  const [brushSize, setBrushSize] = useState<number>(16);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(audioManager.isEnabled());

  const [isBooksModalOpen, setIsBooksModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isParentalModalOpen, setIsParentalModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [savedArtworks, setSavedArtworks] = useState<SavedArtwork[]>([]);

  const canvasRef = useRef<ColoringCanvasRef | null>(null);

  // Load books catalog & saved artworks
  useEffect(() => {
    fetch('/books.json')
      .then((res) => res.json())
      .then((data: BookInfo[]) => {
        setBooks(data);
        if (data.length > 0) {
          setCurrentBookId(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load books.json:', err);
      });

    try {
      const stored = localStorage.getItem('magicbook_saved_artworks');
      if (stored) {
        setSavedArtworks(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const currentBook = books.find((b) => b.id === currentBookId) || books[0];
  const currentPage = currentBook?.pages[currentPageIndex];

  // Stable callbacks to avoid re-triggering child renders
  const handleSelectColor = useCallback((color: string) => {
    setCurrentColor(color);
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== color.toLowerCase());
      return [color, ...filtered].slice(0, 8);
    });
  }, []);

  const handleHistoryChange = useCallback((canU: boolean, canR: boolean) => {
    setCanUndo(canU);
    setCanRedo(canR);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    if (currentBook) {
      setCurrentPageIndex((prev) => Math.min(currentBook.pagesCount - 1, prev + 1));
    }
  }, [currentBook]);

  const handleSelectPage = useCallback((bookId: string, pageIndex: number) => {
    setCurrentBookId(bookId);
    setCurrentPageIndex(pageIndex);
  }, []);

  const handleSaveArtwork = () => {
    if (!canvasRef.current || !currentPage || !currentBook) return;
    const dataUrl = canvasRef.current.exportDataURL();
    if (!dataUrl) return;

    const newArt: SavedArtwork = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${currentBook.title} - Page ${currentPageIndex + 1}`,
      bookId: currentBook.id,
      pageIndex: currentPageIndex,
      dataUrl,
      timestamp: Date.now(),
    };

    const updated = [newArt, ...savedArtworks];
    setSavedArtworks(updated);
    try {
      localStorage.setItem('magicbook_saved_artworks', JSON.stringify(updated));
    } catch {}

    audioManager.play('cheer');
    showToast('🎉 Masterpiece Saved to Gallery! ✨');
  };

  const handleShare = () => {
    if (!canvasRef.current || !currentPage || !currentBook) return;
    const dataUrl = canvasRef.current.exportDataURL();
    if (!dataUrl) return;

    if (navigator.share) {
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `MagicBook_Art_${Date.now()}.png`, { type: 'image/png' });
          navigator.share({
            title: 'My MagicBook Coloring Art',
            text: `Look what I colored in The MagicBook: ${currentBook.title}!`,
            files: [file],
          }).catch(() => {
            triggerDirectDownload(dataUrl);
          });
        })
        .catch(() => triggerDirectDownload(dataUrl));
    } else {
      triggerDirectDownload(dataUrl);
    }
  };

  const triggerDirectDownload = (dataUrl: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `TheMagicBook_${currentBook?.title || 'Art'}_Page_${currentPageIndex + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('📥 Image Downloaded!');
  };

  const handleDeleteArtwork = (id: string) => {
    const updated = savedArtworks.filter((a) => a.id !== id);
    setSavedArtworks(updated);
    try {
      localStorage.setItem('magicbook_saved_artworks', JSON.stringify(updated));
    } catch {}
  };

  const handleClearAllArtworks = () => {
    setSavedArtworks([]);
    try {
      localStorage.removeItem('magicbook_saved_artworks');
    } catch {}
  };

  if (!currentBook || !currentPage) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-950 text-white">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-amber-300">Opening The MagicBook... ✨</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-400 to-orange-500 text-indigo-950 font-black px-5 py-2.5 rounded-full shadow-2xl border-2 border-white animate-bounce text-sm sm:text-base pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <Header
        currentBook={currentBook}
        currentPageIndex={currentPageIndex}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(audioManager.toggle())}
        onOpenBooks={() => setIsBooksModalOpen(true)}
        onOpenGallery={() => setIsGalleryModalOpen(true)}
        onOpenParental={() => setIsParentalModalOpen(true)}
      />

      {/* Main Coloring Area with Canvas */}
      <ColoringCanvas
        ref={canvasRef}
        pageUrl={`/${currentPage.url}`}
        currentTool={currentTool}
        currentColor={currentColor}
        brushSize={brushSize}
        onColorPicked={handleSelectColor}
        onHistoryChange={handleHistoryChange}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        hasPrev={currentPageIndex > 0}
        hasNext={currentPageIndex < currentBook.pagesCount - 1}
      />

      {/* Toolbar */}
      <Toolbar
        currentTool={currentTool}
        onSelectTool={setCurrentTool}
        brushSize={brushSize}
        onChangeBrushSize={setBrushSize}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => canvasRef.current?.undo()}
        onRedo={() => canvasRef.current?.redo()}
        onReset={() => canvasRef.current?.reset()}
        onSave={handleSaveArtwork}
        onShare={handleShare}
      />

      {/* Palette Color Swatches */}
      <PaletteBar
        currentColor={currentColor}
        onSelectColor={handleSelectColor}
        recentColors={recentColors}
      />

      {/* Modals */}
      {isBooksModalOpen && (
        <BookSelectorModal
          books={books}
          currentBookId={currentBookId}
          currentPageIndex={currentPageIndex}
          onSelectPage={handleSelectPage}
          onClose={() => setIsBooksModalOpen(false)}
        />
      )}

      {isGalleryModalOpen && (
        <GalleryModal
          artworks={savedArtworks}
          onDeleteArtwork={handleDeleteArtwork}
          onClose={() => setIsGalleryModalOpen(false)}
        />
      )}

      {isParentalModalOpen && (
        <ParentalModal
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(audioManager.toggle())}
          onClearAllArtworks={handleClearAllArtworks}
          onClose={() => setIsParentalModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
