import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import SignatureCanvas from 'react-signature-canvas';
import { PDFDocument } from 'pdf-lib';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_SESSION_BY_ID } from '@/graphql/queries/getSessionByID.query';
import { UPDATE_OR_CREATE_SESSION_CLIENT_DOCS } from '@/graphql/mutations/updateSessionClientDocs';
import useRegister from '@/hooks/useRegister';
import LiveblocksSignDocumentScreen from './LiveblocksSignDocumentScreen';
import { RoomProvider } from '@liveblocks/react';

// Constants
const APP_ID = "abd7df71ee024625b2cc979e12aec405";

// Types
interface MeetingProps {
  channelName: string;
  token: string;
  onCallEnd?: () => void;
}

const MeetingScreen: React.FC<MeetingProps> = ({  onCallEnd }) => {
  const navigate = useNavigate();
  const userData = useSelector((state: any) => state.user.user);

    const bookingDetail = useSelector((state: any) => state.booking.booking) || {};
    
    const [token, setToken] = useState(bookingDetail.agora_channel_token || '');
    const [channelName, setChannelName] = useState(bookingDetail.agora_channel_name || '');
  // State
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [screenTrack, setScreenTrack] = useState<any>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteScreenTrack, setRemoteScreenTrack] = useState<any>(null);
  const [remoteScreenSharer, setRemoteScreenSharer] = useState<any>(null);
  const userRole = localStorage.getItem('userRole');
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const signatureRef = useRef<any>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  
  // Refs
  const agoraClient = useRef<any>(null);
  const [getSession, { data: sessionData, refetch }] = useLazyQuery(GET_SESSION_BY_ID);
  const [updateClientDocs] = useMutation(UPDATE_OR_CREATE_SESSION_CLIENT_DOCS);
  const { sessionId } = useParams();
  const [uploading, setUploading] = useState(false);
  const { uploadDocumentToSupabase } = useRegister();

  useEffect(() => {
    setToken(bookingDetail.agora_channel_token || '');
    setChannelName(bookingDetail.agora_channel_name || '');
  }, [bookingDetail]);

  // Request permissions
  const requestPermissions = async () => {
    try {
      // Request camera permission
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStream.getTracks().forEach(track => track.stop());

      // Request microphone permission
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getTracks().forEach(track => track.stop());

      toast.success('Camera and microphone permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast.error('Please allow camera and microphone access to join the call');
      return false;
    }
  };

  // Initialize Agora
  const initializeAgora = async () => {
    try {
      const permissions = await navigator.permissions.query({ name: 'camera' as any });
      const micPermissions = await navigator.permissions.query({ name: 'microphone' as any });

      if (permissions.state === 'denied' || micPermissions.state === 'denied') {
        toast.error('Camera and microphone permissions are required. Please enable them in your browser settings.');
        return;
      }

      console.log("channelnameee", channelName, token);

      // Use high-quality audio profile
      agoraClient.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      await agoraClient.current.join(APP_ID, channelName, token, null);

      agoraClient.current.on('user-published', handleUserPublished);
      agoraClient.current.on('user-unpublished', handleUserUnpublished);

      try {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        // Set local audio track volume to 100
        audioTrack.setVolume(100);
        await agoraClient.current.publish([audioTrack, videoTrack]);
        setLocalVideoTrack(videoTrack);
        setLocalAudioTrack(audioTrack);
      } catch (trackError: any) {
        if (trackError.code === 'PERMISSION_DENIED') {
          toast.error('Please allow camera and microphone access to join the call');
        } else {
          throw trackError;
        }
        return;
      }
    } catch (error) {
      console.error('Error initializing Agora:', error);
      toast.error('Failed to join video call. Please check your camera and microphone permissions.');
    }
  };

  // Handle remote user events
  const handleUserPublished = async (user: any, mediaType: string) => {
    try {
      await agoraClient.current.subscribe(user, mediaType);

      if (!remoteUsers.find(u => u.uid === user.uid)) {
        setRemoteUsers(prev => [...prev, user]);
      }

      if (mediaType === 'video' && user.videoTrack) {
        setRemoteUsers(prev => prev.map(u =>
          u.uid === user.uid ? { ...u, videoTrack: user.videoTrack } : u
        ));

        // Detect remote screen sharing by track label
        const label = user.videoTrack.getTrackLabel ? user.videoTrack.getTrackLabel() : '';
        if (label.toLowerCase().includes('screen')) {
          setRemoteScreenTrack(user.videoTrack);
          setRemoteScreenSharer(user);
        } else {
          // If a new camera video is published, clear remote screen track if it was set for this user
          if (remoteScreenSharer && remoteScreenSharer.uid === user.uid) {
            setRemoteScreenTrack(null);
            setRemoteScreenSharer(null);
          }
        }
      }

      // Always try to play remote audio if available
      if (user.audioTrack) {
        console.log('Remote audio track found for user', user.uid);
        user.audioTrack.setVolume(100); // Set remote audio volume to 100
        user.audioTrack.play();
      } else {
        console.log('No remote audio track for user', user.uid);
      }
    } catch (error) {
      console.error('Error handling user published:', error);
    }
  };

  const handleUserUnpublished = (user: any) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  // Control functions
  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.setMuted(!isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setMuted(!isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const leaveChannel = async () => {
    if (localVideoTrack) {
      localVideoTrack.close();
    }
    if (localAudioTrack) {
      localAudioTrack.close();
    }
    await agoraClient.current?.leave();
    if (onCallEnd) {
      onCallEnd();
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        // Pass an empty config object to createScreenVideoTrack
        let screenTrackLocal = await AgoraRTC.createScreenVideoTrack({});
        // Handle if an array is returned (for audio+video)
        if (Array.isArray(screenTrackLocal)) {
          screenTrackLocal = screenTrackLocal[0];
        }
        if (localVideoTrack) {
          await agoraClient.current.unpublish(localVideoTrack);
        }
        await agoraClient.current.publish(screenTrackLocal);
        setScreenTrack(screenTrackLocal);
        setIsScreenSharing(true);

        // When the user stops sharing from browser UI
        screenTrackLocal.on('track-ended', async () => {
          await agoraClient.current.unpublish(screenTrackLocal);
          if (localVideoTrack) {
            await agoraClient.current.publish(localVideoTrack);
          }
          setIsScreenSharing(false);
          setScreenTrack(null);
        });
      } catch (error) {
        toast.error('Screen sharing failed');
        console.error('Screen sharing error:', error);
      }
    } else {
      if (screenTrack) {
        await agoraClient.current.unpublish(screenTrack);
        if (localVideoTrack) {
          await agoraClient.current.publish(localVideoTrack);
        }
        setIsScreenSharing(false);
        setScreenTrack(null);
      }
    }
  };

  // PDF load success handler
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const addSignature = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL();
      const newSignature = {
        id: Date.now().toString(),
        type: 'signature',
        position: { x: 100, y: 100 },
        content: signatureData,
        page: currentPage,
      };
      setSignatures([...signatures, newSignature]);
      clearSignature();
    }
  };

  const handleDragStart = (e: React.DragEvent, signatureId: string) => {
    setSelectedSignature(signatureId);
    setIsDragging(true);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (selectedSignature) {
      const updatedSignatures = signatures.map(sig => {
        if (sig.id === selectedSignature) {
          return {
            ...sig,
            position: dragPosition,
          };
        }
        return sig;
      });
      setSignatures(updatedSignatures);
    }
    setIsDragging(false);
    setSelectedSignature(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return;
    setDragPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDeleteSignature = (signatureId: string) => {
    setSignatures(signatures.filter(sig => sig.id !== signatureId));
  };

  const savePDF = async () => {
    try {
      // Load the PDF document
      const response = await fetch(pdfFile!);
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      // Add signatures to their respective pages
      for (const signature of signatures) {
        const page = pages[signature.page - 1];
        if (signature.type === 'signature') {
          // Convert signature data URL to image and embed in PDF
          const signatureImage = await pdfDoc.embedPng(signature.content);
          page.drawImage(signatureImage, {
            x: signature.position.x,
            y: page.getHeight() - signature.position.y,
            width: 100,
            height: 50,
          });
        }
      }

      // Save the PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'signed-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Document has been signed and saved successfully.');
    } catch (error) {
      console.error('Error saving PDF:', error);
      toast.error('Failed to save the signed document.');
    }
  };

  // Fetch session on mount
  useEffect(() => {
    if (bookingDetail?._id) {
      getSession({ variables: { sessionId: bookingDetail._id } });
    }
  }, [bookingDetail?._id]);

  const handleClientUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const file = e.target.files[0];
      try {
        const uploadResult = await (uploadDocumentToSupabase([file]) as Promise<string[]>);
        const url = uploadResult[0];
        if (!url) throw new Error('No URL returned from upload');
        await updateClientDocs({
          variables: {
            sessionId: bookingDetail._id,
            clientDocuments: [{ key: file.name, value: url }],
          },
        });
        toast.success('Document uploaded!');
        refetch();
      } catch (err) {
        toast.error('Failed to upload document.');
        console.error('Upload error:', err);
      }
      setUploading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    const setup = async () => {
      const hasPermissions = await requestPermissions();
      if (hasPermissions) {
        initializeAgora();
      } else {
        setPermissionError(true);
      }
    };
    
    setup();

    // Cleanup on unmount
    return () => {
      leaveChannel();
    };
  }, [channelName, token]);

  return (
    <div className="h-screen w-full flex bg-[#f7f7fa]">
      {/* Center Video Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-[700px] max-w-full flex flex-col items-center">
          {/* Participant Count */}
          <div className="absolute top-0 right-0 mt-2 mr-2 z-10 bg-gray-800 text-white text-xs px-3 py-1 rounded shadow">
            <span>👥 {1 + remoteUsers.length} participant{remoteUsers.length ? 's' : ''}</span>
          </div>
          {/* Video Panels */}
          <div className="relative flex justify-center items-center mt-8 mb-6 w-full min-h-[320px]" style={{ minHeight: '320px' }}>
            {/* If remote screen sharing is active and the current user is NOT the sharer, show remote screen as main, camera as PiP */}
            {remoteScreenTrack && remoteScreenSharer && remoteScreenSharer.uid !== userData?.uid ? (
              <>
                {/* Main big screen (remote screen) */}
                <div className="w-full h-[400px] bg-black rounded-lg overflow-hidden shadow flex items-center justify-center">
                  <div
                    className="w-full h-full"
                    ref={el => {
                      if (el) {
                        remoteScreenTrack.play(el);
                      }
                    }}
                  />
                </div>
                {/* PiP camera video (remote camera) */}
                <div className="absolute bottom-4 right-4 w-40 h-28 bg-black rounded-lg overflow-hidden shadow-lg border-2 border-white flex items-end">
                  <div
                    className="w-full h-full"
                    ref={el => {
                      if (el && remoteScreenSharer && remoteScreenSharer.videoTrack) {
                        remoteScreenSharer.videoTrack.play(el);
                      }
                    }}
                  />
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                    Remote User
                  </div>
                </div>
              </>
            ) : isScreenSharing && screenTrack ? (
              <>
                {/* Main big screen (local screen) */}
                <div className="w-full h-[400px] bg-black rounded-lg overflow-hidden shadow flex items-center justify-center">
                  <div
                    className="w-full h-full"
                    ref={el => {
                      if (el) {
                        screenTrack.play(el);
                      }
                    }}
                  />
                </div>
                {/* PiP camera video (local camera) */}
                <div className="absolute bottom-4 right-4 w-40 h-28 bg-black rounded-lg overflow-hidden shadow-lg border-2 border-white flex items-end">
                  <div
                    className="w-full h-full"
                    ref={el => {
                      if (el && localVideoTrack) {
                        localVideoTrack.play(el);
                      }
                    }}
                  />
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                    You
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Default layout: local and remote videos side by side */}
                <div className="w-80 h-60 bg-black rounded-lg overflow-hidden shadow relative flex items-end mr-6">
                  {localVideoTrack && (
                    <div
                      id="local-video"
                      className="w-full h-full"
                      ref={el => {
                        if (el) {
                          localVideoTrack.play(el);
                        }
                      }}
                    />
                  )}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                    You
                  </div>
                </div>
                {remoteUsers.length > 0 ? (
                  <div className="w-80 h-60 bg-black rounded-lg overflow-hidden shadow relative flex items-end">
                    <div
                      className="w-full h-full"
                      ref={el => {
                        if (el && remoteUsers[0].videoTrack) {
                          remoteUsers[0].videoTrack.play(el);
                        }
                      }}
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                      Remote User
                    </div>
                  </div>
                ) : (
                  <div className="w-80 h-60 bg-gray-900 rounded-lg flex items-center justify-center text-gray-400 text-lg shadow">
                    Waiting for participant...
                  </div>
                )}
              </>
            )}
          </div>
          {/* Controls */}
          <div className="flex justify-center gap-6 p-4 bg-white rounded-full shadow-lg mt-2">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full flex items-center justify-center transition-colors text-white text-xl ${
                isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
              title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full flex items-center justify-center transition-colors text-white text-xl ${
                isVideoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
              title={isVideoMuted ? 'Turn Video On' : 'Turn Video Off'}
            >
              {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
            {/* Screen Share Button */}
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full flex items-center justify-center transition-colors text-white text-xl ${isScreenSharing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              {/* Simple screen share icon (monitor with stand) */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 16v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={leaveChannel}
              className="p-4 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-xl"
              title="End Call"
            >
              <Phone className="w-6 h-6 transform rotate-135" />
            </button>
          </div>
        </div>
      </div>
      {/* Right Document Panel */}
      <div className="w-[600px] bg-white border-l border-gray-200 flex flex-col overflow-hidden">
        {/* Upload Section */}
        <div className="p-4 border-b border-gray-200">
        <div className="mb-4 text-gray-700 font-semibold text-lg">Upload Document</div>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleClientUpload}
          className="mb-4"
          disabled={uploading}
        />
        </div>

        {/* Documents List and Signing Area */}
        <div className="flex-1 overflow-auto">
        {(sessionData?.getSession?.session?.client_documents || sessionData?.getSessionById?.client_documents) ? (
          (() => {
            const docsObj = sessionData?.getSession?.session?.client_documents || sessionData?.getSessionById?.client_documents;
            const docs = Array.isArray(docsObj)
              ? docsObj
              : Object.entries(docsObj).map(([key, value]) => ({ key, value }));
            return (
                <div className="space-y-2 p-4">
                {docs.map((doc: any, idx: number) => (
                  <div key={doc.key || idx} className="flex items-center gap-2 border p-2 rounded">
                    <span className="truncate flex-1">{doc.key || `Document ${idx + 1}`}</span>
                      {(userRole === 'agent' || userRole === 'client') && (
                        <RoomProvider
                          id={'notary-signing-room'}
                        >
                          <LiveblocksSignDocumentScreen
                            docUrl={doc.value}
                            sessionId={'notary-signing-room'}
                          />
                        </RoomProvider>
                      )}
                    <a
                      href={typeof doc.value === 'string' ? doc.value : ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded ml-2"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            );
          })()
        ) : (
            <div className="text-gray-500 p-4">No documents uploaded yet.</div>
        )}
        </div>
      </div>
      {/* Permission Error Modal */}
      {permissionError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-xl">
            <div className="flex flex-col items-center justify-center p-4">
              <p className="text-red-500 mb-4">Camera and microphone access is required</p>
              <button
                onClick={async () => {
                  const hasPermissions = await requestPermissions();
                  if (hasPermissions) {
                    setPermissionError(false);
                    initializeAgora();
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Grant Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingScreen; 