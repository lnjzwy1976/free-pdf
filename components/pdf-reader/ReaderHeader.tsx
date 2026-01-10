import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
// import { useThemeColor } from '@/hooks/use-theme-color'; // 不再需要，除非要自定义Header背景等
import { moderateScale, scale, verticalScale } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'; // 引入 Platform
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReaderHeaderProps {
  visible: boolean;
  title: string;
  onBookmarkPress: () => void;
}

export function ReaderHeader({ visible, title, onBookmarkPress }: ReaderHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // const tintColor = useThemeColor({}, 'tint'); // 不再使用，因为要保持原生风格

  if (!visible) return null;

  // 根据平台选择返回图标：iOS 是 'chevron.left'，Android 通常是 'arrow.back'
  const backIconName = Platform.OS === 'ios' ? 'chevron.left' : 'arrow.left';
  // Expo Vector Icons 中 'arrow.left' 对应 MaterialIcons 的 'arrow-back'
  // 需要在 IconSymbol 中进行映射，或者直接使用 MaterialIcons

  return (
    <View style={[styles.container, { paddingTop: insets.top, height: verticalScale(44) + insets.top }]}>
      <View style={styles.content}>
        <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {/* 统一为黑色，与原生导航栏风格一致 */}
          <IconSymbol name={backIconName} size={moderateScale(28)} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.title}>
            {title}
          </ThemedText>
        </View>
        
        <TouchableOpacity 
            onPress={onBookmarkPress} 
            style={styles.rightButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            {/* 统一为黑色 */}
            <IconSymbol name="bookmark.fill" size={moderateScale(24)} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.borderBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)', // 半透明背景
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
  },
  backButton: {
    padding: scale(8),
    marginLeft: -scale(8),
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: scale(16),
  },
  title: {
    fontSize: moderateScale(16),
  },
  rightButton: {
    padding: scale(8),
    marginRight: -scale(8),
  },
  borderBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ccc',
  },
});
