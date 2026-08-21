import {create} from 'zustand';
import {WithLiveblocks, liveblocks} from '@liveblocks/zustand';

import {client} from '../libs/liveblocks';
import type {PdfObject} from '../types/liveblocks';

type State = {
  currentPage: number;
  objects: Record<string, PdfObject>;
  selectedObjectId: string | null;
  pdfFilePath: string | null;
  isPdfSaved: boolean;
  sharedDocument: {name: string; url: string; type: string} | null;
  isDocumentPreviewOpen: boolean;
  isSignatureModalOpen: boolean;
  isSessionCompleted: boolean;
  sessionCompletedAt: string | null;
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
  setSharedDocument: (
    document: {name: string; url: string; type: string} | null,
  ) => void;
  setDocumentPreviewOpen: (isOpen: boolean) => void;
  setSignatureModalOpen: (isOpen: boolean) => void;
  setSessionCompleted: (isCompleted: boolean, completedAt?: string) => void;
};

export const useLiveblocks = create<WithLiveblocks<State & Action>>()(
  liveblocks(
    (set, get) => ({
      currentPage: 1,
      objects: {},
      selectedObjectId: null,
      pdfFilePath: '',
      isPdfSaved: false,
      sharedDocument: null,
      isDocumentPreviewOpen: false,
      isSignatureModalOpen: false,
      isSessionCompleted: false,
      sessionCompletedAt: null,
      setCurrentPage: page => {
        set({currentPage: page});
      },
      insertObject: (id, object) => {
        console.log('Inserting object:', {id, object});
        set({
          objects: {
            ...get().objects,
            [id]: object,
          },
          selectedObjectId: id,
        });
      },
      updateObject: (id, object) => {
        set({
          selectedObjectId: id,
          objects: {
            ...get().objects,
            [id]: object,
          },
        });
      },
      deleteObject: id => {
        const {[id]: _, ...remainingObjects} = get().objects;
        set({objects: remainingObjects, selectedObjectId: null});
      },
      setSelectedObjectId: id => {
        set({selectedObjectId: id});
      },
      deleteAllObjects: () => {
        set({objects: {}});
      },
      setPdfFilePath: path => {
        set({pdfFilePath: path});
      },
      setIsPdfSaved: isSaved => {
        set({isPdfSaved: isSaved});
      },
      setSharedDocument: document => {
        set({sharedDocument: document});
      },
      setDocumentPreviewOpen: isOpen => {
        set({isDocumentPreviewOpen: isOpen});
      },
      setSignatureModalOpen: isOpen => {
        set({isSignatureModalOpen: isOpen});
      },
      setSessionCompleted: (isCompleted, completedAt) => {
        set({
          isSessionCompleted: isCompleted,
          sessionCompletedAt: isCompleted
            ? completedAt || new Date().toISOString()
            : null,
        });
      },
    }),
    {
      client,
      storageMapping: {
        objects: true,
        currentPage: true,
        sharedDocument: true,
        isDocumentPreviewOpen: true,
        isSignatureModalOpen: true,
        isSessionCompleted: true,
        sessionCompletedAt: true,
      },
      presenceMapping: {
        selectedObjectId: true,
      },
    },
  ),
);
