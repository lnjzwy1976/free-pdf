import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PdfFile } from '@/services/file-system/file-manager';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scale, verticalScale, moderateScale } from '@/utils/responsive';

interface PdfListItemProps {
  file: PdfFile;
  onPress: (file: PdfFile) => void;
  onDelete: (file: PdfFile) => void;
}

export const PdfListItem = React.memo(({ file, onPress, onDelete }: PdfListItemProps) => {
  const backgroundColor = useThemeColor({}, 'surface');
  const iconColor = useThemeColor({}, 'tint');
  const iconBgColor = useThemeColor({}, 'tintBackground'); // 使用定义的 tintBackground
  const borderColor = useThemeColor({}, 'borderSoft');
  const deleteColor = useThemeColor({}, 'textSecondary');
  
  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // 简单的日期格式化 (假设 file 对象后续会增加 date 字段，这里暂时只显示大小)
  // const dateStr = new Date().toLocaleDateString(); 

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor, borderColor }]} 
      onPress={() => onPress(file)}
      activeOpacity={0.7}
    >
      {/* 模拟书本封面 */}
      <View style={[styles.coverContainer, { backgroundColor: iconBgColor }]}>
         <IconSymbol name="doc.text.fill" size={moderateScale(32)} color={iconColor} />
      </View>

      <View style={styles.contentContainer}>
        <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.title}>
          {file.name}
        </ThemedText>
        <View style={styles.metaContainer}>
          <ThemedText type="caption" style={styles.metaText}>{formatSize(file.size)}</ThemedText>
          <ThemedText type="caption" style={styles.metaText}>PDF</ThemedText>
        </View>
      </View>

      {/* 操作区 */}
      <TouchableOpacity 
        onPress={() => onDelete(file)} 
        style={styles.actionButton}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <IconSymbol name="trash" size={moderateScale(20)} color={deleteColor} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    // borderBottomWidth: StyleSheet.hairlineWidth, // 可选：分割线
    marginBottom: verticalScale(8),
    marginHorizontal: scale(16),
    borderRadius: moderateScale(16), // 卡片圆角
    // 阴影效果交给 Shadow 组件或在外部控制，这里做成 Flat 风格看起来更现代
  },
  coverContainer: {
    width: scale(48),
    height: scale(64), // 3:4 比例
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: scale(8),
  },
  title: {
    fontSize: moderateScale(16),
    marginBottom: verticalScale(4),
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  metaText: {
    opacity: 0.8,
  },
  actionButton: {
    padding: scale(8),
  },
});
