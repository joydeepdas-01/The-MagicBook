export type Tool = 'fill' | 'brush' | 'rainbow' | 'eraser' | 'picker';

export interface PageInfo {
  filename: string;
  url: string;
  name: string;
}

export interface BookInfo {
  id: string;
  title: string;
  icon: string;
  pagesCount: number;
  pages: PageInfo[];
}

export interface SavedArtwork {
  id: string;
  title: string;
  bookId: string;
  pageIndex: number;
  dataUrl: string;
  timestamp: number;
}

