// Componente card compatta per la board Kanban

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Card } from '../types/Task';
import { PRIORITY_CONFIG } from '../constants/priorities';

interface Props {
  card: Card;
  onPress: () => void;
  onLongPress: () => void;
  dragHandle?: () => void;  // funzione per avviare il drag (DraggableFlatList)
  isBeingDragged?: boolean;
}

const COLUMN_WIDTH = Dimensions.get('window').width * 0.78;

function isOverdue(dueDate: number | null): boolean {
  return dueDate !== null && dueDate < Date.now();
}

export default function KanbanCard({ card, onPress, onLongPress, dragHandle, isBeingDragged }: Props) {
  const priority = PRIORITY_CONFIG[card.priority];
  const checkDone = card.checklist.filter(i => i.completed).length;
  const checkTotal = card.checklist.length;
  const overdue = isOverdue(card.dueDate);

  const dueDateLabel = card.dueDate
    ? new Date(card.dueDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
    : null;

  return (
    <View style={[styles.cardWrapper, isBeingDragged && styles.cardWrapperDragging]}>
      {dragHandle && (
        <TouchableOpacity style={styles.dragHandle} onPressIn={dragHandle} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Text style={styles.dragHandleIcon}>⠿</Text>
        </TouchableOpacity>
      )}
    <TouchableOpacity
      style={[styles.card, dragHandle && styles.cardWithHandle]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
    >
      {/* Etichette colorate */}
      {card.labels.length > 0 && (
        <View style={styles.labelsRow}>
          {card.labels.map(label => (
            <View
              key={label.id}
              style={[styles.labelChip, { backgroundColor: label.color }]}
            />
          ))}
        </View>
      )}

      {/* Titolo */}
      <Text style={styles.title} numberOfLines={3}>
        {card.title}
      </Text>

      {/* Footer: badge vari */}
      <View style={styles.footer}>
        {/* Priorità */}
        <View style={[styles.badge, { backgroundColor: priority.backgroundColor }]}>
          <Text style={[styles.badgeText, { color: priority.color }]}>
            {priority.icon} {priority.label}
          </Text>
        </View>

        {/* Scadenza */}
        {dueDateLabel && (
          <View style={[styles.badge, overdue ? styles.badgeOverdue : styles.badgeDue]}>
            <Text style={[styles.badgeText, overdue ? styles.textOverdue : styles.textDue]}>
              📅 {dueDateLabel}
            </Text>
          </View>
        )}

        {/* Checklist progress */}
        {checkTotal > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              ✓ {checkDone}/{checkTotal}
            </Text>
          </View>
        )}

        {/* Immagine allegata */}
        {card.imageUri && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>📎</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardWrapperDragging: {
    opacity: 0.9,
    transform: [{ scale: 1.03 }],
  },
  dragHandle: {
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  dragHandleIcon: {
    fontSize: 16,
    color: '#A0AEC0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  cardWithHandle: {
    marginBottom: 0,
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  labelChip: {
    height: 6,
    width: 40,
    borderRadius: 3,
  },
  title: {
    fontSize: 14,
    color: '#172B4D',
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    backgroundColor: '#F4F5F7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    color: '#5E6C84',
    fontWeight: '500',
  },
  badgeOverdue: {
    backgroundColor: '#FFEBEE',
  },
  badgeDue: {
    backgroundColor: '#E8F5E9',
  },
  textOverdue: {
    color: '#F44336',
  },
  textDue: {
    color: '#388E3C',
  },
});
