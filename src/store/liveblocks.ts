import { create } from 'zustand';
import { WithLiveblocks, liveblocks } from '@liveblocks/zustand';

import { client } from '../libs/liveblocks';
import type { PdfObject } from '../types/liveblocks';

type State = {
  currentPage: number;
  objects: Record<string, PdfObject>;
  selectedObjectId: string | null;
  pdfFilePath: string | null;
  isPdfSaved: boolean;
};

type Action = {
  insertObject: (id: string, object: PdfObject) => void;
  updateObject: (id: string, object: PdfObject) => void;
  deleteObject: (id: string) => void;
  setSelectedObjectId: (id: string | null) => void;
  setCurrentPage: (page: number) => void;
  deleteAllObjects: () => void;
  setPdfFilePath: (path: string | null) => void;
  setIsPdfSaved: (isSaved: boolean) => void;
};

export const useLiveblocks = create<WithLiveblocks<State & Action>>()(
  liveblocks(
    (set, get) => ({
      currentPage: 1,
      objects: {},
      selectedObjectId: null,
      pdfFilePath: "https://notarizr-app-data.s3.us-east-2.amazonaws.com/signed-documents/1716495800641.pdf",
      isPdfSaved: false,
      setCurrentPage: page => {
        set({ currentPage: page });
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
        console.log("ndfdfdfd", object.position, id);
        set({
          selectedObjectId: id,
          objects: {
            ...get().objects,
            [id]: object,
          },
        });
      },
      deleteObject: (id) => {
        const { [id]: _, ...remainingObjects } = get().objects;
        set({ objects: remainingObjects, selectedObjectId: null });
      },
      setSelectedObjectId: id => {
        set({ selectedObjectId: id });
      },
      deleteAllObjects: () => {
        set({ objects: {} });
      },
      setPdfFilePath: path => {
        set({ pdfFilePath: path });
      },
      setIsPdfSaved: isSaved => {
        set({ isPdfSaved: isSaved });
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
