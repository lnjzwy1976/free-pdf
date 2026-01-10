import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scale, verticalScale, moderateScale } from '@/utils/responsive';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ 
  title = "暂无文件", 
  description = "请到「导入」页面添加 PDF" 
}: EmptyStateProps) {
  const color = useThemeColor({}, 'icon');

  return (
    <View style={styles.container}>
      {/* Icon size 也要响应式 */}
      <IconSymbol name="house.fill" size={moderateScale(64)} color={color} />
      <ThemedText type="title" style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.description}>{description}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(20),
    marginTop: verticalScale(80),
  },
  title: {
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
    fontSize: moderateScale(20), // 假设 title 默认是 20
  },
  description: {
    color: 'gray',
    textAlign: 'center',
    fontSize: moderateScale(14),
  },
});
