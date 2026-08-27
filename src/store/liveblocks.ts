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
  completionRequest: {
    status: 'idle' | 'pending' | 'approved' | 'rejected';
    requestedAt: string | null;
  };
  // Keyed by document uri so each document in a multi-document call carries its
  // own finalized state. Both participants read this to lock further edits.
  completedDocuments: Record<
    string,
    {completedAt: string; signedUrl: string | null}
  >;
  documentCompletionNotice: {
    id: string;
    message: string;
    completedAt: string;
  } | null;
  sessionParticipant: {
    name: string;
    role: string;
    agoraUid?: number | null;
    userId?: string | null;
  } | null;
  signingActivity: {
    status: 'idle' | 'choosing' | 'signing' | 'placing';
    label: string;
    page: number;
    x?: number;
    y?: number;
  };
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
  clearSharedDocument: () => void;
  setDocumentPreviewOpen: (isOpen: boolean) => void;
  setSignatureModalOpen: (isOpen: boolean) => void;
  setSessionCompleted: (isCompleted: boolean, completedAt?: string) => void;
  setCompletionRequest: (
    status: State['completionRequest']['status'],
    requestedAt?: string,
  ) => void;
  markDocumentComplete: (
    documentUris: string | (string | null | undefined)[],
    signedUrl?: string | null,
  ) => void;
  setSessionParticipant: (participant: {
    name: string;
    role: string;
    agoraUid?: number | null;
    userId?: string | null;
  }) => void;
  setSigningActivity: (activity: State['signingActivity']) => void;
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
      completionRequest: {
        status: 'idle',
        requestedAt: null,
      },
      completedDocuments: {},
      documentCompletionNotice: null,
      sessionParticipant: null,
      signingActivity: {
        status: 'idle',
        label: '',
        page: 1,
      },
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
        set({
          objects: remainingObjects,
          selectedObjectId: null,
          ...(Object.keys(remainingObjects).length === 0
            ? {
              signingActivity: {
                status: 'idle' as const,
                label: '',
                page: get().currentPage,
              },
            }
            : {}),
        });
      },
      setSelectedObjectId: id => {
        set({selectedObjectId: id});
      },
      deleteAllObjects: () => {
        set({
          objects: {},
          selectedObjectId: null,
          signingActivity: {
            status: 'idle',
            label: '',
            page: get().currentPage,
          },
        });
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
      clearSharedDocument: () => {
        set({
          sharedDocument: null,
          isDocumentPreviewOpen: false,
          objects: {},
          selectedObjectId: null,
          currentPage: 1,
          signingActivity: {
            status: 'idle',
            label: '',
            page: 1,
          },
          completionRequest: {
            status: 'idle',
            requestedAt: null,
          },
        });
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
      setCompletionRequest: (status, requestedAt) => {
        set({
          completionRequest: {
            status,
            requestedAt:
              status === 'pending'
                ? requestedAt || new Date().toISOString()
                : get().completionRequest.requestedAt,
          },
        });
      },
      setSessionParticipant: participant => {
        set({sessionParticipant: participant});
      },
      setSigningActivity: activity => {
        set({signingActivity: activity});
      },
      markDocumentComplete: (documentUris, signedUrl) => {
        const uris = (
          Array.isArray(documentUris) ? documentUris : [documentUris]
        )
          .map(uri => (typeof uri === 'string' ? uri.trim() : ''))
          .filter(Boolean);
        if (!uris.length) {
          return;
        }

        const completedAt = new Date().toISOString();
        const nextCompleted = {...(get().completedDocuments || {})};
        uris.forEach(uri => {
          nextCompleted[uri] = {
            completedAt,
            signedUrl:
              signedUrl ?? nextCompleted[uri]?.signedUrl ?? null,
          };
        });
        set({
          completedDocuments: nextCompleted,
          documentCompletionNotice: {
            id: `${completedAt}-${uris[0]}`,
            message:
              'Document has been marked as completed and can no longer be edited.',
            completedAt,
          },
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
        completionRequest: true,
        completedDocuments: true,
        documentCompletionNotice: true,
      },
      presenceMapping: {
        selectedObjectId: true,
        sessionParticipant: true,
        signingActivity: true,
      },
    },
  ),
);
