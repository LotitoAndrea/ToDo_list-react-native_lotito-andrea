// Selezione e gestione etichette colorate

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Label } from '../../types/Task';
import { LABEL_COLORS } from '../../constants/priorities';

interface Props {
  labels: Label[];
  onAdd: (label: Label) => void;
  onRemove: (labelId: string) => void;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function LabelPicker({ labels, onAdd, onRemove }: Props) {
  const [labelText, setLabelText] = useState('');
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].color);

  function handleAdd() {
    const alreadyAdded = labels.some(l => l.color === selectedColor);
    if (alreadyAdded) return;
    onAdd({ id: makeId(), text: labelText.trim(), color: selectedColor });
    setLabelText('');
  }

  return (
    <View>
      {/* Etichette correnti */}
      {labels.length > 0 && (
        <View style={styles.currentLabels}>
          {labels.map(label => (
            <View key={label.id} style={[styles.labelChip, { backgroundColor: label.color }]}>
              <Text style={styles.labelChipText}>{label.text || '●'}</Text>
              <TouchableOpacity onPress={() => onRemove(label.id)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Text style={styles.labelRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Colori disponibili */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
        {LABEL_COLORS.map(lc => {
          const isSelected = selectedColor === lc.color;
          return (
            <TouchableOpacity
              key={lc.id}
              style={[
                styles.colorDot,
                { backgroundColor: lc.color },
                isSelected && styles.colorDotSelected,
              ]}
              onPress={() => setSelectedColor(lc.color)}
            >
              {isSelected && <Text style={styles.colorCheck}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Nome etichetta + aggiungi */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Nome etichetta (opzionale)"
          placeholderTextColor="#A0AEC0"
          value={labelText}
          onChangeText={setLabelText}
          maxLength={20}
        />
        <TouchableOpacity
          style={[
            styles.addBtn,
            { backgroundColor: selectedColor },
            labels.some(l => l.color === selectedColor) && styles.addBtnDisabled,
          ]}
          onPress={handleAdd}
          disabled={labels.some(l => l.color === selectedColor)}
        >
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  currentLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  labelChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  labelRemove: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '700',
  },
  colorScroll: {
    marginBottom: 10,
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorDotSelected: {
    borderWidth: 2.5,
    borderColor: '#172B4D',
  },
  colorCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  textInput: {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
});
