// Board Kanban per singola board

import React, { useState } from 'react';
import {
  View, Text, FlatList, ScrollView, ActivityIndicator,
  StyleSheet, Modal, TouchableOpacity, Dimensions, Platform, StatusBar, Alert,
  TextInput, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBoard } from '../../../hooks/useBoard';
import Column from '../../../components/Column';

const COLUMN_WIDTH = Dimensions.get('window').width * 0.78;

const COL_COLORS = [
  '#0079BF', '#FF9F1A', '#61BD4F', '#EB5A46',
  '#C377E0', '#00C2E0', '#FF78CB', '#4BBC4E',
];

export default function BoardScreen() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const router = useRouter();
  const {
    getBoard, columnsForBoard, cardsForColumn, cards,
    addCard, moveCard, moveCardToBoard, reorderCards,
    addColumn, deleteColumn,
    boards, isLoading,
  } = useBoard();

  const [moveModalCardId, setMoveModalCardId] = useState<string | null>(null);
  const [moveToBoardModal, setMoveToBoardModal] = useState(false);
  const [addColModal, setAddColModal] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColColor, setNewColColor] = useState(COL_COLORS[0]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0079BF" />
        <Text style={styles.loadingText}>Caricamento board…</Text>
      </View>
    );
  }

  const board = getBoard(boardId ?? '');
  if (!board) {
    return (
      <View style={styles.loading}>
        <Text style={styles.notFound}>Board non trovata.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>← Indietro</Text></TouchableOpacity>
      </View>
    );
  }

  const columns = columnsForBoard(boardId ?? '');
  const boardCards = cards.filter(c => c.boardId === boardId);
  const cardBeingMoved = moveModalCardId ? cards.find(c => c.id === moveModalCardId) : null;

  const otherBoards = boards.filter(b => b.id !== boardId);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F5F7" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: board.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.boardEmoji}>{board.emoji}</Text>
        <View style={{ flex: 1 }}>  
          <Text style={styles.headerTitle} numberOfLines={1}>{board.title}</Text>
          <Text style={styles.headerSub}>{boardCards.length} card · {columns.length} colonne</Text>
        </View>
      </View>

      {/* Colonne */}
      {Platform.OS === 'web' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.boardContentWeb}>
          {columns.map(col => (
            <Column
              key={col.id}
              column={col}
              cards={cardsForColumn(col.id)}
              onAddCard={(colId, title, priority) => addCard(boardId!, colId, title, priority)}
              onCardPress={(cardId) => router.push(`/card/${cardId}`)}
              onMoveCard={(cardId) => setMoveModalCardId(cardId)}
              onDeleteColumn={() => deleteColumn(col.id)}
              style={styles.columnWeb}
            />
          ))}
          {/* Aggiungi colonna — web */}
          <TouchableOpacity style={styles.addColBtn} onPress={() => { setNewColTitle(''); setNewColColor(COL_COLORS[0]); setAddColModal(true); }}>
            <Text style={styles.addColBtnText}>＋ Aggiungi colonna</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={columns}
          keyExtractor={col => col.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={styles.boardContent}
          snapToInterval={COLUMN_WIDTH + 12}
          decelerationRate="fast"
          renderItem={({ item: col }) => (
            <Column
              column={col}
              cards={cardsForColumn(col.id)}
              onAddCard={(colId, title, priority) => addCard(boardId!, colId, title, priority)}
              onCardPress={(cardId) => router.push(`/card/${cardId}`)}
              onMoveCard={(cardId) => setMoveModalCardId(cardId)}
              onDeleteColumn={() => deleteColumn(col.id)}
              reorderCards={reorderCards}
            />
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addColBtn}
              onPress={() => { setNewColTitle(''); setNewColColor(COL_COLORS[0]); setAddColModal(true); }}
            >
              <Text style={styles.addColBtnText}>{'＋\ncolonna'}</Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* Modal: aggiungi colonna */}
      <Modal visible={addColModal} transparent animationType="slide" onRequestClose={() => setAddColModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setAddColModal(false)}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Nuova colonna</Text>
                <TextInput
                  style={styles.colInput}
                  value={newColTitle}
                  onChangeText={setNewColTitle}
                  placeholder="Nome colonna es. Review…"
                  placeholderTextColor="#A0AEC0"
                  autoFocus
                />
                <Text style={styles.modalHint}>Colore intestazione:</Text>
                <View style={styles.colorPickerRow}>
                  {COL_COLORS.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colColorDot,
                        { backgroundColor: c },
                        newColColor === c && styles.colColorDotActive,
                      ]}
                      onPress={() => setNewColColor(c)}
                    />
                  ))}
                </View>
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { marginTop: 0, flex: 1 }]}
                    onPress={() => setAddColModal(false)}
                  >
                    <Text style={styles.cancelBtnText}>Annulla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmColBtn, !newColTitle.trim() && styles.confirmColBtnDisabled]}
                    onPress={async () => {
                      if (!newColTitle.trim() || !boardId) return;
                      await addColumn(boardId, newColTitle.trim(), newColColor);
                      setAddColModal(false);
                    }}
                    disabled={!newColTitle.trim()}
                  >
                    <Text style={styles.confirmColBtnText}>Crea colonna</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: sposta in colonna (stessa board) */}
      <Modal
        visible={moveModalCardId !== null && !moveToBoardModal}
        transparent animationType="fade"
        onRequestClose={() => setMoveModalCardId(null)}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMoveModalCardId(null)}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Sposta card</Text>
              {cardBeingMoved && (
                <Text style={styles.modalSub}>"{cardBeingMoved.title}"</Text>
              )}
              <Text style={styles.modalHint}>Colonna di destinazione:</Text>
              {columns.map(col => {
                const isCurrent = cardBeingMoved?.columnId === col.id;
                return (
                  <TouchableOpacity
                    key={col.id}
                    style={[styles.option, isCurrent && styles.optionActive]}
                    disabled={isCurrent}
                    onPress={async () => {
                      if (!isCurrent && moveModalCardId) await moveCard(moveModalCardId, col.id);
                      setMoveModalCardId(null);
                    }}
                  >
                    <View style={[styles.colorDot, { backgroundColor: col.color }]} />
                    <Text style={[styles.optionText, isCurrent && styles.optionTextActive]}>{col.title}</Text>
                    {isCurrent && <Text style={styles.currentBadge}>attuale</Text>}
                  </TouchableOpacity>
                );
              })}

              {/* Sposta su altra board */}
              {otherBoards.length > 0 && (
                <TouchableOpacity
                  style={styles.moveToBoardBtn}
                  onPress={() => setMoveToBoardModal(true)}
                >
                  <Text style={styles.moveToBoardBtnText}>📦 Sposta in altra board…</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setMoveModalCardId(null)}>
                <Text style={styles.cancelBtnText}>Annulla</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal: sposta in altra board */}
      <Modal
        visible={moveToBoardModal}
        transparent animationType="fade"
        onRequestClose={() => setMoveToBoardModal(false)}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMoveToBoardModal(false)}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Sposta in board</Text>
              <Text style={styles.modalHint}>Scegli la board di destinazione:</Text>
              {otherBoards.map(b => {
                const targetCols = columnsForBoard(b.id);
                const targetCol = targetCols[0]; // prima colonna (To Do)
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.option, { backgroundColor: b.color + '22' }]}
                    onPress={async () => {
                      if (!moveModalCardId) return;
                      if (!targetCol) {
                        if (Platform.OS === 'web') {
                          (globalThis as any).alert?.(`La board "${b.title}" non ha colonne. Aprila e aggiungi almeno una colonna prima.`);
                        } else {
                          Alert.alert('Nessuna colonna', `La board "${b.title}" non ha colonne. Aprila e aggiungi almeno una colonna prima.`);
                        }
                        return;
                      }
                      await moveCardToBoard(moveModalCardId, b.id, targetCol.id);
                      setMoveToBoardModal(false);
                      setMoveModalCardId(null);
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{b.emoji}</Text>
                    <Text style={styles.optionText}>{b.title}</Text>
                    {targetCol && (
                      <Text style={styles.currentBadge}>→ {targetCol.title}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setMoveToBoardModal(false); }}>
                <Text style={styles.cancelBtnText}>Annulla</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F5F7' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F5F7', gap: 12 },
  loadingText: { color: '#5E6C84', fontSize: 14 },
  notFound: { fontSize: 16, color: '#5E6C84' },
  backLink: { fontSize: 14, color: '#0079BF', fontWeight: '600' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
  },
  backBtn: { padding: 4 },
  backBtnText: { fontSize: 28, color: '#FFFFFF', fontWeight: '300', lineHeight: 30 },
  boardEmoji: { fontSize: 26 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  boardContent: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 100 : 80 },
  boardContentWeb: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 16, gap: 12, flex: 1,
  },
  columnWeb: { flex: 1, width: undefined, minWidth: 240 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    width: '100%', maxWidth: 340,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#172B4D', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#5E6C84', marginBottom: 10, fontStyle: 'italic' },
  modalHint: { fontSize: 13, color: '#7A869A', marginBottom: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 10, backgroundColor: '#F4F5F7',
    marginBottom: 8, gap: 10,
  },
  optionActive: { backgroundColor: '#EBF8FF', borderWidth: 1, borderColor: '#0079BF' },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  optionText: { fontSize: 15, fontWeight: '600', color: '#172B4D', flex: 1 },
  optionTextActive: { color: '#0079BF' },
  currentBadge: {
    fontSize: 11, color: '#0079BF', fontWeight: '600',
    backgroundColor: '#E3F2FD', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  moveToBoardBtn: {
    marginTop: 4, marginBottom: 8, paddingVertical: 12,
    borderRadius: 10, backgroundColor: '#F4F5F7',
    alignItems: 'center', borderWidth: 1, borderColor: '#DFE1E6',
    borderStyle: 'dashed' as any,
  },
  moveToBoardBtnText: { color: '#0079BF', fontWeight: '600', fontSize: 14 },
  cancelBtn: {
    marginTop: 4, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#F4F5F7', alignItems: 'center',
  },
  cancelBtnText: { color: '#5E6C84', fontWeight: '600', fontSize: 15 },
  addColBtn: {
    width: 120,
    alignSelf: 'flex-start',
    marginRight: 12,
    marginTop: Platform.OS === 'web' ? 0 : 0,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(180,180,180,0.60)',
    borderStyle: 'dashed' as any,
    backgroundColor: 'rgba(200,200,200,0.20)',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: Platform.OS === 'web' ? undefined : Dimensions.get('window').height - (Platform.OS === 'ios' ? 215 : 180),
  },
  addColBtnText: { color: 'rgba(210,210,210,0.95)', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  colInput: {
    backgroundColor: '#F4F5F7', borderRadius: 10,
    padding: 12, fontSize: 16, color: '#172B4D', marginBottom: 14,
  },
  colorPickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  colColorDot: { width: 32, height: 32, borderRadius: 16 },
  colColorDotActive: { borderWidth: 3, borderColor: '#172B4D' },
  colorDotActive: { borderWidth: 3, borderColor: '#172B4D' },
  modalActionsRow: { flexDirection: 'row', gap: 10 },
  confirmColBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    backgroundColor: '#0079BF', alignItems: 'center',
  },
  confirmColBtnDisabled: { opacity: 0.4 },
  confirmColBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
