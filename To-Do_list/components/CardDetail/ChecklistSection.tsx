// Checklist interna alla card

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { ChecklistItem } from '../../types/Task';

interface Props {
  items: ChecklistItem[];
  onToggle: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onAdd: (text: string) => void;
}

export default function ChecklistSection({ items, onToggle, onDelete, onAdd }: Props) {
  const [newText, setNewText] = useState('');

  const done = items.filter(i => i.completed).length;
  const total = items.length;
  const progress = total > 0 ? done / total : 0;

  function handleAdd() {
    if (!newText.trim()) return;
    onAdd(newText.trim());
    setNewText('');
  }

  return (
    <View>
      {/* Barra progresso */}
      {total > 0 && (
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{done}/{total}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` as any }]} />
          </View>
        </View>
      )}

      {/* Lista item */}
      {items.map(item => (
        <View key={item.id} style={styles.itemRow}>
          <TouchableOpacity
            style={[styles.checkbox, item.completed && styles.checkboxDone]}
            onPress={() => onToggle(item.id)}
          >
            {item.completed && <Text style={styles.checkMark}>✓</Text>}
          </TouchableOpacity>
          <Text style={[styles.itemText, item.completed && styles.itemTextDone]}>
            {item.text}
          </Text>
          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Aggiungi voce */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Aggiungi voce…"
          placeholderTextColor="#A0AEC0"
          value={newText}
          onChangeText={setNewText}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, !newText.trim() && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!newText.trim()}
        >
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E6C84',
    minWidth: 28,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#EBECF0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#61BD4F',
    borderRadius: 3,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F7',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#C1C7D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: '#0079BF',
    borderColor: '#0079BF',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#172B4D',
  },
  itemTextDone: {
    textDecorationLine: 'line-through',
    color: '#A0AEC0',
  },
  deleteText: {
    fontSize: 14,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#172B4D',
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#0079BF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#A0AEC0',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
});
