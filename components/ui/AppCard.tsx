import React from 'react';
import { StyleSheet, View, ViewStyle, Platform, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { moderateScale } from '@/utils/responsive';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function AppCard({ children, style, onPress, variant = 'elevated' }: AppCardProps) {
  const backgroundColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'borderSoft');
  const shadowColor = useThemeColor({ light: '#000000', dark: '#000000' }, 'text'); // Dark mode shadow usually invisible

  const cardStyle = [
    styles.card,
    { backgroundColor },
    variant === 'outlined' && { borderWidth: 1, borderColor },
    variant === 'elevated' && styles.elevated(shadowColor),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress} 
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    overflow: 'hidden', // Ensure content respects border radius
  },
  elevated: (shadowColor: string) => Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
    default: {
      borderWidth: 1,
      borderColor: '#eee',
    },
  }),
});

