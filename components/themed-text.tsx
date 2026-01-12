import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'caption' | 'callout' | 'largeTitle';
  centered?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  centered = false,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const secondaryColor = useThemeColor({ light: lightColor, dark: darkColor }, 'textSecondary');

  let textStyle = {};
  switch (type) {
    case 'largeTitle':
      textStyle = styles.largeTitle;
      break;
    case 'title':
      textStyle = styles.title;
      break;
    case 'subtitle':
      textStyle = styles.subtitle;
      break;
    case 'defaultSemiBold':
      textStyle = styles.defaultSemiBold;
      break;
    case 'caption':
      textStyle = [styles.caption, { color: secondaryColor }];
      break;
    case 'callout':
      textStyle = styles.callout;
      break;
    default:
      textStyle = styles.default;
      break;
  }

  return (
    <Text
      style={[
        { color },
        textStyle,
        centered && styles.centered,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: 0.37,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.35,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25,
    letterSpacing: 0.38,
  },
  default: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  defaultSemiBold: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  centered: {
    textAlign: 'center',
  },
});
