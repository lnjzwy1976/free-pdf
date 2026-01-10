import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { moderateScale, scale, verticalScale } from '@/utils/responsive';
import React, { useEffect, useMemo, useRef } from 'react';
import { Dimensions, PanResponder, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReaderFooterProps {
  visible: boolean;
  totalPages: number;
  currentPage: number;
  onSeek: (page: number) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const FOOTER_PADDING_H = scale(16);

// 缩略图尺寸
const THUMB_HEIGHT = verticalScale(50);
const THUMB_WIDTH_RATIO = 1 / 1.414; // A4 比例
const THUMB_WIDTH = THUMB_HEIGHT * THUMB_WIDTH_RATIO;
const THUMB_GAP = scale(2);

export function ReaderFooter({ visible, totalPages, currentPage, onSeek }: ReaderFooterProps) {
  const insets = useSafeAreaInsets();
  const bgColor = useThemeColor({}, 'background'); 
  
  // 容器相关尺寸
  const trackContainerWidth = SCREEN_WIDTH - FOOTER_PADDING_H * 2;
  const trackInnerPadding = scale(8);
  const availableTrackWidth = trackContainerWidth - trackInnerPadding * 2;
  
  // TrackContainer 在屏幕上的左边界 X 坐标 (假设居中)
  const trackContainerX = FOOTER_PADDING_H; 

  // 动态计算最大可容纳数量
  const maxThumbCount = Math.floor((availableTrackWidth + THUMB_GAP) / (THUMB_WIDTH + THUMB_GAP));
  const thumbCountToRender = Math.min(totalPages, maxThumbCount);

  // 计算显示的页码
  const thumbPages = useMemo(() => {
    if (totalPages <= 0) return [];
    if (totalPages <= maxThumbCount) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    const step = (totalPages - 1) / (maxThumbCount - 1);
    for (let i = 1; i < maxThumbCount - 1; i++) {
      pages.push(Math.round(1 + i * step));
    }
    pages.push(totalPages);
    return Array.from(new Set(pages)).sort((a, b) => a - b);
  }, [totalPages, maxThumbCount]);

  // 使用 ref 来追踪最新的 props，避免 PanResponder 闭包陷阱
  const totalPagesRef = useRef(totalPages);
  const currentPageRef = useRef(currentPage);

  // 每次渲染都更新 ref
  useEffect(() => {
    totalPagesRef.current = totalPages;
    currentPageRef.current = currentPage;
  }, [totalPages, currentPage]);

  // 手势处理
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      
      onPanResponderGrant: (evt, gestureState) => {
        handleTouch(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt, gestureState) => {
        handleTouch(evt.nativeEvent.pageX);
      },
    })
  ).current;

  const handleTouch = (pageX: number) => {
    const currentTotal = totalPagesRef.current;
    if (currentTotal <= 0) return;
    
    // 计算相对于 Track 内部内容的 X 坐标
    const trackContentStartX = trackContainerX + trackInnerPadding;
    const relativeX = pageX - trackContentStartX;
    const clampedX = Math.max(0, Math.min(relativeX, availableTrackWidth));
    const percentage = clampedX / availableTrackWidth;
    
    const targetPage = Math.max(1, Math.min(currentTotal, Math.round(percentage * currentTotal + 0.5)));
    
    // 只有当页码变化显著时才触发
    if (targetPage !== currentPageRef.current) {
       onSeek(targetPage);
    }
  };

  if (!visible) return null;

  return (
    <View 
      style={[
        styles.container, 
        { bottom: insets.bottom + verticalScale(20) } 
      ]}
      pointerEvents="box-none"
    >
      {/* 页码气泡 */}
      <View style={styles.pageBadge}>
          <ThemedText style={styles.pageBadgeText}>{currentPage} / {totalPages}</ThemedText>
      </View>

      <View 
        style={[styles.trackContainer, { backgroundColor: bgColor, width: trackContainerWidth }]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.thumbnailsRow, { paddingHorizontal: trackInnerPadding }]}>
          {thumbPages.map((page) => {
              // 选中状态：当前页码在“该缩略图负责的页码范围”内
              // 每个缩略图负责的范围大小
              const rangePerThumb = totalPages / thumbPages.length;
              // 寻找离 currentPage 最近的 thumbPage
              // 或者简单判断距离
              const isCurrent = Math.abs(page - currentPage) < (rangePerThumb / 1.5);

              return (
                  <View 
                    key={page} 
                    style={[
                      styles.thumb, 
                      { width: THUMB_WIDTH, height: THUMB_HEIGHT, marginRight: THUMB_GAP },
                      isCurrent && styles.activeThumb
                    ]}
                  >
                      <ThemedText style={[styles.thumbText, isCurrent && { color: 'blue', fontWeight: 'bold' }]}>
                        {page}
                      </ThemedText>
                  </View>
              );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  trackContainer: {
    height: verticalScale(70), 
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  thumb: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    overflow: 'hidden',
  },
  activeThumb: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    transform: [{ scale: 1.15 }],
    zIndex: 1, // 选中时浮起
  },
  thumbText: {
    fontSize: moderateScale(8),
    color: '#666',
  },
  pageBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)', // 淡灰色
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10), // 与 Track 的间距
  },
  pageBadgeText: {
    fontSize: moderateScale(12),
    color: '#333',
    fontWeight: '600',
  }
});
