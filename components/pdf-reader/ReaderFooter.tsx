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
const FOOTER_MARGIN_H = scale(20); // 左右悬浮边距

const THUMB_HEIGHT = verticalScale(48);
const THUMB_WIDTH_RATIO = 1 / 1.414;
const THUMB_WIDTH = THUMB_HEIGHT * THUMB_WIDTH_RATIO;
const THUMB_GAP = scale(4);

export function ReaderFooter({ visible, totalPages, currentPage, onSeek }: ReaderFooterProps) {
  const insets = useSafeAreaInsets();
  
  // 悬浮岛背景色
  const islandColor = useThemeColor({ 
    light: 'rgba(255,255,255,0.95)', 
    dark: 'rgba(44,44,46,0.95)' 
  }, 'surface');
  
  const trackBgColor = useThemeColor({ light: '#F2F2F7', dark: '#1C1C1E' }, 'background');
  const activeBorderColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'textSecondary');
  const activeTextColor = useThemeColor({}, 'tint');

  const containerWidth = SCREEN_WIDTH - FOOTER_MARGIN_H * 2;
  const paddingInner = scale(10);
  const availableWidth = containerWidth - paddingInner * 2;

  // 算法逻辑保持不变
  const maxThumbCount = Math.floor((availableWidth + THUMB_GAP) / (THUMB_WIDTH + THUMB_GAP));
  
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

  const totalPagesRef = useRef(totalPages);
  const currentPageRef = useRef(currentPage);

  useEffect(() => {
    totalPagesRef.current = totalPages;
    currentPageRef.current = currentPage;
  }, [totalPages, currentPage]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleTouch(evt.nativeEvent.pageX),
      onPanResponderMove: (evt) => handleTouch(evt.nativeEvent.pageX),
    })
  ).current;

  const handleTouch = (pageX: number) => {
    const currentTotal = totalPagesRef.current;
    if (currentTotal <= 0) return;
    
    // 计算相对于组件内部的坐标
    // containerLeft = FOOTER_MARGIN_H
    // contentStart = FOOTER_MARGIN_H + paddingInner
    const startX = FOOTER_MARGIN_H + paddingInner;
    const relativeX = pageX - startX;
    
    const clampedX = Math.max(0, Math.min(relativeX, availableWidth));
    const percentage = clampedX / availableWidth;
    
    const targetPage = Math.max(1, Math.min(currentTotal, Math.round(percentage * currentTotal + 0.5)));
    
    if (targetPage !== currentPageRef.current) {
       onSeek(targetPage);
    }
  };

  if (!visible) return null;

  return (
    <View 
      style={[
        styles.container, 
        { bottom: insets.bottom + verticalScale(16) } 
      ]}
      pointerEvents="box-none"
    >
      {/* 页码指示器 - 独立悬浮 */}
      <View style={[styles.pageBadge, { backgroundColor: islandColor }]}>
        <ThemedText style={styles.pageBadgeText}>
          <ThemedText style={{fontWeight: '700'}}>{currentPage}</ThemedText>
          <ThemedText style={{color: textColor, fontSize: 13}}> / {totalPages}</ThemedText>
        </ThemedText>
      </View>

      {/* 缩略图条 - 悬浮岛 */}
      <View 
        style={[
          styles.island, 
          { 
            backgroundColor: islandColor, 
            width: containerWidth,
            paddingHorizontal: paddingInner,
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.thumbnailsRow}>
          {thumbPages.map((page) => {
              const rangePerThumb = totalPages / thumbPages.length;
              const isCurrent = Math.abs(page - currentPage) < (rangePerThumb / 1.5);

              return (
                  <View 
                    key={page} 
                    style={[
                      styles.thumb, 
                      { 
                        width: THUMB_WIDTH, 
                        height: THUMB_HEIGHT, 
                        marginRight: THUMB_GAP,
                        backgroundColor: trackBgColor,
                        borderColor: isCurrent ? activeBorderColor : 'transparent',
                        borderWidth: isCurrent ? 2 : 0,
                        transform: [{ scale: isCurrent ? 1.1 : 1 }]
                      },
                    ]}
                  >
                      <ThemedText style={[styles.thumbText, { color: isCurrent ? activeTextColor : textColor }]}>
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
  pageBadge: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    marginBottom: verticalScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  pageBadgeText: {
    fontSize: moderateScale(14),
  },
  island: {
    height: verticalScale(72), 
    borderRadius: moderateScale(24), // 胶囊形状
    justifyContent: 'center',
    // 强烈的悬浮阴影
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  thumb: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  thumbText: {
    fontSize: moderateScale(8),
    fontWeight: '500',
  },
});
