// Componente colonna della board Kanban

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Column as ColumnType, Card } from '../types/Task';
import { Priority } from '../types/Task';
import { PRIORITY_CONFIG } from '../constants/priorities';
import KanbanCard from './KanbanCard';

interface Props {
  column: ColumnType;
  cards: Card[];
  onAddCard: (columnId: string, title: string, priority: Priority) => void;
  onCardPress: (cardId: string) => void;
  onMoveCard: (cardId: string) => void; // apre il modal di spostamento
}

const COLUMN_WIDTH = Dimensions.get('window').width * 0.78;

export default function Column({ column, cards, onAddCard, onCardPress, onMoveCard }: Props) {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>(Priority.MEDIUM);

  function handleAddCard() {
    if (!newTitle.trim()) return;
    onAddCard(column.id, newTitle.trim(), selectedPriority);
    setNewTitle('');
    setSelectedPriority(Priority.MEDIUM);
    setAddModalVisible(false);
  }

  return (
    <View style={[styles.column, { width: COLUMN_WIDTH }]}>
      {/* Header colonna */}
      <View style={[styles.header, { backgroundColor: column.color }]}>
        <Text style={styles.headerTitle}>{column.title}</Text>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{cards.length}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setAddModalVisible(true)}
            style={styles.addButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista card */}
      <ScrollView
        style={styles.cardList}
        contentContainerStyle={styles.cardListContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {cards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nessuna card</Text>
            <Text style={styles.emptyHint}>Premi ＋ per aggiungerne una</Text>
          </View>
        ) : (
          cards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              onPress={() => onCardPress(card.id)}
              onLongPress={() => onMoveCard(card.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Modal: aggiungi card */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAddModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>
                  Nuova card in "{column.title}"
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Titolo della card…"
                  placeholderTextColor="#A0AEC0"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  autoFocus
                  multiline
                  returnKeyType="done"
                />

                {/* Selezione priorità */}
                <Text style={styles.priorityLabel}>Priorità</Text>
                <View style={styles.priorityRow}>
                  {([Priority.LOW, Priority.MEDIUM, Priority.HIGH] as Priority[]).map(p => {
                    const cfg = PRIORITY_CONFIG[p];
                    const active = selectedPriority === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.priorityBtn,
                          { borderColor: cfg.color },
                          active && { backgroundColor: cfg.backgroundColor },
                        ]}
                        onPress={() => setSelectedPriority(p)}
                      >
                        <Text style={[styles.priorityBtnText, { color: cfg.color }]}>
                          {cfg.icon} {cfg.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Bottoni azione */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setAddModalVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>Annulla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmBtn, !newTitle.trim() && styles.confirmBtnDisabled]}
                    onPress={handleAddCard}
                    disabled={!newTitle.trim()}
                  >
                    <Text style={styles.confirmBtnText}>Aggiungi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#EBECF0',
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  cardList: {
    flex: 1,
  },
  cardListContent: {
    padding: 12,
    paddingBottom: 16,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7A869A',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#A0AEC0',
    fontSize: 12,
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#172B4D',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  priorityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5E6C84',
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  priorityBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  priorityBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#5E6C84',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0079BF',
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#A0AEC0',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
