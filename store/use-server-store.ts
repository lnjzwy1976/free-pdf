import { create } from 'zustand';

interface ServerState {
  isRunning: boolean;
  ipAddress: string | null;
  port: number;
  
  isUploading: boolean;
  uploadFileName: string | null;
  uploadProgress: number; // 0-100
  uploadTotalSize: number; // bytes
  uploadReceivedSize: number; // bytes
  uploadStatusText: string; // 例如 "正在上传..." "上传完成" "上传失败"

  setServerStatus: (status: { isRunning: boolean; ipAddress: string | null; port: number }) => void;
  setUploadProgress: (progress: {
    isUploading: boolean;
    fileName: string | null;
    progress: number;
    totalSize: number;
    receivedSize: number;
    statusText: string;
  }) => void;
  resetUploadStatus: () => void;
}

export const useServerStore = create<ServerState>((set) => ({
  isRunning: false,
  ipAddress: null,
  port: 0,
  
  isUploading: false,
  uploadFileName: null,
  uploadProgress: 0,
  uploadTotalSize: 0,
  uploadReceivedSize: 0,
  uploadStatusText: '等待文件...',

  setServerStatus: ({ isRunning, ipAddress, port }) => set({ isRunning, ipAddress, port }),
  setUploadProgress: ({ isUploading, fileName, progress, totalSize, receivedSize, statusText }) =>
    set({
      isUploading,
      uploadFileName: fileName,
      uploadProgress: progress,
      uploadTotalSize: totalSize,
      uploadReceivedSize: receivedSize,
      uploadStatusText: statusText,
    }),
  resetUploadStatus: () =>
    set({
      isUploading: false,
      uploadFileName: null,
      uploadProgress: 0,
      uploadTotalSize: 0,
      uploadReceivedSize: 0,
      uploadStatusText: '等待文件...',
    }),
}));