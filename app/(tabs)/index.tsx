import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PdfListItem } from '@/components/pdf-library/PdfListItem';
import { EmptyState } from '@/components/common/EmptyState';
import { useFileStore } from '@/store/use-file-store';
import { PdfFile, FileManager } from '@/services/file-system/file-manager';

export default function HomeScreen() {
  const router = useRouter();
  const { files, refreshFiles } = useFileStore();

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
      '确认删除',
      `您确定要删除文件 "${file.name}" 吗？此操作不可撤销。`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await FileManager.deleteFile(file.uri);
              if (success) {
                console.log(`[File Manager] 文件 ${file.name} 删除成功`);
                refreshFiles(); // 删除成功后刷新列表
              } else {
                Alert.alert('删除失败', '文件删除失败，请稍后重试。');
              }
            } catch (error) {
              console.error('[File Manager] 删除文件时出错:', error);
              Alert.alert('删除出错', '删除文件时发生错误，请检查权限或稍后重试。');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [refreshFiles]);

  return (
    <ScreenContainer>
      <FlashList
        data={files}
        renderItem={({ item }) => (
          <PdfListItem file={item} onPress={handlePress} onDelete={handleDelete} />
        )}
        estimatedItemSize={80}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.listContent}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100, // 底部留白
  },
});
