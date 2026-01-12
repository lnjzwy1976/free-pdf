import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { DownloadModal } from '@/components/import/DownloadModal';
import { ImportOptionCard } from '@/components/import/ImportOptionCard';
import { ServerModal } from '@/components/import/ServerModal';
import { ThemedText } from '@/components/themed-text';
import { FileManager } from '@/services/file-system/file-manager';
import { useFileStore } from '@/store/use-file-store';
import { scale, verticalScale } from '@/utils/responsive';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ImportScreen() {
  const router = useRouter();
  const { refreshFiles } = useFileStore();
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');

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
          { text: '继续导入', onPress: () => refreshFiles() },
          { 
            text: '去查看', 
            style: 'default',
            onPress: async () => {
              await refreshFiles(); 
              router.push('/(tabs)');
            }
          },
        ]);
      } else {
        Alert.alert('导入失败', '无法保存文件');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '选择文件时发生错误');
    }
  }, [refreshFiles, router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="largeTitle">导入文件</ThemedText>
          <ThemedText style={styles.subtitle}>
            支持多种方式将 PDF 导入到应用中
          </ThemedText>
        </View>

        {/* 主要入口：本地文件 */}
        <ImportOptionCard
          title="本地文件导入"
          description="浏览 iCloud Drive、Google Drive 或本地存储"
          icon="folder.fill"
          onPress={handleLocalImport}
          variant="primary"
          colorTheme="blue"
        />

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>其他方式</ThemedText>

        {/* 网格布局：网络下载 & 局域网 */}
        <View style={styles.gridRow}>
          <ImportOptionCard
            title="网络下载"
            description="输入 URL 下载"
            icon="cloud.download.fill"
            onPress={() => setDownloadModalVisible(true)}
            variant="grid"
            colorTheme="orange"
          />
          
          <ImportOptionCard
            title="无线传输"
            description="局域网 WiFi 传书"
            icon="wifi"
            onPress={() => setServerModalVisible(true)}
            variant="grid"
            colorTheme="green"
          />
        </View>
      </ScrollView>

      <DownloadModal 
        visible={downloadModalVisible}
        onClose={() => setDownloadModalVisible(false)}
        onSuccess={() => refreshFiles()}
      />

      <ServerModal
        visible={serverModalVisible}
        onClose={() => setServerModalVisible(false)}
        refreshFiles={refreshFiles}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(40),
  },
  header: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(24),
  },
  subtitle: {
    marginTop: verticalScale(8),
    color: '#8E8E93',
  },
  sectionTitle: {
    marginTop: verticalScale(24),
    marginBottom: verticalScale(16),
    marginLeft: scale(4),
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -scale(6), // Offset grid padding
  },
});
