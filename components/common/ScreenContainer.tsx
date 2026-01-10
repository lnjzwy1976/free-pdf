import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // 明确从 react-native-safe-area-context 导入

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withSafeArea?: boolean; // 是否包裹 SafeAreaView (默认 true)
  disableSafeArea?: boolean; // 是否禁用内部 SafeAreaView (默认 false)
  backgroundColor?: string;
}

export function ScreenContainer({ 
  children, 
  style, 
  withSafeArea = true,
  disableSafeArea = false, 
  backgroundColor 
}: ScreenContainerProps) {
  const defaultBg = useThemeColor({}, 'background');
  const bg = backgroundColor || defaultBg;

  // 根据 withSafeArea 和 disableSafeArea 动态选择容器组件
  // 确保 Container 始终是一个 React 组件
  const ContainerComponent = (withSafeArea && !disableSafeArea) ? SafeAreaView : View;

  return (
    <ContainerComponent style={[styles.container, { backgroundColor: bg }, style]}>
      {children}
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
