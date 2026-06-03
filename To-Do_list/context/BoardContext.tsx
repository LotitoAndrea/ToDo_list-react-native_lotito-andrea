// Context globale multi-board — gestisce boards, colonne, card e membri

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState, Board, Column, Card, Member, MemberRole,
  BoardState, Task, ChecklistItem, Label, Priority,
} from '../types/Task';
import { DEFAULT_COLUMN_TEMPLATES, AVATAR_COLORS, BOARD_BG_COLORS } from '../constants/priorities';

const APP_KEY    = 'app_v3';
const BOARD_KEY  = 'board_v2';  // legacy
const LEGACY_KEY = 'tasks';     // legacy v1
const SCHEMA_VERSION = 3;

// ─── helpers ────────────────────────────────────────────────────────────────

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeDefaultBoard(id: string, title = 'La mia Board', emoji = '📋'): Board {
  return { id, title, emoji, description: '', createdAt: Date.now(), color: BOARD_BG_COLORS[0] };
}

function makeDefaultColumns(boardId: string): Column[] {
  return DEFAULT_COLUMN_TEMPLATES.map((t, i) => ({
    id: `${boardId}-col-${i}`,
    boardId,
    title: t.title,
    color: t.color,
    order: t.order,
  }));
}

function emptyAppState(): AppState {
  const boardId = makeId();
  return {
    boards: [makeDefaultBoard(boardId)],
    columns: makeDefaultColumns(boardId),
    cards: [],
    members: [],
    schemaVersion: SCHEMA_VERSION,
  };
}

// ── migrazione da board_v2 ───────────────────────────────────────────────────
function migrateFromBoardV2(old: BoardState): AppState {
  const boardId = 'default-board';
  const board   = makeDefaultBoard(boardId, 'La mia Board', '📋');

  // aggiunge boardId alle colonne vecchie
  const columns: Column[] = old.columns.map(c => ({
    ...c,
    boardId,
    // board_v2 non aveva boardId nei tipi, ma ora lo aggiungiamo
  } as Column));

  // aggiunge boardId e campi mancanti alle card vecchie
  const cards: Card[] = old.cards.map((c: any, i: number) => ({
    ...c,
    boardId,
    order: c.order ?? i,
  } as Card));

  return { boards: [board], columns, cards, members: [], schemaVersion: SCHEMA_VERSION };
}

// ── migrazione da tasks (v1) ─────────────────────────────────────────────────
function migrateFromLegacy(rawTasks: Task[]): AppState {
  const boardId  = 'default-board';
  const board    = makeDefaultBoard(boardId, 'La mia Board', '📋');
  const columns  = makeDefaultColumns(boardId);
  const todoCol  = columns.find(c => c.title === 'To Do')!;
  const doneCol  = columns.find(c => c.title === 'Done')!;

  const cards: Card[] = rawTasks.map((t, i) => ({
    id: t.id,
    boardId,
    columnId: t.completed ? doneCol.id : todoCol.id,
    title: t.text,
    description: '',
    priority: t.priority ?? Priority.MEDIUM,
    createdAt: t.createdAt ?? Date.now(),
    dueDate: null,
    labels: [],
    checklist: [],
    imageUri: null,
    completed: t.completed,
    order: i,
  }));

  return { boards: [board], columns, cards, members: [], schemaVersion: SCHEMA_VERSION };
}

// ─── Tipo del context ────────────────────────────────────────────────────────

interface AppContextValue {
  appState: AppState;
  isLoading: boolean;
  // derived
  boards: Board[];
  columns: Column[];
  cards: Card[];
  members: Member[];
  // board CRUD
  addBoard: (title: string, emoji: string, color: string) => Promise<string>;
  updateBoard: (id: string, changes: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  // column CRUD
  addColumn: (boardId: string, title: string, color: string) => Promise<void>;
  updateColumn: (id: string, changes: Partial<Column>) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  // card CRUD
  addCard: (boardId: string, columnId: string, title: string, priority?: Priority) => Promise<string>;
  updateCard: (id: string, changes: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (cardId: string, targetColumnId: string) => Promise<void>;
  moveCardToBoard: (cardId: string, targetBoardId: string, targetColumnId: string) => Promise<void>;
  reorderCards: (columnId: string, orderedIds: string[]) => Promise<void>;
  // card sub-items
  addChecklistItem: (cardId: string, text: string) => Promise<void>;
  toggleChecklistItem: (cardId: string, itemId: string) => Promise<void>;
  deleteChecklistItem: (cardId: string, itemId: string) => Promise<void>;
  addLabel: (cardId: string, label: Label) => Promise<void>;
  removeLabel: (cardId: string, labelId: string) => Promise<void>;
  // members CRUD
  addMember: (name: string, role: MemberRole) => Promise<string>;
  updateMember: (id: string, changes: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  assignMemberToBoard: (memberId: string, boardId: string) => Promise<void>;
  unassignMemberFromBoard: (memberId: string, boardId: string) => Promise<void>;
  assignMemberToCard: (memberId: string, cardId: string) => Promise<void>;
  unassignMemberFromCard: (memberId: string, cardId: string) => Promise<void>;
  // derived helpers
  getCard: (id: string) => Card | null;
  getBoard: (id: string) => Board | null;
  cardsForColumn: (columnId: string) => Card[];
  columnsForBoard: (boardId: string) => Column[];
  cardsForBoard: (boardId: string) => Card[];
  membersForBoard: (boardId: string) => Member[];
  membersForCard: (cardId: string) => Member[];
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState<AppState>(emptyAppState());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const raw = await AsyncStorage.getItem(APP_KEY);
        if (raw) {
          setAppState(JSON.parse(raw));
        } else {
          // prova migrazione da board_v2
          const v2Raw = await AsyncStorage.getItem(BOARD_KEY);
          if (v2Raw) {
            const migrated = migrateFromBoardV2(JSON.parse(v2Raw) as BoardState);
            setAppState(migrated);
            await AsyncStorage.setItem(APP_KEY, JSON.stringify(migrated));
          } else {
            // prova migrazione da tasks (v1)
            const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
            if (legacyRaw) {
              const migrated = migrateFromLegacy(JSON.parse(legacyRaw) as Task[]);
              setAppState(migrated);
              await AsyncStorage.setItem(APP_KEY, JSON.stringify(migrated));
            } else {
              const fresh = emptyAppState();
              setAppState(fresh);
              await AsyncStorage.setItem(APP_KEY, JSON.stringify(fresh));
            }
          }
        }
      } catch (e) {
        console.error('AppContext: errore caricamento', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: AppState) => {
    setAppState(next);
    await AsyncStorage.setItem(APP_KEY, JSON.stringify(next));
  }, []);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setAppState(prev => {
      const next = updater(prev);
      AsyncStorage.setItem(APP_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ── BOARD ────────────────────────────────────────────────────────────────

  const addBoard = useCallback(async (title: string, emoji: string, color: string) => {
    const id      = makeId();
    const board   = { id, title, emoji, description: '', createdAt: Date.now(), color };
    const columns = makeDefaultColumns(id);
    await persist({
      ...appState,
      boards: [...appState.boards, board],
      columns: [...appState.columns, ...columns],
    });
    return id;
  }, [appState, persist]);

  const updateBoard = useCallback(async (id: string, changes: Partial<Board>) => {
    await persist({
      ...appState,
      boards: appState.boards.map(b => b.id === id ? { ...b, ...changes } : b),
    });
  }, [appState, persist]);

  const deleteBoard = useCallback(async (id: string) => {
    if (appState.boards.length <= 1) return; // non eliminare l'ultima board
    // rimuove board, colonne e card associate; aggiorna members
    const members = appState.members.map(m => ({
      ...m,
      assignedBoardIds: m.assignedBoardIds.filter(bid => bid !== id),
      assignedCardIds: m.assignedCardIds.filter(cid =>
        !appState.cards.find(c => c.id === cid && c.boardId === id)
      ),
    }));
    await persist({
      ...appState,
      boards:  appState.boards.filter(b => b.id !== id),
      columns: appState.columns.filter(c => c.boardId !== id),
      cards:   appState.cards.filter(c => c.boardId !== id),
      members,
    });
  }, [appState, persist]);

  // ── COLUMN ───────────────────────────────────────────────────────────────

  const addColumn = useCallback(async (boardId: string, title: string, color: string) => {
    const boardCols = appState.columns.filter(c => c.boardId === boardId);
    const col: Column = {
      id: makeId(), boardId, title, color, order: boardCols.length,
    };
    await persist({ ...appState, columns: [...appState.columns, col] });
  }, [appState, persist]);

  const updateColumn = useCallback(async (id: string, changes: Partial<Column>) => {
    await persist({
      ...appState,
      columns: appState.columns.map(c => c.id === id ? { ...c, ...changes } : c),
    });
  }, [appState, persist]);

  const deleteColumn = useCallback(async (id: string) => {
    await persist({
      ...appState,
      columns: appState.columns.filter(c => c.id !== id),
      cards:   appState.cards.filter(c => c.columnId !== id),
    });
  }, [appState, persist]);

  // ── CARD ─────────────────────────────────────────────────────────────────

  const addCard = useCallback(async (
    boardId: string, columnId: string, title: string, priority: Priority = Priority.MEDIUM
  ) => {
    const colCards = appState.cards.filter(c => c.columnId === columnId);
    const card: Card = {
      id: makeId(), boardId, columnId, title, description: '',
      priority, createdAt: Date.now(), dueDate: null,
      labels: [], checklist: [], imageUri: null, completed: false,
      order: colCards.length,
    };
    await persist({ ...appState, cards: [card, ...appState.cards] });
    return card.id;
  }, [appState, persist]);

  const updateCard = useCallback(async (id: string, changes: Partial<Card>) => {
    await persist({
      ...appState,
      cards: appState.cards.map(c => c.id === id ? { ...c, ...changes } : c),
    });
  }, [appState, persist]);

  const deleteCard = useCallback(async (id: string) => {
    const members = appState.members.map(m => ({
      ...m,
      assignedCardIds: m.assignedCardIds.filter(cid => cid !== id),
    }));
    await persist({
      ...appState,
      cards: appState.cards.filter(c => c.id !== id),
      members,
    });
  }, [appState, persist]);

  const moveCard = useCallback(async (cardId: string, targetColumnId: string) => {
    const targetCol = appState.columns.find(c => c.id === targetColumnId);
    await persist({
      ...appState,
      cards: appState.cards.map(c =>
        c.id === cardId
          ? { ...c, columnId: targetColumnId, boardId: targetCol?.boardId ?? c.boardId }
          : c
      ),
    });
  }, [appState, persist]);

  const moveCardToBoard = useCallback(async (
    cardId: string, targetBoardId: string, targetColumnId: string
  ) => {
    await persist({
      ...appState,
      cards: appState.cards.map(c =>
        c.id === cardId ? { ...c, boardId: targetBoardId, columnId: targetColumnId } : c
      ),
    });
  }, [appState, persist]);

  const reorderCards = useCallback(async (columnId: string, orderedIds: string[]) => {
    const cards = appState.cards.map(c => {
      if (c.columnId !== columnId) return c;
      const newOrder = orderedIds.indexOf(c.id);
      return newOrder >= 0 ? { ...c, order: newOrder } : c;
    });
    await persist({ ...appState, cards });
  }, [appState, persist]);

  // ── CHECKLIST ────────────────────────────────────────────────────────────

  const addChecklistItem = useCallback(async (cardId: string, text: string) => {
    const item: ChecklistItem = { id: makeId(), text, completed: false };
    await persist({
      ...appState,
      cards: appState.cards.map(c =>
        c.id === cardId ? { ...c, checklist: [...c.checklist, item] } : c
      ),
    });
  }, [appState, persist]);

  const toggleChecklistItem = useCallback(async (cardId: string, itemId: string) => {
    await persist({
      ...appState,
      cards: appState.cards.map(c => {
        if (c.id !== cardId) return c;
        return { ...c, checklist: c.checklist.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i) };
      }),
    });
  }, [appState, persist]);

  const deleteChecklistItem = useCallback(async (cardId: string, itemId: string) => {
    await persist({
      ...appState,
      cards: appState.cards.map(c =>
        c.id !== cardId ? c : { ...c, checklist: c.checklist.filter(i => i.id !== itemId) }
      ),
    });
  }, [appState, persist]);

  // ── LABELS ───────────────────────────────────────────────────────────────

  const addLabel = useCallback(async (cardId: string, label: Label) => {
    await persist({
      ...appState,
      cards: appState.cards.map(c => {
        if (c.id !== cardId) return c;
        if (c.labels.some(l => l.color === label.color)) return c;
        return { ...c, labels: [...c.labels, label] };
      }),
    });
  }, [appState, persist]);

  const removeLabel = useCallback(async (cardId: string, labelId: string) => {
    await persist({
      ...appState,
      cards: appState.cards.map(c =>
        c.id !== cardId ? c : { ...c, labels: c.labels.filter(l => l.id !== labelId) }
      ),
    });
  }, [appState, persist]);

  // ── MEMBERS ──────────────────────────────────────────────────────────────

  const addMember = useCallback(async (name: string, role: MemberRole) => {
    const id = makeId();
    updateState(prev => {
      const colorIdx = prev.members.length % AVATAR_COLORS.length;
      const member: Member = {
        id, name, role,
        avatarColor: AVATAR_COLORS[colorIdx],
        assignedBoardIds: [],
        assignedCardIds: [],
        createdAt: Date.now(),
      };
      return { ...prev, members: [...prev.members, member] };
    });
    return id;
  }, [updateState]);

  const updateMember = useCallback(async (id: string, changes: Partial<Member>) => {
    updateState(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...changes } : m),
    }));
  }, [updateState]);

  const deleteMember = useCallback(async (id: string) => {
    updateState(prev => ({ ...prev, members: prev.members.filter(m => m.id !== id) }));
  }, [updateState]);

  const assignMemberToBoard = useCallback(async (memberId: string, boardId: string) => {
    updateState(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id !== memberId) return m;
        if (m.assignedBoardIds.includes(boardId)) return m;
        return { ...m, assignedBoardIds: [...m.assignedBoardIds, boardId] };
      }),
    }));
  }, [updateState]);

  const unassignMemberFromBoard = useCallback(async (memberId: string, boardId: string) => {
    updateState(prev => ({
      ...prev,
      members: prev.members.map(m =>
        m.id !== memberId ? m : { ...m, assignedBoardIds: m.assignedBoardIds.filter(id => id !== boardId) }
      ),
    }));
  }, [updateState]);

  const assignMemberToCard = useCallback(async (memberId: string, cardId: string) => {
    updateState(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id !== memberId) return m;
        if (m.assignedCardIds.includes(cardId)) return m;
        return { ...m, assignedCardIds: [...m.assignedCardIds, cardId] };
      }),
    }));
  }, [updateState]);

  const unassignMemberFromCard = useCallback(async (memberId: string, cardId: string) => {
    updateState(prev => ({
      ...prev,
      members: prev.members.map(m =>
        m.id !== memberId ? m : { ...m, assignedCardIds: m.assignedCardIds.filter(id => id !== cardId) }
      ),
    }));
  }, [updateState]);

  // ── DERIVED ──────────────────────────────────────────────────────────────

  const getCard = useCallback((id: string) =>
    appState.cards.find(c => c.id === id) ?? null, [appState]);

  const getBoard = useCallback((id: string) =>
    appState.boards.find(b => b.id === id) ?? null, [appState]);

  const columnsForBoard = useCallback((boardId: string) =>
    [...appState.columns.filter(c => c.boardId === boardId)].sort((a, b) => a.order - b.order),
    [appState]);

  const cardsForColumn = useCallback((columnId: string) =>
    [...appState.cards.filter(c => c.columnId === columnId)].sort((a, b) => a.order - b.order),
    [appState]);

  const cardsForBoard = useCallback((boardId: string) =>
    appState.cards.filter(c => c.boardId === boardId), [appState]);

  const membersForBoard = useCallback((boardId: string) =>
    appState.members.filter(m => m.assignedBoardIds.includes(boardId)), [appState]);

  const membersForCard = useCallback((cardId: string) =>
    appState.members.filter(m => m.assignedCardIds.includes(cardId)), [appState]);

  const value: AppContextValue = {
    appState, isLoading,
    boards: appState.boards,
    columns: appState.columns,
    cards: appState.cards,
    members: appState.members,
    addBoard, updateBoard, deleteBoard,
    addColumn, updateColumn, deleteColumn,
    addCard, updateCard, deleteCard,
    moveCard, moveCardToBoard, reorderCards,
    addChecklistItem, toggleChecklistItem, deleteChecklistItem,
    addLabel, removeLabel,
    addMember, updateMember, deleteMember,
    assignMemberToBoard, unassignMemberFromBoard,
    assignMemberToCard, unassignMemberFromCard,
    getCard, getBoard,
    cardsForColumn, columnsForBoard, cardsForBoard,
    membersForBoard, membersForCard,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useBoardContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useBoardContext deve essere usato dentro <BoardProvider>');
  return ctx;
}
