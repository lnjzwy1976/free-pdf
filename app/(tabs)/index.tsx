import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfListItem } from '@/components/pdf-library/PdfListItem';
import { EmptyState } from '@/components/common/EmptyState';
import { useFileStore } from '@/store/use-file-store';
import { PdfFile, FileManager } from '@/services/file-system/file-manager';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scale, verticalScale } from '@/utils/responsive';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  const router = useRouter();
  const { files, refreshFiles } = useFileStore();
  const backgroundColor = useThemeColor({}, 'background');

  useFocusEffect(
    useCallback(() => {
      refreshFiles();
    }, [refreshFiles])
  );

  const handlePress = useCallback((file: PdfFile) => {
    router.push(`/reader/${encodeURIComponent(file.uri)}`);
  }, [router]);

  const handleDelete = useCallback((file: PdfFile) => {
    Alert.alert(
      '删除文件',
      `您确定要删除 "${file.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await FileManager.deleteFile(file.uri);
              if (success) {
                refreshFiles();
              }
            } catch (error) {
              console.error(error);
            }
          },
        },
      ]
    );
  }, [refreshFiles]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <ThemedText type="largeTitle" style={styles.headerTitle}>书架</ThemedText>
      <ThemedText type="caption" style={styles.headerSubtitle}>
        {files.length} 本书
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <StatusBar style="auto" />
      <FlashList
        data={files}
        renderItem={({ item }) => (
          <PdfListItem file={item} onPress={handlePress} onDelete={handleDelete} />
        )}
        estimatedItemSize={88}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<EmptyState title="空空如也" description="快去「导入」添加你的第一本书吧" />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
  },
  headerTitle: {
    marginBottom: verticalScale(4),
  },
  headerSubtitle: {
    marginBottom: verticalScale(16),
  },
  listContent: {
    paddingBottom: 100,
  },
});
