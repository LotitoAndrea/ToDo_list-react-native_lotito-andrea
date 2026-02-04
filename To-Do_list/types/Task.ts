// 📚 SPIEGAZIONE: Questo file definisce la struttura dei dati della nostra app
// TypeScript usa queste interfacce per controllare che non facciamo errori

// Priority enum: rappresenta i 3 livelli di priorità
export enum Priority {
  LOW = 'low',      // Priorità bassa
  MEDIUM = 'medium', // Priorità media
  HIGH = 'high',     // Priorità alta
}

// Task interface: definisce come deve essere fatto un task
export interface Task {
  id: string;           // ID univoco (es. "1738255200000-abc123")
  text: string;         // Testo del task (es. "Comprare il latte")
  completed: boolean;   // true se completato, false altrimenti
  priority: Priority;   // Priorità del task (LOW, MEDIUM o HIGH)
  createdAt: number;    // Timestamp di creazione (es. 1738255200000)
}

// Filter type: rappresenta i filtri disponibili nella UI
export type FilterType = 'all' | 'active' | 'completed';
// 'all' → mostra tutti i task
// 'active' → mostra solo i task non completati
// 'completed' → mostra solo i task completati
