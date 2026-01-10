import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { moderateScale, scale, verticalScale } from '@/utils/responsive';
import { SymbolViewProps } from 'expo-symbols';

interface ImportOptionCardProps {
  title: string;
  description: string;
  icon: SymbolViewProps['name'];
  onPress: () => void;
}

export function ImportOptionCard({ title, description, icon, onPress }: ImportOptionCardProps) {
  const backgroundColor = useThemeColor({}, 'background'); // 这里应该用 card 背景色，暂时用 background
  const iconColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor, borderColor }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <IconSymbol name={icon} size={moderateScale(32)} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
      </View>
      <View style={styles.arrowContainer}>
        <IconSymbol name="chevron.right" size={moderateScale(20)} color="gray" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    // 简单的阴影
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(25),
    backgroundColor: '#f5f5f5', // 浅灰色背景
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(16),
    marginBottom: verticalScale(4),
  },
  description: {
    fontSize: moderateScale(12),
    color: 'gray',
  },
  arrowContainer: {
    marginLeft: scale(8),
  },
});

