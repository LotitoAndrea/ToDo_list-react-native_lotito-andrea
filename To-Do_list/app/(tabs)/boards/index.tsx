// Schermata lista board — home dell'app

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBoard } from '../../../hooks/useBoard';
import { BOARD_EMOJIS, BOARD_BG_COLORS } from '../../../constants/priorities';

export default function BoardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { boards, columns, cards, deleteBoard, addBoard, isLoading } = useBoard();

  const [createModal, setCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('📋');
  const [newColor, setNewColor] = useState(BOARD_BG_COLORS[0]);

  async function handleCreate() {
    if (!newTitle.trim()) return;
    const id = await addBoard(newTitle.trim(), newEmoji, newColor);
    setNewTitle('');
    setNewEmoji('📋');
    setNewColor(BOARD_BG_COLORS[0]);
    setCreateModal(false);
    router.push(`/(tabs)/boards/${id}` as any);
  }

  function handleDelete(boardId: string, boardTitle: string) {
    if (boards.length <= 1) {
      if (Platform.OS === 'web') {
        (globalThis as any).alert?.('Non puoi eliminare l\'ultima board.');
      } else {
        Alert.alert('Impossibile eliminare', 'Non puoi eliminare l\'ultima board.');
      }
      return;
    }
    const doDelete = () => deleteBoard(boardId);
    if (Platform.OS === 'web') {
      if ((globalThis as any).confirm?.(`Eliminare la board "${boardTitle}"? Verranno eliminate anche tutte le sue card.`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Elimina board',
        `Eliminare "${boardTitle}"? Verranno eliminate anche tutte le sue card.`,
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Elimina', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F5F7" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Le mie Board</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setCreateModal(true)}>
          <Text style={styles.addBtnText}>＋ Nuova</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {boards.map(board => {
          const boardCols = columns.filter(c => c.boardId === board.id);
          const boardCards = cards.filter(c => c.boardId === board.id);
          return (
            <TouchableOpacity
              key={board.id}
              style={[styles.boardCard, { backgroundColor: board.color }]}
              onPress={() => router.push(`/(tabs)/boards/${board.id}` as any)}
              activeOpacity={0.85}
            >
              {/* Delete button */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(board.id, board.title)}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.boardEmoji}>{board.emoji}</Text>
              <Text style={styles.boardTitle} numberOfLines={2}>{board.title}</Text>
              {board.description ? (
                <Text style={styles.boardDesc} numberOfLines={2}>{board.description}</Text>
              ) : null}
              <View style={styles.boardStats}>
                <Text style={styles.boardStat}>🗂 {boardCols.length} col.</Text>
                <Text style={styles.boardStat}>🃏 {boardCards.length} card</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal crea board */}
      <Modal visible={createModal} transparent animationType="slide" onRequestClose={() => setCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
            <Text style={styles.modalTitle}>Nuova Board</Text>

            {/* Selezione emoji */}
            <Text style={styles.fieldLabel}>Icona</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
              {BOARD_EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiBtn, newEmoji === e && styles.emojiBtnActive]}
                  onPress={() => setNewEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Nome */}
            <Text style={styles.fieldLabel}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="es. Progetto Alpha"
              placeholderTextColor="#A0AEC0"
              autoFocus
            />

            {/* Colore */}
            <Text style={styles.fieldLabel}>Colore</Text>
            <View style={styles.colorRow}>
              {BOARD_BG_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, newColor === c && styles.colorDotActive]}
                  onPress={() => setNewColor(c)}
                />
              ))}
            </View>

            {/* Anteprima */}
            <View style={[styles.preview, { backgroundColor: newColor }]}>
              <Text style={styles.previewEmoji}>{newEmoji}</Text>
              <Text style={styles.previewTitle}>{newTitle || 'Nome board…'}</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateModal(false)}>
                <Text style={styles.cancelBtnText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !newTitle.trim() && styles.confirmBtnDisabled]}
                onPress={handleCreate}
                disabled={!newTitle.trim()}
              >
                <Text style={styles.confirmBtnText}>Crea Board</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#172B4D' },
  addBtn: {
    backgroundColor: '#0079BF', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingBottom: 24, gap: 12,
  },
  boardCard: {
    width: '47%', minWidth: 150, borderRadius: 14,
    padding: 16, minHeight: 140,
  },
  deleteBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  boardEmoji: { fontSize: 28, marginBottom: 8 },
  boardTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  boardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  boardStats: { flexDirection: 'row', gap: 10, marginTop: 'auto' as any },
  boardStat: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#172B4D', marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#7A869A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 12 },
  emojiRow: { flexDirection: 'row', marginBottom: 4 },
  emojiBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F4F5F7', marginRight: 8,
  },
  emojiBtnActive: { backgroundColor: '#E3F2FD', borderWidth: 2, borderColor: '#0079BF' },
  emojiText: { fontSize: 22 },
  input: {
    backgroundColor: '#F4F5F7', borderRadius: 10, padding: 12,
    fontSize: 16, color: '#172B4D',
  },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 4 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 3, borderColor: '#172B4D' },
  preview: {
    borderRadius: 12, padding: 16, marginTop: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  previewEmoji: { fontSize: 28 },
  previewTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#F4F5F7', alignItems: 'center',
  },
  cancelBtnText: { color: '#5E6C84', fontWeight: '600', fontSize: 15 },
  confirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#0079BF', alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
