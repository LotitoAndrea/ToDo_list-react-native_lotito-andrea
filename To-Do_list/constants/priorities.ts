// 📚 SPIEGAZIONE: Questo file contiene le configurazioni delle priorità
// Usiamo costanti per evitare di ripetere colori/icone nel codice

import { Priority } from '../types/Task';

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

// Colori delle colonne della board
export const COLUMN_COLORS = {
  todo:       '#0079BF',
  inprogress: '#FF9F1A',
  done:       '#61BD4F',
};

// Colonne default della board
export const DEFAULT_COLUMNS = [
  { id: 'todo',       title: 'To Do',       color: COLUMN_COLORS.todo,       order: 0 },
  { id: 'inprogress', title: 'In Progress', color: COLUMN_COLORS.inprogress, order: 1 },
  { id: 'done',       title: 'Done',        color: COLUMN_COLORS.done,       order: 2 },
];
