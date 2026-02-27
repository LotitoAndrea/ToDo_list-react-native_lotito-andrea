// 📚 SPIEGAZIONE: Questo file definisce la struttura dei dati della nostra app
// TypeScript usa queste interfacce per controllare che non facciamo errori

// Priority enum: rappresenta i 3 livelli di priorità
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// FilterType: mantenuto per compatibilità
export type FilterType = 'all' | 'active' | 'completed';

// ─── NUOVI TIPI PER LA BOARD KANBAN ────────────────────────────────────────

// ChecklistItem: un singolo elemento di una checklist dentro una card
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Label: etichetta colorata da attaccare a una card
export interface Label {
  id: string;
  text: string;   // es. "Design", "Bug", ""
  color: string;  // hex es. "#61BD4F"
}

// Card: il dato centrale dell'app — una singola scheda sulla board
export interface Card {
  id: string;
  columnId: string;        // a quale colonna appartiene
  title: string;           // titolo breve
  description: string;     // testo lungo opzionale
  priority: Priority;
  createdAt: number;
  dueDate: number | null;  // timestamp UTC, null = nessuna scadenza
  labels: Label[];
  checklist: ChecklistItem[];
  imageUri: string | null; // URI locale dell'immagine allegata
  completed: boolean;      // true = card "Done" (usato per migrazione)
}

// Column: una colonna della board (es. "To Do", "In Progress", "Done")
export interface Column {
  id: string;
  title: string;
  color: string;   // colore dell'header della colonna
  order: number;   // posizione nella board
}

// BoardState: stato complessivo salvato in AsyncStorage
export interface BoardState {
  columns: Column[];
  cards: Card[];
  schemaVersion: number; // usato per rilevare se migrare i vecchi dati
}

// Task: MANTENUTO per compatibilità — è la forma dei dati vecchi
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}
