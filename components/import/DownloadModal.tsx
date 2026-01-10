import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { FileManager } from '@/services/file-system/file-manager';
import { moderateScale, scale, verticalScale } from '@/utils/responsive';
// @ts-ignore: Expo SDK 54+ legacy API support
import * as FileSystem from 'expo-file-system/legacy';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface DownloadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DownloadModal({ visible, onClose, onSuccess }: DownloadModalProps) {
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleDownload = async () => {
    console.log('handleDownload', url);
    if (!url) {
      Alert.alert('提示', '请输入有效的 PDF 下载链接');
      return;
    }

    // 简单校验
    if (!url.startsWith('http')) {
      Alert.alert('错误', '链接必须以 http 或 https 开头');
      return;
    }

    setIsDownloading(true);
    setProgress(0);

    try {
      // 1. 提取文件名 (从 URL 或默认)
      let fileName = 'downloaded_file.pdf';
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && lastPart.toLowerCase().includes('.pdf')) {
        fileName = lastPart;
      } else {
        fileName = `download_${Date.now()}.pdf`;
      }

      // 2. 先下载到临时目录
      const tempUri = FileSystem.cacheDirectory + fileName;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        tempUri,
        {},
        (downloadProgress) => {
          const p = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setProgress(p);
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        // 3. 导入到书架 (Document 目录)
        await FileManager.importFile(result.uri, fileName);
        Alert.alert('下载成功', '文件已添加到书架');
        setUrl(''); // 清空
        onSuccess(); // 回调刷新
        onClose();   // 关闭弹窗
      }

    } catch (error) {
      console.error(error);
      Alert.alert('下载失败', '请检查网络或链接是否有效');
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: bgColor }]}>
          <ThemedText type="subtitle" style={styles.title}>下载网络文件</ThemedText>

          <TextInput
            style={[styles.input, { color: textColor, borderColor: textColor }]}
            placeholder="请输入 PDF 链接 (https://...)"
            placeholderTextColor="gray"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            editable={!isDownloading}
          />

          {isDownloading ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" color={tintColor} />
              <ThemedText style={styles.progressText}>
                正在下载... {Math.round(progress * 100)}%
              </ThemedText>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <ThemedText>取消</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDownload} style={[styles.downloadButton, { backgroundColor: tintColor }]}>
                <ThemedText style={{ color: '#fff' }}>立即下载</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '85%',
    borderRadius: moderateScale(20),
    padding: scale(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    marginBottom: verticalScale(15),
  },
  input: {
    width: '100%',
    height: verticalScale(44),
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    marginBottom: verticalScale(20),
    opacity: 0.5, // slightly dim border
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    padding: scale(10),
  },
  downloadButton: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: moderateScale(8),
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  progressText: {
    marginTop: verticalScale(8),
  },
});

