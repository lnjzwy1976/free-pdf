import { StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ThemedText } from '@/components/themed-text';

export default function SettingsScreen() {
  return (
    <ScreenContainer style={styles.container}>
      <ThemedText type="title">设置</ThemedText>
      <ThemedText style={styles.subtitle}>待实现功能：主题设置、缓存管理、关于我们</ThemedText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 10,
    color: 'gray',
  },
});
