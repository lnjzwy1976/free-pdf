import { useFileStore } from '@/store/use-file-store';
import { useServerStore } from '@/store/use-server-store';
import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';
import { FileManager } from '../file-system/file-manager';
import { NetworkInfo } from './network-info';

const { LanTransferModule } = NativeModules;

// 浏览器端上传页面 HTML
const INDEX_HTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF 传输助手</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f7; }
        .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px; }
        h1 { margin-top: 0; font-size: 24px; }
        .upload-zone { border: 2px dashed #007AFF; border-radius: 8px; padding: 40px; text-align: center; cursor: pointer; transition: 0.2s; background: #f0f7ff; }
        .upload-zone:hover { background: #e0f0ff; }
        #fileInput { display: none; }
        #status { margin-top: 16px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="card">
        <h1>PDF 局域网传输</h1>
        <div class="upload-zone" onclick="document.getElementById('fileInput').click()">
            <p style="color: #007AFF; font-weight: 500;">点击选择文件</p>
        </div>
        <input type="file" id="fileInput" accept=".pdf" onchange="uploadFile(this.files[0])">
        <p id="status"></p>
    </div>

    <script>
        async function uploadFile(file) {
            if (!file) return;
            const status = document.getElementById('status');
            status.style.color = '#666';
            
            try {
                status.innerText = '正在读取文件...';
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    let base64Data = e.target.result;
                    // 去掉 Data URL 前缀 (data:application/pdf;base64,)
                    const commaIndex = base64Data.indexOf(',');
                    if (commaIndex !== -1) {
                        base64Data = base64Data.substring(commaIndex + 1);
                    }
                    
                    status.innerText = '正在上传...';
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/upload', true);
                    
                    xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
                    xhr.setRequestHeader('Content-Type', 'text/plain');
                    
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const percent = Math.round((e.loaded / e.total) * 100);
                            status.innerText = '发送进度: ' + percent + '%';
                        }
                    };
                    
                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            status.innerText = '上传成功！';
                            status.style.color = 'green';
                            document.getElementById('fileInput').value = '';
                        } else {
                            status.innerText = '上传失败';
                            status.style.color = 'red';
                        }
                    };
                    
                    xhr.onerror = () => {
                        status.innerText = '网络错误';
                        status.style.color = 'red';
                    };
                    xhr.send(base64Data);
                };
                reader.readAsDataURL(file);
                
            } catch (e) {
                status.innerText = '上传失败: ' + e.message;
                status.style.color = 'red';
            }
        }
    </script>
</body>
</html>
`;

/**
 * 局域网传输 HTTP 服务器
 * 使用原生模块 (Android / iOS) 处理文件上传
 */
class LocalHttpServer {
  port = 0;
  isRunning = false;

  /**
   * 启动服务器
   * @returns 服务器 URL
   */
  async start(): Promise<string> {
    const ipAddress = await NetworkInfo.getIpAddress();

    // 支持 Android 和 iOS 原生模块
    if ((Platform.OS === 'android' || Platform.OS === 'ios') && LanTransferModule) {
      console.log('[LocalServer] Starting Native Module...');

      const port = await LanTransferModule.start(INDEX_HTML);
      this.port = port;
      this.isRunning = true;

      // 注册原生事件监听器
      this.registerNativeEventListeners();

      const url = `http://${ipAddress}:${port}`;
      useServerStore.getState().setServerStatus({
        isRunning: true,
        ipAddress: ipAddress,
        port: this.port
      });

      return url;
    }

    throw new Error('LanTransferModule not available. Only Android is supported.');
  }

  /**
   * 注册原生模块事件监听器
   */
  private registerNativeEventListeners() {
    // 上传开始
    DeviceEventEmitter.removeAllListeners('onUploadStart');
    DeviceEventEmitter.addListener('onUploadStart', (e) => {
      console.log('[Native] Upload Start:', e);
      useServerStore.getState().setUploadProgress({
        isUploading: true,
        fileName: e.fileName,
        progress: 0,
        totalSize: e.totalSize,
        receivedSize: 0,
        statusText: '准备接收...',
      });
    });

    // 上传进度
    DeviceEventEmitter.removeAllListeners('onUploadProgress');
    DeviceEventEmitter.addListener('onUploadProgress', (e) => {
      const progress = e.totalSize > 0 ? Math.floor((e.receivedSize / e.totalSize) * 100) : 0;
      useServerStore.getState().setUploadProgress({
        isUploading: true,
        fileName: '',
        progress: progress,
        totalSize: e.totalSize,
        receivedSize: e.receivedSize,
        statusText: `正在接收: ${progress}%`,
      });
    });

    // 上传完成
    DeviceEventEmitter.removeAllListeners('onUploadComplete');
    DeviceEventEmitter.addListener('onUploadComplete', async (e) => {
      console.log('[Native] Upload Complete:', e.filePath);

      useServerStore.getState().setUploadProgress({
        isUploading: false,
        fileName: e.fileName,
        progress: 100,
        totalSize: 0,
        receivedSize: 0,
        statusText: '接收完成，正在导入...',
      });

      // 导入文件到应用目录
      try {
        await FileManager.importFile(e.filePath, decodeURIComponent(e.fileName));
        useFileStore.getState().refreshFiles();
      } catch (err) {
        console.error('[Native] Import error:', err);
      }
    });

    // 上传错误
    DeviceEventEmitter.removeAllListeners('onUploadError');
    DeviceEventEmitter.addListener('onUploadError', (e) => {
      console.error('[Native] Upload Error:', e.message);
      useServerStore.getState().setUploadProgress({
        isUploading: false,
        fileName: '',
        progress: 0,
        totalSize: 0,
        receivedSize: 0,
        statusText: `错误: ${e.message}`,
      });
    });
  }

  /**
   * 停止服务器
   */
  stop() {
    if (LanTransferModule) {
      LanTransferModule.stop();
    }
    this.isRunning = false;
    this.port = 0;
    useServerStore.getState().setServerStatus({ isRunning: false, ipAddress: null, port: 0 });
    useServerStore.getState().resetUploadStatus();
  }
}

export const HttpServer = new LocalHttpServer();