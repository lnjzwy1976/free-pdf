import { Platform } from 'react-native';

const tintColorLight = '#007AFF';
const tintColorDark = '#0A84FF';

export const Colors = {
  light: {
    text: '#1C1C1E',        // 近似纯黑，更柔和
    textSecondary: '#3C3C4399', // iOS 标准次要文本 (60% opacity)
    textTertiary: '#3C3C434D',  // 30% opacity
    textInverse: '#FFFFFF',
    
    background: '#F2F2F7',    // 系统级背景灰
    backgroundSecondary: '#FFFFFF', // 次级背景（通常用于页面）
    
    surface: '#FFFFFF',       // 卡片背景
    surfaceHighlight: '#E5E5EA',
    surfaceVariant: '#F2F2F7', // 稍微深一点的表面
    
    tint: tintColorLight,
    tintBackground: '#007AFF1A', // 10% 透明度的主题色背景
    
    border: '#C6C6C8',
    borderSoft: '#E5E5EA',    // 分割线
    
    icon: '#8E8E93',
    iconActive: tintColorLight,
    
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    
    tabIconDefault: '#999999',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#EBEBF599', // 60% white
    textTertiary: '#EBEBF54D',  // 30% white
    textInverse: '#000000',

    background: '#000000',
    backgroundSecondary: '#1C1C1E',

    surface: '#1C1C1E',
    surfaceHighlight: '#2C2C2E',
    surfaceVariant: '#2C2C2E',

    tint: tintColorDark,
    tintBackground: '#0A84FF26', // 15% opacity

    border: '#38383A',
    borderSoft: '#545458A6', // 65% opacity

    icon: '#8E8E93',
    iconActive: tintColorDark,

    error: '#FF453A',
    success: '#32D74B',
    warning: '#FFD60A',

    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Times New Roman',
    rounded: 'System', 
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'sans-serif-medium',
    mono: 'monospace',
  },
  default: {
    sans: 'system-ui',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
