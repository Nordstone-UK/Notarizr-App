import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useStorage, useRoom } from '@liveblocks/react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/web/pdf_viewer.css';
import SignaturePad from 'react-signature-canvas';
import SignatureContainer from '../../components/SignatureContainer';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SignatureInfo {
  id: string;
  position: { x: number; y: number };
  type: 'signature' | 'text' | 'date';
  content: string;
  ownerId?: string;
  ownerRole?: string;
  [key: string]: any; // Make it indexable for Liveblocks JSON compatibility
}

interface LiveblocksSignDocumentScreenProps {
  docUrl: string;
  sessionId: string;
}

const LiveblocksSignDocumentScreen: React.FC<LiveblocksSignDocumentScreenProps> = ({ docUrl, sessionId }) => {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPad, setShowPad] = useState(false);
  const sigPadRef = useRef<any>(null);
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Liveblocks storage for objects (dictionary of objects keyed by id)
  const objects = (useStorage((root) => (root.objects as Record<string, SignatureInfo>)) ?? {}) as Record<string, SignatureInfo>;
  const room = useRoom();

  // Get current user info
  const userId = localStorage.getItem('user_id');
  const userRole = localStorage.getItem('userRole');

  // Render PDF (just the PDF, no signatures)
  useEffect(() => {
    const renderPDF = async () => {
      try {
        if (!docUrl) return;
        const loadingTask = pdfjsLib.getDocument(docUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 1.5 });
        const canvas = pdfCanvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        canvas.height = vp.height;
        canvas.width = vp.width;
        setCanvasDims({ width: vp.width, height: vp.height });
        await page.render({ canvasContext: context, viewport: vp }).promise;
      } catch (err) {
        setError('Failed to load PDF file');
        console.error('PDF Error:', err);
      }
    };
    renderPDF();
  }, [docUrl]);

  // Add object (signature) to Liveblocks
  const addObject = useMutation(({ storage }, id: string, object: SignatureInfo) => {
    const objects = (storage.get('objects') as Record<string, SignatureInfo>) || {};
    storage.set('objects', { ...objects, [id]: { ...object, ownerId: userId, ownerRole: userRole } });
  }, [userId, userRole]);

  // Add signature from pad
  const handleSaveSignature = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
      const id = Date.now().toString();
      addObject(id, {
        id,
        type: 'signature',
        content: dataUrl,
        position: { x: 100, y: 100 }
      });
      setShowPad(false);
      sigPadRef.current.clear();
    }
  };

  // Handler for updating object position (drag)
  const handleObjectChange = useMutation(({ storage }, updatedObj: SignatureInfo) => {
    const objects = (storage.get('objects') as Record<string, SignatureInfo>) || {};
    storage.set('objects', { ...objects, [updatedObj.id]: { ...objects[updatedObj.id], ...updatedObj } });
  }, []);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 500 }}>
      {error && <div className="text-red-500">{error}</div>}
      <div style={{ position: 'relative', width: canvasDims.width || 900, height: canvasDims.height || 1200 }}>
        <canvas 
          ref={pdfCanvasRef}
          className="border border-gray-200 rounded"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        {/* Overlay objects as draggable components */}
        <SignatureContainer
          onSignatureChange={handleObjectChange}
          signatures={Object.values(objects)}
          canvasDims={canvasDims}
        />
        <button
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white rounded shadow"
          onClick={() => setShowPad(true)}
        >
          Sign
        </button>
      </div>
      {showPad && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
            <SignaturePad
              ref={sigPadRef}
              penColor="black"
              canvasProps={{ width: 400, height: 200, className: 'border border-gray-300 rounded' }}
            />
            <div className="flex gap-4 mt-4">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleSaveSignature}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => { sigPadRef.current.clear(); }}
              >
                Clear
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => setShowPad(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveblocksSignDocumentScreen; 