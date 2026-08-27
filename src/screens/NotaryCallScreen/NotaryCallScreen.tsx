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
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
} from 'react-native-agora';

import Toast from 'react-native-toast-message';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import PdfView from 'react-native-pdf';

import RNPickerSelect from 'react-native-picker-select';
import { useLiveblocks } from '../../store/liveblocks';
const appId = 'f64e76f674b646bc965dc3e257b4e108';

import Pdf from 'react-native-pdf';
import { encode as btoa } from 'base-64';
import RNFS from 'react-native-fs';
import { uploadSignedDocumentToSpaces } from '../../utils/spacesHelper';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SIGN_DOCS } from '../../../request/mutations/signDocument';
import { ADD_NOTARIZED_DOCS } from '../../../request/mutations/addNotarizedDocs';
import { useSession } from '../../hooks/useSession';
import useBookingStatus from '../../hooks/useBookingStatus';
import { GET_SESSION_BY_ID } from '../../../request/queries/getSessionByID.query';
import { setBookingInfoState } from '../../features/booking/bookingSlice';
import SignatureContainer from './SignatureContainer';
import useRegister from '../../hooks/useRegister';
import { UPDATE_OR_CREATE_SESSION_UPDATED_DOCS } from '../../../request/mutations/updateSessionUpdateddocs';
import SketchCanvasComponent from './PenTool/SketchCanvasComponent';
import { UPDATE_OR_CREATE_SESSION_CLIENT_DOCS } from '../../../request/mutations/updateSessionClientDocs';
import DrawSignTypeModal, { ActiveSignerPresence } from './Signature';
import { getSessionAvailability } from '../../utils/sessionAvailability';
import {getObserverPhone} from '../../utils/observerPhone';

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

const getDisplayInitials = (name: string): string =>
  String(name || '')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'P';

const getPersonName = (person: any, fallback = ''): string =>
  [person?.first_name, person?.last_name].filter(Boolean).join(' ') ||
  fallback;

export default function NotaryCallScreen({ route, navigation }: any) {
  const {
    channel,
    token: CutomToken,
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
  const { updateSession } = useSession();
  const {
    handleUpdateBookingStatus,
    handlegetBookingStatus,
    handleSessionStatus,
  } = useBookingStatus();
  const [AddSignedDocs] = useMutation(ADD_NOTARIZED_DOCS);
  const [getSession] = useLazyQuery(GET_SESSION_BY_ID);
  const User = useSelector(state => state?.user?.user);
  const isAgent = String(User?.account_type || '').includes('agent');
  const isClient = !isAgent && User?.account_type === 'client';
  const insets = useSafeAreaInsets();
  const sharedDocument = useLiveblocks(state => state.sharedDocument);
  const isDocumentPreviewOpen = useLiveblocks(
    state => state.isDocumentPreviewOpen,
  );
  const isDocumentCollaborationActive = Boolean(
    resolveDocumentUri(sharedDocument) && isDocumentPreviewOpen,
  );
  const setSharedDocument = useLiveblocks(state => state.setSharedDocument);
  const clearSharedDocument = useLiveblocks(
    state => state.clearSharedDocument,
  );
  const setDocumentPreviewOpen = useLiveblocks(
    state => state.setDocumentPreviewOpen,
  );
  const isSignatureModalOpen = useLiveblocks(
    state => state.isSignatureModalOpen,
  );
  const setSignatureModalOpen = useLiveblocks(
    state => state.setSignatureModalOpen,
  );
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
  const markDocumentComplete = useLiveblocks(
    state => state.markDocumentComplete,
  );
  const deleteAllObjects = useLiveblocks(state => state.deleteAllObjects);
  const signingObjects = useLiveblocks(state => state.objects);
  const setSharedCurrentPage = useLiveblocks(state => state.setCurrentPage);
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
  const [sourceKey, setSourceKey] = useState(initialSourceKey);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);
  const [pickerItems, setPickerItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updatedDocumentsession] = useMutation(
    UPDATE_OR_CREATE_SESSION_UPDATED_DOCS,
  );
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [pdfEditMode, setPdfEditMode] = useState(false);
  const [signatureArrayBuffer, setSignatureArrayBuffer] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [newPdfSaved, setNewPdfSaved] = useState(false);
  const [newPdfPath, setNewPdfPath] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [filePath, setFilePath] = useState(
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
      channel,
      token: CutomToken,
      time: scheduledTime,
      date: scheduledDate,
      routeFrom,
    });
  }, [
    CutomToken,
    bookingRoomId,
    channel,
    navigation,
    routeFrom,
    scheduledDate,
    scheduledTime,
    sessionAvailability.canJoin,
    sessionAvailability.message,
  ]);

  useEffect(() => {
    const sharedDocumentUri = resolveDocumentUri(sharedDocument);
    if (!sharedDocumentUri) {
      setClientDocModalVisible(false);
      setSelectedLocalDocument(null);
      setSelectedItem(null);
      setSourceKey(null);
      setSourceUrl(null);
      setFileDownloaded(false);
      setPdfBase64(null);
      setNewPdfSaved(false);
      setNewPdfPath(null);
      return;
    }

    const document = {
      name: sharedDocument.name || 'Shared document.pdf',
      uri: sharedDocumentUri,
      type: sharedDocument.type || 'application/pdf',
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
    setClientDocModalVisible(
      Boolean(resolveDocumentUri(sharedDocument) && isDocumentPreviewOpen),
    );
  }, [isDocumentPreviewOpen, sharedDocument]);

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

      if (!requestedDocument) {
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
        setFileDownloaded(true);
      } catch (error: any) {
        if (cancelled || loadId !== documentLoadIdRef.current) {
          return;
        }
        console.warn('Unable to prepare selected document:', error);
        setFileDownloaded(false);
        setPdfBase64(null);
        Toast.show({
          type: 'error',
          text1: 'Document unavailable',
          text2: error?.message || 'Choose the document again and retry.',
        });
      }
    };

    loadDocument();
    return () => {
      cancelled = true;
    };
  }, [bookingRoomId, newPdfPath, newPdfSaved, sourceUrl]);
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
    setSharedCurrentPage(1);
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
    try {
      const urls = docs.map(resolveDocumentUri).filter(Boolean);
      if (!bookingData?._id || urls.length === 0) {
        return;
      }
      const request = {
        variables: {
          bookingId: bookingData?._id,
          notarizedDocs: urls,
          bookingType:
            bookingData?.__typename == 'Booking' ? 'booking' : 'session',
        },
      };
      const response = await AddSignedDocs(request);
      if (response?.data?.bookingAddNotarizedDocs?.status === '200') {
        const request = {
          variables: {
            sessionId: bookingData?._id,
          },
        };
        let sessiondata = await getSession(request);
        dispatch(setBookingInfoState(sessiondata.data.getSession.session));
      }
    } catch (error) {
      console.warn('Unable to attach signed documents:', error);
    }
  };

  /////////////////////////////////////
  ///////////////////////////////

  const uid = 0;
  const channelName = channel;
  const token = CutomToken;
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUids, setRemoteUids] = useState<any[]>([]);
  const agoraEngineRef = useRef<IRtcEngine>();
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [remoteVideoMutedByUid, setRemoteVideoMutedByUid] = useState<
    Record<string, boolean>
  >({});
  const [localAgoraUid, setLocalAgoraUid] = useState<number | null>(null);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<
    'connecting' | 'waiting' | 'connected' | 'error' | 'permissions'
  >('connecting');
  const [callError, setCallError] = useState('');
  const remoteCurrentPage = useLiveblocks(state => state.currentPage);
  const pdfRef = React.useRef<Pdf>(null);
  const displayedPageRef = React.useRef(1);
  const pendingProgrammaticPageRef = React.useRef<number | null>(null);
  const lastPublishedPageRef = React.useRef<number | null>(null);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const [currentPage, setCurrentPage] =
    React.useState<number>(remoteCurrentPage);
  useEffect(() => {
    if (!remoteCurrentPage) {
      return;
    }

    if (lastPublishedPageRef.current === remoteCurrentPage) {
      lastPublishedPageRef.current = null;
      return;
    }

    if (displayedPageRef.current === remoteCurrentPage) {
      return;
    }

    pendingProgrammaticPageRef.current = remoteCurrentPage;
    setCurrentPage(remoteCurrentPage);
    pdfRef.current?.setPage(remoteCurrentPage);
  }, [remoteCurrentPage]);

  const handleSharedPageChanged = useCallback(
    (page: number) => {
      displayedPageRef.current = page;
      setCurrentPage(page);

      // A page change caused by following the other participant must not be
      // published back into the room. Otherwise two viewers can continuously
      // bounce a multi-page document between their previous pages.
      if (pendingProgrammaticPageRef.current !== null) {
        if (page === pendingProgrammaticPageRef.current) {
          pendingProgrammaticPageRef.current = null;
        }
        return;
      }

      if (page !== remoteCurrentPage) {
        lastPublishedPageRef.current = page;
        setSharedCurrentPage(page);
      }
    },
    [remoteCurrentPage, setSharedCurrentPage],
  );
  const handleBackButton = () => {
    if (routeFrom === 'agent') {
      // If routeFrom is 'agent', navigate back
      navigation.goBack();
    } else {
      // Otherwise, navigate to WaitingRoomScreen
      navigation.navigate('WaitingRoomScreen', {
        uid: bookingData?._id,
        channel: bookingData?.agora_channel_name,
        token: bookingData?.agora_channel_token,
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
  const join = useCallback(
    async (engine = agoraEngineRef.current) => {
      if (!sessionAvailability.canJoin) {
        setCallStatus('error');
        setCallError(sessionAvailability.message);
        return;
      }
      if (!engine) {
        setCallStatus('error');
        setCallError('The call engine is not ready. Please retry.');
        return;
      }
      if (!channelName || !token) {
        setCallStatus('error');
        setCallError('The secure video room details are missing.');
        return;
      }
      try {
        setCallError('');
        setCallStatus('connecting');
        engine.startPreview();
        const result = engine.joinChannel(token, channelName, uid, {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          publishCameraTrack: true,
          publishMicrophoneTrack: true,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        });
        if (typeof result === 'number' && result < 0) {
          throw new Error(`Unable to join the call (${result}).`);
        }
      } catch (error: any) {
        console.warn('Unable to join video session:', error?.message || error);
        setCallStatus('error');
        setCallError(error?.message || 'The video room could not be opened.');
      }
    },
    [
      channelName,
      sessionAvailability.canJoin,
      sessionAvailability.message,
      token,
    ],
  );

  const getPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }
    const permissions = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ]);
    return (
      permissions[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
      PermissionsAndroid.RESULTS.GRANTED &&
      permissions[PermissionsAndroid.PERMISSIONS.CAMERA] ===
      PermissionsAndroid.RESULTS.GRANTED
    );
  }, []);

  useEffect(() => {
    let active = true;
    let eventHandler: any;

    const setupVideoSDKEngine = async () => {
      try {
        const permissionGranted = await getPermission();
        if (!permissionGranted) {
          if (active) {
            setCallStatus('permissions');
            setCallError(
              'Camera and microphone access are required for this session.',
            );
          }
          return;
        }

        const agoraEngine = createAgoraRtcEngine();
        agoraEngineRef.current = agoraEngine;
        eventHandler = {
          onJoinChannelSuccess: connection => {
            if (!active) {
              return;
            }
            const joinedUid = Number(connection?.localUid);
            if (Number.isFinite(joinedUid) && joinedUid > 0) {
              setLocalAgoraUid(joinedUid);
            }
            setIsJoined(true);
            setCallStatus('waiting');
            setCallError('');
          },
          onUserJoined: (_connection, remoteUid) => {
            if (!active) {
              return;
            }
            setRemoteUids(prevUids =>
              prevUids.includes(remoteUid)
                ? prevUids
                : [...prevUids, remoteUid],
            );
            setCallStatus('connected');
          },
          onUserOffline: (_connection, remoteUid) => {
            if (!active) {
              return;
            }
            setRemoteUids(prevUids => {
              const nextUids = prevUids.filter(
                previousUid => previousUid !== remoteUid,
              );
              setCallStatus(nextUids.length ? 'connected' : 'waiting');
              return nextUids;
            });
            setRemoteVideoMutedByUid(current => {
              const next = {...current};
              delete next[String(remoteUid)];
              return next;
            });
          },
          onUserMuteVideo: (_connection, remoteUid, muted) => {
            if (active) {
              setRemoteVideoMutedByUid(current => ({
                ...current,
                [String(remoteUid)]: muted,
              }));
            }
          },
          onError: (errorCode, message) => {
            if (!active) {
              return;
            }
            console.warn('Agora call error:', errorCode, message);
            setCallStatus('error');
            setCallError(
              message || `The video connection failed (${errorCode}).`,
            );
          },
          onConnectionLost: () => {
            if (active) {
              setCallStatus('error');
              setCallError('The call connection was lost. Tap retry.');
            }
          },
        };

        agoraEngine.registerEventHandler(eventHandler);
        agoraEngine.initialize({
          appId,
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
        });
        agoraEngine.enableAudio();
        agoraEngine.enableVideo();
        agoraEngine.enableLocalVideo(true);
        agoraEngine.setDefaultAudioRouteToSpeakerphone(true);
        await join(agoraEngine);
      } catch (error: any) {
        console.warn(
          'Unable to initialize video session:',
          error?.message || error,
        );
        if (active) {
          setCallStatus('error');
          setCallError(
            error?.message || 'Camera and microphone could not be started.',
          );
        }
      }
    };

    setupVideoSDKEngine();
    return () => {
      active = false;
      const engine = agoraEngineRef.current;
      if (engine && eventHandler) {
        engine.unregisterEventHandler(eventHandler);
      }
      engine?.stopPreview();
      engine?.leaveChannel();
      engine?.release();
      agoraEngineRef.current = undefined;
    };
  }, [getPermission, join]);

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
          await addSignedDocFunc(completedDocuments);
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

      const isSessionRecord = bookingData?.__typename === 'Session';
      const completedRecord = isSessionRecord
        ? await updateSession('completed', recordId)
        : await handleUpdateBookingStatus('completed', recordId, {
          navigate: false,
          throwOnError: true,
          verifyPersistedStatus: true,
        });

      if (String(completedRecord?.status).toLowerCase() !== 'completed') {
        throw new Error('The server did not confirm the completed status.');
      }

      dispatch(
        setBookingInfoState({
          ...bookingData,
          ...completedRecord,
          status: 'completed',
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

    agoraEngineRef.current?.leaveChannel();
    setRemoteUids([]);
    setIsJoined(false);
    leaveRoom();

    if (isClient) {
      navigation.replace('MedicalBookingScreen');
      return;
    }

    navigation.replace('ClientDetailsScreen', {
      clientDetail: bookingData,
    });
  }, [bookingData, isClient, leaveRoom, navigation]);
  function showMessage(msg: string) {
    console.log(msg);
    Toast.show({
      type: 'success',
      text1: msg,
    });
  }
  const mute = () => {
    if (agoraEngineRef.current) {
      const nextMuted = !isMuted;
      agoraEngineRef.current.muteLocalAudioStream(nextMuted);
      setIsMuted(nextMuted);
    }
  };
  const toggleVideoMute = () => {
    if (agoraEngineRef.current) {
      const nextMuted = !isVideoMuted;
      agoraEngineRef.current.muteLocalVideoStream(nextMuted);
      if (nextMuted) {
        agoraEngineRef.current.stopPreview();
      } else {
        agoraEngineRef.current.startPreview();
      }
      setIsVideoMuted(nextMuted);
    }
  };
  const switchCamera = () => agoraEngineRef.current?.switchCamera();
  const toggleSpeaker = () => {
    if (agoraEngineRef.current) {
      const nextSpeakerState = !isSpeakerOn;
      agoraEngineRef.current.setEnableSpeakerphone(nextSpeakerState);
      setIsSpeakerOn(nextSpeakerState);
    }
  };
  const retryCall = async () => {
    const engine = agoraEngineRef.current;
    if (!engine) {
      setCallError('Reopen this session to restart the camera and microphone.');
      return;
    }
    engine.leaveChannel();
    setIsJoined(false);
    setRemoteUids([]);
    setRemoteVideoMutedByUid({});
    await join(engine);
  };
  const userDisplayName =
    [User?.first_name, User?.last_name].filter(Boolean).join(' ') || 'You';
  const userInitials = getDisplayInitials(userDisplayName);
  useEffect(() => {
    setSessionParticipant({
      name: userDisplayName,
      role: participantRole,
      agoraUid: localAgoraUid,
    });
  }, [localAgoraUid, participantRole, setSessionParticipant, userDisplayName]);
  const connectedCount = remoteUids.length + (isJoined ? 1 : 0);
  const callStatusLabel =
    callStatus === 'connected'
      ? connectedCount > 2
        ? `${connectedCount} participants connected`
        : 'Participant connected'
      : callStatus === 'waiting'
        ? 'Waiting for participant'
        : callStatus === 'connecting'
          ? 'Connecting securely'
          : callStatus === 'permissions'
            ? 'Permissions required'
            : 'Connection issue';

  const rosterParticipants = useMemo(() => {
    const observers = (
      Array.isArray(bookingData?.observers) ? bookingData.observers : []
    ).map((observer: any) =>
      typeof observer === 'string'
        ? {phone_number: observer, first_name: observer, role: 'Observer'}
        : {
            ...observer,
            role: 'Observer',
            first_name:
              observer?.first_name || observer?.phone_number || 'Observer',
          },
    );
    return [
      bookingData?.agent
        ? {...bookingData.agent, role: 'Notary'}
        : null,
      bookingData?.booked_by || bookingData?.client || bookingData?.booked_for
        ? {
            ...(bookingData.booked_by ||
              bookingData.client ||
              bookingData.booked_for),
            role: 'Client',
          }
        : null,
      ...observers,
    ]
      .filter(Boolean)
      .map((person: any) => ({
        name: getPersonName(
          person,
          person.role === 'Observer' ? 'Observer' : person.role,
        ),
        role: person.role,
        id: String(person._id || ''),
      }))
      .filter(
        (person, index, list) =>
          person.name &&
          person.name !== userDisplayName &&
          list.findIndex(item => item.name === person.name) === index,
      );
  }, [
    bookingData?.agent,
    bookingData?.booked_by,
    bookingData?.booked_for,
    bookingData?.client,
    bookingData?.observers,
    userDisplayName,
  ]);

  const participantInfoForUid = (remoteUid: number, index: number) => {
    const matchedPresence = roomOthers.find(
      other =>
        Number(other?.presence?.sessionParticipant?.agoraUid) ===
        Number(remoteUid),
    )?.presence?.sessionParticipant as
      | {name?: string; role?: string}
      | undefined;
    if (matchedPresence?.name) {
      return {
        name: matchedPresence.name,
        role: matchedPresence.role || 'Participant',
        initials: getDisplayInitials(matchedPresence.name),
      };
    }

    const claimedNames = new Set(
      remoteUids.slice(0, index).map((uid, claimedIndex) => {
        const presenceName = roomOthers.find(
          other =>
            Number(other?.presence?.sessionParticipant?.agoraUid) ===
            Number(uid),
        )?.presence?.sessionParticipant?.name;
        return (
          presenceName ||
          rosterParticipants[claimedIndex]?.name ||
          `Participant ${claimedIndex + 1}`
        );
      }),
    );
    const leftover = rosterParticipants.find(
      person => !claimedNames.has(person.name),
    );
    const fallbackName =
      leftover?.name ||
      roomOthers[index]?.presence?.sessionParticipant?.name ||
      `Participant ${index + 1}`;
    return {
      name: fallbackName,
      role:
        leftover?.role ||
        roomOthers[index]?.presence?.sessionParticipant?.role ||
        'Participant',
      initials: getDisplayInitials(fallbackName),
    };
  };

  const isRemoteVideoMuted = (remoteUid: number) =>
    Boolean(remoteVideoMutedByUid[String(remoteUid)]);

  const renderRemotePip = (remoteUid: number, index: number) => {
    const info = participantInfoForUid(remoteUid, index);
    return (
      <View key={remoteUid} pointerEvents="none" style={styles.participantPip}>
        {isRemoteVideoMuted(remoteUid) ? (
          <View style={styles.pipPlaceholder}>
            <RNText style={styles.pipInitials}>{info.initials}</RNText>
          </View>
        ) : (
          <RtcSurfaceView
            canvas={{uid: remoteUid}}
            style={styles.pipVideoView}
          />
        )}
        <View style={styles.pipLabel}>
          <View style={styles.pipOnlineDot} />
          <RNText numberOfLines={1} style={styles.pipLabelText}>
            {info.name}
          </RNText>
        </View>
      </View>
    );
  };

  const primaryRemoteUid = remoteUids[0];
  const extraRemoteUids = remoteUids.slice(1);
  const primaryRemoteInfo = primaryRemoteUid
    ? participantInfoForUid(primaryRemoteUid, 0)
    : null;

  const renderFullVideoPanel = () => (
    <View style={styles.videoPanel}>
      <View style={styles.videoStage}>
        {primaryRemoteUid && !isRemoteVideoMuted(primaryRemoteUid) ? (
          <RtcSurfaceView
            canvas={{ uid: primaryRemoteUid }}
            style={styles.mainVideoView}
          />
        ) : primaryRemoteUid && isRemoteVideoMuted(primaryRemoteUid) ? (
          <View style={styles.videoPlaceholder}>
            <View style={styles.initialsAvatar}>
              <RNText style={styles.initialsText}>
                {primaryRemoteInfo?.initials}
              </RNText>
            </View>
            <RNText style={styles.placeholderName}>
              {primaryRemoteInfo?.name}
            </RNText>
            <RNText style={styles.placeholderCaption}>Camera is off</RNText>
          </View>
        ) : isJoined && !isVideoMuted ? (
          <RtcSurfaceView canvas={{ uid: 0 }} style={styles.mainVideoView} />
        ) : (
          <View style={styles.videoPlaceholder}>
            {User?.profile_picture ? (
              <Image
                source={{ uri: User.profile_picture }}
                style={styles.videoAvatar}
              />
            ) : (
              <View style={styles.initialsAvatar}>
                <RNText style={styles.initialsText}>{userInitials}</RNText>
              </View>
            )}
            <RNText style={styles.placeholderName}>{userDisplayName}</RNText>
            <RNText style={styles.placeholderCaption}>
              {isVideoMuted ? 'Camera is off' : callStatusLabel}
            </RNText>
          </View>
        )}

        <View style={styles.callStatusPill}>
          <View
            style={[
              styles.callStatusDot,
              callStatus === 'connected' && styles.callStatusDotConnected,
              (callStatus === 'error' || callStatus === 'permissions') &&
              styles.callStatusDotError,
            ]}
          />
          <RNText style={styles.callStatusText}>{callStatusLabel}</RNText>
        </View>

        <View pointerEvents="none" style={styles.callPipOverlay}>
          {extraRemoteUids.map((remoteUid, index) =>
            renderRemotePip(remoteUid, index + 1),
          )}
          <View style={[styles.participantPip, styles.callPipBox]}>
            {isVideoMuted ? (
              <View style={styles.pipPlaceholder}>
                <RNText style={styles.pipInitials}>{userInitials}</RNText>
              </View>
            ) : (
              <RtcSurfaceView canvas={{ uid: 0 }} style={styles.pipVideoView} />
            )}
            <View style={styles.pipLabel}>
              <View style={styles.pipOnlineDot} />
              <RNText numberOfLines={1} style={styles.pipLabelText}>
                You
              </RNText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.videoControlsRow}>
        <TouchableOpacity
          style={[styles.controlAction, isMuted && styles.controlActionMuted]}
          onPress={mute}
          disabled={!isJoined}>
          <View style={styles.controlIconCircle}>
            <Feather
              name={isMuted ? 'mic-off' : 'mic'}
              size={19}
              color={isMuted ? BookingColors.error : BookingColors.white}
            />
          </View>
          <RNText style={styles.controlLabel}>
            {isMuted ? 'Unmute' : 'Mute'}
          </RNText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.controlAction,
            isVideoMuted && styles.controlActionMuted,
          ]}
          onPress={toggleVideoMute}
          disabled={!isJoined}>
          <View style={styles.controlIconCircle}>
            <Feather
              name={isVideoMuted ? 'video-off' : 'video'}
              size={19}
              color={isVideoMuted ? BookingColors.error : BookingColors.white}
            />
          </View>
          <RNText style={styles.controlLabel}>
            {isVideoMuted ? 'Start video' : 'Stop video'}
          </RNText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlAction}
          onPress={switchCamera}
          disabled={!isJoined || isVideoMuted}>
          <View style={styles.controlIconCircle}>
            <Feather name="refresh-cw" size={19} color={BookingColors.white} />
          </View>
          <RNText style={styles.controlLabel}>Flip</RNText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlAction}
          onPress={toggleSpeaker}
          disabled={!isJoined}>
          <View style={styles.controlIconCircle}>
            <Feather
              name={isSpeakerOn ? 'volume-2' : 'volume-1'}
              size={19}
              color={BookingColors.white}
            />
          </View>
          <RNText style={styles.controlLabel}>
            {isSpeakerOn ? 'Speaker' : 'Earpiece'}
          </RNText>
        </TouchableOpacity>
        {!isClient && (
          <TouchableOpacity
            accessibilityLabel="Complete call"
            style={styles.controlAction}
            onPress={completeCall}
            disabled={isCompleting || isWaitingForClientApproval}>
            <View
              style={[
                styles.controlIconCircle,
                styles.completeCallIconCircle,
                (isCompleting || isWaitingForClientApproval) &&
                styles.endCallBtnDisabled,
              ]}>
              {isCompleting || isWaitingForClientApproval ? (
                <ActivityIndicator size="small" color={BookingColors.white} />
              ) : (
                <Feather name="phone-off" size={19} color={BookingColors.white} />
              )}
            </View>
            <RNText style={[styles.controlLabel, styles.completeCallLabel]}>
              {isCompleting
                ? 'Finishing…'
                : isWaitingForClientApproval
                  ? 'Awaiting…'
                  : 'Complete'}
            </RNText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderParticipantPips = () => (
    <ScrollView
      horizontal
      pointerEvents="box-none"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.participantPipStack}
      style={styles.participantPipScroller}>
      {remoteUids.map((remoteUid, index) => renderRemotePip(remoteUid, index))}

      <View pointerEvents="none" style={styles.participantPip}>
        {isVideoMuted ? (
          <View style={styles.pipPlaceholder}>
            <RNText style={styles.pipInitials}>{userInitials}</RNText>
          </View>
        ) : (
          <RtcSurfaceView canvas={{ uid: 0 }} style={styles.pipVideoView} />
        )}
        <View style={styles.pipLabel}>
          <View style={styles.pipOnlineDot} />
          <RNText numberOfLines={1} style={styles.pipLabelText}>You</RNText>
        </View>
      </View>
    </ScrollView>
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
    try {
      setSignatureModalOpen(false);
      setPdfEditMode(false);
      const finalizedPdf = await flattenSigningObjectsIntoPdf(pdfBase64);
      const signedUrl = await uploadSignedDocumentToSpaces(finalizedPdf);
      const documentName =
        selectedLocalDocument?.name || 'Notarized document.pdf';
      const documentType =
        selectedLocalDocument?.type || 'application/pdf';

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
      await addSignedDocFunc([{value: signedUrl, url: signedUrl}]);
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
      Toast.show({
        type: 'success',
        text1: 'Document completed',
        text2: 'This document is finalized and can no longer be edited.',
      });
    } catch (error: any) {
      console.warn('Unable to mark document complete:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not complete document',
        text2: error?.message || 'Please try again.',
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
    if (isClient) {
      clearSharedDocument();
      return;
    }

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
          <RNText style={styles.headerTitle}>Notary Session</RNText>
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

      {isDocumentCollaborationActive ? (
        /* Compact call chrome keeps the shared document as the primary canvas. */
        <View style={styles.sessionControlBar}>
          <View style={styles.compactCallStatus}>
            <View
              style={[
                styles.callStatusDot,
                callStatus === 'connected' && styles.callStatusDotConnected,
                (callStatus === 'error' || callStatus === 'permissions') &&
                styles.callStatusDotError,
              ]}
            />
            <RNText numberOfLines={1} style={styles.compactCallStatusText}>
              {callStatusLabel}
            </RNText>
          </View>
          <View style={styles.compactControlsRow}>
            <TouchableOpacity
              accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
              style={styles.compactControl}
              onPress={mute}
              disabled={!isJoined}>
              <Feather
                name={isMuted ? 'mic-off' : 'mic'}
                size={17}
                color={isMuted ? BookingColors.error : BookingColors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={isVideoMuted ? 'Start video' : 'Stop video'}
              style={styles.compactControl}
              onPress={toggleVideoMute}
              disabled={!isJoined}>
              <Feather
                name={isVideoMuted ? 'video-off' : 'video'}
                size={17}
                color={
                  isVideoMuted ? BookingColors.error : BookingColors.textPrimary
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Switch camera"
              style={styles.compactControl}
              onPress={switchCamera}
              disabled={!isJoined || isVideoMuted}>
              <Feather
                name="refresh-cw"
                size={17}
                color={BookingColors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={isSpeakerOn ? 'Use earpiece' : 'Use speaker'}
              style={styles.compactControl}
              onPress={toggleSpeaker}
              disabled={!isJoined}>
              <Feather
                name={isSpeakerOn ? 'volume-2' : 'volume-1'}
                size={17}
                color={BookingColors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        renderFullVideoPanel()
      )}

      {(callStatus === 'error' || callStatus === 'permissions') && (
        <View style={styles.callErrorBanner}>
          <View style={styles.callErrorIcon}>
            <Feather name="alert-circle" size={18} color={BookingColors.error} />
          </View>
          <View style={styles.callErrorCopy}>
            <RNText style={styles.callErrorTitle}>
              {callStatus === 'permissions'
                ? 'Allow camera and microphone'
                : 'Unable to connect'}
            </RNText>
            <RNText style={styles.callErrorMessage}>{callError}</RNText>
          </View>
          <TouchableOpacity
            style={styles.callErrorAction}
            onPress={
              callStatus === 'permissions'
                ? () => Linking.openSettings()
                : retryCall
            }>
            <RNText style={styles.callErrorActionText}>
              {callStatus === 'permissions' ? 'Settings' : 'Retry'}
            </RNText>
          </TouchableOpacity>
        </View>
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
                        const initialPage = Math.min(
                          Math.max(remoteCurrentPage || 1, 1),
                          numberOfPages,
                        );
                        displayedPageRef.current = 1;
                        setCurrentPage(initialPage);
                        if (initialPage > 1) {
                          pendingProgrammaticPageRef.current = initialPage;
                          pdfRef.current?.setPage(initialPage);
                        } else {
                          pendingProgrammaticPageRef.current = null;
                        }
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
                    <View style={styles.pageIndicator}>
                      <RNText style={styles.pageIndicatorText}>
                        {currentPage}
                      </RNText>
                    </View>
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
            />
          </View>

          {/* The client owns uploads; the notary works with the shared file. */}
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
              {renderParticipantPips()}
              <View style={styles.documentCallControls}>
                <TouchableOpacity
                  accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
                  style={styles.documentCallControl}
                  onPress={mute}
                  disabled={!isJoined}>
                  <Feather
                    name={isMuted ? 'mic-off' : 'mic'}
                    size={16}
                    color={isMuted ? '#FF8A82' : BookingColors.white}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel={isVideoMuted ? 'Start video' : 'Stop video'}
                  style={styles.documentCallControl}
                  onPress={toggleVideoMute}
                  disabled={!isJoined}>
                  <Feather
                    name={isVideoMuted ? 'video-off' : 'video'}
                    size={16}
                    color={isVideoMuted ? '#FF8A82' : BookingColors.white}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Switch camera"
                  style={styles.documentCallControl}
                  onPress={switchCamera}
                  disabled={!isJoined || isVideoMuted}>
                  <Feather name="refresh-cw" size={16} color={BookingColors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel={isSpeakerOn ? 'Use earpiece' : 'Use speaker'}
                  style={styles.documentCallControl}
                  onPress={toggleSpeaker}
                  disabled={!isJoined}>
                  <Feather
                    name={isSpeakerOn ? 'volume-2' : 'volume-1'}
                    size={16}
                    color={BookingColors.white}
                  />
                </TouchableOpacity>
                {!isClient && (
                  <TouchableOpacity
                    accessibilityLabel="Complete call"
                    style={[
                      styles.documentCallControl,
                      styles.documentCompleteCallControl,
                    ]}
                    onPress={completeCall}
                    disabled={isCompleting || isWaitingForClientApproval}>
                    {isCompleting || isWaitingForClientApproval ? (
                      <ActivityIndicator size="small" color={BookingColors.white} />
                    ) : (
                      <Feather
                        name="phone-off"
                        size={16}
                        color={BookingColors.white}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.header}>
              <RNText numberOfLines={1} style={[styles.headerTitle, { flex: 1 }]}>
                {selectedLocalDocument?.name || 'Document'}
              </RNText>
              <View style={styles.documentHeaderActions}>
                {!isClient &&
                  (isCurrentDocumentComplete ? (
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
                  ) : (
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
                  ))}
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
                    <PdfView
                      key={resolveDocumentUri(selectedLocalDocument)}
                      ref={pdfRef}
                      style={styles.pdfView}
                      source={{ uri: resolveDocumentUri(selectedLocalDocument) }}
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
                        const initialPage = Math.min(
                          Math.max(remoteCurrentPage || 1, 1),
                          numberOfPages,
                        );
                        displayedPageRef.current = 1;
                        setCurrentPage(initialPage);
                        if (initialPage > 1) {
                          pendingProgrammaticPageRef.current = initialPage;
                          pdfRef.current?.setPage(initialPage);
                        } else {
                          pendingProgrammaticPageRef.current = null;
                        }
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
                    <View style={styles.pageIndicator}>
                      <RNText style={styles.pageIndicatorText}>
                        {currentPage}
                      </RNText>
                    </View>
                  </>
                )}
                <SignatureContainer
                  signatureData={signatureData}
                  onSignatureChange={handleDragabbleSignatureData}
                  locked={isCurrentDocumentComplete}
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
  placeholderCaption: {
    marginTop: 3,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    color: '#9CA5B5',
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
    maxWidth: '78%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
    padding: 4,
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

///////////////////////////////

// const deleteAllObjects = useLiveblocks(state => state.deleteAllObjects);
// // const [selectedLink, setSelectedLink] = useState(arrayOfDocs[0].id);
// const {channel, token: CutomToken} = route.params;
// const uid = 0;
// const channelName = channel;
// const token = CutomToken;
// const [isMuted, setIsMuted] = useState(false);
// const [remoteUids, setRemoteUids] = useState<number[]>([]);
// const agoraEngineRef = useRef<IRtcEngine>();
// const [isJoined, setIsJoined] = useState(false);
// const [remoteUid, setRemoteUid] = useState(0);
// const [selected, setSelected] = useState('notary room');
// const [value, setValue] = useState(50);
// const pdfRef = React.useRef<Pdf>(null);
// const objects = useLiveblocks(state => state.objects);
// const remoteCurrentPage = useLiveblocks(state => state.currentPage);
// const setRemoteCurrentPage = useLiveblocks(state => state.setCurrentPage);
// const insertObject = useLiveblocks(state => state.insertObject);
// const selectedObjectId = useLiveblocks(state => state.selectedObjectId);
// const [totalPages, setTotalPages] = React.useState<number>(0);
// const [newSource, setNewSource] = useState<object>();
// const [currentPage, setCurrentPage] = React.useState<number>(remoteCurrentPage);

// const handleLinkChange = (linkId: string) => {
//   setFileDownloaded(true);
//   setSourceUrl(linkId);
//   setNewSource({
//     uri: linkId,
//     cache: true,
//   });
// };
// React.useEffect(() => {
//   setNewSource({uri: bookingData?.documents[0].url, cache: true});
// }, []);

// const handleBackButton = () => {
//   navigation.navigate('WaitingRoomScreen', {
//     uid: bookingData?._id,
//     channel: bookingData?.agora_channel_name,
//     token: bookingData?.agora_channel_token,
//     time: bookingData?.time_of_booking,
//     date: bookingData?.date_of_booking,
//   });
//   return true;
// };
// useEffect(() => {
//   BackHandler.addEventListener('hardwareBackPress', handleBackButton);
//   return () => {
//     BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
//   };
// }, []);
// useEffect(() => {
//   const setupVideoSDKEngine = async () => {
//     try {
//       if (Platform.OS === 'android') {
//         await getPermission();
//       }
//       agoraEngineRef.current = createAgoraRtcEngine();
//       const agoraEngine = agoraEngineRef.current;
//       agoraEngine.registerEventHandler({
//         onJoinChannelSuccess: () => {
//           showMessage('Successfully joined ' + channelName);
//           setIsJoined(true);
//         },
//         onUserJoined: (_connection, uid) => {
//           showMessage('Remote user joined with uid ' + uid);

//           setRemoteUids(prevUids => [...prevUids, uid]);
//         },
//         onUserOffline: (_connection, uid) => {
//           showMessage('Remote user left the channel. uid: ' + uid);

//           setRemoteUids(prevUids => prevUids.filter(uid => uid !== uid));
//         },
//         onRequestToken(connection) {},
//       });
//       agoraEngine.initialize({
//         appId: appId,
//         channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
//       });
//       agoraEngine.enableVideo();
//     } catch (e) {
//       console.log(e);
//     }
//   };
//   setupVideoSDKEngine().then(() => {
//     join();
//   });
//   return () => {
//     agoraEngineRef.current?.leaveChannel();
//   };
// }, []);
// const join = async () => {
//   console.log('====================================');
//   if (isJoined) {
//     return;
//   }
//   try {
//     agoraEngineRef.current?.setChannelProfile(
//       ChannelProfileType.ChannelProfileCommunication,
//     );
//     agoraEngineRef.current?.startPreview();
//     // console.log(token, channelName, uid);
//     agoraEngineRef.current?.joinChannel(token, channelName, uid, {
//       clientRoleType: ClientRoleType.ClientRoleBroadcaster,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };
// const leave = () => {
//   try {
//     agoraEngineRef.current?.leaveChannel();
//     setRemoteUids([]);

//     setIsJoined(false);
//     showMessage('You left the session');
//   } catch (e) {
//     console.log(e);
//   }
// };
// function showMessage(msg: string) {
//   console.log(msg);
//   Toast.show({
//     type: 'success',
//     text1: msg,
//   });
// }
// const mute = () => {
//   setIsMuted(!isMuted);
//   console.log('====================================');
//   console.log(remoteUids, isMuted);
//   console.log('====================================');
//   agoraEngineRef.current?.muteRemoteAudioStream(remoteUid, isMuted);
// };

// const displayValue = () => {
//   return (
//     <Text style={[styles.sessionDesc, {color: Colors.Orange}]}>
//       {Math.floor(value)}%
//     </Text>
//   );
// };
// const getPermission = async () => {
//   if (Platform.OS === 'android') {
//     await PermissionsAndroid.requestMultiple([
//       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//       PermissionsAndroid.PERMISSIONS.CAMERA,
//     ]);
//   }
// };
// import {
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Pressable,
//   View,
//   ScrollView,
//   SafeAreaView,
//   PermissionsAndroid,
//   Platform,
//   Alert,
// } from 'react-native';
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import Colors from '../../themes/Colors';
// import { heightToDp, widthToDp } from '../../utils/Responsive';
// import MainButton from '../../components/MainGradientButton/MainButton';
// import {
//   ClientRoleType,
//   createAgoraRtcEngine,
//   IRtcEngine,
//   RtcSurfaceView,
//   ChannelProfileType,
//   VideoContentHint,
// } from 'react-native-agora';
// import SplashScreen from 'react-native-splash-screen';
// import Toast from 'react-native-toast-message';
// import { PDFDocument } from 'pdf-lib';
// import PdfView, { Source } from 'react-native-pdf';
// import ReactNativeBlobUtil from 'react-native-blob-util';
// import RNPickerSelect from 'react-native-picker-select';
// import {
//   Edit,
//   NavArrowLeft,
//   NavArrowRight,
//   PageEdit,
//   Text,
// } from 'iconoir-react-native';
// import { useLiveblocks } from '../../store/liveblocks';
// const appId = 'f64e76f674b646bc965dc3e257b4e108';
// import PdfObject from '../../components/LiveBlocksComponents/pdf-object';
// import HeaderRight from '../../components/LiveBlocksComponents/header-right';
// import { Picker } from '@react-native-picker/picker';
// import useChatService from '../../hooks/useChatService';
// import { useSelector } from 'react-redux';
// import {
//   MultipleSelectList,
//   SelectList,
// } from 'react-native-dropdown-select-list';
// export default function NotaryCallScreen({ route, navigation }: any) {
//   const User = useSelector(state => state?.user?.user);
//   const agent = useSelector(state => state?.booking?.booking?.agent);
//   const booked_by = useSelector(state => state?.booking?.booking?.booked_by);
//   const arrayOfDocs = [
//     {
//       id: 1,
//       name: 'Document 1',
//       url: 'https://images.template.net/wp-content/uploads/2015/12/29130015/Sample-Contract-Agreement-Template-PDF.pdf',
//     },
//     {
//       id: 2,
//       name: 'Document 2',
//       url: 'https://sccrtc.org/wp-content/uploads/2010/09/SampleContract-Shuttle.pdf',
//     },
//   ];
//   const deleteAllObjects = useLiveblocks(state => state.deleteAllObjects);
//   const [selectedLink, setSelectedLink] = useState(arrayOfDocs[0].id);
//   const { channel, token: CutomToken } = route.params;
//   const uid = 0;
//   const channelName = channel;
//   const token = CutomToken;
//   const [isMuted, setIsMuted] = useState(false);
//   const [remoteUids, setRemoteUids] = useState<number[]>([]);
//   const agoraEngineRef = useRef<IRtcEngine>();
//   const [isJoined, setIsJoined] = useState(false);
//   const [remoteUid, setRemoteUid] = useState(0);
//   const [selected, setSelected] = useState('notary room');
//   const [value, setValue] = useState(50);
//   const pdfRef = React.useRef<PdfView>(null);
//   const objects = useLiveblocks(state => state.objects);
//   const remoteCurrentPage = useLiveblocks(state => state.currentPage);
//   const setRemoteCurrentPage = useLiveblocks(state => state.setCurrentPage);
//   const insertObject = useLiveblocks(state => state.insertObject);
//   const selectedObjectId = useLiveblocks(state => state.selectedObjectId);
//   const [totalPages, setTotalPages] = React.useState<number>(0);

//   const [currentPage, setCurrentPage] =
//     React.useState<number>(remoteCurrentPage);

//   const [pdfSource, setPdfSource] = React.useState<Source | null>(null);

//   const onUpdatePdf = useCallback(async (link: string) => {
//     const pdfFile = await ReactNativeBlobUtil.fetch('GET', link);
//     const pdfDoc = await PDFDocument.load(pdfFile.base64());
//     const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

//     setPdfSource({
//       uri: base64Pdf,
//     });
//   }, []);
//   const handleLinkChange = (linkId: number) => {
//     const selectedDoc = arrayOfDocs.find(doc => doc.id === linkId);
//     setSelectedLink(linkId);
//     deleteAllObjects();
//     onUpdatePdf(selectedDoc?.url);
//   };
//   const onLabelAdd = React.useCallback(() => {
//     insertObject(new Date().toISOString(), {
//       type: 'label',
//       text: 'John Doe',
//       page: currentPage,
//       position: {
//         x: 100,
//         y: 100,
//       },
//     });
//   }, [currentPage, insertObject]);

//   const onSignatureAdd = React.useCallback(() => {
//     insertObject(new Date().toISOString(), {
//       type: 'image',
//       sourceUrl: 'https://i.ibb.co/0XxrCH9/signature-40121.png',
//       page: currentPage,
//       position: {
//         x: 100,
//         y: 100,
//       },
//     });
//   }, [currentPage, insertObject]);

//   const onStampAdd = React.useCallback(() => {
//     insertObject(new Date().toISOString(), {
//       type: 'image',
//       sourceUrl: 'https://i.ibb.co/989TrsJ/free-stamp-png-24402.png',
//       page: currentPage,
//       position: {
//         x: 200,
//         y: 200,
//       },
//     });
//   }, [currentPage, insertObject]);

//   React.useEffect(() => {
//     onUpdatePdf(arrayOfDocs[0].url);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
//   React.useEffect(() => {
//     if (remoteCurrentPage !== currentPage) {
//       pdfRef.current?.setPage(remoteCurrentPage);
//     }
//   }, [remoteCurrentPage, currentPage]);
//   useEffect(() => {
//     const setupVideoSDKEngine = async () => {
//       try {
//         if (Platform.OS === 'android') {
//           await getPermission();
//         }
//         agoraEngineRef.current = createAgoraRtcEngine();
//         const agoraEngine = agoraEngineRef.current;
//         agoraEngine.registerEventHandler({
//           onJoinChannelSuccess: () => {
//             showMessage('Successfully joined ' + channelName);
//             setIsJoined(true);
//           },
//           onUserJoined: (_connection, uid) => {
//             showMessage('Remote user joined with uid ' + uid);

//             setRemoteUids(prevUids => [...prevUids, uid]);
//           },
//           onUserOffline: (_connection, uid) => {
//             showMessage('Remote user left the channel. uid: ' + uid);

//             setRemoteUids(prevUids => prevUids.filter(uid => uid !== uid));
//           },
//         });
//         agoraEngine.initialize({
//           appId: appId,
//           channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
//         });
//         agoraEngine.enableVideo();
//       } catch (e) {
//         console.log(e);
//       }
//     };
//     console.log('useEffect');
//     setupVideoSDKEngine().then(() => {
//       join();
//     });
//     return () => {
//       agoraEngineRef.current?.leaveChannel();
//     };
//   }, []);

//   const join = async () => {
//     console.log('====================================');
//     if (isJoined) {
//       return;
//     }
//     try {
//       agoraEngineRef.current?.setChannelProfile(
//         ChannelProfileType.ChannelProfileCommunication,
//       );
//       agoraEngineRef.current?.startPreview();
//       agoraEngineRef.current?.joinChannel(token, channelName, uid, {
//         clientRoleType: ClientRoleType.ClientRoleBroadcaster,
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   };
//   const leave = () => {
//     try {
//       agoraEngineRef.current?.leaveChannel();
//       setRemoteUids([]);

//       setIsJoined(false);
//       showMessage('You left the session');
//     } catch (e) {
//       console.log(e);
//     }
//   };
//   function showMessage(msg: string) {
//     console.log(msg);
//     Toast.show({
//       type: 'success',
//       text1: msg,
//     });
//   }
//   const mute = () => {
//     setIsMuted(!isMuted);
//     console.log('====================================');
//     console.log(remoteUids, isMuted);
//     console.log('====================================');
//     agoraEngineRef.current?.muteRemoteAudioStream(remoteUid, isMuted);
//   };

//   const displayValue = () => {
//     return (
//       <Text style={[styles.sessionDesc, { color: Colors.Orange }]}>
//         {Math.floor(value)}%
//       </Text>
//     );
//   };
//   const getPermission = async () => {
//     if (Platform.OS === 'android') {
//       await PermissionsAndroid.requestMultiple([
//         PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         PermissionsAndroid.PERMISSIONS.CAMERA,
//       ]);
//     }
//   };
//   return (
//     <SafeAreaView style={styles.Maincontainer}>

//       <View style={styles.SecondContainer}>
//         <View style={styles.flexContainer}>
//           <ScrollView
//             style={styles.scroll}
//             horizontal={true}
//             contentContainerStyle={styles.scrollContainer}>
//             {isJoined ? (
//               <React.Fragment key={0}>
//                 <RtcSurfaceView canvas={{ uid: 0 }} style={styles.videoView} />
//               </React.Fragment>
//             ) : (
//               <View
//                 style={{
//                   // borderWidth: 2,
//                   // borderRadius: 5,
//                   // borderColor: Colors.DullTextColor,
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                 }}>
//                 <Image
//                   source={{ uri: User?.profile_picture }}
//                   style={{
//                     width: widthToDp(25),
//                     height: widthToDp(25),
//                     borderRadius: 100,
//                   }}
//                 />
//               </View>
//             )}
//             {remoteUids.map((uid, index) => (
//               <View key={index}>
//                 <RtcSurfaceView canvas={{ uid }} style={styles.videoView} />
//               </View>
//             ))}
//           </ScrollView>
//           <View style={{ flex: 0.2, justifyContent: 'space-evenly' }}>
//             {isJoined ? (
//               <TouchableOpacity
//                 style={styles.hourGlass}
//                 onPress={() => setIsJoined(!isJoined)}>
//                 <Image
//                   source={require('../../../assets/videoOff.png')}
//                   style={{ width: widthToDp(10), height: widthToDp(10) }}
//                 />
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity
//                 style={styles.hourGlass}
//                 onPress={() => setIsJoined(!isJoined)}>
//                 <Image
//                   source={require('../../../assets/video.png')}
//                   style={{ width: widthToDp(10), height: widthToDp(10) }}
//                 />
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity style={styles.hourGlass} onPress={() => mute()}>
//               <Image
//                 source={
//                   isMuted
//                     ? require('../../../assets/unmute.png')
//                     : require('../../../assets/mute.png')
//                 }
//                 style={{ width: widthToDp(10), height: widthToDp(10) }}
//               />
//             </TouchableOpacity>
//             {/* <TouchableOpacity style={styles.hourGlass} onPress={() => leave()}>
//               <Image
//                 source={require('../../../assets/callDrop.png')}
//                 style={{width: widthToDp(10), height: widthToDp(10)}}
//               />
//             </TouchableOpacity> */}
//           </View>
//         </View>
//       </View>
//       <View style={{ backgroundColor: Colors.white }}>
//         <RNPickerSelect
//           style={pickerSelectStyles}
//           onValueChange={itemValue => handleLinkChange(itemValue)}
//           items={arrayOfDocs.map(doc => ({ label: doc.name, value: doc.url }))}
//         />
//         {/* <Picker
//           selectedValue={selectedLink}
//           onValueChange={itemValue => handleLinkChange(itemValue)}
//           style={styles.picker}>
//           {arrayOfDocs.map(doc => (
//             <Picker.Item key={doc.id} label={doc.name} value={doc.id} />
//           ))}
//         </Picker> */}
//       </View>
//       <View style={styles.container}>
//         <View style={styles.pdfWrapper}>
//           {pdfSource && (
//             <PdfView
//               ref={pdfRef}
//               style={styles.pdfView}
//               source={pdfSource}
//               showsVerticalScrollIndicator={false}
//               showsHorizontalScrollIndicator={false}
//               horizontal={true}
//               singlePage={true}
//               onLoadComplete={numberOfPages => {
//                 console.log('Func', numberOfPages);
//                 setCurrentPage(1);
//                 setTotalPages(numberOfPages);
//               }}
//               onPageChanged={page => {
//                 setCurrentPage(page);
//                 setRemoteCurrentPage(page);
//               }}
//             />
//           )}
//           <View style={styles.objectsWrapper}>
//             {Object.entries(objects).map(([objectId, object]) => {
//               if (object.page !== currentPage) {
//                 return null;
//               }

//               return (
//                 <PdfObject
//                   id={objectId}
//                   key={objectId}
//                   object={object}
//                   selected={selectedObjectId === objectId}
//                 />
//               );
//             })}
//           </View>
//         </View>
//         <View style={styles.actions}>
//           <View style={styles.editActions}>
//             <Pressable onPress={() => onSignatureAdd()}>
//               <Edit width={30} height={30} color="#000000" />
//             </Pressable>
//             <Pressable onPress={() => onLabelAdd()}>
//               <Text width={32} height={32} color="#000000" />
//             </Pressable>
//             <Pressable onPress={() => onStampAdd()}>
//               <PageEdit width={26} height={26} color="#000000" />
//             </Pressable>
//             <HeaderRight />
//           </View>
//           <View style={styles.navigation}>
//             <Pressable
//               onPress={() => {
//                 if (currentPage !== 1) {
//                   pdfRef.current?.setPage(currentPage - 1);
//                 }
//               }}>
//               <NavArrowLeft
//                 width={36}
//                 height={36}
//                 color={currentPage === 1 ? '#dddddd' : '#000000'}
//               />
//             </Pressable>
//             <Pressable
//               onPress={() => {
//                 pdfRef.current?.setPage(currentPage + 1);
//               }}>
//               <NavArrowRight
//                 width={36}
//                 height={36}
//                 color={currentPage === totalPages ? '#dddddd' : '#000000'}
//               />
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }
// const pickerSelectStyles = StyleSheet.create({
//   inputIOS: {
//     fontSize: 16,
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     borderWidth: 1,
//     borderColor: 'gray',
//     borderRadius: 4,
//     color: 'black',
//     paddingRight: 30, // to ensure the text is never behind the icon
//   },
//   inputAndroid: {
//     fontSize: 16,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     borderWidth: 1.5,
//     borderColor: 'purple',
//     borderRadius: 8,
//     color: 'black',
//     paddingRight: 30, // to ensure the text is never behind the icon
//   },
// });
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   pdfWrapper: {
//     flex: 1,
//   },
//   pdfView: {
//     flex: 1,
//   },
//   objectsWrapper: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//   },
//   actions: {
//     borderTopWidth: 1,
//     borderTopColor: '#e2e2e2',
//     backgroundColor: '#ffffff',
//     paddingBottom: 40,
//     paddingHorizontal: 20,
//     paddingTop: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   navigation: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     columnGap: 16,
//   },
//   editActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     columnGap: 16,
//   },
//   Maincontainer: {
//     flex: 1,
//     backgroundColor: Colors.PinkBackground,
//   },
//   NavbarContainer: {
//     flexDirection: 'row',
//     marginHorizontal: widthToDp(5),
//     marginVertical: widthToDp(2),
//     justifyContent: 'space-between',
//   },
//   NavContainer: {
//     flexDirection: 'row',
//     marginHorizontal: widthToDp(2),
//     marginVertical: widthToDp(2),
//     // borderWidth: 1,
//   },
//   waitingNav: {
//     width: widthToDp(6),
//     height: heightToDp(6),
//     marginVertical: widthToDp(2),
//   },
//   profilePic: {
//     marginVertical: widthToDp(2),
//   },
//   flexContainer: {
//     flexDirection: 'row',
//     height: heightToDp(40),
//   },
//   scrollBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginHorizontal: widthToDp(5),
//   },
//   picker: {
//     borderWidth: 2,
//     backgroundColor: Colors.white,
//     borderColor: Colors.DisableColor,
//   },
//   NavTextContainer: {
//     // borderWidth: 1,
//     marginLeft: widthToDp(5),
//   },
//   textHead: {
//     color: Colors.TextColor,
//     fontSize: widthToDp(5),
//     fontWeight: '700',
//     fontFamily: 'Manrope-Regular',
//   },
//   textSubHead: {
//     color: Colors.TextColor,
//     fontSize: widthToDp(3.5),
//     fontWeight: '700',
//     marginLeft: widthToDp(2),
//     fontFamily: 'Manrope-Regular',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     // borderWidth: 1,
//     justifyContent: 'center',
//   },
//   SecondContainer: {
//     backgroundColor: Colors.white,
//   },
//   hourGlass: {
//     alignSelf: 'center',
//   },
//   textSession: {
//     color: Colors.TextColor,
//     marginHorizontal: widthToDp(5),
//     marginTop: heightToDp(10),
//     fontSize: widthToDp(6),
//     fontFamily: 'Manrope-Bold',
//   },
//   sessionDesc: {
//     color: Colors.TextColor,
//     fontFamily: 'Manrope-Bold',
//   },
//   btn: {
//     marginVertical: heightToDp(2),
//   },
//   btncontain: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     marginVertical: heightToDp(5),
//   },
//   slideContainer: {
//     flex: 1,
//     marginHorizontal: widthToDp(5),
//     alignItems: 'stretch',
//     justifyContent: 'center',
//   },
//   button: {
//     paddingHorizontal: 25,
//     paddingVertical: 4,
//     fontWeight: 'bold',
//     color: '#ffffff',
//     backgroundColor: '#0055cc',
//     margin: 5,
//   },
//   main: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   scroll: {
//     flex: 1,
//     width: '100%',
//   },
//   scrollContainer: {
//     margin: widthToDp(3),
//     columnGap: widthToDp(4),
//   },
//   videoView: {
//     width: widthToDp(25),
//     height: heightToDp(30),
//     resizeMode: 'contain',
//     borderRadius: 15,
//   },
//   btnContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   head: {
//     fontSize: 20,
//   },
//   info: {
//     backgroundColor: '#ffffe0',
//     color: '#0000ff',
//   },
// });
