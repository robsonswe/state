import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Entry } from './types';

export interface Reflection {
  id: string;
  timestamp: string;
  challenge: string;
  action: string;
}

interface JournalState {
  entries: Entry[];
  values: string[];
  reflections: Reflection[];
  addEntry: (entry: Omit<Entry, 'id' | 'timestamp'>) => void;
  updateEntry: (id: string, updates: Partial<Entry>) => void;
  deleteEntry: (id: string) => void;
  addValue: (value: string) => void;
  removeValue: (value: string) => void;
  addReflection: (reflection: Omit<Reflection, 'id' | 'timestamp'>) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: [],
      values: ['Health', 'Relationships', 'Growth', 'Peace'],
      reflections: [],
      addEntry: (entry) => set((state) => ({
        entries: [
          {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
          ...state.entries,
        ],
      })),
      updateEntry: (id, updates) => set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      })),
      deleteEntry: (id) => set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      })),
      addValue: (value) => set((state) => ({
        values: state.values.includes(value) ? state.values : [...state.values, value]
      })),
      removeValue: (value) => set((state) => ({
        values: state.values.filter(v => v !== value)
      })),
      addReflection: (reflection) => set((state) => ({
        reflections: [
          {
            ...reflection,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
          ...state.reflections,
        ]
      }))
    }),
    {
      name: 'journal-storage',
    }
  )
);
