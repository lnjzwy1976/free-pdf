// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Add 'partial' to allow for missing keys if needed, but here we want strong typing
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * Add your SF Symbols to Material Icons mappings here.
 */
const MAPPING: Record<string, MaterialIconName> = {
  // Navigation
  'house.fill': 'home',
  'arrow.down.doc.fill': 'file-download',
  'gear': 'settings',
  
  // Actions & UI
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'arrow.left': 'arrow-back',
  'plus': 'add',
  'trash': 'delete',
  'link': 'link',
  'wifi': 'wifi',
  
  // Files
  'folder.fill': 'folder',
  'doc.text.fill': 'description',
  'cloud.download.fill': 'cloud-download',
  
  // Settings & Status
  'sun.max.fill': 'brightness-6',
  'info.circle.fill': 'info',
  'hammer.fill': 'build', // or 'construction'
  
  // Reader
  'bookmark.fill': 'bookmark',
  'bookmark': 'bookmark-border',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'arrow.up': 'arrow-upward',
};

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
