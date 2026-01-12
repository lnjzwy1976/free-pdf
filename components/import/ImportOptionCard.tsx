import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scale, verticalScale, moderateScale } from '@/utils/responsive';
import { SymbolViewProps } from 'expo-symbols';

interface ImportOptionCardProps {
  title: string;
  description: string;
  icon: SymbolViewProps['name'];
  onPress: () => void;
  variant?: 'primary' | 'grid'; // primary: 大卡片横向, grid: 小卡片纵向
  colorTheme?: 'blue' | 'green' | 'orange'; // 主题色
}

export function ImportOptionCard({ 
  title, 
  description, 
  icon, 
  onPress, 
  variant = 'primary',
  colorTheme = 'blue'
}: ImportOptionCardProps) {
  const backgroundColor = useThemeColor({}, 'surface');
  // 根据主题色选择图标颜色 (简化版，实际可以用 map 映射)
  const tintMap = {
    blue: '#007AFF',
    green: '#34C759',
    orange: '#FF9500',
  };
  const iconColor = tintMap[colorTheme];
  const iconBgColor = `${iconColor}1A`; // 10% opacity

  if (variant === 'grid') {
    return (
      <TouchableOpacity 
        style={[styles.container, styles.gridContainer, { backgroundColor }]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <IconSymbol name={icon} size={moderateScale(32)} color={iconColor} />
        </View>
        <View style={styles.gridTextContainer}>
          <ThemedText type="defaultSemiBold" style={styles.gridTitle}>{title}</ThemedText>
          <ThemedText type="caption" style={styles.gridDesc} numberOfLines={2}>{description}</ThemedText>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, styles.primaryContainer, { backgroundColor }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, styles.iconPrimary, { backgroundColor: iconBgColor }]}>
        <IconSymbol name={icon} size={moderateScale(36)} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
      </View>
      <View style={styles.arrowContainer}>
         <IconSymbol name="chevron.right" size={moderateScale(20)} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: scale(16),
    borderRadius: moderateScale(20), // 大圆角
    // 阴影
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: verticalScale(16),
  },
  primaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: verticalScale(100),
  },
  gridContainer: {
    flex: 1,
    alignItems: 'flex-start',
    minHeight: verticalScale(140),
    marginHorizontal: scale(6), // Grid 间距
  },
  iconContainer: {
    width: scale(56),
    height: scale(56),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  iconPrimary: {
    marginBottom: 0,
    marginRight: scale(16),
    width: scale(64),
    height: scale(64),
    borderRadius: moderateScale(18),
  },
  textContainer: {
    flex: 1,
  },
  gridTextContainer: {
    width: '100%',
  },
  title: {
    fontSize: moderateScale(18),
    marginBottom: verticalScale(4),
  },
  gridTitle: {
    fontSize: moderateScale(16),
    marginBottom: verticalScale(4),
  },
  description: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
  },
  gridDesc: {
    fontSize: moderateScale(13),
    color: '#8E8E93',
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: scale(8),
  },
});
