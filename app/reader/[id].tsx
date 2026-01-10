import { ReaderFooter } from '@/components/pdf-reader/ReaderFooter';
import { ReaderHeader } from '@/components/pdf-reader/ReaderHeader';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';

import { useBookmarkStore } from '@/store/use-bookmark-store';

export default function ReaderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const uri = decodeURIComponent(id as string);
  const fileName = uri.split('/').pop() || '阅读';
  
  const bgColor = useThemeColor({}, 'background');
  
  const pdfRef = useRef<Pdf>(null);
  const [totalPages, setTotalPages] = useState(0);

  // 监听书签跳转请求
  const { jumpRequest, consumeJumpRequest } = useBookmarkStore();

  // 仅用于首次渲染时的初始页 (如果直接带参数进入)
  // 不要在 JSX 中使用 page={initialPage} 强绑定，避免冲突
  const initialPage = (jumpRequest && jumpRequest.fileUri === uri) ? jumpRequest.page : 1;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hudVisible, setHudVisible] = useState(true);

  // 统一在 Focus 时处理跳转，无论是首次加载还是从书签页返回
  useFocusEffect(
    useCallback(() => {
      if (jumpRequest && jumpRequest.fileUri === uri) {
        const targetPage = Number(jumpRequest.page);
        console.log('[Reader] Jump request detected to page:', targetPage);
        
        const performJump = () => {
            if (pdfRef.current) {
                console.log('[Reader] Executing setPage...');
                pdfRef.current.setPage(targetPage);
            }
        };

        // 尝试多次跳转，确保 Native View 准备就绪
        // Android 上 View 重新可见时可能需要一点时间恢复状态
        requestAnimationFrame(performJump);
        // setTimeout(performJump, 100);
        // setTimeout(performJump, 500);

        consumeJumpRequest(); 
      }
    }, [jumpRequest, uri, consumeJumpRequest])
  );

  const source = { uri, cache: true };

  const toggleHud = () => {
    setHudVisible(!hudVisible);
    // 同时切换状态栏
    StatusBar.setHidden(hudVisible, 'fade');
  };

  const handleSeek = (page: number) => {
    if (pdfRef.current) {
      pdfRef.current.setPage(page);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 隐藏 Expo Router 默认 Header，我们用自定义的 */}
      <Stack.Screen options={{ headerShown: false }} />
      
      <Pdf
        ref={pdfRef}
        source={source}
        style={styles.pdf}
        horizontal={false}
        enablePaging={false} 
        onLoadComplete={(numberOfPages) => {
          setTotalPages(numberOfPages);
          // 首次加载时的跳转
          if (initialPage > 1 && pdfRef.current) {
              pdfRef.current.setPage(initialPage);
          }
        }}
        onPageChanged={(page) => {
          setCurrentPage(page);
        }}
        onPageSingleTap={() => {
          toggleHud();
        }}
        onError={(error) => {
          console.log(error);
        }}
        enableAntialiasing={true}
        fitPolicy={0} 
        spacing={0}
      />

      <ReaderHeader 
        visible={hudVisible}
        title={fileName}
        onBookmarkPress={() => {
          // 跳转到书签页，传递 fileUri, currentPage
          router.push({
            pathname: '/reader/bookmarks',
            params: { fileUri: uri, currentPage: currentPage.toString() }
          });
        }}
      />

      <ReaderFooter
        visible={hudVisible}
        totalPages={totalPages}
        currentPage={currentPage}
        onSeek={handleSeek}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
