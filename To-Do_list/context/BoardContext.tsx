// Context globale della board — un'unica istanza di stato condivisa
// da tutte le schermate (board, dettaglio card, ecc.)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BoardState, Card, Column, Task, ChecklistItem, Label, Priority } from '../types/Task';
import { DEFAULT_COLUMNS } from '../constants/priorities';

const BOARD_KEY = 'board_v2';
const LEGACY_KEY = 'tasks';
const SCHEMA_VERSION = 2;

// ─── helpers ────────────────────────────────────────────────────────────────

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyBoard(): BoardState {
  return {
    columns: DEFAULT_COLUMNS.map(c => ({ ...c })),
    cards: [],
    schemaVersion: SCHEMA_VERSION,
  };
}

function migrateLegacyTasks(rawTasks: Task[]): Card[] {
  return rawTasks.map(t => ({
    id: t.id,
    columnId: t.completed ? 'done' : 'todo',
    title: t.text,
    description: '',
    priority: t.priority ?? Priority.MEDIUM,
    createdAt: t.createdAt ?? Date.now(),
    dueDate: null,
    labels: [],
    checklist: [],
    imageUri: null,
    completed: t.completed,
  }));
}

// ─── Tipo del context ────────────────────────────────────────────────────────

interface BoardContextValue {
  board: BoardState;
  isLoading: boolean;
  columns: Column[];
  cards: Card[];
  addCard: (columnId: string, title: string, priority?: Priority) => Promise<string>;
  updateCard: (id: string, changes: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (cardId: string, targetColumnId: string) => Promise<void>;
  addColumn: (title: string, color: string) => Promise<void>;
  updateColumn: (id: string, changes: Partial<Column>) => Promise<void>;
  addChecklistItem: (cardId: string, text: string) => Promise<void>;
  toggleChecklistItem: (cardId: string, itemId: string) => Promise<void>;
  deleteChecklistItem: (cardId: string, itemId: string) => Promise<void>;
  addLabel: (cardId: string, label: Label) => Promise<void>;
  removeLabel: (cardId: string, labelId: string) => Promise<void>;
  getCard: (id: string) => Card | null;
  cardsForColumn: (columnId: string) => Card[];
}

const BoardContext = createContext<BoardContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [board, setBoard] = useState<BoardState>(emptyBoard());
  const [isLoading, setIsLoading] = useState(true);

  // ── caricamento iniziale + migrazione ─────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const raw = await AsyncStorage.getItem(BOARD_KEY);
        if (raw) {
          setBoard(JSON.parse(raw));
        } else {
          const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
          if (legacyRaw) {
            const legacyTasks: Task[] = JSON.parse(legacyRaw);
            const newBoard: BoardState = {
              ...emptyBoard(),
              cards: migrateLegacyTasks(legacyTasks),
            };
            setBoard(newBoard);
            await AsyncStorage.setItem(BOARD_KEY, JSON.stringify(newBoard));
          } else {
            const fresh = emptyBoard();
            setBoard(fresh);
            await AsyncStorage.setItem(BOARD_KEY, JSON.stringify(fresh));
          }
        }
      } catch (e) {
        console.error('BoardContext: errore caricamento', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── persist helper ───────────────────────────────────────────────────────
  const persist = useCallback(async (next: BoardState) => {
    setBoard(next);
    await AsyncStorage.setItem(BOARD_KEY, JSON.stringify(next));
  }, []);

  // ── CARD actions ─────────────────────────────────────────────────────────

  const addCard = useCallback(
    async (columnId: string, title: string, priority: Priority = Priority.MEDIUM) => {
      const card: Card = {
        id: makeId(),
        columnId,
        title,
        description: '',
        priority,
        createdAt: Date.now(),
        dueDate: null,
        labels: [],
        checklist: [],
        imageUri: null,
        completed: false,
      };
      await persist({ ...board, cards: [card, ...board.cards] });
      return card.id;
    },
    [board, persist]
  );

  const updateCard = useCallback(
    async (id: string, changes: Partial<Card>) => {
      const cards = board.cards.map(c => (c.id === id ? { ...c, ...changes } : c));
      await persist({ ...board, cards });
    },
    [board, persist]
  );

  const deleteCard = useCallback(
    async (id: string) => {
      const cards = board.cards.filter(c => c.id !== id);
      await persist({ ...board, cards });
    },
    [board, persist]
  );

  const moveCard = useCallback(
    async (cardId: string, targetColumnId: string) => {
      const cards = board.cards.map(c =>
        c.id === cardId ? { ...c, columnId: targetColumnId } : c
      );
      await persist({ ...board, cards });
    },
    [board, persist]
  );

  // ── COLUMN actions ───────────────────────────────────────────────────────

  const addColumn = useCallback(
    async (title: string, color: string) => {
      const col: Column = {
        id: makeId(),
        title,
        color,
        order: board.columns.length,
      };
      await persist({ ...board, columns: [...board.columns, col] });
    },
    [board, persist]
  );

  const updateColumn = useCallback(
    async (id: string, changes: Partial<Column>) => {
      const columns = board.columns.map(c => (c.id === id ? { ...c, ...changes } : c));
      await persist({ ...board, columns });
    },
    [board, persist]
  );

  // ── CHECKLIST ────────────────────────────────────────────────────────────

  const addChecklistItem = useCallback(
    async (cardId: string, text: string) => {
      const item: ChecklistItem = { id: makeId(), text, completed: false };
      const cards = board.cards.map(c =>
        c.id === cardId ? { ...c, checklist: [...c.checklist, item] } : c
      );
      await persist({ ...board, cards });
    },
    [board, persist]
  );

  const toggleChecklistItem = useCallback(
    async (cardId: string, itemId: string) => {
      const cards = board.cards.map(c => {
        if (c.id !== cardId) return c;
        const checklist = c.checklist.map(i =>
          i.id === itemId ? { ...i, completed: !i.completed } : i
        );
        return { ...c, checklist };
      });
      await persist({ ...board, cards });
    },
    [board, persist]
  );

  const deleteChecklistItem = useCallback(
    async (cardId: string, itemId: string) => {
      const cards = board.cards.map(c => {
        if (c.id !== cardId) return c;
        return { ...c, checklist: c.checklist.filter(i => i.id !== itemId) };
      });
      await persist({ ...board, cards });
    },
    [board, persist]
  );

  // ── LABELS ───────────────────────────────────────────────────────────────

  const addLabel = useCallback(
    async (cardId: string, label: Label) => {
      const cards = board.cards.map(c => {
        if (c.id !== cardId) return c;
        const exists = c.labels.some(l => l.color === label.color);
        if (exists) return c;
        return { ...c, labels: [...c.labels, label] };
      });
      await persist({ ...board, cards });
    },
    [board, persist]
  );

  const removeLabel = useCallback(
    async (cardId: string, labelId: string) => {
      const cards = board.cards.map(c =>
        c.id !== cardId ? c : { ...c, labels: c.labels.filter(l => l.id !== labelId) }
      );
      await persist({ ...board, cards });
    },
    [board, persist]
  );

  // ── derived ──────────────────────────────────────────────────────────────

  const getCard = useCallback(
    (id: string) => board.cards.find(c => c.id === id) ?? null,
    [board]
  );

  const cardsForColumn = useCallback(
    (columnId: string) =>
      board.cards
        .filter(c => c.columnId === columnId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [board]
  );

  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);

  const value: BoardContextValue = {
    board,
    isLoading,
    columns: sortedColumns,
    cards: board.cards,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    addColumn,
    updateColumn,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    addLabel,
    removeLabel,
    getCard,
    cardsForColumn,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

// ─── Hook per consumare il context ───────────────────────────────────────────

export function useBoardContext(): BoardContextValue {
  const ctx = useContext(BoardContext);
  if (!ctx) {
    throw new Error('useBoardContext deve essere usato dentro <BoardProvider>');
  }
  return ctx;
}
