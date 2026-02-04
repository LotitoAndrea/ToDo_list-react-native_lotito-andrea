// 📚 SPIEGAZIONE: Questo file contiene le configurazioni delle priorità
// Usiamo costanti per evitare di ripetere colori/icone nel codice

import { Priority } from '../types/Task';

// Configurazione di ogni livello di priorità
export const PRIORITY_CONFIG = {
  [Priority.LOW]: {
    label: 'Bassa',
    color: '#4CAF50',      // Verde → tranquillo, non urgente
    icon: '📌',             // Emoji per visualizzare
    backgroundColor: '#E8F5E9', // Sfondo verde chiaro
  },
  [Priority.MEDIUM]: {
    label: 'Media',
    color: '#FF9800',      // Arancione → attenzione moderata
    icon: '⚡',
    backgroundColor: '#FFF3E0',
  },
  [Priority.HIGH]: {
    label: 'Alta',
    color: '#F44336',      // Rosso → urgente!
    icon: '🔥',
    backgroundColor: '#FFEBEE',
  },
};

// 📚 NOTA: Usiamo la sintassi [Priority.LOW] per creare un oggetto
// dove le chiavi sono i valori dell'enum Priority.
// È come scrivere: { 'low': {...}, 'medium': {...}, 'high': {...} }
