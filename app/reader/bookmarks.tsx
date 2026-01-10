import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ThemedHeader } from '@/components/common/ThemedHeader';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Bookmark, useBookmarkStore } from '@/store/use-bookmark-store';
import { moderateScale, scale, verticalScale } from '@/utils/responsive';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function BookmarksScreen() {
  const router = useRouter();
  const { fileUri, currentPage } = useLocalSearchParams<{ fileUri: string, currentPage: string }>();
  const uri = fileUri as string;
  const currentP = parseInt(currentPage || '1', 10);
  
  const { bookmarks, addBookmark, removeBookmark, requestJump } = useBookmarkStore();
  const fileBookmarks = bookmarks.filter(b => b.fileUri === uri).sort((a, b) => a.page - b.page);

  const [modalVisible, setModalVisible] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState('');

  const handleAddPress = () => {
    setNewBookmarkName(`第 ${currentP} 页`);
    setModalVisible(true);
  };

  const handleConfirmAdd = () => {
    addBookmark(uri, currentP, newBookmarkName);
    setModalVisible(false);
  };

  const handleItemPress = (page: number) => {
    requestJump(uri, page);
    router.back();
  };

  const renderItem = ({ item }: { item: Bookmark }) => {
    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemPress(item.page)}>
        <View style={styles.itemInfo}>
            <ThemedText style={styles.itemTitle}>{item.name}</ThemedText>
            <View style={styles.pageBadge}>
                <ThemedText style={styles.pageText}>P {item.page}</ThemedText>
            </View>
        </View>
        <TouchableOpacity 
            onPress={() => removeBookmark(item.id)} 
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <IconSymbol name="trash" size={moderateScale(20)} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="bookmark.fill" size={moderateScale(48)} color="#ddd" />
      <ThemedText style={styles.emptyText}>暂无书签</ThemedText>
      <ThemedText style={styles.emptySubText}>点击右上角 + 添加当前页</ThemedText>
    </View>
  );

  return (
    <ScreenContainer backgroundColor="#fff" disableSafeArea={true}>
      <Stack.Screen options={{ headerShown: false }} />

      <ThemedHeader 
        title="书签" 
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity 
            onPress={handleAddPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ paddingRight: scale(0) }}
          >
            <IconSymbol name="plus" size={moderateScale(24)} color="#000" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={fileBookmarks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmptyComponent}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <ThemedText type="subtitle" style={styles.modalTitle}>添加书签</ThemedText>
                <ThemedText style={styles.modalSubtitle}>当前位置: 第 {currentP} 页</ThemedText>
                
                <TextInput 
                    style={styles.input} 
                    value={newBookmarkName}
                    onChangeText={setNewBookmarkName}
                    placeholder="输入书签名称"
                    autoFocus
                    selectTextOnFocus
                />

                <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtn}>
                        <ThemedText style={{ color: '#666' }}>取消</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleConfirmAdd} style={styles.modalBtn}>
                        <ThemedText style={{color: '#007AFF', fontWeight: 'bold'}}>保存</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: scale(20),
    flexGrow: 1, 
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: moderateScale(16),
    color: '#333',
    marginRight: scale(10),
  },
  pageBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  pageText: {
    fontSize: moderateScale(12),
    color: '#666',
  },
  deleteButton: {
    padding: scale(8),
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#eee',
  },
  emptyContainer: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center', 
    paddingBottom: verticalScale(50), 
  },
  emptyText: {
    color: '#333',
    fontSize: moderateScale(16),
    marginTop: verticalScale(16),
    fontWeight: '600',
  },
  emptySubText: {
    color: '#999',
    marginTop: verticalScale(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(4),
  },
  modalTitle: {
    marginBottom: verticalScale(4),
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: moderateScale(12),
    color: 'gray',
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginBottom: verticalScale(24),
    fontSize: moderateScale(16),
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(20),
  },
  modalBtn: {
    padding: scale(10),
  }
});