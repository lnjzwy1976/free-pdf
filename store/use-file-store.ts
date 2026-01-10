import { create } from 'zustand';
import { FileManager, PdfFile } from '@/services/file-system/file-manager';

interface FileStoreState {
  files: PdfFile[];
  isLoading: boolean;
  refreshFiles: () => Promise<void>;
  deleteFile: (uri: string) => Promise<void>;
  addFile: () => Promise<void>; // 预留给导入操作
}

export const useFileStore = create<FileStoreState>((set, get) => ({
  files: [],
  isLoading: false,

  refreshFiles: async () => {
    set({ isLoading: true });
    try {
      const files = await FileManager.getAllPdfFiles();
      set({ files });
    } catch (error) {
      console.error('Failed to refresh files:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteFile: async (uri: string) => {
    // 乐观更新：先从 UI 移除
    const currentFiles = get().files;
    set({ files: currentFiles.filter((f) => f.uri !== uri) });

    // 执行实际删除
    const success = await FileManager.deleteFile(uri);
    
    // 如果失败，回滚 (简化处理，通常这里应该重新刷新列表)
    if (!success) {
      console.error('Delete failed, reverting...');
      await get().refreshFiles();
    }
  },

  addFile: async () => {
    // 这是一个 placeholder，实际导入逻辑通常在 UI 组件触发
    // 导入完成后调用 refreshFiles 即可
    await get().refreshFiles();
  },
}));

