// Schermata dettaglio di una card — modifica in-place con salvataggio automatico

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useBoard } from '../../hooks/useBoard';
import { Priority, Label } from '../../types/Task';
import { PRIORITY_CONFIG, ROLE_CONFIG } from '../../constants/priorities';
import DueDatePicker from '../../components/CardDetail/DueDatePicker';
import LabelPicker from '../../components/CardDetail/LabelPicker';
import ChecklistSection from '../../components/CardDetail/ChecklistSection';
import ImageAttachment from '../../components/CardDetail/ImageAttachment';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const {
    getCard,
    updateCard,
    deleteCard,
    columns,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    addLabel,
    removeLabel,
    members,
    membersForCard,
    assignMemberToCard,
    unassignMemberFromCard,
    isLoading,
  } = useBoard();

  const card = getCard(id ?? '');

  // ── local editable state (salvato al blur / cambio) ────────────────────
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');

  // Sincronizza se la card viene aggiornata esternamente
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
    }
  }, [card?.id]);

  // Titolo nella navigation header
  useEffect(() => {
    navigation.setOptions({ title: title || 'Dettaglio card' });
  }, [title]);

  // ── helpers ────────────────────────────────────────────────────────────
  const saveTitle = useCallback(() => {
    if (!card || !title.trim()) return;
    updateCard(card.id, { title: title.trim() });
  }, [card, title, updateCard]);

  const saveDescription = useCallback(() => {
    if (!card) return;
    updateCard(card.id, { description });
  }, [card, description, updateCard]);

  function handleDelete() {
    // Su web Alert.alert non supporta più bottoni — usa window.confirm
    if (Platform.OS === 'web') {
      const confirmed = (globalThis as any).confirm?.("Vuoi eliminare questa card? L'azione è irreversibile.");
      if (confirmed && card) {
        deleteCard(card.id).then(() => router.back());
      }
      return;
    }
    Alert.alert('Elimina card', 'Vuoi eliminare questa card? L\'azione è irreversibile.', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina',
        style: 'destructive',
        onPress: async () => {
          if (card) {
            await deleteCard(card.id);
            router.back();
          }
        },
      },
    ]);
  }

  const currentColumn = card ? columns.find(c => c.id === card.columnId) : null;

  // ── render ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0079BF" />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.loading}>
        <Text style={styles.notFoundText}>Card non trovata.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Torna alla board</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Colonna corrente */}
        {currentColumn && (
          <View style={[styles.columnBadge, { backgroundColor: currentColumn.color }]}>
            <Text style={styles.columnBadgeText}>📋 {currentColumn.title}</Text>
          </View>
        )}

        {/* Titolo */}
        <Section title="Titolo">
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            onBlur={saveTitle}
            placeholder="Titolo della card…"
            placeholderTextColor="#A0AEC0"
            multiline
          />
        </Section>

        {/* Priorità */}
        <Section title="Priorità">
          <View style={styles.priorityRow}>
            {([Priority.LOW, Priority.MEDIUM, Priority.HIGH] as Priority[]).map(p => {
              const cfg = PRIORITY_CONFIG[p];
              const active = card.priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    { borderColor: cfg.color },
                    active && { backgroundColor: cfg.backgroundColor },
                  ]}
                  onPress={() => updateCard(card.id, { priority: p })}
                >
                  <Text style={[styles.priorityBtnText, { color: cfg.color }]}>
                    {cfg.icon} {cfg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Descrizione */}
        <Section title="Descrizione">
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            onBlur={saveDescription}
            placeholder="Aggiungi una descrizione più dettagliata…"
            placeholderTextColor="#A0AEC0"
            multiline
            textAlignVertical="top"
          />
        </Section>

        {/* Scadenza */}
        <Section title="Scadenza">
          <DueDatePicker
            dueDate={card.dueDate}
            onChange={date => updateCard(card.id, { dueDate: date })}
          />
        </Section>

        {/* Etichette */}
        <Section title="Etichette">
          <LabelPicker
            labels={card.labels}
            onAdd={(label: Label) => addLabel(card.id, label)}
            onRemove={(labelId: string) => removeLabel(card.id, labelId)}
          />
        </Section>

        {/* Immagine */}
        <Section title="Immagine">
          <ImageAttachment
            imageUri={card.imageUri}
            onChangeImage={uri => updateCard(card.id, { imageUri: uri })}
          />
        </Section>

        {/* Checklist */}
        <Section title={`Checklist${card.checklist.length > 0 ? ` (${card.checklist.filter(i => i.completed).length}/${card.checklist.length})` : ''}`}>
          <ChecklistSection
            items={card.checklist}
            onToggle={(itemId: string) => toggleChecklistItem(card.id, itemId)}
            onDelete={(itemId: string) => deleteChecklistItem(card.id, itemId)}
            onAdd={(text: string) => addChecklistItem(card.id, text)}
          />
        </Section>

        {/* Membri */}
        <Section title="Membri">
          {members.length === 0 ? (
            <TouchableOpacity
              style={styles.memberHint}
              onPress={() => router.push('/(tabs)/members' as any)}
            >
              <Text style={styles.memberHintText}>👥 Nessun membro ancora.</Text>
              <Text style={styles.memberHintLink}>Aggiungili dalla tab Membri →</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.membersGrid}>
              {members.map(m => {
                const isAssigned = m.assignedCardIds.includes(card.id);
                const roleCfg = ROLE_CONFIG[m.role];
                const initials = m.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.memberChip, isAssigned && styles.memberChipActive]}
                    onPress={() => isAssigned
                      ? unassignMemberFromCard(m.id, card.id)
                      : assignMemberToCard(m.id, card.id)
                    }
                  >
                    <View style={[styles.memberAvatar, { backgroundColor: m.avatarColor }]}>
                      <Text style={styles.memberAvatarText}>{initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
                      <Text style={[styles.memberRole, { color: roleCfg.color }]}>{roleCfg.icon} {roleCfg.label}</Text>
                    </View>
                    <Text style={styles.memberCheck}>{isAssigned ? '✓' : '+'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Section>

        {/* Elimina card */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>🗑️ Elimina card</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Componente sezione riutilizzabile ───────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  content: {
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    color: '#5E6C84',
  },
  backLink: {
    fontSize: 14,
    color: '#0079BF',
    fontWeight: '600',
  },
  columnBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  columnBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A869A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172B4D',
    padding: 0,
    lineHeight: 26,
  },
  descriptionInput: {
    fontSize: 14,
    color: '#172B4D',
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
    padding: 12,
    minHeight: 90,
    lineHeight: 22,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
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
  deleteBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F44336',
  },
  membersGrid: { gap: 8 },
  memberChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F4F5F7', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 10,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  memberChipActive: {
    backgroundColor: '#EBF8FF', borderColor: '#0079BF',
  },
  memberAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  memberAvatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  memberName: { fontSize: 13, fontWeight: '600', color: '#172B4D' },
  memberRole: { fontSize: 11, fontWeight: '500' },
  memberCheck: { fontSize: 18, color: '#0079BF', fontWeight: '700' },
  memberHint: {
    backgroundColor: '#F4F5F7', borderRadius: 10, padding: 14,
    alignItems: 'center', gap: 4,
  },
  memberHintText: { fontSize: 14, color: '#5E6C84', fontWeight: '500' },
  memberHintLink: { fontSize: 13, color: '#0079BF', fontWeight: '600' },
});
