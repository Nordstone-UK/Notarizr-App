import { createClient } from '@liveblocks/client';
import { create } from 'zustand';

interface LiveblocksState {
  objects: Record<string, any>;
  selectedObjectId: string | null;
  setObjects: (objects: Record<string, any>) => void;
  addObject: (id: string, object: any) => void;
  updateObject: (id: string, updates: Partial<any>) => void;
  deleteObject: (id: string) => void;
  setSelectedObjectId: (id: string | null) => void;
}

export const useLiveblocks = create<LiveblocksState>((set) => ({
  objects: {},
  selectedObjectId: null,
  setObjects: (objects) => set({ objects }),
  addObject: (id, object) =>
    set((state) => ({
      objects: { ...state.objects, [id]: object },
    })),
  updateObject: (id, updates) =>
    set((state) => ({
      objects: {
        ...state.objects,
        [id]: { ...state.objects[id], ...updates },
      },
    })),
  deleteObject: (id) =>
    set((state) => {
      const newObjects = { ...state.objects };
      delete newObjects[id];
      return { objects: newObjects };
    }),
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
})); 