import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Bookmark {
  id: string;
  fileUri: string;
  page: number;
  name: string;
  createdAt: number;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  addBookmark: (fileUri: string, page: number, name?: string) => void;
  removeBookmark: (id: string) => void;
  getBookmarksByFile: (fileUri: string) => Bookmark[];
  
  // 页面跳转通信
  jumpRequest: { fileUri: string; page: number } | null;
  requestJump: (fileUri: string, page: number) => void;
  consumeJumpRequest: () => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      jumpRequest: null,

      addBookmark: (fileUri, page, name) => {
        const newBookmark: Bookmark = {
          id: Date.now().toString(),
          fileUri,
          page,
          name: name || `第 ${page} 页`,
          createdAt: Date.now(),
        };
        set((state) => ({
          bookmarks: [newBookmark, ...state.bookmarks],
        }));
      },

      removeBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));
      },

      getBookmarksByFile: (fileUri) => {
        return get().bookmarks.filter((b) => b.fileUri === fileUri).sort((a, b) => a.page - b.page);
      },

      requestJump: (fileUri, page) => set({ jumpRequest: { fileUri, page } }),
      consumeJumpRequest: () => set({ jumpRequest: null }),
    }),
    {
      name: 'bookmark-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 不持久化 jumpRequest
      partialize: (state) => ({ bookmarks: state.bookmarks }),
    }
  )
);
