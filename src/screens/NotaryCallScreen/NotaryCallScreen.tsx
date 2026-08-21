import {
  TouchableOpacity,
  Image,
  Modal,
  Share,
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  Linking,
  BackHandler,
  Dimensions,
  ActivityIndicator,
  Text as RNText,
} from 'react-native';
import moment from 'moment-timezone';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Colors from '../../themes/Colors';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
} from 'react-native-agora';
import DragabbleSignature from './DragabbleSignature';

import Toast from 'react-native-toast-message';
import {PDFDocument, rgb, StandardFonts} from 'pdf-lib';
import PdfView from 'react-native-pdf';

import RNPickerSelect from 'react-native-picker-select';
import {
  Edit,
  NavArrowLeft,
  NavArrowRight,
  PageEdit,
  Text,
} from 'iconoir-react-native';
import {useLiveblocks} from '../../store/liveblocks';
const appId = 'f64e76f674b646bc965dc3e257b4e108';

import Pdf from 'react-native-pdf';
import {encode as btoa} from 'base-64';
import RNFS from 'react-native-fs';
import {uploadSignedDocumentToSpaces} from '../../utils/spacesHelper';
import {useLazyQuery, useMutation} from '@apollo/client';
import {SIGN_DOCS} from '../../../request/mutations/signDocument';
import PdfObject from '../../components/LiveBlocksComponents/pdf-object';
import {ADD_NOTARIZED_DOCS} from '../../../request/mutations/addNotarizedDocs';
import {useSession} from '../../hooks/useSession';
import {GET_SESSION_BY_ID} from '../../../request/queries/getSessionByID.query';
import {setBookingInfoState} from '../../features/booking/bookingSlice';
import SignatureContainer from './SignatureContainer';
import HeaderRight from '../../components/LiveBlocksComponents/header-right';
import useRegister from '../../hooks/useRegister';
import PDFViewer from './PDFViewer';
import {UPDATE_OR_CREATE_SESSION_UPDATED_DOCS} from '../../../request/mutations/updateSessionUpdateddocs';
import SketchCanvasComponent from './PenTool/SketchCanvasComponent';
import LinearGradient from 'react-native-linear-gradient';
import {UPDATE_OR_CREATE_SESSION_CLIENT_DOCS} from '../../../request/mutations/updateSessionClientDocs';
import DrawSignTypeModal from './Signature';
import {TouchableWithoutFeedback} from 'react-native';
import {getSessionAvailability} from '../../utils/sessionAvailability';

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

export default function NotaryCallScreen({route, navigation}: any) {
  const {
    channel,
    token: CutomToken,
    routeFrom,
    date: routeDate,
    time: routeTime,
    uid: routeUid,
  } = route?.params || {};
  const {pickDocumentDetails, uploadDocumentToStorage} = useRegister();
  const [updateSessionClientDocs] = useMutation(
    UPDATE_OR_CREATE_SESSION_CLIENT_DOCS,
  );
  const dispatch = useDispatch();
  const [UpdateDocumentsByDocId] = useMutation(SIGN_DOCS);
  const {updateSession} = useSession();
  const [AddSignedDocs] = useMutation(ADD_NOTARIZED_DOCS);
  const [getSession] = useLazyQuery(GET_SESSION_BY_ID);
  const User = useSelector(state => state?.user?.user);
  const isClient = User?.account_type === 'client';
  const insets = useSafeAreaInsets();
  const sharedDocument = useLiveblocks(state => state.sharedDocument);
  const isDocumentPreviewOpen = useLiveblocks(
    state => state.isDocumentPreviewOpen,
  );
  const setSharedDocument = useLiveblocks(state => state.setSharedDocument);
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
  const setSharedCurrentPage = useLiveblocks(state => state.setCurrentPage);
  const enterRoom = useLiveblocks(state => state.liveblocks.enterRoom);
  const leaveRoom = useLiveblocks(state => state.liveblocks.leaveRoom);
  const bookingData =
    useSelector((state: any) => state?.booking?.booking) || {};
  const bookingRoomId = routeUid || bookingData?._id;
  const scheduledDate = routeDate || bookingData?.date_of_booking;
  const scheduledTime = routeTime || bookingData?.time_of_booking;
  const sessionAvailability = useMemo(
    () => getSessionAvailability({date: scheduledDate, time: scheduledTime}),
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
  const [isCompleting, setIsCompleting] = useState(false);
  const documentLoadIdRef = useRef(0);
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const videoStageHeight = isClient
    ? Math.min(Math.max(screenHeight * 0.58, 390), 520)
    : Math.min(Math.max(screenHeight * 0.43, 320), 400);
  const getFitPolicy = () => {
    if (pageWidth && pageHeight) {
      const screenRatio = screenWidth / screenHeight;
      const pageRatio = pageWidth / pageHeight;
      return screenRatio > pageRatio ? 2 : 1; // Fit height if screen is taller, otherwise fit width
    }
    return 0; // Default fitPolicy
  };
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
      return;
    }

    const document = {
      name: sharedDocument.name || 'Shared document.pdf',
      uri: sharedDocumentUri,
      type: sharedDocument.type || 'application/pdf',
    };
    setSelectedLocalDocument(document);
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
    if (resolveDocumentUri(sharedDocument)) {
      setClientDocModalVisible(isDocumentPreviewOpen);
    }
  }, [isDocumentPreviewOpen, sharedDocument]);
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
      signatureData: imageData,
      type,
      fontFamily,
    } = signatureData;
    setSignatureDimensions({
      width,
      height,
      x,
      y,
      fontFamily,
      Deletestatus: deleteStatus,
    });
    if (deleteStatus === true) {
      setPdfEditMode(false);
    }
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
    } else {
      if (!imageData || typeof imageData.toLocaleDateString !== 'function') {
        console.warn('Signature date data is unavailable.');
        return;
      }
      const data = imageData.toLocaleDateString();
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

        const {width: width, height: height} = signatureDimensions;
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
        const path = `${
          RNFS.DocumentDirectoryPath
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
        const {width: width, height: height, fontFamily} = signatureDimensions;
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
        const path = `${
          RNFS.DocumentDirectoryPath
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

    const selectedDocument = pickerItems.find(
      item => item.value === documentUri,
    );
    setSourceKey(selectedDocument?.documentKey || sourceKey);
    setSourceUrl(documentUri);
    setSelectedItem(documentUri);
    setFileDownloaded(false);
    setNewPdfSaved(false);
    setNewPdfPath(null);
    setPdfBase64(null);
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
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<
    'connecting' | 'waiting' | 'connected' | 'error' | 'permissions'
  >('connecting');
  const [callError, setCallError] = useState('');
  const remoteCurrentPage = useLiveblocks(state => state.currentPage);
  const pdfRef = React.useRef<Pdf>(null);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const [currentPage, setCurrentPage] =
    React.useState<number>(remoteCurrentPage);
  useEffect(() => {
    if (!remoteCurrentPage) {
      return;
    }

    setCurrentPage(remoteCurrentPage);
    pdfRef.current?.setPage(remoteCurrentPage);
  }, [remoteCurrentPage]);

  const handleSharedPageChanged = useCallback(
    (page: number) => {
      setCurrentPage(page);
      if (page !== remoteCurrentPage) {
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
          onJoinChannelSuccess: () => {
            if (!active) {
              return;
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
  const completeCall = async () => {
    if (isClient || isCompleting) {
      return;
    }

    setIsCompleting(true);
    try {
      const completedDocuments = pickerItems.map(item => ({...item}));

      if (selectedItem && pdfBase64) {
        const selectedDocument = completedDocuments.find(
          item => item.value === selectedItem,
        );
        if (selectedDocument) {
          const signedUrl = await uploadSignedDocumentToSpaces(pdfBase64);
          selectedDocument.value = signedUrl;
        }
      }

      if (completedDocuments.length > 0) {
        await addSignedDocFunc(completedDocuments);
      }

      await updateSession('completed', bookingData?._id);
      setSessionCompleted(true, new Date().toISOString());
    } catch (error: any) {
      console.warn('Unable to complete notary call:', error);
      Toast.show({
        type: 'error',
        text1: 'Could not complete call',
        text2: error?.message || 'Please check your connection and try again.',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const closeCompletedSession = useCallback(() => {
    agoraEngineRef.current?.leaveChannel();
    setRemoteUids([]);
    setIsJoined(false);
    leaveRoom();

    if (isClient) {
      navigation.reset({
        index: 0,
        routes: [{name: 'HomeScreen', params: {screen: 'BookScreen'}}],
      });
      return;
    }

    navigation.replace('AgentBookingComplete');
  }, [isClient, leaveRoom, navigation]);
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
    await join(engine);
  };
  const userDisplayName =
    [User?.first_name, User?.last_name].filter(Boolean).join(' ') || 'You';
  const userInitials = userDisplayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const callStatusLabel =
    callStatus === 'connected'
      ? 'Participant connected'
      : callStatus === 'waiting'
      ? 'Waiting for participant'
      : callStatus === 'connecting'
      ? 'Connecting securely'
      : callStatus === 'permissions'
      ? 'Permissions required'
      : 'Connection issue';
  const [drawingMode, setDrawingMode] = useState<
    'pen' | 'line' | 'arrow' | 'rectangle'
  >(null);
  const [paths, setPaths] = useState<any[]>([]);
  function rgbStringToRgb(rgbString) {
    const colorArray = rgbString.match(/\d+/g).map(Number);
    return rgb(colorArray[0] / 255, colorArray[1] / 255, colorArray[2] / 255);
  }

  console.log('current page', currentPage);
  const handlePathsChange = newPaths => {
    console.log('pahedfdfd', newPaths);
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
    insertObject(new Date().toISOString(), {
      type: 'image',
      sourceUrl: stampPath,
      page: currentPage,
      position: {
        x: 100,
        y: 100,
      },
    });
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
    const {width, height} = page.getSize();
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
    const path = `${
      RNFS.DocumentDirectoryPath
    }/react-native_signed_${Date.now()}.pdf`;
    await RNFS.writeFile(path, pdfBase64, 'base64')
      .then(async success => {
        setNewPdfPath(path);
        setNewPdfSaved(true);
        setPdfBase64(pdfBase64);
        const l = await uploadSignedDocumentToSpaces(pdfBase64);
        await updatedDocument(l);
        await handleClearPaths();
      })
      .catch(err => {
        console.log('eeee', err.message);
      });
  };
  // The client owns document uploads. Once storage returns a public URL,
  // publish it to the booking room so both participants open the same file.
  const selectClientDocument = async () => {
    const [document] = await pickDocumentDetails(false);
    if (!document) {
      return;
    }
    setSelectedLocalDocument(document);
    setClientDocModalVisible(true);

    setLoading(true);
    try {
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
    }
  };
  const handleDownloadDocument = async () => {
    if (!selectedLocalDocument?.uri) {
      return;
    }
    try {
      await Share.share({
        title: selectedLocalDocument.name,
        url: selectedLocalDocument.uri,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Could not open share sheet',
        text2: error?.message || 'Please try again.',
      });
    }
  };
  const handleSignPress = () => {
    setSignatureModalOpen(true);
  };

  const handleSignCloseModal = () => {
    setSignatureModalOpen(false);
  };

  const closeDocumentPreview = () => {
    setClientDocModalVisible(false);
    setDocumentPreviewOpen(false);
  };

  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    setIsInteractionBlocked(!isInteractionBlocked);
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
              {bookingData._id?.slice(-10).toUpperCase()}
            </RNText>
          </View>
        </View>
      </View>

      {/* ── VIDEO PANEL ── */}
      <View style={styles.videoPanel}>
        <View style={[styles.videoStage, {height: videoStageHeight}]}>
          {remoteUids.length ? (
            <RtcSurfaceView
              canvas={{uid: remoteUids[0]}}
              style={styles.mainVideoView}
            />
          ) : isJoined && !isVideoMuted ? (
            <RtcSurfaceView canvas={{uid: 0}} style={styles.mainVideoView} />
          ) : (
            <View style={styles.videoPlaceholder}>
              {User?.profile_picture ? (
                <Image
                  source={{uri: User?.profile_picture}}
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

          {remoteUids.length > 0 && (
            <View style={styles.localVideoPip}>
              {isVideoMuted ? (
                <View style={styles.pipPlaceholder}>
                  <RNText style={styles.pipInitials}>{userInitials}</RNText>
                </View>
              ) : (
                <RtcSurfaceView canvas={{uid: 0}} style={styles.pipVideoView} />
              )}
              <View style={styles.pipLabel}>
                <RNText style={styles.pipLabelText}>You</RNText>
              </View>
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
              <Feather
                name="refresh-cw"
                size={19}
                color={BookingColors.white}
              />
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
        </View>

        {(callStatus === 'error' || callStatus === 'permissions') && (
          <View style={styles.callErrorBanner}>
            <View style={styles.callErrorIcon}>
              <Feather
                name="alert-circle"
                size={18}
                color={BookingColors.error}
              />
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
      </View>

      {isClient ? (
        /* ── SELECT DOCUMENT (client) ── */
        <View style={styles.pickerCard}>
          <TouchableOpacity
            accessibilityLabel="Select document"
            onPress={selectClientDocument}
            disabled={loading}
            style={styles.clientUploadButton}>
            {loading ? (
              <ActivityIndicator size="small" color={BookingColors.primary} />
            ) : (
              <Feather
                name="file-plus"
                size={16}
                color={BookingColors.primary}
              />
            )}
            <RNText style={styles.clientUploadButtonText}>
              {loading ? 'Sharing document…' : 'Select Doc'}
            </RNText>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── DOCUMENT PICKER (agent) ── */
        <View style={styles.pickerCard}>
          <View style={styles.pickerIconWrap}>
            <Feather name="file-text" size={14} color={BookingColors.primary} />
          </View>
          <View style={styles.pickerInner}>
            <RNPickerSelect
              style={modernPickerStyles}
              onValueChange={(itemValue, itemLabel) =>
                handleLinkChange(itemValue, itemLabel)
              }
              items={pickerItems}
              value={selectedItem}
              placeholder={{
                label: 'Select a document',
                color: BookingColors.textMuted,
              }}
              useNativeAndroidPickerStyle={false}
              Icon={() => (
                <Feather
                  name="chevron-down"
                  size={17}
                  color={BookingColors.textSecondary}
                />
              )}
            />
          </View>
        </View>
      )}

      {/* ── PDF VIEWER + TOOLBAR (agent) ── */}
      {!isClient && (
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
                        isInteractionBlocked && {pointerEvents: 'none'},
                      ]}
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
                      onLoadComplete={(
                        numberOfPages,
                        filePath,
                        {width, height},
                      ) => {
                        const initialPage = remoteCurrentPage || 1;
                        setCurrentPage(initialPage);
                        pdfRef.current?.setPage(initialPage);
                        setTotalPages(numberOfPages);
                        setPageWidth(width);
                        setPageHeight(height);
                      }}
                      onPageChanged={page => handleSharedPageChanged(page)}
                      onPageSingleTap={(page, x, y) => {
                        handleSingleTap(page, x, y);
                      }}
                      onError={error =>
                        console.warn('Unable to display document:', error)
                      }
                    />
                    {User.account_type !== 'client' && (
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
                    )}
                    {drawingMode && User.account_type != 'client' && (
                      <SketchCanvasComponent
                        onPathsChange={handlePathsChange}
                        stamps={User}
                        onStampChanges={handleSavedStamp}
                        saveToPdf={saveToPdf}
                      />
                    )}
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
            {paddingTop: insets.top, paddingBottom: insets.bottom},
          ]}>
          <View style={styles.Maincontainer}>
            <View style={styles.header}>
              <RNText numberOfLines={1} style={[styles.headerTitle, {flex: 1}]}>
                {selectedLocalDocument?.name || 'Document'}
              </RNText>
              <TouchableOpacity
                accessibilityLabel="Close"
                onPress={closeDocumentPreview}
                style={styles.headerBackBtn}>
                <Feather name="x" size={18} color={BookingColors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.container}>
              <View style={styles.pdfWrapper}>
                {selectedLocalDocument?.uri && (
                  <>
                    <PdfView
                      ref={pdfRef}
                      style={styles.pdfView}
                      source={{uri: resolveDocumentUri(selectedLocalDocument)}}
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
                        {width, height},
                      ) => {
                        const initialPage = remoteCurrentPage || 1;
                        setCurrentPage(initialPage);
                        pdfRef.current?.setPage(initialPage);
                        setTotalPages(numberOfPages);
                        setPageWidth(width);
                        setPageHeight(height);
                      }}
                      onPageChanged={page => handleSharedPageChanged(page)}
                      onPageSingleTap={(page, x, y) => {
                        handleSingleTap(page, x, y);
                      }}
                      onError={error =>
                        console.warn('Unable to display document:', error)
                      }
                    />
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
                />
              </View>

              <View style={styles.toolbar}>
                <View style={styles.toolbarGrid}>
                  <TouchableOpacity
                    onPress={() => handleSignPress()}
                    style={styles.toolBtn}>
                    <View style={styles.toolBtnIcon}>
                      <Feather
                        name="edit-2"
                        size={15}
                        color={BookingColors.primary}
                      />
                    </View>
                    <RNText style={styles.toolBtnLabel}>Signature</RNText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleDownloadDocument}
                    style={styles.toolBtn}>
                    <View style={styles.toolBtnIcon}>
                      <Feather
                        name="download"
                        size={15}
                        color={BookingColors.primary}
                      />
                    </View>
                    <RNText style={styles.toolBtnLabel}>Download</RNText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      <DrawSignTypeModal
        isVisible={isSignatureModalOpen}
        onClose={handleSignCloseModal}
        signs={User}
        onStampChanges={handleSavedStamp}
        page={currentPage}
      />

      <Modal
        animationType="fade"
        transparent
        visible={isSessionCompleted}
        onRequestClose={closeCompletedSession}>
        <View style={styles.completionBackdrop}>
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
            {sessionCompletedAt ? (
              <RNText style={styles.completionTime}>
                Completed {moment(sessionCompletedAt).format('h:mm A')}
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
      </Modal>
    </SafeAreaView>
  );
}
const modernPickerStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 13,
    paddingHorizontal: 10,
    color: BookingColors.textPrimary,
    paddingRight: 32,
    fontFamily: 'Manrope-Regular',
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
    color: BookingColors.textPrimary,
    paddingRight: 32,
    fontFamily: 'Manrope-Regular',
  },
  iconContainer: {
    top: 14,
    right: 12,
  },
  placeholder: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
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

  // ── VIDEO PANEL ──
  videoPanel: {
    backgroundColor: '#0F1117',
    borderBottomWidth: 1,
    borderBottomColor: '#222735',
  },
  videoStage: {
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
  localVideoPip: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 92,
    height: 122,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.32)',
    backgroundColor: '#252C39',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    bottom: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  pipLabelText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
    color: BookingColors.white,
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
  callStatusDotConnected: {backgroundColor: BookingColors.success},
  callStatusDotError: {backgroundColor: BookingColors.error},
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
    gap: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#121722',
  },
  controlAction: {
    minWidth: 62,
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
  callErrorCopy: {flex: 1},
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
    shadowOffset: {width: 0, height: 1},
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    top: 12,
    right: 10,
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
    shadowOffset: {width: 0, height: 2},
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
  navigation: {flexDirection: 'row', alignItems: 'center', columnGap: 16},
  flexContainer: {flexDirection: 'row'},
  scroll: {flex: 1, width: '100%'},
  scrollContainer: {margin: widthToDp(3), columnGap: widthToDp(4)},
  SecondContainer: {backgroundColor: Colors.white},
  hourGlass: {alignSelf: 'center'},
  penToolcanva: {position: 'absolute', top: 0, left: 0},

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
