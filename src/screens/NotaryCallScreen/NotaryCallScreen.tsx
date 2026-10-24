import {
  TouchableOpacity,
  Image,
  StyleSheet,
  View,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  Linking,
  BackHandler,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Text as RNText,
} from 'react-native';
import moment from 'moment-timezone';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';
import { getBookingDisplayId } from '../../utils/bookingPresentation';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Colors from '../../themes/Colors';
import { widthToDp } from '../../utils/Responsive';

import Toast from 'react-native-toast-message';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import PdfView from 'react-native-pdf';

import RNPickerSelect from 'react-native-picker-select';
import { CommonActions } from '@react-navigation/native';
import { useLiveblocks } from '../../store/liveblocks';

import Pdf from 'react-native-pdf';
import { encode as btoa } from 'base-64';
import RNFS from 'react-native-fs';
import { uploadSignedDocumentToSpaces } from '../../utils/spacesHelper';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SIGN_DOCS } from '../../../request/mutations/signDocument';
import { ADD_NOTARIZED_DOCS } from '../../../request/mutations/addNotarizedDocs';
import { SESSION_ADD_NOTARIZED_DOCS } from '../../../request/mutations/sessionAddNotarizedDocs.mutation';
import {
  COMPLETE_BOOKING_NOTARIZATION,
  COMPLETE_SESSION_NOTARIZATION,
} from '../../../request/mutations/completeNotarization.mutation';
import useBookingStatus from '../../hooks/useBookingStatus';
import { GET_SESSION_BY_ID } from '../../../request/queries/getSessionByID.query';
import { GET_BOOKING_BY_ID } from '../../../request/queries/getBookingByID.query';
import { setBookingInfoState } from '../../features/booking/bookingSlice';
import SignatureContainer from './SignatureContainer';
import useRegister from '../../hooks/useRegister';
import { UPDATE_OR_CREATE_SESSION_UPDATED_DOCS } from '../../../request/mutations/updateSessionUpdateddocs';
import SketchCanvasComponent from './PenTool/SketchCanvasComponent';
import { UPDATE_OR_CREATE_SESSION_CLIENT_DOCS } from '../../../request/mutations/updateSessionClientDocs';
import DrawSignTypeModal, { ActiveSignerPresence } from './Signature';
import { getSessionAvailability } from '../../utils/sessionAvailability';
import {getObserverPhone} from '../../utils/observerPhone';
import LiveKitSessionVideo from '../../components/LiveKitSessionVideo/LiveKitSessionVideo';
import RemoteRonCallScreen from './RemoteRonCallScreen';
import { VERIFY_SESSION_CLIENT_IDENTITY } from '../../../request/mutations/verifySessionClientIdentity.mutation';

const resolveDocumentUri = (document: any): string | null => {
  if (typeof document === 'string') {
    const uri = document.trim();
    return uri.length > 0 ? uri : null;
  }

  if (!document || typeof document !== 'object') {
    return null;
  }

  return (
    resolveDocumentUri(document.url) ||
    resolveDocumentUri(document.uri) ||
    resolveDocumentUri(document.value)
  );
};

const documentFileName = (document: any, fallback: string): string => {
  if (typeof document?.name === 'string' && document.name.trim()) {
    return document.name.trim();
  }

  const uri = resolveDocumentUri(document);
  if (!uri) {
    return fallback;
  }

  const pathWithoutQuery = uri.split('?')[0];
  const encodedName = pathWithoutQuery.split('/').pop();
  if (!encodedName) {
    return fallback;
  }

  try {
    return decodeURIComponent(encodedName);
  } catch {
    return encodedName;
  }
};

const isRemoteDocumentUri = (uri: string): boolean => /^https?:\/\//i.test(uri);

const localFilePath = (uri: string): string => {
  if (!uri.startsWith('file://')) {
    return uri;
  }

  const filePath = uri.slice('file://'.length);
  try {
    return decodeURIComponent(filePath);
  } catch {
    return filePath;
  }
};

const getPersonName = (person: any, fallback = ''): string =>
  [person?.first_name, person?.last_name].filter(Boolean).join(' ') ||
  fallback;

export default function NotaryCallScreen({ route, navigation }: any) {
  const booking = useSelector((state: any) => state?.booking?.booking);
  const inPerson = route?.params?.sessionMode === 'in_person' || booking?.session_mode === 'in_person';
  return inPerson
    ? <InPersonCallScreen route={route} navigation={navigation} />
    : <RemoteRonCallScreen route={route} navigation={navigation} />;
}

function InPersonCallScreen({ route, navigation }: any) {
  const {
    routeFrom,
    date: routeDate,
    time: routeTime,
    uid: routeUid,
  } = route?.params || {};
  const { pickDocumentDetails, uploadDocumentToStorage } = useRegister();
  const [updateSessionClientDocs] = useMutation(
    UPDATE_OR_CREATE_SESSION_CLIENT_DOCS,
  );
  const dispatch = useDispatch();
  const [UpdateDocumentsByDocId] = useMutation(SIGN_DOCS);
  const {
    handlegetBookingStatus,
    handleSessionStatus,
  } = useBookingStatus();
  const [AddSignedDocs] = useMutation(ADD_NOTARIZED_DOCS);
  const [addSessionNotarizedDocs] = useMutation(SESSION_ADD_NOTARIZED_DOCS);
  const [completeBookingNotarization] = useMutation(
    COMPLETE_BOOKING_NOTARIZATION,
  );
  const [completeSessionNotarization] = useMutation(
    COMPLETE_SESSION_NOTARIZATION,
  );
  const [getSession] = useLazyQuery(GET_SESSION_BY_ID);
  const [getBookingByID] = useLazyQuery(GET_BOOKING_BY_ID, {
    fetchPolicy: 'network-only',
  });
  const [verifyClientIdentity, {loading: verifyingClientIdentity}] = useMutation(
    VERIFY_SESSION_CLIENT_IDENTITY,
  );
  const User = useSelector(state => state?.user?.user);
  const isAgent = String(User?.account_type || '').includes('agent');
  const isClient = !isAgent && User?.account_type === 'client';
  const insets = useSafeAreaInsets();
  const sharedDocument = useLiveblocks(state => state.sharedDocument);
  const isDocumentCollaborationActive = Boolean(
    resolveDocumentUri(sharedDocument),
  );
  const setSharedDocument = useLiveblocks(state => state.setSharedDocument);
  const setDocumentPreviewOpen = useLiveblocks(
    state => state.setDocumentPreviewOpen,
  );
  const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const isSessionCompleted = useLiveblocks(state => state.isSessionCompleted);
  const sessionCompletedAt = useLiveblocks(state => state.sessionCompletedAt);
  const setSessionCompleted = useLiveblocks(state => state.setSessionCompleted);
  const completionRequest = useLiveblocks(state => state.completionRequest);
  const setCompletionRequest = useLiveblocks(
    state => state.setCompletionRequest,
  );
  const completedDocuments = useLiveblocks(
    state => state.completedDocuments || {},
  );
  const documentCompletionNotice = useLiveblocks(
    state => state.documentCompletionNotice,
  );
  const markDocumentComplete = useLiveblocks(
    state => state.markDocumentComplete,
  );
  const deleteAllObjects = useLiveblocks(state => state.deleteAllObjects);
  const signingObjects = useLiveblocks(state => state.objects);
  const sessionParticipant = useLiveblocks(state => state.sessionParticipant);
  const signingActivity = useLiveblocks(state => state.signingActivity);
  const setSessionParticipant = useLiveblocks(
    state => state.setSessionParticipant,
  );
  const setSigningActivity = useLiveblocks(state => state.setSigningActivity);
  const roomOthers = useLiveblocks(state => state.liveblocks.others);
  const enterRoom = useLiveblocks(state => state.liveblocks.enterRoom);
  const leaveRoom = useLiveblocks(state => state.liveblocks.leaveRoom);
  const bookingData =
    useSelector((state: any) => state?.booking?.booking) || {};
  const sessionIdentityProof = bookingData?.live_session?.identity_proof;
  const sessionIdentityProofUrl = resolveDocumentUri(sessionIdentityProof);
  const sessionIdentityProofName = documentFileName(
    sessionIdentityProof,
    'Client identity proof',
  );
  const [identityVerifiedOverride, setIdentityVerifiedOverride] = useState<boolean | null>(null);
  const clientIdentityVerified = identityVerifiedOverride ?? Boolean(bookingData?.live_session?.client_identity_verified);
  const isObserver = useMemo(() => {
    if (isAgent) {
      return false;
    }
    const observers = Array.isArray(bookingData?.observers)
      ? bookingData.observers
      : [];
    const userId = String(User?._id || '');
    const userPhone = getObserverPhone(User);
    return observers.some((observer: any) => {
      if (observer && typeof observer === 'object' && observer._id) {
        return String(observer._id) === userId;
      }
      const phone = getObserverPhone(observer);
      return Boolean(phone && userPhone && phone === userPhone);
    });
  }, [User, bookingData?.observers, isAgent]);
  const participantRole = isAgent
    ? 'Notary'
    : isObserver
      ? 'Observer'
      : 'Client';
  const bookingRoomId = routeUid || bookingData?._id;
  const markClientIdentityVerified = useCallback(async () => {
    if (!bookingRoomId || !sessionIdentityProofUrl || !isAgent) return;
    try {
      const result = await verifyClientIdentity({
        variables: {recordId: String(bookingRoomId), verified: !clientIdentityVerified},
      });
      const response = result?.data?.verifySessionClientIdentityR;
      if (response?.status !== '200') throw new Error(response?.message || 'Could not update client verification.');
      setIdentityVerifiedOverride(!clientIdentityVerified);
      Toast.show({type: 'success', text1: response.message});
    } catch (error: any) {
      Toast.show({type: 'error', text1: error?.message || 'Could not update client verification.'});
    }
  }, [bookingRoomId, clientIdentityVerified, isAgent, sessionIdentityProofUrl, verifyClientIdentity]);
  const isInPersonMode =
    route?.params?.sessionMode === 'in_person' ||
    bookingData?.session_mode === 'in_person';
  const useLiveKit = Boolean(bookingRoomId) && !isInPersonMode;
  const scheduledDate =
    routeDate || bookingData?.date_of_booking || bookingData?.date_time_session;
  const scheduledTime =
    routeTime || bookingData?.time_of_booking || bookingData?.date_time_session;
  const sessionAvailability = useMemo(
    () => getSessionAvailability({ date: scheduledDate, time: scheduledTime }),
    [scheduledDate, scheduledTime],
  );
  const clientDocuments = useMemo(
    () => bookingData?.client_documents || {},
    [bookingData?.client_documents],
  );
  const agentDocuments = useMemo(
    () =>
      Array.isArray(bookingData?.agent_document)
        ? bookingData.agent_document
        : [],
    [bookingData?.agent_document],
  );
  const clientDocumentsKeys = Object.keys(clientDocuments);
  const clientDocumentsValues = Object.values(clientDocuments);

  const initialSourceKey =
    clientDocumentsKeys.length > 0
      ? clientDocumentsKeys[0]
      : agentDocuments.length > 0
        ? 'agent_document'
        : null;

  const initialSourceUrl = resolveDocumentUri(
    clientDocumentsValues.length > 0
      ? clientDocumentsValues[0]
      : agentDocuments.length > 0
        ? agentDocuments[0]
        : null,
  );

  // Create state for sourceKey and sourceUrl
  const [sourceKey, setSourceKey] = useState<string | null>(initialSourceKey);
  const [sourceUrl, setSourceUrl] = useState<string | null>(initialSourceUrl);
  const [pickerItems, setPickerItems] = useState<
    Array<{label: string; value: string; documentKey: string}>
  >([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [updatedDocumentsession] = useMutation(
    UPDATE_OR_CREATE_SESSION_UPDATED_DOCS,
  );
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [documentLoadError, setDocumentLoadError] = useState('');
  const [documentLoadAttempt, setDocumentLoadAttempt] = useState(0);
  const [pdfEditMode, setPdfEditMode] = useState(false);
  const [signatureArrayBuffer, setSignatureArrayBuffer] = useState(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [newPdfSaved, setNewPdfSaved] = useState(false);
  const [newPdfPath, setNewPdfPath] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [filePath, setFilePath] = useState<string | null>(
    `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
  );
  const [isInteractionBlocked, setIsInteractionBlocked] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [signatureDimensions, setSignatureDimensions] = useState({});
  const [signatureImageMimeType, setSignatureImageMimeType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientDocModalVisible, setClientDocModalVisible] = useState(false);
  const [selectedLocalDocument, setSelectedLocalDocument] = useState<any>(null);
  const [markCompleteConfirmVisible, setMarkCompleteConfirmVisible] =
    useState(false);
  const [isMarkingDocumentComplete, setIsMarkingDocumentComplete] =
    useState(false);
  const [openedDocumentUris, setOpenedDocumentUris] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [localSessionCompleted, setLocalSessionCompleted] = useState(false);
  const [localSessionCompletedAt, setLocalSessionCompletedAt] = useState<
    string | null
  >(null);
  const statusReadersRef = useRef({
    handlegetBookingStatus,
    handleSessionStatus,
  });
  const completionExitRef = useRef(false);
  const documentLoadIdRef = useRef(0);
  const documentSelectionInFlightRef = useRef(false);
  const lastUploadedDocumentRef = useRef<string | null>(null);
  const completionNavigationRef = useRef(false);
  const completionFinalizationRef = useRef(false);
  const rejectionNoticeRef = useRef<string | null>(null);
  const uidIdentityRef = useRef<Map<number, string>>(new Map());
  const seenDocumentCompletionNoticeRef = useRef<string | null | undefined>(
    undefined,
  );
  const isWaitingForClientApproval =
    completionRequest.status === 'pending' ||
    completionRequest.status === 'approved';
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const getFitPolicy = () => {
    if (pageWidth && pageHeight) {
      const screenRatio = screenWidth / screenHeight;
      const pageRatio = pageWidth / pageHeight;
      return screenRatio > pageRatio ? 2 : 1; // Fit height if screen is taller, otherwise fit width
    }
    return 0; // Default fitPolicy
  };
  useEffect(() => {
    statusReadersRef.current = {
      handlegetBookingStatus,
      handleSessionStatus,
    };
  }, [handlegetBookingStatus, handleSessionStatus]);

  useEffect(() => {
    seenDocumentCompletionNoticeRef.current = undefined;
  }, [bookingRoomId]);

  useEffect(() => {
    const noticeId = documentCompletionNotice?.id || null;
    if (seenDocumentCompletionNoticeRef.current === undefined) {
      seenDocumentCompletionNoticeRef.current = noticeId;
      return;
    }
    if (!noticeId || seenDocumentCompletionNoticeRef.current === noticeId) {
      return;
    }
    seenDocumentCompletionNoticeRef.current = noticeId;
    Toast.show({
      type: 'success',
      text1:
        documentCompletionNotice?.message ||
        'Document has been marked as completed and can no longer be edited.',
    });
  }, [documentCompletionNotice]);

  useEffect(() => {
    if (!bookingRoomId || localSessionCompleted || isSessionCompleted) {
      return undefined;
    }

    let active = true;
    const isSessionRecord = bookingData?.__typename === 'Session';
    const checkCompletion = async () => {
      try {
        const status = isSessionRecord
          ? await statusReadersRef.current.handleSessionStatus(bookingRoomId)
          : await statusReadersRef.current.handlegetBookingStatus(
            bookingRoomId,
          );

        if (active && String(status).toLowerCase() === 'completed') {
          setLocalSessionCompleted(true);
          setLocalSessionCompletedAt(new Date().toISOString());
        }
      } catch (error) {
        // The next polling pass will retry without interrupting the call.
      }
    };

    checkCompletion();
    const completionPoll = setInterval(checkCompletion, 3000);
    return () => {
      active = false;
      clearInterval(completionPoll);
    };
  }, [
    bookingData?.__typename,
    bookingRoomId,
    isSessionCompleted,
    localSessionCompleted,
  ]);

  useEffect(() => {
    if (!bookingRoomId || !sessionAvailability.canJoin) {
      return undefined;
    }

    enterRoom(`notary-session-${bookingRoomId}`);
    return () => leaveRoom();
  }, [bookingRoomId, enterRoom, leaveRoom, sessionAvailability.canJoin]);

  useEffect(() => {
    if (sessionAvailability.canJoin) {
      return;
    }

    Toast.show({
      type: 'info',
      text1: 'Session unavailable',
      text2: sessionAvailability.message,
    });
    navigation.replace('WaitingRoomScreen', {
      uid: bookingRoomId,
      time: scheduledTime,
      date: scheduledDate,
      routeFrom,
    });
  }, [
    bookingRoomId,
    navigation,
    routeFrom,
    scheduledDate,
    scheduledTime,
    sessionAvailability.canJoin,
    sessionAvailability.message,
  ]);

  useEffect(() => {
    const documentSnapshot = sharedDocument;
    const sharedDocumentUri = resolveDocumentUri(documentSnapshot);
    if (!documentSnapshot || !sharedDocumentUri) {
      return;
    }

    const document = {
      name: documentSnapshot.name || 'Shared document.pdf',
      uri: sharedDocumentUri,
      type: documentSnapshot.type || 'application/pdf',
    };
    setSelectedLocalDocument(document);
    setOpenedDocumentUris(currentUris =>
      currentUris.includes(sharedDocumentUri)
        ? currentUris
        : [...currentUris, sharedDocumentUri],
    );
    setSourceKey('client_document');
    setSourceUrl(sharedDocumentUri);
    setSelectedItem(sharedDocumentUri);
    setClientDocModalVisible(true);
    setDocumentPreviewOpen(true);
    setNewPdfSaved(false);
    setNewPdfPath(null);
    setPickerItems(currentItems => [
      ...currentItems.filter(item => item.value !== sharedDocumentUri),
      {
        label: document.name,
        value: sharedDocumentUri,
        documentKey: 'client_document',
      },
    ]);
  }, [sharedDocument]);

  useEffect(() => {
    if (!isSessionCompleted) {
      return;
    }

    // Hide the session overlays before rendering the in-screen completion
    // state. The completion UI intentionally isn't a native Modal because iOS
    // can still be dismissing the signature picker when the session completes.
    setSignatureModalOpen(false);
    setClientDocModalVisible(false);
    setSigningActivity({
      status: 'idle',
      label: '',
      page: signingActivity?.page || 1,
    });
  }, [
    isSessionCompleted,
    setSignatureModalOpen,
    setSigningActivity,
    signingActivity?.page,
  ]);

  useEffect(() => {
    if (isClient && completionRequest.status === 'pending') {
      setSignatureModalOpen(false);
      setSigningActivity({
        status: 'idle',
        label: '',
        page: signingActivity?.page || 1,
      });
    }
  }, [
    completionRequest.status,
    isClient,
    setSignatureModalOpen,
    setSigningActivity,
    signingActivity?.page,
  ]);
  useEffect(() => {
    const items = [
      ...Object.entries(clientDocuments).map(([key, document], index) => ({
        label: documentFileName(document, `Client document ${index + 1}`),
        value: resolveDocumentUri(document),
        documentKey: key,
      })),
      ...agentDocuments.map((document, index) => ({
        label: documentFileName(document, `Notary document ${index + 1}`),
        value: resolveDocumentUri(document),
        documentKey: 'agent_document',
      })),
    ].filter(item => Boolean(item.value));

    setPickerItems(items);
    if (items.length > 0) {
      setSelectedItem(items[0].value);
      setSourceKey(items[0].documentKey);
      setSourceUrl(items[0].value);
      setNewPdfSaved(false);
      setNewPdfPath(null);
    } else {
      setSelectedItem(null);
      setSourceKey(null);
      setSourceUrl(null);
      setFileDownloaded(false);
      setPdfBase64(null);
    }
  }, [clientDocuments, agentDocuments]);

  const getBase64FromUrl = async url => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch image from URL');
      }
      const blob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Error fetching and converting image to Base64:', error);
      return null;
    }
  };
  const handleDragabbleSignatureData = async (signatureData: any) => {
    if (!signatureData) {
      console.warn('Signature data is unavailable.');
      return;
    }
    const {
      width,
      height,
      x,
      y,
      delete: deleteStatus,
      redo,
      signatureData: imageData,
      type,
      fontFamily,
    } = signatureData;

    if (deleteStatus === true) {
      setPdfEditMode(false);
      setSignatureArrayBuffer(null);
      if (redo) {
        setSigningActivity({
          status: 'choosing',
          label: 'Choosing a signature',
          page: currentPage,
        });
        setSignatureModalOpen(true);
      }
      return;
    }

    setSignatureDimensions({
      width,
      height,
      x,
      y,
      fontFamily,
      Deletestatus: deleteStatus,
    });
    setSignatureImageMimeType(type);
    if (type === 'image') {
      if (imageData) {
        if (imageData.startsWith && imageData.startsWith('data:image')) {
          setPdfEditMode(true);
          setSignatureArrayBuffer(imageData);
        } else if (imageData?.startsWith && imageData.startsWith('https')) {
          try {
            const fileType = await identifyFileType(imageData);
            setSignatureImageMimeType(fileType);

            const base64ImageData = await getBase64FromUrl(imageData);
            setPdfEditMode(true);
            setSignatureArrayBuffer(base64ImageData);
          } catch (error) {
            console.warn('Error fetching image data from URL:', error);
          }
        } else {
          console.warn('Unknown format for signature data.');
        }
      } else {
        console.warn('Signature image data is unavailable.');
      }
    } else if (type === 'text') {
      setPdfEditMode(true);
      setSignatureArrayBuffer(imageData);
    } else if (type === 'date') {
      if (!imageData) {
        console.warn('Signature date data is unavailable.');
        return;
      }
      const data =
        typeof imageData === 'string'
          ? imageData
          : imageData.toLocaleDateString();
      setPdfEditMode(true);
      setSignatureArrayBuffer(data);
    }
  };
  const _uint8ToBase64 = u8Arr => {
    const CHUNK_SIZE = 0x8000;
    let index = 0;
    const length = u8Arr.length;
    let result = '';
    let slice;
    while (index < length) {
      slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
      result += String.fromCharCode.apply(null, slice);
      index += CHUNK_SIZE;
    }
    return btoa(result);
  };
  const readDocumentBase64 = async candidate => {
    const documentUri = resolveDocumentUri(candidate);
    if (!documentUri || isRemoteDocumentUri(documentUri)) {
      return null;
    }

    try {
      const path = localFilePath(documentUri);
      const fileExists = await RNFS.exists(path);
      if (fileExists) {
        return await RNFS.readFile(path, 'base64');
      }
      console.warn('Document file does not exist:', path);
    } catch (error) {
      console.warn('Error reading file:', error);
    }
    return null;
  };

  useEffect(() => {
    const loadId = ++documentLoadIdRef.current;
    let cancelled = false;

    const loadDocument = async () => {
      const requestedDocument =
        newPdfSaved && resolveDocumentUri(newPdfPath)
          ? resolveDocumentUri(newPdfPath)
          : resolveDocumentUri(sourceUrl);

      setFileDownloaded(false);
      setPdfBase64(null);
      setDocumentLoadError('');

      if (!requestedDocument) {
        setDocumentLoadError('No document is available in this session yet.');
        return;
      }

      try {
        let readablePath = requestedDocument;
        if (isRemoteDocumentUri(requestedDocument)) {
          const safeRoomId = String(bookingRoomId || 'session').replace(
            /[^a-z0-9_-]/gi,
            '',
          );
          readablePath = `${RNFS.CachesDirectoryPath}/notary-${safeRoomId}-${loadId}.pdf`;
          const downloadResult = await RNFS.downloadFile({
            fromUrl: requestedDocument,
            toFile: readablePath,
          }).promise;

          if (
            downloadResult.statusCode < 200 ||
            downloadResult.statusCode >= 300
          ) {
            throw new Error(
              `Document download failed (${downloadResult.statusCode}).`,
            );
          }
        }

        const contents = await readDocumentBase64(readablePath);
        if (cancelled || loadId !== documentLoadIdRef.current) {
          return;
        }

        if (!contents) {
          throw new Error('The selected document could not be read.');
        }

        setFilePath(readablePath);
        setPdfBase64(contents);
        setDocumentLoadError('');
        setFileDownloaded(true);
      } catch (error: any) {
        if (cancelled || loadId !== documentLoadIdRef.current) {
          return;
        }
        console.warn('Unable to prepare selected document:', error);
        setFileDownloaded(false);
        setPdfBase64(null);
        setDocumentLoadError(
          error?.message ||
            'The document could not be downloaded. Check your connection and retry.',
        );
      }
    };

    loadDocument();
    return () => {
      cancelled = true;
    };
  }, [bookingRoomId, documentLoadAttempt, newPdfPath, newPdfSaved, sourceUrl]);
  ////////////// live bolcks ////////////////
  const insertObject = useLiveblocks(state => state.insertObject);
  const setPdfFilePath = useLiveblocks(state => state.setPdfFilePath);
  //////////////////////////////////////////
  const handleSingleTap = async (page, x, y) => {
    if (pdfEditMode) {
      setSigningActivity({
        status: 'placing',
        label: 'Placing a signature',
        page,
        x,
        y,
      });
      setTimeout(
        () => setSigningActivity({ status: 'idle', label: '', page }),
        2500,
      );
      setNewPdfSaved(false);
      setFilePath(null);
      const pdfDoc = await PDFDocument.load(pdfBase64, {
        ignoreEncryption: true,
      });
      const pages = pdfDoc.getPages();
      const firstPage = pages[page - 1];
      const yOffsetPercentage = 0.1;
      const yOffset = pageHeight * yOffsetPercentage;
      if (
        signatureImageMimeType == 'image' ||
        signatureImageMimeType == 'jpg' ||
        signatureImageMimeType == 'png'
      ) {
        const signatureImage =
          signatureImageMimeType == 'jpg' || !signatureImageMimeType
            ? await pdfDoc.embedJpg(signatureArrayBuffer)
            : await pdfDoc.embedPng(signatureArrayBuffer);

        const { width: width, height: height } = signatureDimensions;
        if (Platform.OS == 'ios') {
          firstPage.drawImage(signatureImage, {
            x: (pageWidth * (x - 12)) / Dimensions.get('window').width,
            y: pageHeight - (pageHeight * (y + 12)) / 540,
            width: 200,
            height: 200,
          });
        } else {
          firstPage.drawImage(signatureImage, {
            x: (firstPage.getWidth() * x) / pageWidth - 85,
            y:
              firstPage.getHeight() -
              (firstPage.getHeight() * y) / pageHeight -
              85,
            width: width * 1.45,
            height: height * 1.45,
          });
        }
        const pdfBytes = await pdfDoc.save();
        const pdfBase64 = _uint8ToBase64(pdfBytes);
        const path = `${RNFS.DocumentDirectoryPath
          }/react-native_signed_${Date.now()}.pdf`;
        RNFS.writeFile(path, pdfBase64, 'base64')
          .then(async success => {
            setNewPdfPath(path);
            setNewPdfSaved(true);
            setPdfBase64(pdfBase64);
            const l = await uploadSignedDocumentToSpaces(pdfBase64);
            await updatedDocument(l);
          })
          .catch(err => {
            console.log('eeee', err.message);
          });
      } else {
        const { width: width, height: height, fontFamily } = signatureDimensions;
        console.log('fontfamilu', fontFamily);
        const customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        if (Platform.OS == 'ios') {
          firstPage.drawText(signatureArrayBuffer, {
            x: (pageWidth * (x - 12)) / Dimensions.get('window').width,
            y: pageHeight - (pageHeight * (y + 12)) / 540,
            width: 200,
            height: 200,
          });
        } else {
          firstPage.drawText(signatureArrayBuffer, {
            x: (firstPage.getWidth() * x) / pageWidth - 85,
            y:
              firstPage.getHeight() -
              (firstPage.getHeight() * y) / pageHeight -
              85,
            width: width * 1.45,
            height: height * 1.45,
            font: customFont,
          });
        }
        const pdfBytes = await pdfDoc.save();
        const pdfBase64 = _uint8ToBase64(pdfBytes);
        const path = `${RNFS.DocumentDirectoryPath
          }/react-native_signed_${Date.now()}.pdf`;
        RNFS.writeFile(path, pdfBase64, 'base64')
          .then(async success => {
            setPdfFilePath(path);
            setSourceUrl(path);
            setNewPdfPath(path);
            setPdfBase64(pdfBase64);
            setFilePath(path);
            setNewPdfSaved(true);
            const l = await uploadSignedDocumentToSpaces(pdfBase64);
            // const d = await uploadAllDocuments(pdfBase64)
            await updatedDocument(l);
            // setPdfFilePath(l);
            // updateSignedDocumentToDb(l);
            // addSignedDocFunc(l);
            // }
          })
          .catch(err => {
            // console.log('eeee', err.message);
          });
      }
      setPdfEditMode(false);
    }
  };
  const handleLinkChange = async (linkId: string, _itemLabel: string) => {
    const documentUri = resolveDocumentUri(linkId);
    if (!documentUri) {
      return;
    }

    // RNPickerSelect can emit another change event when the already-selected
    // row is tapped. Clearing the loaded PDF in that case makes the viewer
    // disappear because sourceUrl itself does not change and its loading
    // effect therefore has nothing to restart.
    const selectedDocument = pickerItems.find(
      item => item.value === documentUri,
    );
    const sharedSelection = {
      name: selectedDocument?.label || 'Shared document.pdf',
      uri: documentUri,
      url: documentUri,
      type: 'application/pdf',
    };

    if (!newPdfSaved && documentUri === resolveDocumentUri(sourceUrl)) {
      setSelectedItem(documentUri);
      setSelectedLocalDocument(sharedSelection);
      setSharedDocument({
        name: sharedSelection.name,
        url: documentUri,
        type: sharedSelection.type,
      });
      setDocumentPreviewOpen(true);
      return;
    }

    setSourceKey(selectedDocument?.documentKey || sourceKey);
    setSourceUrl(documentUri);
    setSelectedItem(documentUri);
    setSelectedLocalDocument(sharedSelection);
    setFileDownloaded(false);
    setNewPdfSaved(false);
    setNewPdfPath(null);
    setPdfBase64(null);
    setCurrentPage(1);
    setSharedDocument({
      name: sharedSelection.name,
      url: documentUri,
      type: sharedSelection.type,
    });
    setDocumentPreviewOpen(true);
  };
  const updatedDocument = async url => {
    const urlResponse = {
      key: sourceKey,
      value: url,
    };
    const request = {
      variables: {
        sessionId: bookingData?._id,
        updatedDocuments: [urlResponse],
      },
    };
    const success = await updatedDocumentsession(request);
  };
  const updateSignedDocumentToDb = async url => {
    try {
      const request = {
        variables: {
          bookingId: bookingData?._id,
          documentId: '1',
          documents: JSON.stringify({
            // name: bookingData?.documents[0].name,
            url: url,
            // id: bookingData?.documents[0].id,
          }),
        },
      };
      const response = await UpdateDocumentsByDocId(request);
    } catch (error) {
      console.log('error', error);
    }
  };
  // console.log('boolkingdaree', bookingData);
  const addSignedDocFunc = async docs => {
    const urls = docs.map(resolveDocumentUri).filter(Boolean);
    if (!bookingData?._id || urls.length === 0) {
      return urls;
    }

    const isSessionRecord = bookingData?.__typename === 'Session';
    const response = isSessionRecord
      ? await addSessionNotarizedDocs({
          variables: {sessionId: bookingData._id, notarizedDocs: urls},
        })
      : await AddSignedDocs({
          variables: {
            bookingId: bookingData._id,
            notarizedDocs: urls,
            bookingType: 'booking',
          },
        });
    const result = isSessionRecord
      ? response?.data?.sessionAddNotarizedDocs
      : response?.data?.bookingAddNotarizedDocs;
    if (result?.status !== '200') {
      throw new Error(result?.message || 'The server could not save the notarized document.');
    }

    let updatedRecord = isSessionRecord
      ? result?.session
      : response?.data?.bookingAddNotarizedDocs?.booking;
    try {
      const refreshed = isSessionRecord
        ? await getSession({
            variables: {sessionId: bookingData._id},
            fetchPolicy: 'network-only',
          })
        : await getBookingByID({
            variables: {bookingId: bookingData._id},
            fetchPolicy: 'network-only',
          });
      updatedRecord = isSessionRecord
        ? refreshed?.data?.getSession?.session || updatedRecord
        : refreshed?.data?.getBookingById?.booking || updatedRecord;
    } catch (refreshError) {
      console.warn(
        'Saved notarized document; refresh will retry later.',
        refreshError,
      );
    }
    dispatch(
      setBookingInfoState({
        ...(updatedRecord || bookingData),
        notarized_docs: updatedRecord?.notarized_docs?.length
          ? updatedRecord.notarized_docs
          : urls,
      }),
    );
    return urls;
  };

  const buildCompletionPackage = notarizedDocs => {
    const assets = User?.notaryOnboarding?.assets || {};
    const signatureUrl =
      assets.signature ||
      (Array.isArray(User?.notarysigns) ? User.notarysigns[0]?.signUrl : '') ||
      '';
    const esealUrl = assets.eSeal || User?.notarySeal || '';
    const digitalCertificateUrl = assets.digitalCertificate || '';
    const finalPdfUrl = Array.isArray(notarizedDocs) ? notarizedDocs[0] || '' : '';

    return {
      certificate_wording:
        'Completed remote online notarization by the commissioned notary.',
      signature_url: signatureUrl,
      eseal_url: esealUrl,
      digital_certificate_url: digitalCertificateUrl,
      certificate_forms_url: assets.certificateForms || '',
      final_pdf_url: finalPdfUrl,
      final_pdf_urls: Array.isArray(notarizedDocs) ? notarizedDocs : [],
    };
  };

  const buildJournalEntry = notarizedDocs => ({
    service_type: bookingData?.service_type || bookingData?.session_type || '',
    client:
      getPersonName(bookingData?.booked_by) ||
      bookingData?.client_email ||
      bookingData?.booked_for?.email ||
      '',
    notary: getPersonName(User),
    document_count: Array.isArray(notarizedDocs) ? notarizedDocs.length : 0,
    notarized_docs: Array.isArray(notarizedDocs) ? notarizedDocs : [],
    completed_at: new Date().toISOString(),
  });

  const normalizeFinalPdfUrls = notarizedDocs =>
    Array.from(
      new Set(
        (Array.isArray(notarizedDocs) ? notarizedDocs : [])
          .map(resolveDocumentUri)
          .filter(url => /^https?:\/\//i.test(String(url || ''))),
      ),
    );

  const completeNotarizationRecord = async (recordId, notarizedDocs) => {
    const finalPdfUrls = normalizeFinalPdfUrls(notarizedDocs);
    if (!finalPdfUrls.length) {
      throw new Error('Upload at least one final notarized PDF before completing.');
    }

    const completionPackage = buildCompletionPackage(finalPdfUrls);
    const journalEntry = buildJournalEntry(finalPdfUrls);
    const isSessionRecord = bookingData?.__typename === 'Session';

    if (isSessionRecord) {
      const {data} = await completeSessionNotarization({
        variables: {
          sessionId: recordId,
          completionPackage,
          journalEntry,
          notarizedDocs: finalPdfUrls,
        },
      });
      const response = data?.completeSessionNotarizationR;
      if (response?.status !== '200') {
        throw new Error(response?.message || 'The server did not complete the session.');
      }
      return response?.session;
    }

    const {data} = await completeBookingNotarization({
      variables: {
        bookingId: recordId,
        completionPackage,
        journalEntry,
        notarizedDocs: finalPdfUrls,
      },
    });
    const response = data?.completeBookingNotarizationR;
    if (response?.status !== '200') {
      throw new Error(response?.message || 'The server did not complete the booking.');
    }
    return response?.booking;
  };

  /////////////////////////////////////
  ///////////////////////////////

  const pdfRef = React.useRef<Pdf>(null);
  const [totalPages, setTotalPages] = React.useState<number>(0);

  const handleSharedPageChanged = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [],
  );

  const navigatePdfPage = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, totalPages || 1));
      if (nextPage !== currentPage) {
        pdfRef.current?.setPage(nextPage);
        setCurrentPage(nextPage);
      }
    },
    [currentPage, totalPages],
  );
  const handleBackButton = () => {
    if (routeFrom === 'agent') {
      // If routeFrom is 'agent', navigate back
      navigation.goBack();
    } else {
      // Otherwise, navigate to WaitingRoomScreen
      navigation.navigate('WaitingRoomScreen', {
        uid: bookingData?._id,
        time: bookingData?.time_of_booking,
        date: bookingData?.date_of_booking,
      });
    }
    return true;
  };
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, []);
  const readSigningImage = async (uri: string): Promise<string> => {
    if (!uri) {
      throw new Error('A signature or stamp image is missing.');
    }
    if (uri.startsWith('data:image')) {
      return uri;
    }
    if (!isRemoteDocumentUri(uri)) {
      const base64 = await RNFS.readFile(localFilePath(uri), 'base64');
      if (!base64) {
        throw new Error('A signature or stamp image was empty.');
      }
      return base64;
    }

    const cachePath = `${RNFS.CachesDirectoryPath}/notarizr-signing-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.image`;
    try {
      const download = await RNFS.downloadFile({
        fromUrl: uri,
        toFile: cachePath,
      }).promise;
      if (
        typeof download.statusCode === 'number' &&
        (download.statusCode < 200 || download.statusCode >= 300)
      ) {
        throw new Error(
          `Unable to download a signing image (${download.statusCode}).`,
        );
      }
      const base64 = await RNFS.readFile(cachePath, 'base64');
      if (!base64) {
        throw new Error('A downloaded signature or stamp image was empty.');
      }
      return base64;
    } finally {
      try {
        if (await RNFS.exists(cachePath)) {
          await RNFS.unlink(cachePath);
        }
      } catch (cleanupError) {
        console.warn('Unable to remove temporary signing image:', cleanupError);
      }
    }
  };

  const flattenSigningObjectsIntoPdf = async (
    sourcePdfBase64: string,
  ): Promise<string> => {
    const objects = Object.values(signingObjects || {});
    if (!objects.length) {
      return sourcePdfBase64;
    }

    const pdfDoc = await PDFDocument.load(sourcePdfBase64, {
      ignoreEncryption: true,
    });
    const pages = pdfDoc.getPages();
    const viewportWidth = Math.max(screenWidth, 1);
    const viewportHeight = Math.max(
      screenHeight - insets.top - insets.bottom - 190,
      1,
    );
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const object of objects) {
      const pageIndex = Math.max(
        0,
        Math.min((object.page || 1) - 1, pages.length - 1),
      );
      const page = pages[pageIndex];
      if (!page) {
        continue;
      }
      const pageSize = page.getSize();
      const x = Math.max(
        0,
        Math.min(
          (pageSize.width * (object.position?.x || 0)) / viewportWidth,
          pageSize.width,
        ),
      );
      const top =
        (pageSize.height * (object.position?.y || 0)) / viewportHeight;
      const boxWidth = (pageSize.width * 120) / viewportWidth;
      const boxHeight = (pageSize.height * 120) / viewportHeight;

      if (object.type === 'image' && object.sourceUrl) {
        const imageBytes = await readSigningImage(object.sourceUrl);
        let embeddedImage;
        try {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } catch {
          try {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          } catch {
            throw new Error(
              'A signature or stamp image is not a valid PNG or JPEG file.',
            );
          }
        }
        const scale = Math.min(
          boxWidth / embeddedImage.width,
          boxHeight / embeddedImage.height,
        );
        const width = embeddedImage.width * scale;
        const height = embeddedImage.height * scale;
        page.drawImage(embeddedImage, {
          x,
          y: Math.max(0, pageSize.height - top - height),
          width,
          height,
        });
        continue;
      }

      const rawText = typeof object.text === 'string' ? object.text : '';
      if (!rawText) {
        continue;
      }
      const isDate = object.type === 'date';
      const text = isDate ? moment(rawText).format('DD-MM-YYYY') : rawText;
      const fontSize = isDate ? 11 : 16;
      page.drawText(text, {
        x,
        y: Math.max(0, pageSize.height - top - fontSize),
        size: fontSize,
        font: isDate ? boldFont : regularFont,
        color: rgb(0, 0, 0),
        maxWidth: Math.max(boxWidth, 40),
      });
    }

    return _uint8ToBase64(await pdfDoc.save());
  };

  const finalizeApprovedCall = async () => {
    if (isClient || isCompleting) {
      return;
    }

    setIsCompleting(true);
    try {
      let savedNotarizedUrls = [];
      // Saving the signed document is useful, but it must not leave a
      // completed appointment stuck if storage is temporarily unavailable.
      try {
        const completedDocuments = pickerItems.map(item => ({ ...item }));

        if (selectedItem && pdfBase64) {
          const selectedDocument = completedDocuments.find(
            item => item.value === selectedItem,
          );
          if (selectedDocument) {
            const finalizedPdf = await flattenSigningObjectsIntoPdf(pdfBase64);
            const signedUrl = await uploadSignedDocumentToSpaces(finalizedPdf);
            selectedDocument.value = signedUrl;
            setPdfBase64(finalizedPdf);
          }
        }

        if (completedDocuments.length > 0) {
          savedNotarizedUrls = await addSignedDocFunc(completedDocuments);
        }
      } catch (documentError) {
        console.warn(
          'Signed document persistence did not complete:',
          documentError,
        );
      }

      const recordId = bookingData?._id || routeUid;
      if (!recordId) {
        throw new Error('The booking could not be identified.');
      }

      const completedRecord = await completeNotarizationRecord(
        recordId,
        savedNotarizedUrls.length > 0
          ? savedNotarizedUrls
          : bookingData?.notarized_docs || [],
      );

      if (String(completedRecord?.status).toLowerCase() !== 'completed') {
        throw new Error('The server did not confirm the completed status.');
      }

      dispatch(
        setBookingInfoState({
          ...bookingData,
          ...completedRecord,
          status: 'completed',
          notarized_docs:
            savedNotarizedUrls.length > 0
              ? savedNotarizedUrls
              : completedRecord?.notarized_docs || bookingData?.notarized_docs,
        }),
      );
      const completedAt = new Date().toISOString();
      setLocalSessionCompleted(true);
      setLocalSessionCompletedAt(completedAt);
      try {
        setSessionCompleted(true, completedAt);
      } catch (syncError) {
        console.warn(
          'Completion sync will retry from booking status:',
          syncError,
        );
      }
    } catch (error: any) {
      console.warn('Unable to complete notary call:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not complete call',
        text2: error?.message || 'Please check your connection and try again.',
      });
      completionFinalizationRef.current = false;
      setCompletionRequest('idle');
    } finally {
      setIsCompleting(false);
    }
  };

  const completeCall = () => {
    if (
      isClient ||
      isCompleting ||
      completionRequest.status === 'pending' ||
      completionRequest.status === 'approved'
    ) {
      return;
    }

    const unmarkedDocuments = openedDocumentUris.filter(uri => {
      const signedUrl = completedDocuments[uri]?.signedUrl;
      return !completedDocuments[uri] && !(signedUrl && completedDocuments[signedUrl]);
    });
    if (unmarkedDocuments.length > 0) {
      Toast.show({
        type: 'warning',
        text1: 'Documents not complete',
        text2: 'Mark each document complete before closing the call.',
      });
      return;
    }

    rejectionNoticeRef.current = null;
    setCompletionRequest('pending', new Date().toISOString());
  };

  useEffect(() => {
    if (isClient) {
      return;
    }

    if (
      completionRequest.status === 'approved' &&
      !completionFinalizationRef.current
    ) {
      completionFinalizationRef.current = true;
      finalizeApprovedCall();
      return;
    }

    if (
      completionRequest.status === 'rejected' &&
      rejectionNoticeRef.current !== completionRequest.requestedAt
    ) {
      rejectionNoticeRef.current = completionRequest.requestedAt;
      Toast.show({
        type: 'info',
        text1: 'Completion rejected',
        text2: 'The client did not approve finalizing this document.',
      });
    }
  }, [completionRequest.requestedAt, completionRequest.status, isClient]);

  const closeCompletedSession = useCallback(() => {
    if (completionNavigationRef.current) {
      return;
    }
    completionNavigationRef.current = true;

    leaveRoom();

    if (isClient) {
      navigation.replace('MedicalBookingScreen');
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: 'HomeScreen',
            params: {screen: 'BookScreen'},
            state: {
              routes: [
                {name: 'Home'},
                {name: 'AllBookingScreen'},
                {name: 'BookScreen'},
                {name: 'ChatContactScreen'},
                {name: 'ProfileInfoScreen'},
              ],
              index: 2,
            },
          },
          {
            name: 'ClientDetailsScreen',
            params: {
              clientDetail: bookingData,
              fromCompletedSession: true,
            },
          },
        ],
      }),
    );
  }, [bookingData, isClient, leaveRoom, navigation]);
  function showMessage(msg: string) {
    console.log(msg);
    Toast.show({
      type: 'success',
      text1: msg,
    });
  }
  const userDisplayName =
    [User?.first_name, User?.last_name].filter(Boolean).join(' ') || 'You';

  useEffect(() => {
    setSessionParticipant({
      name: userDisplayName,
      role: participantRole,
      userId: User?._id ? String(User._id) : null,
    });
  }, [User?._id, participantRole, setSessionParticipant, userDisplayName]);

  const renderFullVideoPanel = () =>
    isInPersonMode ? (
      <View style={styles.videoPanel}>
        <View style={styles.videoStage}>
          <View style={styles.inPersonSessionState}>
            <View style={styles.inPersonSessionIcon}>
              <Feather name="edit-3" size={25} color={BookingColors.primary} />
            </View>
            <RNText style={styles.inPersonSessionTitle}>
              In-person signing session
            </RNText>
            <RNText style={styles.inPersonSessionDescription}>
              You and the notary are together. Open the shared document below
              to review and sign electronically.
            </RNText>
          </View>
        </View>
      </View>
    ) : (
      <LiveKitSessionVideo
        canJoin={sessionAvailability.canJoin}
        onClientIdentityVerifiedChange={setIdentityVerifiedOverride}
        isClient={isClient}
        onComplete={isClient ? undefined : completeCall}
        recordId={bookingRoomId}
        unavailableMessage={sessionAvailability.message}
      />
    );
  const [drawingMode, setDrawingMode] = useState<
    'pen' | 'line' | 'arrow' | 'rectangle'
  >(null);
  const [paths, setPaths] = useState<any[]>([]);
  function rgbStringToRgb(rgbString) {
    const colorArray = rgbString.match(/\d+/g).map(Number);
    return rgb(colorArray[0] / 255, colorArray[1] / 255, colorArray[2] / 255);
  }

  const handlePathsChange = newPaths => {
    console.log('pahedfdfd', newPaths);
    setSigningActivity({
      status: 'signing',
      label: 'Annotating the document',
      page: currentPage,
    });
    setPaths([...paths, newPaths]); // Assuming newPaths is a single path object
  };
  const handleSavedStamp = stampPath => {
    onAddSavedStamp(stampPath);
  };
  const identifyFileType = url => {
    const fileExtension = url.split('.').pop().toLowerCase();
    if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      return 'jpg';
    } else if (fileExtension === 'png') {
      return 'png';
    } else {
      return 'unknown';
    }
  };
  const onAddSavedStamp = async stampPath => {
    const fileType = await identifyFileType(stampPath);
    setSignatureImageMimeType(fileType);
    setSignatureData(stampPath);
    setPdfEditMode(true);
    setSigningActivity({
      status: 'placing',
      label: 'Positioning a signature',
      page: currentPage,
      x: 100,
      y: 100,
    });
    insertObject(new Date().toISOString(), {
      type: 'image',
      sourceUrl: stampPath,
      page: currentPage,
      position: {
        x: 100,
        y: 100,
      },
    });
    setSigningActivity({ status: 'idle', label: '', page: currentPage });
  };
  const _uint8ToBase641 = uint8Array => {
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  };
  const convertPointsToSvgPath = points => {
    let path = '';
    if (points.length > 0) {
      path += `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
    }
    return path;
  };
  const drawPathsOnPdf = async (paths, scale = 1) => {
    const pdfDoc = await PDFDocument.load(pdfBase64, {
      ignoreEncryption: true,
    });
    const page = pdfDoc.getPages()[currentPage - 1];
    const { width, height } = page.getSize();
    paths.forEach((path, index) => {
      if (
        path[0].type === 'pen' &&
        Array.isArray(path[0].points) &&
        path[0].points.length > 0
      ) {
        const scaledPoints = path[0].points.map(point => ({
          x: point.x * scale,
          y: point.y * scale,
        }));
        const svgPath = convertPointsToSvgPath(scaledPoints);
        console.log('poofndodnfd', path[0].points);
        const x = scaledPoints[0].x;
        const y = scaledPoints[0].y;

        const colorString = path[0].color;
        const color = rgbStringToRgb(colorString);
        page.drawSvgPath(svgPath, {
          x: (page.getWidth() * x) / pageWidth,
          y: page.getHeight() - (page.getHeight() * y) / pageHeight,
          borderColor: color,
          borderWidth: 5,
        });
      }
    });
    const pdfBytesWithDrawing = await pdfDoc.save();
    return pdfBytesWithDrawing;
  };
  const handleClearPaths = () => {
    setPaths([]);
  };
  const saveToPdf = async () => {
    setPdfEditMode(true);
    const updatedPdfBytes = await drawPathsOnPdf(paths);
    const pdfBase64 = _uint8ToBase641(updatedPdfBytes);
    const path = `${RNFS.DocumentDirectoryPath
      }/react-native_signed_${Date.now()}.pdf`;
    await RNFS.writeFile(path, pdfBase64, 'base64')
      .then(async success => {
        setNewPdfPath(path);
        setNewPdfSaved(true);
        setPdfBase64(pdfBase64);
        const l = await uploadSignedDocumentToSpaces(pdfBase64);
        await updatedDocument(l);
        await handleClearPaths();
        setSigningActivity({ status: 'idle', label: '', page: currentPage });
      })
      .catch(err => {
        console.log('eeee', err.message);
      });
  };
  // The client owns document uploads. Once storage returns a public URL,
  // publish it to the booking room so both participants open the same file.
  const selectClientDocument = async () => {
    if (documentSelectionInFlightRef.current) {
      return;
    }

    documentSelectionInFlightRef.current = true;
    setLoading(true);
    try {
      const [document] = await pickDocumentDetails(false);
      if (!document) {
        return;
      }

      const documentFingerprint = [
        document.name || '',
        document.size || 0,
        document.type || '',
      ].join(':');
      const currentSharedUri = resolveDocumentUri(sharedDocument);

      // Re-selecting the same local file should simply reopen the existing
      // shared copy. Uploading it again briefly swaps local/remote PDF sources
      // and produces a visible flash while duplicating the session document.
      if (
        currentSharedUri &&
        lastUploadedDocumentRef.current === documentFingerprint
      ) {
        setSelectedLocalDocument({
          ...document,
          uri: currentSharedUri,
          url: currentSharedUri,
        });
        setSourceUrl(currentSharedUri);
        setSelectedItem(currentSharedUri);
        setDocumentPreviewOpen(true);
        return;
      }

      const uploadedUrl = await uploadDocumentToStorage(
        document.uri,
        document.name,
        document.type,
      );
      if (!uploadedUrl) {
        throw new Error('Document did not finish uploading.');
      }

      const existingCount = Object.keys(clientDocuments).length;
      const clientDocumentPayload = [
        {
          key: `document-${existingCount + 1}-${Date.now()}`,
          value: uploadedUrl,
        },
      ];
      const response = await updateSessionClientDocs({
        variables: {
          sessionId: bookingData._id,
          clientDocuments: clientDocumentPayload,
        },
      });
      const updatedSession = response?.data?.createOrUpdateClientDocs?.session;
      if (updatedSession) {
        dispatch(setBookingInfoState(updatedSession));
      }

      setSharedDocument({
        name: document.name || 'Shared document.pdf',
        url: uploadedUrl,
        type: document.type || 'application/pdf',
      });
      lastUploadedDocumentRef.current = documentFingerprint;
      setDocumentPreviewOpen(true);

      Toast.show({
        type: 'success',
        text1: 'Document shared',
        text2: 'Your notary can now see this document.',
      });
    } catch (error: any) {
      console.warn('Client document upload failed:', error?.message || error);
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2:
          error?.message || 'Check your connection and choose the file again.',
      });
    } finally {
      setLoading(false);
      documentSelectionInFlightRef.current = false;
    }
  };
  const currentDocumentUri =
    resolveDocumentUri(selectedLocalDocument) ||
    resolveDocumentUri(selectedItem) ||
    resolveDocumentUri(sourceUrl);
  const isCurrentDocumentComplete = Boolean(
    currentDocumentUri &&
      (completedDocuments[currentDocumentUri] ||
        Object.values(completedDocuments).some(
          entry => entry?.signedUrl === currentDocumentUri,
        )),
  );

  const confirmMarkDocumentComplete = async () => {
    if (isClient || isMarkingDocumentComplete || isCurrentDocumentComplete) {
      return;
    }
    if (!currentDocumentUri) {
      Toast.show({
        type: 'warning',
        text1: 'No document selected',
        text2: 'Open a document before marking it complete.',
      });
      return;
    }
    if (!pdfBase64) {
      Toast.show({
        type: 'warning',
        text1: 'Document still loading',
        text2: 'Wait for the document to finish loading, then try again.',
      });
      return;
    }

    setIsMarkingDocumentComplete(true);
    let completionStage = 'Preparing the signed document';
    try {
      setSignatureModalOpen(false);
      setPdfEditMode(false);
      const finalizedPdf = await flattenSigningObjectsIntoPdf(pdfBase64);
      completionStage = 'Uploading the signed document';
      const signedUrl = await uploadSignedDocumentToSpaces(finalizedPdf);
      const documentName =
        selectedLocalDocument?.name || 'Notarized document.pdf';
      const documentType =
        selectedLocalDocument?.type || 'application/pdf';

      completionStage = 'Saving the completed document to this session';
      await addSignedDocFunc([{value: signedUrl, url: signedUrl}]);
      setPdfBase64(finalizedPdf);
      setPickerItems(currentItems =>
        currentItems.map(item =>
          item.value === currentDocumentUri
            ? {...item, value: signedUrl}
            : item,
        ),
      );
      setSelectedItem(signedUrl);
      setSourceUrl(signedUrl);
      setSelectedLocalDocument({
        ...(selectedLocalDocument || {}),
        name: documentName,
        uri: signedUrl,
        url: signedUrl,
        type: documentType,
      });
      setSharedDocument({
        name: documentName,
        url: signedUrl,
        type: documentType,
      });
      deleteAllObjects();
      markDocumentComplete([currentDocumentUri, signedUrl], signedUrl);
      setOpenedDocumentUris(currentUris =>
        currentUris.includes(signedUrl)
          ? currentUris
          : [...currentUris, signedUrl],
      );
      setSigningActivity({
        status: 'idle',
        label: '',
        page: currentPage,
      });
      setMarkCompleteConfirmVisible(false);
    } catch (error: any) {
      console.warn('Unable to mark document complete:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not complete document',
        text2:
          error?.message === 'Network request failed'
            ? `${completionStage}: connection failed. Your document is not marked complete; check your connection and retry.`
            : `${completionStage}: ${error?.message || 'Please try again.'}`,
      });
    } finally {
      setIsMarkingDocumentComplete(false);
    }
  };

  const handleSignPress = () => {
    if (isCurrentDocumentComplete) {
      return;
    }
    setSigningActivity({
      status: 'choosing',
      label: 'Choosing a signature',
      page: currentPage,
    });
    setSignatureModalOpen(true);
  };

  const handleSignCloseModal = () => {
    setSignatureModalOpen(false);
  };

  const closeDocumentPreview = () => {
    setMarkCompleteConfirmVisible(false);
    setClientDocModalVisible(false);
    setDocumentPreviewOpen(false);
  };

  const toggleDrawingMode = () => {
    const willEnableDrawing = !drawingMode;
    setDrawingMode(willEnableDrawing ? 'pen' : null);
    setIsInteractionBlocked(willEnableDrawing);
    setSigningActivity(
      willEnableDrawing
        ? {
          status: 'signing',
          label: 'Annotating the document',
          page: currentPage,
        }
        : { status: 'idle', label: '', page: currentPage },
    );
  };
  return (
    <SafeAreaView style={styles.Maincontainer}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => handleBackButton()}>
          <Feather
            name="chevron-left"
            size={22}
            color={BookingColors.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <RNText style={styles.headerTitle}>
            {isInPersonMode ? 'In-Person Signing' : 'Notary Session'}
          </RNText>
          <View style={styles.sessionBadge}>
            <Feather name="hash" size={9} color={BookingColors.primary} />
            <RNText style={styles.sessionBadgeText} numberOfLines={1}>
              {getBookingDisplayId(bookingData)}
            </RNText>
          </View>
        </View>
        {isClient ? (
          <TouchableOpacity
            accessibilityLabel="Select document"
            onPress={selectClientDocument}
            disabled={loading}
            style={[
              styles.headerDocumentButton,
              loading && styles.headerDocumentButtonDisabled,
            ]}>
            {loading ? (
              <ActivityIndicator size="small" color={BookingColors.primary} />
            ) : (
              <Feather name="file-plus" size={15} color={BookingColors.primary} />
            )}
            <RNText numberOfLines={1} style={styles.headerDocumentButtonText}>
              {loading ? 'Sharing…' : 'Select Doc'}
            </RNText>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerDocumentPicker}>
            <Feather name="file-text" size={14} color={BookingColors.primary} />
            <View style={styles.headerDocumentPickerInput}>
              <RNPickerSelect
                style={headerPickerStyles}
                onValueChange={(itemValue, itemLabel) =>
                  handleLinkChange(itemValue, itemLabel)
                }
                items={pickerItems}
                value={selectedItem}
                placeholder={{
                  label: 'Select Doc',
                  color: BookingColors.primary,
                }}
                useNativeAndroidPickerStyle={false}
                Icon={() => (
                  <Feather
                    name="chevron-down"
                    size={14}
                    color={BookingColors.primary}
                  />
                )}
              />
            </View>
          </View>
        )}
      </View>

      {isAgent && sessionIdentityProofUrl && (
        <TouchableOpacity
          accessibilityLabel="Open client identity proof"
          onPress={() => Linking.openURL(sessionIdentityProofUrl)}
          style={styles.identityProofRow}>
          <View style={styles.identityProofIcon}>
            <Feather name="shield" size={16} color={BookingColors.primary} />
          </View>
          <View style={styles.identityProofCopy}>
            <RNText style={styles.identityProofTitle}>Client identity proof</RNText>
            <RNText numberOfLines={1} style={styles.identityProofName}>
              {sessionIdentityProofName}
            </RNText>
          </View>
          <Feather name="external-link" size={17} color={BookingColors.primary} />
        </TouchableOpacity>
      )}

      {!isInPersonMode && (
        <View style={styles.identityVerificationRow}>
          <View style={styles.identityProofIcon}>
            <Feather name={clientIdentityVerified ? 'check-circle' : 'shield'} size={16} color={clientIdentityVerified ? '#168A5B' : BookingColors.primary} />
          </View>
          <View style={styles.identityProofCopy}>
            <RNText style={styles.identityProofTitle}>Client identity</RNText>
            <RNText numberOfLines={1} style={styles.identityProofName}>
              {clientIdentityVerified ? 'Verified by notary' : sessionIdentityProofUrl ? 'Review the uploaded ID' : 'Waiting for client ID proof'}
            </RNText>
          </View>
          {isAgent && sessionIdentityProofUrl && (
            <TouchableOpacity
              accessibilityRole="button"
              disabled={verifyingClientIdentity}
              onPress={markClientIdentityVerified}
              style={[styles.identityVerifyButton, clientIdentityVerified && styles.identityVerifyButtonDone]}>
              {verifyingClientIdentity ? <ActivityIndicator size="small" color={BookingColors.primary} /> : <RNText style={styles.identityVerifyButtonText}>{clientIdentityVerified ? 'Verified' : 'Verify'}</RNText>}
            </TouchableOpacity>
          )}
        </View>
      )}

      {isDocumentCollaborationActive ? (
        isInPersonMode ? (
          <View style={styles.sessionControlBar}>
            <View style={styles.compactCallStatus}>
              <View style={[styles.callStatusDot, styles.callStatusDotConnected]} />
              <RNText numberOfLines={1} style={styles.compactCallStatusText}>
                In-person signing workspace
              </RNText>
            </View>
          </View>
        ) : !clientDocModalVisible ? (
          <LiveKitSessionVideo
            canJoin={sessionAvailability.canJoin}
            compact
            onClientIdentityVerifiedChange={setIdentityVerifiedOverride}
            isClient={isClient}
            onComplete={isClient ? undefined : completeCall}
            recordId={bookingRoomId}
            unavailableMessage={sessionAvailability.message}
          />
        ) : null
      ) : (
        renderFullVideoPanel()
      )}


      {/* ── PDF VIEWER + TOOLBAR (agent) ── */}
      {false && (
        <View style={styles.container}>
          <View style={styles.pdfWrapper}>
            {fileDownloaded && (
              <>
                {filePath ? (
                  <>
                    <PdfView
                      ref={pdfRef}
                      style={[
                        styles.pdfView,
                        isInteractionBlocked && { pointerEvents: 'none' },
                      ]}
                      source={{ uri: filePath }}
                      trustAllCerts={false}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                      horizontal={true}
                      enablePaging={false}
                      minScale={1.0}
                      maxScale={3.0}
                      scale={1.0}
                      spacing={0}
                      fitPolicy={getFitPolicy()}
                      onLoadComplete={(
                        numberOfPages,
                        filePath,
                        { width, height },
                      ) => {
                        setCurrentPage(1);
                        setTotalPages(numberOfPages);
                        setPageWidth(width);
                        setPageHeight(height);
                      }}
                      onPageChanged={page => handleSharedPageChanged(page)}
                      onPageSingleTap={(page, x, y) => {
                        if (!isCurrentDocumentComplete) {
                          handleSingleTap(page, x, y);
                        }
                      }}
                      onError={error =>
                        console.warn('Unable to display document:', error)
                      }
                    />
                    {/* {User.account_type !== 'client' && (
                      <TouchableOpacity
                        onPress={toggleDrawingMode}
                        style={[
                          styles.penIconContainer,
                          drawingMode && styles.activePenIconContainer,
                        ]}>
                        <Icon
                          name="pencil"
                          size={16}
                          style={[
                            styles.editIcon,
                            drawingMode && styles.activeeditIcon,
                          ]}
                        />
                      </TouchableOpacity>
                    )} */}
                    {/* {drawingMode && User.account_type != 'client' && (
                      <SketchCanvasComponent
                        onPathsChange={handlePathsChange}
                        stamps={User}
                        onStampChanges={handleSavedStamp}
                        saveToPdf={saveToPdf}
                      />
                    )} */}
                    {totalPages > 1 && (
                      <View style={styles.pageNavigation}>
                        <TouchableOpacity
                          accessibilityLabel="Previous page"
                          disabled={currentPage <= 1}
                          onPress={() => navigatePdfPage(currentPage - 1)}
                          style={styles.pageNavigationButton}>
                          <Feather
                            name="chevron-left"
                            size={18}
                            color={currentPage <= 1 ? '#A0A6B1' : BookingColors.textPrimary}
                          />
                        </TouchableOpacity>
                        <RNText style={styles.pageNavigationText}>
                          {currentPage} / {totalPages}
                        </RNText>
                        <TouchableOpacity
                          accessibilityLabel="Next page"
                          disabled={currentPage >= totalPages}
                          onPress={() => navigatePdfPage(currentPage + 1)}
                          style={styles.pageNavigationButton}>
                          <Feather
                            name="chevron-right"
                            size={18}
                            color={currentPage >= totalPages ? '#A0A6B1' : BookingColors.textPrimary}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator
                      size="large"
                      color={BookingColors.primary}
                    />
                    <RNText style={styles.loadingText}>Saving PDF…</RNText>
                  </View>
                )}
              </>
            )}
            <SignatureContainer
              signatureData={signatureData}
              onSignatureChange={handleDragabbleSignatureData}
              locked={isCurrentDocumentComplete}
              page={currentPage}
            />
          </View>

          {/* Clients publish source documents; signatures and stamps are uploaded independently. */}
          <View style={styles.toolbar}>
            {User.account_type != 'client' && (
              <TouchableOpacity
                disabled={isCompleting}
                style={[
                  styles.endCallBtn,
                  isCompleting && styles.endCallBtnDisabled,
                ]}
                onPress={completeCall}>
                {isCompleting ? (
                  <ActivityIndicator size="small" color={BookingColors.error} />
                ) : (
                  <Feather
                    name="phone-off"
                    size={15}
                    color={BookingColors.error}
                  />
                )}
                <RNText style={styles.endCallBtnText}>
                  {isCompleting ? 'Finishing…' : 'Complete Call'}
                </RNText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── DOCUMENT + SIGNATURE POPUP ──
          The client uploads and publishes the file into the shared room.
          Both participants then see this same preview and live annotations.
          Plain full-screen overlay, not a native <Modal>: the signature
          picker below is its own real <Modal>, and iOS won't reliably
          stack two native Modals — the second only appears once the first
          is dismissed. Using a View here keeps DrawSignTypeModal as the
          single native modal on screen. */}
      {clientDocModalVisible && (
        <View
          style={[
            styles.clientDocOverlay,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}>
          <View style={styles.Maincontainer}>
            <View style={styles.documentCallBar}>
              {useLiveKit && (
                <LiveKitSessionVideo
                  canJoin={sessionAvailability.canJoin}
                  compact
                  onClientIdentityVerifiedChange={setIdentityVerifiedOverride}
                  isClient={isClient}
                  onComplete={isClient ? undefined : completeCall}
                  recordId={bookingRoomId}
                  unavailableMessage={sessionAvailability.message}
                />
              )}
              {isInPersonMode ? (
                <RNText style={styles.documentCallModeLabel}>
                  In-person signing
                </RNText>
              ) : null}
            </View>
            <View style={styles.header}>
              <RNText numberOfLines={1} style={[styles.headerTitle, { flex: 1 }]}>
                {selectedLocalDocument?.name || 'Document'}
              </RNText>
              <View style={styles.documentHeaderActions}>
                {isCurrentDocumentComplete ? (
                  <View style={styles.markCompleteDoneBadge}>
                    <Feather
                      name="check"
                      size={13}
                      color={BookingColors.success}
                    />
                    <RNText style={styles.markCompleteDoneText}>
                      Completed
                    </RNText>
                  </View>
                ) : !isClient ? (
                  <TouchableOpacity
                    accessibilityLabel="Mark as Complete"
                    onPress={() => setMarkCompleteConfirmVisible(true)}
                    disabled={isMarkingDocumentComplete}
                    style={[
                      styles.markCompleteButton,
                      isMarkingDocumentComplete &&
                        styles.headerDocumentButtonDisabled,
                    ]}>
                    {isMarkingDocumentComplete ? (
                      <ActivityIndicator
                        size="small"
                        color={BookingColors.white}
                      />
                    ) : (
                      <>
                        <Feather
                          name="check-circle"
                          size={13}
                          color={BookingColors.white}
                        />
                        <RNText
                          numberOfLines={1}
                          style={styles.markCompleteButtonText}>
                          Mark as Complete
                        </RNText>
                      </>
                    )}
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  accessibilityLabel="Close"
                  onPress={closeDocumentPreview}
                  style={[styles.headerBackBtn, styles.documentCloseBtn]}>
                  <Feather name="x" size={18} color={BookingColors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.container}>
              <View style={styles.pdfWrapper}>
                {selectedLocalDocument?.uri && (
                  <>
                    {fileDownloaded && filePath ? (
                      <PdfView
                        key={`${resolveDocumentUri(selectedLocalDocument)}:${filePath}`}
                        ref={pdfRef}
                        style={styles.pdfView}
                        source={{uri: filePath}}
                        trustAllCerts={false}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                        enablePaging={false}
                        minScale={1.0}
                        maxScale={3.0}
                        scale={1.0}
                        spacing={0}
                        fitPolicy={getFitPolicy()}
                        onLoadComplete={(numberOfPages, _path, {width, height}) => {
                          setDocumentLoadError('');
                          setCurrentPage(1);
                          setTotalPages(numberOfPages);
                          setPageWidth(width);
                          setPageHeight(height);
                        }}
                        onPageChanged={page => handleSharedPageChanged(page)}
                        onPageSingleTap={(page, x, y) => {
                          if (!isCurrentDocumentComplete) {
                            handleSingleTap(page, x, y);
                          }
                        }}
                        onError={error => {
                          console.warn('Unable to display document:', error);
                          setFileDownloaded(false);
                          setDocumentLoadError(
                            'The document preview could not be rendered. Tap to retry.',
                          );
                        }}
                      />
                    ) : documentLoadError ? (
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => {
                          setDocumentLoadError('');
                          setDocumentLoadAttempt(attempt => attempt + 1);
                        }}
                        style={styles.documentLoadState}>
                        <Feather name="refresh-cw" size={22} color={BookingColors.primary} />
                        <RNText style={styles.documentLoadMessage}>
                          {documentLoadError}
                        </RNText>
                        <RNText style={styles.documentRetryLabel}>Tap to retry</RNText>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.documentLoadState}>
                        <ActivityIndicator color={BookingColors.primary} />
                        <RNText style={styles.documentLoadMessage}>
                          Preparing document…
                        </RNText>
                      </View>
                    )}
                    {!isCurrentDocumentComplete && (
                      <TouchableOpacity
                        accessibilityLabel="Edit document"
                        activeOpacity={0.8}
                        onPress={handleSignPress}
                        style={styles.documentEditButton}>
                        <Feather
                          name="edit-2"
                          size={16}
                          color={BookingColors.white}
                        />
                      </TouchableOpacity>
                    )}
                    {totalPages > 1 && (
                      <View style={styles.pageNavigation}>
                        <TouchableOpacity
                          accessibilityLabel="Previous page"
                          disabled={currentPage <= 1}
                          onPress={() => navigatePdfPage(currentPage - 1)}
                          style={styles.pageNavigationButton}>
                          <Feather
                            name="chevron-left"
                            size={18}
                            color={currentPage <= 1 ? '#A0A6B1' : BookingColors.textPrimary}
                          />
                        </TouchableOpacity>
                        <RNText style={styles.pageNavigationText}>
                          {currentPage} / {totalPages}
                        </RNText>
                        <TouchableOpacity
                          accessibilityLabel="Next page"
                          disabled={currentPage >= totalPages}
                          onPress={() => navigatePdfPage(currentPage + 1)}
                          style={styles.pageNavigationButton}>
                          <Feather
                            name="chevron-right"
                            size={18}
                            color={currentPage >= totalPages ? '#A0A6B1' : BookingColors.textPrimary}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
                <SignatureContainer
                  signatureData={signatureData}
                  onSignatureChange={handleDragabbleSignatureData}
                  locked={isCurrentDocumentComplete}
                  page={currentPage}
                />
                <ActiveSignerPresence
                  currentActivity={signingActivity}
                  currentParticipant={sessionParticipant}
                  others={roomOthers}
                />
              </View>
            </View>
          </View>
        </View>
      )}

      <DrawSignTypeModal
        isVisible={isSignatureModalOpen && !isCurrentDocumentComplete}
        onClose={handleSignCloseModal}
        signs={User}
        onStampChanges={handleSavedStamp}
        page={currentPage}
      />

      {!isClient && markCompleteConfirmVisible && (
        <View accessibilityViewIsModal style={styles.approvalBackdrop}>
          <View style={styles.approvalCard}>
            <View style={styles.approvalIcon}>
              <Feather
                name="alert-triangle"
                size={25}
                color={BookingColors.error}
              />
            </View>
            <RNText style={styles.approvalTitle}>Mark as complete?</RNText>
            <RNText style={styles.approvalMessage}>
              Once you mark as complete, the document will be finalized and no
              further changes can be made. Are you sure?
            </RNText>
            <View style={styles.approvalActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isMarkingDocumentComplete}
                onPress={() => setMarkCompleteConfirmVisible(false)}
                style={[styles.approvalButton, styles.rejectApprovalButton]}>
                <RNText style={styles.rejectApprovalText}>Cancel</RNText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isMarkingDocumentComplete}
                onPress={confirmMarkDocumentComplete}
                style={[styles.approvalButton, styles.approveApprovalButton]}>
                {isMarkingDocumentComplete ? (
                  <ActivityIndicator size="small" color={BookingColors.white} />
                ) : (
                  <RNText style={styles.approveApprovalText}>Confirm</RNText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {isClient && completionRequest.status === 'pending' && (
        <View accessibilityViewIsModal style={styles.approvalBackdrop}>
          <View style={styles.approvalCard}>
            <View style={styles.approvalIcon}>
              <Feather
                name="alert-triangle"
                size={25}
                color={BookingColors.error}
              />
            </View>
            <RNText style={styles.approvalTitle}>Confirm notarization</RNText>
            <RNText style={styles.approvalMessage}>
              Changes are irreversible once stamped, confirm to proceed.
            </RNText>
            <View style={styles.approvalActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setCompletionRequest('rejected')}
                style={[styles.approvalButton, styles.rejectApprovalButton]}>
                <RNText style={styles.rejectApprovalText}>Reject</RNText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setCompletionRequest('approved')}
                style={[styles.approvalButton, styles.approveApprovalButton]}>
                <RNText style={styles.approveApprovalText}>Approve</RNText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {isSessionCompleted && (
        <View
          accessibilityViewIsModal
          style={styles.completionBackdrop}>
          <View style={styles.completionCard}>
            <View style={styles.completionIcon}>
              <Feather name="check" size={30} color={BookingColors.white} />
            </View>
            <RNText style={styles.completionEyebrow}>SESSION COMPLETE</RNText>
            <RNText style={styles.completionTitle}>Signed and finished</RNText>
            <RNText style={styles.completionMessage}>
              The notarization is complete. Signed documents and appointment
              details are now available in Completed.
            </RNText>
            {localSessionCompletedAt || sessionCompletedAt ? (
              <RNText style={styles.completionTime}>
                Completed{' '}
                {moment(localSessionCompletedAt || sessionCompletedAt).format(
                  'h:mm A',
                )}
              </RNText>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={closeCompletedSession}
              style={styles.completionButton}>
              <RNText style={styles.completionButtonText}>Done</RNText>
              <Feather
                name="arrow-right"
                size={18}
                color={BookingColors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
const headerPickerStyles = StyleSheet.create({
  inputIOS: {
    height: 38,
    paddingLeft: 5,
    paddingRight: 20,
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  inputAndroid: {
    height: 38,
    paddingLeft: 5,
    paddingRight: 20,
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  iconContainer: {
    top: 12,
    right: 0,
  },
  placeholder: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
});

const styles = StyleSheet.create({
  // ── LAYOUT ──
  Maincontainer: {
    flex: 1,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  clientDocOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  container: {
    flex: 1,
  },
  completionBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  approvalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 950,
    elevation: 950,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  approvalCard: {
    width: '100%',
    maxWidth: 420,
    padding: 22,
    borderRadius: 16,
    backgroundColor: BookingColors.surface,
  },
  approvalIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: BookingColors.errorSoft,
  },
  approvalTitle: {
    marginTop: 16,
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
    color: BookingColors.textPrimary,
  },
  approvalMessage: {
    marginTop: 8,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: BookingColors.textSecondary,
  },
  approvalActions: {
    flexDirection: 'row',
    marginTop: 22,
    gap: 10,
  },
  approvalButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  rejectApprovalButton: {
    borderWidth: 1,
    borderColor: BookingColors.borderStrong,
    backgroundColor: BookingColors.surface,
  },
  approveApprovalButton: {
    backgroundColor: BookingColors.primary,
  },
  rejectApprovalText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: BookingColors.textPrimary,
  },
  approveApprovalText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: BookingColors.white,
  },
  completionCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    borderRadius: 16,
    backgroundColor: BookingColors.surface,
  },
  completionIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: BookingColors.success,
  },
  completionEyebrow: {
    marginTop: 18,
    color: BookingColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  completionTitle: {
    marginTop: 6,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
    textAlign: 'center',
  },
  completionMessage: {
    marginTop: 8,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  completionTime: {
    marginTop: 12,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  completionButton: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 22,
    borderRadius: 10,
    backgroundColor: BookingColors.primary,
  },
  completionButtonText: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },

  // ── HEADER ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: BookingColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.backgroundSubtle,
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
    color: BookingColors.textPrimary,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  sessionBadgeText: {
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    color: BookingColors.primary,
    letterSpacing: 0.5,
  },
  headerDocumentButton: {
    minWidth: 106,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BookingColors.primary,
    backgroundColor: BookingColors.primarySoft,
    gap: 6,
  },
  headerDocumentButtonDisabled: {
    opacity: 0.65,
  },
  headerDocumentButtonText: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  headerDocumentPicker: {
    width: 116,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 9,
    paddingRight: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BookingColors.primary,
    backgroundColor: BookingColors.primarySoft,
  },
  headerDocumentPickerInput: {
    flex: 1,
    minWidth: 0,
  },
  identityProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 10,
    backgroundColor: BookingColors.surface,
    gap: 10,
  },
  identityVerificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 10,
    backgroundColor: BookingColors.surface,
    gap: 10,
  },
  identityVerifyButton: {
    minWidth: 68,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: BookingColors.primarySoft,
  },
  identityVerifyButtonDone: {backgroundColor: '#EAF7F0'},
  identityVerifyButtonText: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  identityProofIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  identityProofCopy: {
    flex: 1,
    minWidth: 0,
  },
  identityProofTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  identityProofName: {
    marginTop: 1,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  documentHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 8,
  },
  documentCloseBtn: {
    marginRight: 0,
  },
  markCompleteButton: {
    maxWidth: 168,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: BookingColors.primary,
    gap: 6,
  },
  markCompleteButtonText: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  markCompleteDoneBadge: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: BookingColors.successSoft,
    borderWidth: 1,
    borderColor: BookingColors.success,
    gap: 5,
  },
  markCompleteDoneText: {
    color: BookingColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },

  sessionControlBar: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: BookingColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  compactCallStatus: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 7,
  },
  compactCallStatusText: {
    flexShrink: 1,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  compactControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  compactControl: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.backgroundSubtle,
  },

  // ── VIDEO PANEL ──
  videoPanel: {
    flex: 1,
    backgroundColor: '#0F1117',
    borderBottomWidth: 1,
    borderBottomColor: '#222735',
  },
  videoStage: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#090D14',
  },
  inPersonSessionState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  inPersonSessionIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF0E7',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginBottom: 16,
    width: 60,
  },
  inPersonSessionTitle: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
    textAlign: 'center',
  },
  inPersonSessionDescription: {
    color: '#AEB4BF',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 300,
    textAlign: 'center',
  },
  documentCallModeLabel: {
    color: BookingColors.white,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
  },
  mainVideoView: {
    ...StyleSheet.absoluteFillObject,
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111722',
  },
  videoAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  initialsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252C39',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  initialsText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 25,
    color: BookingColors.white,
  },
  placeholderName: {
    marginTop: 12,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
    color: BookingColors.white,
  },
  pipVideoView: {
    ...StyleSheet.absoluteFillObject,
  },
  pipPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipInitials: {
    fontFamily: 'Manrope-Bold',
    fontSize: 19,
    color: BookingColors.white,
  },
  pipLabel: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  pipLabelText: {
    flexShrink: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
    color: BookingColors.white,
  },
  pipOnlineDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor: BookingColors.success,
  },
  documentCallBar: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#111722',
    borderBottomWidth: 1,
    borderBottomColor: '#283142',
    gap: 8,
  },
  documentCallControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
  },
  documentCallControl: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#2A3240',
  },
  documentCompleteCallControl: {
    backgroundColor: BookingColors.error,
  },
  participantPipScroller: {
    flex: 1,
    minWidth: 0,
  },
  participantPipStack: {
    flexGrow: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  },
  participantPip: {
    width: 54,
    height: 58,
    overflow: 'hidden',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.36)',
    backgroundColor: '#252C39',
  },
  callPipOverlay: {
    position: 'absolute',
    bottom: 18,
    right: 14,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(9,13,20,0.52)',
  },
  callPipBox: {
    width: 62,
    height: 74,
  },
  callStatusPill: {
    position: 'absolute',
    left: 14,
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: 'rgba(9,13,20,0.74)',
    gap: 7,
  },
  callStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F2B94B',
  },
  callStatusDotConnected: { backgroundColor: BookingColors.success },
  callStatusDotError: { backgroundColor: BookingColors.error },
  callStatusText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    color: BookingColors.white,
  },
  videoControlsRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#121722',
  },
  controlAction: {
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  controlActionMuted: {},
  controlIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252C39',
  },
  controlLabel: {
    marginTop: 5,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
    color: '#CBD1DC',
  },
  completeCallIconCircle: {
    backgroundColor: BookingColors.error,
  },
  completeCallLabel: {
    color: '#FFB4AF',
  },
  callErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFF1F0',
    gap: 10,
  },
  callErrorIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BookingColors.errorSoft,
  },
  callErrorCopy: { flex: 1 },
  callErrorTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: BookingColors.textPrimary,
  },
  callErrorMessage: {
    marginTop: 2,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 14,
    color: BookingColors.textSecondary,
  },
  callErrorAction: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
    borderWidth: 1,
    borderColor: BookingColors.error,
  },
  callErrorActionText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    color: BookingColors.error,
  },

  // ── DOCUMENT PICKER ──
  pickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 12,
    paddingLeft: 12,
    backgroundColor: BookingColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BookingColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pickerIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  pickerInner: {
    flex: 1,
  },
  clientUploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingRight: 12,
  },
  clientUploadButtonText: {
    marginLeft: 8,
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  clientDocumentStage: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 14,
    paddingHorizontal: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
    overflow: 'hidden',
  },
  documentEmptyIcon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: BookingColors.primarySoft,
  },
  documentEmptyTitle: {
    marginTop: 14,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
  },
  documentEmptyMessage: {
    maxWidth: 250,
    marginTop: 6,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  // ── PDF VIEWER ──
  pdfWrapper: {
    flex: 1,
  },
  documentLoadState: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: BookingColors.white,
  },
  documentLoadMessage: {
    marginTop: 12,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    textAlign: 'center',
  },
  documentRetryLabel: {
    marginTop: 6,
    color: BookingColors.primary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
  },
  pdfView: {
    height: '100%',
    width: '100%',
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BookingColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pageNavigation: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    marginLeft: -72,
    width: 144,
    height: 38,
    zIndex: 1001,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  pageNavigationButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  pageNavigationText: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  documentEditButton: {
    position: 'absolute',
    right: 50,
    bottom: 10,
    zIndex: 1000,
    elevation: 5,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: BookingColors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pageIndicatorText: {
    color: BookingColors.white,
    fontSize: 12,
    fontFamily: 'Manrope-Bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: BookingColors.primary,
    fontSize: 15,
    fontFamily: 'Manrope-Bold',
    marginTop: 14,
  },
  objectsWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  // ── PEN TOOL ──
  penIconContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: BookingColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activePenIconContainer: {
    backgroundColor: BookingColors.primary,
    borderColor: BookingColors.primary,
  },
  editIcon: {
    color: BookingColors.textSecondary,
  },
  activeeditIcon: {
    color: BookingColors.white,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },

  // ── ACTION TOOLBAR ──
  toolbar: {
    backgroundColor: BookingColors.surface,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
  },
  toolbarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
    gap: 8,
    minWidth: '47%',
    flex: 1,
  },
  toolBtnIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnLabel: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: BookingColors.textPrimary,
  },
  endCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BookingColors.errorSoft,
    gap: 8,
  },
  endCallBtnDisabled: {
    opacity: 0.62,
  },
  endCallBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: BookingColors.error,
  },

  // ── LEGACY / MISC (kept for compatibility) ──
  buttonFlex: {},
  navigation: { flexDirection: 'row', alignItems: 'center', columnGap: 16 },
  flexContainer: { flexDirection: 'row' },
  scroll: { flex: 1, width: '100%' },
  scrollContainer: { margin: widthToDp(3), columnGap: widthToDp(4) },
  SecondContainer: { backgroundColor: Colors.white },
  hourGlass: { alignSelf: 'center' },
  penToolcanva: { position: 'absolute', top: 0, left: 0 },

  // kept so StyleSheet.create doesn't complain about removed references in commented code
  NavbarContainer: {} as any,
  NavContainer: {} as any,
  waitingNav: {} as any,
  profilePic: {} as any,
  scrollBar: {} as any,
  picker: {} as any,
  NavTextContainer: {} as any,
  textHead: {} as any,
  textSubHead: {} as any,
  buttonContainer: {} as any,
  textSession: {} as any,
  sessionDesc: {} as any,
  btn: {} as any,
  btncontain: {} as any,
  slideContainer: {} as any,
  button: {} as any,
  main: {} as any,
  btnContainer: {} as any,
  head: {} as any,
  info: {} as any,
  sessionIDComponent: {} as any,
  sessionID: {} as any,
  topbuttons: {} as any,
  currentPageTextContainer: {} as any,
  currentPageText: {} as any,
  actions: {} as any,
});
