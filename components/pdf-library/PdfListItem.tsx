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
  onDelete: (file: PdfFile) => void; // 新增 onDelete 属性
}

export const PdfListItem = React.memo(({ file, onPress, onDelete }: PdfListItemProps) => {
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border'); 
  // const deleteIconColor = useThemeColor({ light: 'red', dark: 'red' }, 'tint'); // 移除红色主题色
  const deleteIconColor = iconColor; // 使用与普通图标相同的颜色

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <TouchableOpacity style={[styles.container, { borderColor }]} onPress={() => onPress(file)}>
      <View style={styles.iconContainer}>
         {/* 暂时用图标代替缩略图 */}
        <IconSymbol name="arrow.down.doc.fill" size={moderateScale(40)} color={iconColor} />
      </View>
      <View style={styles.infoContainer}>
        <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.title}>{file.name}</ThemedText>
        <ThemedText style={styles.meta}>{formatSize(file.size)}</ThemedText>
      </View>
      {/* 删除按钮 */}
      <TouchableOpacity 
        onPress={() => onDelete(file)} 
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // 扩大点击区域
      >
        <IconSymbol name="trash" size={moderateScale(20)} color={deleteIconColor} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: scale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(50),
    height: verticalScale(70), // 模拟书本比例
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(4),
    marginRight: scale(12),
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: moderateScale(16),
  },
  meta: {
    fontSize: moderateScale(12),
    color: 'gray',
    marginTop: verticalScale(4),
  },
  deleteButton: {
    padding: scale(8),
  },
});
