import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { moderateScale, scale, verticalScale } from '@/utils/responsive';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SymbolViewProps } from 'expo-symbols';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: SymbolViewProps['name'];
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}: AppButtonProps) {
  // Theme Colors
  const tintColor = useThemeColor({}, 'tint');
  const whiteColor = '#FFFFFF';
  const errorColor = useThemeColor({}, 'error');
  const surfaceHighlight = useThemeColor({}, 'surfaceHighlight');
  const textPrimary = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  
  // Dynamic Styles
  let backgroundColor = 'transparent';
  let contentColor = tintColor;
  let borderWidth = 0;
  let borderColor = 'transparent';

  switch (variant) {
    case 'primary':
      backgroundColor = tintColor;
      contentColor = whiteColor;
      break;
    case 'secondary':
      backgroundColor = surfaceHighlight;
      contentColor = tintColor;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      contentColor = tintColor;
      borderWidth = 1;
      borderColor = tintColor;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      contentColor = textPrimary; // Ghost buttons usually blend with text
      break;
    case 'danger':
      backgroundColor = errorColor;
      contentColor = whiteColor;
      break;
  }

  if (disabled) {
    backgroundColor = variant === 'ghost' ? 'transparent' : surfaceHighlight;
    contentColor = textSecondary;
    borderColor = 'transparent';
  }

  const sizeStyles = {
    sm: { paddingVertical: verticalScale(6), paddingHorizontal: scale(12), borderRadius: moderateScale(8), fontSize: 14, iconSize: 16 },
    md: { paddingVertical: verticalScale(10), paddingHorizontal: scale(16), borderRadius: moderateScale(12), fontSize: 16, iconSize: 20 },
    lg: { paddingVertical: verticalScale(14), paddingHorizontal: scale(24), borderRadius: moderateScale(16), fontSize: 18, iconSize: 24 },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor,
          borderWidth,
          borderColor,
          borderRadius: currentSize.borderRadius,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={contentColor} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && (
            <View style={{ marginRight: title ? scale(8) : 0 }}>
              <IconSymbol name={icon} size={currentSize.iconSize} color={contentColor} />
            </View>
          )}
          {title && (
            <ThemedText
              type="defaultSemiBold"
              style={[
                { color: contentColor, fontSize: currentSize.fontSize },
                textStyle,
              ]}
            >
              {title}
            </ThemedText>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});

