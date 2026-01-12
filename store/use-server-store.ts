import { create } from 'zustand';

interface ServerState {
  isRunning: boolean;
  ipAddress: string | null;
  port: number;
  
  isUploading: boolean;
  /**
   * 说明：
   * - 用于 UI 层判断“上传刚完成”的状态（例如：上传完成后仍显示一段时间的状态/进度条）
   * - 这个字段不参与上传逻辑本身，只是为了让界面表达更清晰
   */
  uploadCompleted: boolean;
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
  uploadCompleted: false,
  uploadFileName: null,
  uploadProgress: 0,
  uploadTotalSize: 0,
  uploadReceivedSize: 0,
  uploadStatusText: '等待文件...',

  setServerStatus: ({ isRunning, ipAddress, port }) => set({ isRunning, ipAddress, port }),
  setUploadProgress: ({ isUploading, fileName, progress, totalSize, receivedSize, statusText }) =>
    set({
      isUploading,
      // 说明：当上传结束且进度达到 100% 时，标记为完成（用于 UI 持续显示“完成”状态）
      uploadCompleted: !isUploading && progress >= 100,
      uploadFileName: fileName,
      uploadProgress: progress,
      uploadTotalSize: totalSize,
      uploadReceivedSize: receivedSize,
      uploadStatusText: statusText,
    }),
  resetUploadStatus: () =>
    set({
      isUploading: false,
      uploadCompleted: false,
      uploadFileName: null,
      uploadProgress: 0,
      uploadTotalSize: 0,
      uploadReceivedSize: 0,
      uploadStatusText: '等待文件...',
    }),
}));