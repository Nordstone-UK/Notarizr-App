import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useStorage, useRoom } from '@liveblocks/react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/web/pdf_viewer.css';
import SignaturePad from 'react-signature-canvas';
import SignatureContainer from '../../components/SignatureContainer';
import useRegister from '../../hooks/useRegister';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SignatureInfo {
  id: string;
  position: { x: number; y: number };
  type: 'signature' | 'text' | 'date';
  content: string;
  ownerId?: string;
  ownerRole?: string;
  page: number;
  [key: string]: any; // Make it indexable for Liveblocks JSON compatibility
}

interface LiveblocksSignDocumentScreenProps {
  docUrl: string;
  sessionId: string;
}

// Helper: Convert dataURL to Blob
function dataURLtoBlob(dataurl: string) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Helper: Convert dataURL to File
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const LiveblocksSignDocumentScreen: React.FC<LiveblocksSignDocumentScreenProps> = ({ docUrl, sessionId }) => {
  const [error, setError] = useState<string | null>(null);
  const [showPad, setShowPad] = useState(false);
  const sigPadRef = useRef<any>(null);
  const { uploadimageToS3, uploadDocumentToSupabase } = useRegister();
  const [uploading, setUploading] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typedSign, setTypedSign] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageDims, setPageDims] = useState<{ width: number; height: number }[]>([]);
  const pdfCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Liveblocks storage for objects (dictionary of objects keyed by id)
  const objects = (useStorage((root) => (root.objects as Record<string, SignatureInfo>)) ?? {}) as Record<string, SignatureInfo>;
  const room = useRoom();

  // Get current user info
  const userId = localStorage.getItem('user_id');
  const userRole = localStorage.getItem('userRole');

  // Render all PDF pages
  useEffect(() => {
    const renderPDF = async () => {
      try {
        if (!docUrl) return;
        const loadingTask = pdfjsLib.getDocument(docUrl);
        const pdf = await loadingTask.promise;
        setNumPages(pdf.numPages);
        const dims: { width: number; height: number }[] = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const vp = page.getViewport({ scale: 1.5 });
          dims.push({ width: vp.width, height: vp.height });
          const canvas = pdfCanvasRefs.current[pageNum - 1];
          if (!canvas) continue;
          const context = canvas.getContext('2d');
          if (!context) continue;
          canvas.height = vp.height;
          canvas.width = vp.width;
          await page.render({ canvasContext: context, viewport: vp }).promise;
        }
        setPageDims(dims);
      } catch (err) {
        // setError('Failed to load PDF file');
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
  const handleSaveSignature = async () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
      try {
        setUploading(true);
        const file = dataURLtoFile(dataUrl, `signature_${Date.now()}.png`);
        const uploadUrls = await uploadDocumentToSupabase([file]);
        const url = uploadUrls[0];
        const id = Date.now().toString();
        addObject(id, {
          id,
          type: 'signature',
          content: url,
          position: { x: 100, y: 100 },
          page: currentPage
        });
        sigPadRef.current.clear();
        setShowPad(false);
      } catch (err) {
        alert('Failed to upload signature. Please try again.');
        console.error(err);
        setUploading(false);
        return;
      }
      setUploading(false);
    }
  };

  // Handler for updating object position (drag)
  const handleObjectChange = useMutation(({ storage }, updatedObj: SignatureInfo) => {
    const objects = (storage.get('objects') as Record<string, SignatureInfo>) || {};
    storage.set('objects', { ...objects, [updatedObj.id]: { ...objects[updatedObj.id], ...updatedObj } });
  }, []);

  // Handler: Upload image as signature
  const handleUploadImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadUrls = await uploadDocumentToSupabase([file]);
      const url = uploadUrls[0];
      const id = Date.now().toString();
      addObject(id, {
        id,
        type: 'signature',
        content: url,
        position: { x: 100, y: 100 },
        page: currentPage
      });
    } catch (err) {
      alert('Failed to upload image. Please try again.');
      console.error(err);
    }
    setUploading(false);
  };

  // Handler: Type signature
  const handleTypeSign = () => {
    setShowTypeModal(true);
    setTypedSign('');
  };

  const handleTypeSignSave = async () => {
    if (!typedSign.trim()) return;
    try {
      setUploading(true);
      // Create a canvas and draw the typed text as an image
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '48px cursive';
        ctx.fillStyle = '#222';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedSign, canvas.width / 2, canvas.height / 2);
      }
      const dataUrl = canvas.toDataURL('image/png');
      const file = dataURLtoFile(dataUrl, `typed_signature_${Date.now()}.png`);
      const uploadUrls = await uploadDocumentToSupabase([file]);
      const url = uploadUrls[0];
      const id = Date.now().toString();
      addObject(id, {
        id,
        type: 'signature',
        content: url,
        position: { x: 100, y: 100 },
        page: currentPage
      });
      setShowTypeModal(false);
      setTypedSign('');
    } catch (err) {
      alert('Failed to upload typed signature. Please try again.');
      console.error(err);
    }
    setUploading(false);
  };

  // Handler: Delete all signatures
  const handleDeleteAllSignatures = useMutation(({ storage }) => {
    const objects = (storage.get('objects') as Record<string, SignatureInfo>) || {};
    const filtered = Object.fromEntries(
      Object.entries(objects).filter(([_, obj]) => obj.type !== 'signature')
    );
    storage.set('objects', filtered);
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div
        className="relative bg-white rounded shadow border border-gray-200 mt-4 mb-4"
        style={{
          maxHeight: '80vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 'fit-content',
          margin: '0 auto',
        }}
      >
        {/* Page navigation controls */}
        {/* {numPages > 1 && (
          <div className="flex gap-2 my-2">
            {Array.from({ length: numPages }).map((_, idx) => (
              <button
                key={idx}
                className={`px-2 py-1 rounded ${currentPage === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setCurrentPage(idx + 1)}
              >
                Page {idx + 1}
              </button>
            ))}
          </div>
        )} */}
        <div className="fixed top-16 right-4 z-100 flex gap-2 bg-white p-2 rounded shadow border border-gray-300">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded shadow"
            onClick={() => setShowPad(true)}
            disabled={uploading}
          >
            Sign
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded shadow"
            onClick={handleUploadImageClick}
            disabled={uploading}
          >
            Upload Image
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded shadow"
            onClick={handleTypeSign}
            disabled={uploading}
          >
            Type Signature
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded shadow"
            onClick={handleDeleteAllSignatures}
            disabled={uploading}
          >
            Delete All Signatures
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex flex-col items-center w-full">
          {Array.from({ length: numPages }).map((_, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                width: pageDims[idx]?.width || 900,
                height: pageDims[idx]?.height || 1200,
                marginBottom: 24,
              }}
            >
              <canvas
                ref={el => (pdfCanvasRefs.current[idx] = el)}
                className="border border-gray-200 rounded"
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
              {/* Only render signatures for this page */}
              <SignatureContainer
                onSignatureChange={handleObjectChange}
                signatures={Object.values(objects).filter(obj => obj.page === idx + 1)}
                canvasDims={pageDims[idx] || { width: 900, height: 1200 }}
              />
            </div>
          ))}
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
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                  onClick={() => { sigPadRef.current.clear(); }}
                  disabled={uploading}
                >
                  Clear
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() => setShowPad(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
              <input
                type="text"
                className="border border-gray-300 rounded px-4 py-2 mb-4"
                placeholder="Type your signature"
                value={typedSign}
                onChange={e => setTypedSign(e.target.value)}
                disabled={uploading}
                maxLength={50}
                style={{ minWidth: 250 }}
              />
              <div className="flex gap-4">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  onClick={handleTypeSignSave}
                  disabled={uploading || !typedSign.trim()}
                >
                  Add
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() => setShowTypeModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveblocksSignDocumentScreen; 