// @ts-ignore: Expo SDK 54+ legacy API support
import * as FileSystem from 'expo-file-system/legacy';

export interface PdfFile {
  id: string; // 通常使用文件 URI 作为 ID
  name: string;
  uri: string;
  size?: number; // bytes
  modificationTime?: number; // timestamp
}

// 获取 App 的文档目录路径
// 注意: 在 Android 上，这通常是内部存储；用户无法通过文件管理器直接访问，除了我们的 App
const DOCUMENT_DIR = FileSystem.documentDirectory;

class FileManagerService {
  /**
   * 确保文档目录存在
   */
  async ensureDirExists() {
    if (!DOCUMENT_DIR) return;
    const dirInfo = await FileSystem.getInfoAsync(DOCUMENT_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(DOCUMENT_DIR, { intermediates: true });
    }
  }

  /**
   * 扫描文档目录下的所有 PDF 文件
   */
  async getAllPdfFiles(): Promise<PdfFile[]> {
    if (!DOCUMENT_DIR) return [];

    try {
      await this.ensureDirExists();
      console.log('[FileManager] Scanning directory:', DOCUMENT_DIR);
      const files = await FileSystem.readDirectoryAsync(DOCUMENT_DIR);
      console.log('[FileManager] Found files:', files);

      const pdfFiles: PdfFile[] = [];

      // 并行获取文件信息
      await Promise.all(
        files.map(async (fileName) => {
          // 修复：先清理文件名中的潜在空白字符再检查后缀
          // 注意：文件名可能包含 \n 等，这里我们尝试匹配
          const cleanName = fileName.trim();

          // 简单过滤 .pdf 后缀 (忽略大小写)
          if (!cleanName.toLowerCase().endsWith('.pdf')) {
            // 尝试更宽松的检查，比如文件名包含 .pdf
            if (!fileName.toLowerCase().includes('.pdf')) {
              return;
            }
          }

          const uri = DOCUMENT_DIR + fileName;
          const info = await FileSystem.getInfoAsync(uri);

          if (info.exists && !info.isDirectory) {
            pdfFiles.push({
              id: uri,
              name: fileName.replace(/[\r\n]+/g, '').trim(), // 显示给用户时清理名字
              uri: uri,
              size: info.size,
              modificationTime: info.modificationTime,
            });
          }
        })
      );

      // 按修改时间倒序排列
      return pdfFiles.sort((a, b) => (b.modificationTime || 0) - (a.modificationTime || 0));

    } catch (error) {
      console.error('Error scanning PDF files:', error);
      return [];
    }
  }

  /**
   * 导入文件: 将外部文件复制到 Document 目录
   */
  async importFile(sourceUri: string, fileName: string): Promise<string | null> {
    try {
      // 修复：清理输入文件名
      const sanitizedFileName = fileName.replace(/[\r\n\t\0]/g, '').trim();
      console.log(`[FileManager] Importing file from ${sourceUri} to root with name ${sanitizedFileName}`);

      await this.ensureDirExists();
      // 处理文件名冲突: 如果存在同名文件，添加时间戳
      let newName = sanitizedFileName;
      let destinationUri = DOCUMENT_DIR + newName;

      const fileInfo = await FileSystem.getInfoAsync(destinationUri);
      if (fileInfo.exists) {
        const timestamp = new Date().getTime();
        const dotIndex = sanitizedFileName.lastIndexOf('.');
        if (dotIndex !== -1) {
          newName = `${sanitizedFileName.substring(0, dotIndex)}_${timestamp}${sanitizedFileName.substring(dotIndex)}`;
        } else {
          newName = `${sanitizedFileName}_${timestamp}`;
        }
        destinationUri = DOCUMENT_DIR + newName;
      }

      console.log(`[FileManager] Copying to ${destinationUri}`);
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationUri,
      });
      console.log('[FileManager] Copy success');

      return destinationUri;
    } catch (error) {
      console.error('Error importing file:', error);
      return null;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(uri: string): Promise<boolean> {
    try {
      await FileSystem.deleteAsync(uri);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

export const FileManager = new FileManagerService();

