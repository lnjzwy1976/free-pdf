import { ThemedText } from '@/components/themed-text';
import { HttpServer } from '@/services/local-server/http-server';
import { NetworkInfo } from '@/services/local-server/network-info';
import { useServerStore } from '@/store/use-server-store';
import { moderateScale, scale, verticalScale } from '@/utils/responsive';
import { ProgressBar } from '@react-native-community/progress-bar-android';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface ServerModalProps {
  visible: boolean;
  onClose: () => void;
  refreshFiles: () => void;
}

export function ServerModal({ visible, onClose, refreshFiles }: ServerModalProps) {
  const { 
    isRunning, ipAddress, port, 
    isUploading, uploadFileName, uploadProgress, uploadStatusText, uploadCompleted,
    setServerStatus, resetUploadStatus,
  } = useServerStore();

  const [loading, setLoading] = useState(false);

  const startServer = useCallback(async () => {
    setLoading(true);
    const ipAddr = await NetworkInfo.getIpAddress();
    
    const success = await HttpServer.start();
    
    if (success) {
      setServerStatus({ isRunning: true, ipAddress: ipAddr, port: HttpServer.port });
    } else {
      setServerStatus({ isRunning: false, ipAddress: null, port: 0 });
    }
    setLoading(false);
  }, [setServerStatus]);

  const stopServer = useCallback(() => {
    HttpServer.stop();
    resetUploadStatus();
  }, [resetUploadStatus]);

  useEffect(() => {
    if (visible) {
      startServer();
    } else {
      stopServer();
      refreshFiles();
    }
    return () => {
        if (isRunning) {
            HttpServer.stop();
        }
    };
  }, [visible, startServer, stopServer, refreshFiles, isRunning]);

  const url = ipAddress && port > 0 ? `http://${ipAddress}:${port}` : '正在启动服务...';
  const displayUrl = isRunning ? url : '服务已停止';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>局域网文件传输</ThemedText>
          
          <View style={styles.qrContainer}>
            {loading || !isRunning || !ipAddress || port === 0 ? (
              <ActivityIndicator size="large" />
            ) : (
              <QRCode value={url} size={moderateScale(200)} />
            )}
          </View>

          <ThemedText style={styles.urlText}>{displayUrl}</ThemedText>
          
          {isUploading || uploadCompleted ? (
            <View style={styles.uploadStatusContainer}>
              <ThemedText type="defaultSemiBold" style={styles.uploadFileName} numberOfLines={1}>
                {uploadFileName}
              </ThemedText>
              {Platform.OS === 'android' ? (
                <ProgressBar 
                  styleAttr="Horizontal" 
                  indeterminate={false} 
                  progress={uploadProgress / 100} 
                  style={styles.progressBar}
                  color="#007AFF"
                />
              ) : (
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                </View>
              )}
              <ThemedText style={styles.uploadProgressText}>{uploadStatusText}</ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.hint}>请在电脑浏览器输入上述地址并上传文件</ThemedText>
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>停止服务并关闭</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: moderateScale(20),
    padding: scale(24),
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    marginBottom: verticalScale(24),
    color: '#000',
  },
  qrContainer: {
    height: moderateScale(220),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  urlText: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginBottom: verticalScale(8),
    color: '#007AFF',
  },
  hint: {
    color: 'gray',
    marginBottom: verticalScale(32),
    fontSize: moderateScale(14),
  },
  closeBtn: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(24),
    marginTop: verticalScale(24),
  },
  uploadStatusContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  uploadFileName: {
    fontSize: moderateScale(16),
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  progressBar: {
    width: '90%',
    height: verticalScale(8),
    marginBottom: verticalScale(8),
  },
  progressBarBackground: {
    width: '90%',
    height: verticalScale(8),
    backgroundColor: '#e0e0e0',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
    marginBottom: verticalScale(8),
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: moderateScale(4),
  },
  uploadProgressText: {
    fontSize: moderateScale(14),
    color: 'gray',
    textAlign: 'center',
  },
});
