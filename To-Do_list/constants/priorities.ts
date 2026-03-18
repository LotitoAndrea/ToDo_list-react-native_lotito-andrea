// 📚 SPIEGAZIONE: Questo file contiene le configurazioni delle priorità, ruoli e board
import { Priority, MemberRole } from '../types/Task';

// Configurazione di ogni livello di priorità
export const PRIORITY_CONFIG = {
  [Priority.LOW]: {
    label: 'Bassa',
    color: '#4CAF50',
    icon: '📌',
    backgroundColor: '#E8F5E9',
  },
  [Priority.MEDIUM]: {
    label: 'Media',
    color: '#FF9800',
    icon: '⚡',
    backgroundColor: '#FFF3E0',
  },
  [Priority.HIGH]: {
    label: 'Alta',
    color: '#F44336',
    icon: '🔥',
    backgroundColor: '#FFEBEE',
  },
};

// Colori predefiniti delle etichette (stile Trello)
export const LABEL_COLORS = [
  { id: 'green',  color: '#61BD4F', name: 'Verde' },
  { id: 'yellow', color: '#F2D600', name: 'Giallo' },
  { id: 'orange', color: '#FF9F1A', name: 'Arancione' },
  { id: 'red',    color: '#EB5A46', name: 'Rosso' },
  { id: 'purple', color: '#C377E0', name: 'Viola' },
  { id: 'blue',   color: '#0079BF', name: 'Blu' },
  { id: 'teal',   color: '#00C2E0', name: 'Teal' },
  { id: 'pink',   color: '#FF78CB', name: 'Rosa' },
];

// Colori dei ruoli dei membri
export const ROLE_CONFIG: Record<MemberRole, { label: string; color: string; bgColor: string; icon: string }> = {
  [MemberRole.OWNER]:  { label: 'Owner',  color: '#B36A00', bgColor: '#FFF3CD', icon: '👑' },
  [MemberRole.ADMIN]:  { label: 'Admin',  color: '#C0392B', bgColor: '#FDECEA', icon: '🛡️' },
  [MemberRole.MEMBER]: { label: 'Membro', color: '#1565C0', bgColor: '#E3F2FD', icon: '👤' },
  [MemberRole.VIEWER]: { label: 'Viewer', color: '#37474F', bgColor: '#ECEFF1', icon: '👁️' },
};

// Colori avatar per i membri
export const AVATAR_COLORS = [
  '#0079BF', '#61BD4F', '#EB5A46', '#FF9F1A',
  '#C377E0', '#00C2E0', '#FF78CB', '#4BBC4E',
];

// Emoji suggerite per le board
export const BOARD_EMOJIS = ['📋', '🚀', '💡', '🎯', '🛠️', '📊', '🌟', '🔥', '💼', '🎨', '📱', '🧩'];

// Colori di sfondo suggeriti per le board
export const BOARD_BG_COLORS = [
  '#0079BF', '#519839', '#D9A20B', '#CF5B25',
  '#89609E', '#CD5A91', '#4BBF6B', '#00AECC',
];

// Colori delle colonne della board
export const COLUMN_COLORS = {
  todo:       '#0079BF',
  inprogress: '#FF9F1A',
  done:       '#61BD4F',
};

// Colonne default (vengono assegnate a una boardId al momento della creazione)
export const DEFAULT_COLUMN_TEMPLATES = [
  { title: 'To Do',       color: COLUMN_COLORS.todo,       order: 0 },
  { title: 'In Progress', color: COLUMN_COLORS.inprogress, order: 1 },
  { title: 'Done',        color: COLUMN_COLORS.done,       order: 2 },
];

