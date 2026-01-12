import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { moderateScale, scale, verticalScale } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReaderHeaderProps {
  visible: boolean;
  title: string;
  onBookmarkPress: () => void;
}

export function ReaderHeader({ visible, title, onBookmarkPress }: ReaderHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'surface'); // 实际上会覆盖透明度
  const iconColor = useThemeColor({}, 'text');
  
  // 模拟 Blur 效果的半透明背景
  const blurBgColor = useThemeColor({ 
    light: 'rgba(255,255,255,0.85)', 
    dark: 'rgba(28,28,30,0.85)' 
  }, 'surface');

  if (!visible) return null;

  const backIconName = Platform.OS === 'ios' ? 'chevron.left' : 'arrow.left';

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: blurBgColor }]}>
      <View style={styles.content}>
        <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name={backIconName} size={moderateScale(24)} color={iconColor} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.title} centered>
            {title}
          </ThemedText>
        </View>
        
        <TouchableOpacity 
            onPress={onBookmarkPress} 
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <IconSymbol name="bookmark" size={moderateScale(24)} color={iconColor} />
        </TouchableOpacity>
      </View>
      {/* 极细的分割线替代品：轻微阴影 */}
      <View style={styles.shadowLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    // iOS Blur fallback
    borderBottomWidth: 0,
  },
  content: {
    height: verticalScale(44),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(12),
  },
  iconButton: {
    padding: scale(8),
    width: scale(44),
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: scale(8),
  },
  title: {
    fontSize: moderateScale(16),
  },
  shadowLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
