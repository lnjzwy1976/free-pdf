import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { moderateScale, scale, verticalScale } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ThemedHeaderProps {
  title: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export function ThemedHeader({ title, onBackPress, rightComponent }: ThemedHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const backIconName = Platform.OS === 'ios' ? 'chevron.left' : 'arrow.left';

  return (
    <View style={[styles.container, { paddingTop: insets.top, height: verticalScale(44) + insets.top }]}>
      <View style={styles.content}>
        <TouchableOpacity 
            onPress={handleBack} 
            style={styles.leftButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name={backIconName} size={moderateScale(28)} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.title}>
            {title}
          </ThemedText>
        </View>
        
        <View style={styles.rightComponentContainer}>
            {rightComponent}
        </View>
      </View>
      <View style={styles.borderBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)', // 半透明背景
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    zIndex: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
  },
  leftButton: {
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
  rightComponentContainer: {
    minWidth: moderateScale(40), // 确保有足够的点击区域和显示空间
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
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

