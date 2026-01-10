import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { DownloadModal } from '@/components/import/DownloadModal';
import { ImportOptionCard } from '@/components/import/ImportOptionCard';
import { ServerModal } from '@/components/import/ServerModal';
import { ThemedText } from '@/components/themed-text';
import { FileManager } from '@/services/file-system/file-manager';
import { useFileStore } from '@/store/use-file-store';
import { scale, verticalScale } from '@/utils/responsive';

export default function ImportScreen() {
  const router = useRouter();
  const { refreshFiles } = useFileStore();
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [serverModalVisible, setServerModalVisible] = useState(false);

  const handleLocalImport = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true, 
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!file) return;

      const savedUri = await FileManager.importFile(file.uri, file.name);

      if (savedUri) {
        Alert.alert('导入成功', `文件 ${file.name} 已保存到书架`, [
          { 
            text: '去查看', 
            onPress: async () => {
              await refreshFiles(); 
              router.push('/(tabs)');
            }
          },
          { text: '继续导入', onPress: () => refreshFiles() } 
        ]);
      } else {
        Alert.alert('导入失败', '无法保存文件');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('错误', '选择文件时发生错误');
    }
  }, [refreshFiles, router]);

  const handleNetworkDownload = () => {
    setDownloadModalVisible(true);
  };

  const handleWifiTransfer = () => {
    setServerModalVisible(true);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.headerTitle}>导入 PDF</ThemedText>
        <ThemedText style={styles.headerSubtitle}>选择一种方式将 PDF 添加到书架</ThemedText>

        <ImportOptionCard
          title="本地文件导入"
          description="从手机存储、iCloud 或 Google Drive 选择 PDF"
          icon="folder.fill"
          onPress={handleLocalImport}
        />

        <ImportOptionCard
          title="网络链接下载"
          description="输入 URL 直接下载 PDF 文件"
          icon="link"
          onPress={handleNetworkDownload}
        />

        <ImportOptionCard
          title="局域网无线传输"
          description="在电脑浏览器上传文件到手机"
          icon="wifi"
          onPress={handleWifiTransfer}
        />
      </ScrollView>

      <DownloadModal 
        visible={downloadModalVisible}
        onClose={() => setDownloadModalVisible(false)}
        onSuccess={() => {
          refreshFiles();
        }}
      />

      <ServerModal
        visible={serverModalVisible}
        onClose={() => {
            setServerModalVisible(false);
            // refreshFiles(); // 刷新操作移到 ServerModal 内部的 stopServer 函数调用之后
        }}
        refreshFiles={refreshFiles} // 传递 refreshFiles 回调
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: verticalScale(40),
  },
  headerTitle: {
    marginTop: verticalScale(20),
    marginHorizontal: scale(16),
  },
  headerSubtitle: {
    marginHorizontal: scale(16),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(24),
    color: 'gray',
  },
});
