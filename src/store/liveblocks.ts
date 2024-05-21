import {create} from 'zustand';
import {WithLiveblocks, liveblocks} from '@liveblocks/zustand';

import {client} from '../libs/liveblocks';
import type {PdfObject} from '../types/liveblocks';

type State = {
  currentPage: number;
  objects: Record<string, PdfObject>;
  selectedObjectId: string | null;
};

type Action = {
  insertObject: (id: string, object: PdfObject) => void;
  updateObject: (id: string, object: PdfObject) => void;
  deleteObject: (id: string) => void; 
  setSelectedObjectId: (id: string | null) => void;
  setCurrentPage: (page: number) => void;
  deleteAllObjects: () => void;
};

export const useLiveblocks = create<WithLiveblocks<State & Action>>()(
  liveblocks(
    (set, get) => ({
      currentPage: 1,
      objects: {},
      selectedObjectId: null,
      setCurrentPage: page => {
        set({
          currentPage: page,
        });
      },
      insertObject: (id, object) => {
        set({
          objects: {
            ...get().objects,
            [id]: object,
          },
          selectedObjectId: id,
        });
      },
      updateObject: (id, object) => {
         console.log("ndfdfdfd", object.position,id)
        set({
          selectedObjectId: id,
          objects: {
            ...get().objects,
            [id]: object,
          },
        });
      },
      deleteObject: (id) => { // Implement this function
        const { [id]: _, ...remainingObjects } = get().objects;
        set({ objects: remainingObjects, selectedObjectId: null });
      },
      setSelectedObjectId: id => {
        set({
          selectedObjectId: id,
        });
      },
      deleteAllObjects: () => {
        set({
          objects: {},
        });
      },
    }),
    {
      client,
      storageMapping: {
        objects: true,
        currentPage: true,
      },
      presenceMapping: {
        selectedObjectId: true,
      },
    },
  ),
);
