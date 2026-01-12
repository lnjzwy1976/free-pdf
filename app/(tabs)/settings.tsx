import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { SettingsItem } from '@/components/settings/SettingsItem';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scale, verticalScale } from '@/utils/responsive';

export default function SettingsScreen() {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="largeTitle">设置</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" style={styles.sectionHeader}>外观</ThemedText>
          <View style={styles.sectionBody}>
             {/* 占位功能 */}
            <SettingsItem 
              icon="sun.max.fill" 
              title="深色模式" 
              isSwitch 
              switchValue={false} 
              onSwitchChange={() => {}} 
              colorTheme="#007AFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" style={styles.sectionHeader}>关于</ThemedText>
          <View style={styles.sectionBody}>
            <SettingsItem 
              icon="info.circle.fill" 
              title="版本" 
              value="1.0.0" 
              onPress={() => {}} 
              colorTheme="#8E8E93"
            />
            <SettingsItem 
              icon="hammer.fill" 
              title="开发者" 
              value="LNJZWY" 
              onPress={() => {}} 
              colorTheme="#FF9500"
            />
          </View>
        </View>
        
        <View style={styles.footer}>
            <ThemedText type="caption" centered style={{ opacity: 0.5 }}>
                Free PDF Reader
            </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: verticalScale(40),
  },
  header: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionHeader: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(8),
    textTransform: 'uppercase',
  },
  sectionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
  },
  footer: {
      marginTop: verticalScale(20),
  }
});
