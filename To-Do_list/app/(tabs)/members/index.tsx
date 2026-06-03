// Schermata gestione membri

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Platform, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBoard } from '../../../hooks/useBoard';
import { Member, MemberRole } from '../../../types/Task';
import { ROLE_CONFIG, AVATAR_COLORS } from '../../../constants/priorities';

export default function MembersScreen() {
  const insets = useSafeAreaInsets();
  const {
    members, boards, cards,
    addMember, updateMember, deleteMember,
    assignMemberToBoard, unassignMemberFromBoard,
    assignMemberToCard, unassignMemberFromCard,
  } = useBoard();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<MemberRole>(MemberRole.MEMBER);
  const [formBoardIds, setFormBoardIds] = useState<string[]>([]);
  const [formCardIds, setFormCardIds] = useState<string[]>([]);
  const [formColor, setFormColor] = useState(AVATAR_COLORS[0]);

  function openCreate() {
    setEditingMember(null);
    setFormName('');
    setFormRole(MemberRole.MEMBER);
    setFormBoardIds([]);
    setFormCardIds([]);
    setFormColor(AVATAR_COLORS[members.length % AVATAR_COLORS.length]);
    setModalVisible(true);
  }

  function openEdit(m: Member) {
    setEditingMember(m);
    setFormName(m.name);
    setFormRole(m.role);
    setFormBoardIds([...m.assignedBoardIds]);
    setFormCardIds([...m.assignedCardIds]);
    setFormColor(m.avatarColor);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!formName.trim()) return;
    if (editingMember) {
      await updateMember(editingMember.id, {
        name: formName.trim(),
        role: formRole,
        avatarColor: formColor,
        assignedBoardIds: formBoardIds,
        assignedCardIds: formCardIds,
      });
    } else {
      const id = await addMember(formName.trim(), formRole);
      // assign boards/cards
      for (const bid of formBoardIds) await assignMemberToBoard(id, bid);
      for (const cid of formCardIds) await assignMemberToCard(id, cid);
      // update color if different from default
      if (formColor !== AVATAR_COLORS[members.length % AVATAR_COLORS.length]) {
        await updateMember(id, { avatarColor: formColor });
      }
    }
    setModalVisible(false);
  }

  function handleDelete(m: Member) {
    const doDelete = () => deleteMember(m.id);
    if (Platform.OS === 'web') {
      if ((globalThis as any).confirm?.(`Eliminare il membro "${m.name}"?`)) doDelete();
    } else {
      Alert.alert('Elimina membro', `Eliminare "${m.name}"?`, [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Elimina', style: 'destructive', onPress: doDelete },
      ]);
    }
  }

  function toggleBoard(boardId: string) {
    setFormBoardIds(prev =>
      prev.includes(boardId) ? prev.filter(id => id !== boardId) : [...prev, boardId]
    );
  }

  function toggleCard(cardId: string) {
    setFormCardIds(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  }

  // Filtra card alle sole board selezionate
  const relevantCards = formBoardIds.length > 0
    ? cards.filter(c => formBoardIds.includes(c.boardId))
    : cards;

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F5F7" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Membri</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>＋ Aggiungi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list}>
        {members.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>Nessun membro</Text>
            <Text style={styles.emptySub}>Aggiungi membri per assegnarli alle board e alle card</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={openCreate}>
              <Text style={styles.emptyAddBtnText}>＋ Aggiungi il primo membro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          members.map(m => {
            const roleCfg = ROLE_CONFIG[m.role];
            const memberBoards = boards.filter(b => m.assignedBoardIds.includes(b.id));
            return (
              <TouchableOpacity
                key={m.id}
                style={styles.memberCard}
                onPress={() => openEdit(m)}
                activeOpacity={0.8}
              >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: m.avatarColor }]}>
                  <Text style={styles.avatarText}>{initials(m.name)}</Text>
                </View>
                {/* Info */}
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: roleCfg.bgColor }]}>
                    <Text style={[styles.roleText, { color: roleCfg.color }]}>
                      {roleCfg.icon} {roleCfg.label}
                    </Text>
                  </View>
                  {memberBoards.length > 0 && (
                    <Text style={styles.assignedBoards} numberOfLines={1}>
                      Board: {memberBoards.map(b => `${b.emoji} ${b.title}`).join(', ')}
                    </Text>
                  )}
                  <Text style={styles.assignedCount}>
                    {m.assignedCardIds.length} card assegnate
                  </Text>
                </View>
                {/* Delete */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(m)}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Modal crea/modifica membro */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{editingMember ? 'Modifica membro' : 'Nuovo membro'}</Text>

              {/* Avatar preview */}
              <View style={styles.avatarPreviewRow}>
                <View style={[styles.avatarLarge, { backgroundColor: formColor }]}>
                  <Text style={styles.avatarLargeText}>{formName ? initials(formName) : '??'}</Text>
                </View>
                <View style={styles.colorPicker}>
                  {AVATAR_COLORS.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.colorDot, { backgroundColor: c }, formColor === c && styles.colorDotActive]}
                      onPress={() => setFormColor(c)}
                    />
                  ))}
                </View>
              </View>

              {/* Nome */}
              <Text style={styles.fieldLabel}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="Nome del membro…"
                placeholderTextColor="#A0AEC0"
                autoFocus
              />

              {/* Ruolo */}
              <Text style={styles.fieldLabel}>Ruolo</Text>
              <View style={styles.rolesRow}>
                {(Object.values(MemberRole) as MemberRole[]).map(role => {
                  const cfg = ROLE_CONFIG[role];
                  const active = formRole === role;
                  return (
                    <TouchableOpacity
                      key={role}
                      style={[styles.roleBtn, active && { backgroundColor: cfg.bgColor, borderColor: cfg.color }]}
                      onPress={() => setFormRole(role)}
                    >
                      <Text style={[styles.roleBtnText, active && { color: cfg.color }]}>
                        {cfg.icon} {cfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Board assegnate */}
              {boards.length > 0 && (
                <>
                  <Text style={styles.fieldLabel}>Board assegnate</Text>
                  {boards.map(b => {
                    const sel = formBoardIds.includes(b.id);
                    return (
                      <TouchableOpacity
                        key={b.id}
                        style={[styles.checkRow, sel && styles.checkRowActive]}
                        onPress={() => toggleBoard(b.id)}
                      >
                        <Text style={{ fontSize: 18 }}>{b.emoji}</Text>
                        <Text style={styles.checkLabel}>{b.title}</Text>
                        <Text style={styles.checkbox}>{sel ? '☑️' : '☐'}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}

              {/* Card assegnate */}
              {relevantCards.length > 0 && (
                <>
                  <Text style={styles.fieldLabel}>
                    Card assegnate
                    {formBoardIds.length > 0 ? ' (board selezionate)' : ' (tutte le board)'}
                  </Text>
                  {relevantCards.map(c => {
                    const sel = formCardIds.includes(c.id);
                    const boardOfCard = boards.find(b => b.id === c.boardId);
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.checkRow, sel && styles.checkRowActive]}
                        onPress={() => toggleCard(c.id)}
                      >
                        <Text style={styles.checkBoard}>{boardOfCard?.emoji ?? '📋'}</Text>
                        <Text style={styles.checkLabel} numberOfLines={1}>{c.title}</Text>
                        <Text style={styles.checkbox}>{sel ? '☑️' : '☐'}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, !formName.trim() && styles.confirmBtnDisabled]}
                  onPress={handleSave}
                  disabled={!formName.trim()}
                >
                  <Text style={styles.confirmBtnText}>{editingMember ? 'Salva' : 'Aggiungi'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  addBtn: { backgroundColor: '#0079BF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#172B4D', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#7A869A', textAlign: 'center', paddingHorizontal: 20 },
  emptyAddBtn: {
    marginTop: 16, backgroundColor: '#0079BF',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20,
  },
  emptyAddBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  memberCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  memberInfo: { flex: 1, gap: 4 },
  memberName: { fontSize: 16, fontWeight: '700', color: '#172B4D' },
  roleBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: { fontSize: 12, fontWeight: '700' },
  assignedBoards: { fontSize: 12, color: '#7A869A' },
  assignedCount: { fontSize: 12, color: '#7A869A' },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 18 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40, maxHeight: '90%',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#172B4D', marginBottom: 16 },
  avatarPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  avatarLarge: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLargeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 20 },
  colorPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: { borderWidth: 3, borderColor: '#172B4D' },
  fieldLabel: {
    fontSize: 12, fontWeight: '700', color: '#7A869A',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 8, marginTop: 14,
  },
  input: {
    backgroundColor: '#F4F5F7', borderRadius: 10,
    padding: 12, fontSize: 16, color: '#172B4D',
  },
  rolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#F4F5F7', borderWidth: 1.5, borderColor: '#DFE1E6',
  },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: '#5E6C84' },
  checkRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F4F5F7', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12,
    marginBottom: 6, gap: 10,
  },
  checkRowActive: { backgroundColor: '#EBF8FF', borderWidth: 1, borderColor: '#0079BF' },
  checkLabel: { flex: 1, fontSize: 14, color: '#172B4D', fontWeight: '500' },
  checkBoard: { fontSize: 16 },
  checkbox: { fontSize: 18 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F4F5F7', alignItems: 'center' },
  cancelBtnText: { color: '#5E6C84', fontWeight: '600', fontSize: 15 },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#0079BF', alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
