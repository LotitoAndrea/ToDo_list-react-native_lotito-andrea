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

// ─── TIPI BOARD & KANBAN ────────────────────────────────────────────────────

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
  boardId: string;         // a quale board appartiene
  title: string;           // titolo breve
  description: string;     // testo lungo opzionale
  priority: Priority;
  createdAt: number;
  dueDate: number | null;  // timestamp UTC, null = nessuna scadenza
  labels: Label[];
  checklist: ChecklistItem[];
  imageUri: string | null; // URI locale dell'immagine allegata
  completed: boolean;      // true = card "Done" (usato per migrazione)
  order: number;           // posizione nella colonna (per drag & drop)
}

// Column: una colonna della board (es. "To Do", "In Progress", "Done")
export interface Column {
  id: string;
  boardId: string;         // a quale board appartiene
  title: string;
  color: string;           // colore dell'header della colonna
  order: number;           // posizione nella board
}

// Board: una singola board (es. "Progetto Alpha", "Personale")
export interface Board {
  id: string;
  title: string;
  emoji: string;           // emoji rappresentativa
  description: string;
  createdAt: number;
  color: string;           // colore di sfondo della card board
}

// ─── TIPI MEMBRI ────────────────────────────────────────────────────────────

export enum MemberRole {
  OWNER  = 'owner',
  ADMIN  = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  avatarColor: string;     // colore di sfondo dell'avatar
  assignedBoardIds: string[];
  assignedCardIds: string[];
  createdAt: number;
}

// ─── APP STATE ───────────────────────────────────────────────────────────────

// AppState: stato complessivo salvato in AsyncStorage (sostituisce BoardState)
export interface AppState {
  boards: Board[];
  columns: Column[];
  cards: Card[];
  members: Member[];
  schemaVersion: number;   // versione 3
}

// BoardState: MANTENUTO per migrazione da board_v2
export interface BoardState {
  columns: Column[];
  cards: Card[];
  schemaVersion: number;
}

// Task: MANTENUTO per compatibilità — è la forma dei dati vecchi
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}
