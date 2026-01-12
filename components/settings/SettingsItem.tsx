import React from 'react';
import { StyleSheet, TouchableOpacity, View, Switch } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scale, verticalScale, moderateScale } from '@/utils/responsive';
import { SymbolViewProps } from 'expo-symbols';

interface SettingsItemProps {
  icon: SymbolViewProps['name'];
  title: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  colorTheme?: string;
}

export function SettingsItem({ 
  icon, 
  title, 
  value, 
  onPress, 
  isSwitch, 
  switchValue, 
  onSwitchChange,
  colorTheme 
}: SettingsItemProps) {
  const backgroundColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const valueColor = useThemeColor({}, 'textSecondary');
  const iconColor = colorTheme || useThemeColor({}, 'tint');

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor }]} 
      onPress={isSwitch ? undefined : onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colorTheme ? `${colorTheme}20` : undefined }]}>
        <IconSymbol name={icon} size={moderateScale(22)} color={iconColor} />
      </View>
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        
        {isSwitch ? (
          <Switch 
            value={switchValue} 
            onValueChange={onSwitchChange} 
            trackColor={{ false: '#767577', true: '#34C759' }}
          />
        ) : (
          <View style={styles.rightContainer}>
            {value && <ThemedText style={[styles.value, { color: valueColor }]}>{value}</ThemedText>}
            <IconSymbol name="chevron.right" size={moderateScale(18)} color="#C7C7CC" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    backgroundColor: 'white',
  },
  iconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA', // Inner separator
    paddingVertical: verticalScale(4),
  },
  title: {
    fontSize: moderateScale(16),
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: moderateScale(16),
    marginRight: scale(8),
  },
});

