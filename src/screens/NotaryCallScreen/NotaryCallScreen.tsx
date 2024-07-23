import {
  TouchableOpacity,
  Image,
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  BackHandler,
  Dimensions,
  ActivityIndicator,
  Text as RNText,
} from 'react-native';
import moment from 'moment-timezone';
import DatePicker from 'react-native-date-picker';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Colors from '../../themes/Colors';
import { height, heightToDp, widthToDp } from '../../utils/Responsive';
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
import { PDFDocument, rgb } from 'pdf-lib';
import PdfView from 'react-native-pdf';

import RNPickerSelect from 'react-native-picker-select';
import { Edit, NavArrowLeft, NavArrowRight, PageEdit, Text } from 'iconoir-react-native';
import { useLiveblocks } from '../../store/liveblocks';
const appId = 'abd7df71ee024625b2cc979e12aec405';

import Pdf from 'react-native-pdf';
import Signature from 'react-native-signature-canvas';
import { decode as atob, encode as btoa } from 'base-64';
import RNFS from 'react-native-fs';
import { uploadSignatureOnS3, uploadSignedDocumentsOnS3 } from '../../utils/s3Helper';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SIGN_DOCS } from '../../../request/mutations/signDocument';
import { launchImageLibrary } from 'react-native-image-picker';
import PdfObject from '../../components/LiveBlocksComponents/pdf-object';
import { ADD_NOTARIZED_DOCS } from '../../../request/mutations/addNotarizedDocs';
import { useSession } from '../../hooks/useSession';
import { GET_SESSION_BY_ID } from '../../../request/queries/getSessionByID.query';
import {
  setBookingInfoState,

} from '../../features/booking/bookingSlice';
import SignatureContainer from './SignatureContainer';
import HeaderRight from '../../components/LiveBlocksComponents/header-right';
import useRegister from '../../hooks/useRegister';
import PDFViewer from './PDFViewer';
import AddText from '../../components/LiveBlocksComponents/addText';
import { UPDATE_OR_CREATE_SESSION_UPDATED_DOCS } from '../../../request/mutations/updateSessionUpdateddocs';
import SketchCanvasComponent from './PenTool/SketchCanvasComponent';
import useUpdate from '../../hooks/useUpdate';
import useFetchUser from '../../hooks/useFetchUser';
export default function NotaryCallScreen({ route, navigation }: any) {

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['25%', '40%'], []);
  const { uploadimageToS3, uploadAllDocuments } = useRegister();
  const dispatch = useDispatch();
  const [UpdateDocumentsByDocId] = useMutation(SIGN_DOCS);
  const { updateSession } = useSession();
  const [AddSignedDocs] = useMutation(ADD_NOTARIZED_DOCS);
  const [getSession] = useLazyQuery(GET_SESSION_BY_ID);
  const User = useSelector(state => state?.user?.user);
  const objects = useLiveblocks(state => state.objects);
  const { handleProfileUpdate, handleNotarysignUpdate } = useUpdate();
  const { fetchUserInfo } = useFetchUser();
  const bookingData = useSelector(state => state?.booking?.booking);
  const clientDocumentsKeys = Object.keys(bookingData.client_documents);
  const clientDocumentsValues = Object.values(bookingData.client_documents);

  const initialSourceKey = clientDocumentsKeys.length > 0
    ? clientDocumentsKeys[0]
    : bookingData.agent_document.length > 0
      ? 'agent_document'
      : null;

  const initialSourceUrl = clientDocumentsValues.length > 0
    ? clientDocumentsValues[0]
    : bookingData.agent_document.length > 0
      ? bookingData.agent_document[0]
      : null;

  // Create state for sourceKey and sourceUrl
  const [sourceKey, setSourceKey] = useState(initialSourceKey);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);
  const [pickerItems, setPickerItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updatedDocumentsession] = useMutation(
    UPDATE_OR_CREATE_SESSION_UPDATED_DOCS,
  );
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [getSignaturePad, setSignaturePad] = useState(false);
  const [pdfEditMode, setPdfEditMode] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState(null);
  const [stampBase64, setStampBase64] = useState(null);
  const [signatureArrayBuffer, setSignatureArrayBuffer] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [newPdfSaved, setNewPdfSaved] = useState(false);
  const [newPdfPath, setNewPdfPath] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [filePath, setFilePath] = useState(
    `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
  );
  const [signatureData, setSignatureData] = useState(null);
  const [documentText, setDocumentText] = useState(null);
  const [signatureDimensions, setSignatureDimensions] = useState({});
  const [signatureImageMimeType, setSignatureImageMimeType] = useState(null);

  useEffect(() => {
    const items = [
      ...Object.keys(bookingData.client_documents).map(doc => ({
        label: `${doc}`,
        value: bookingData.client_documents[doc]
      })),
      ...bookingData.agent_document.map((doc, index) => ({
        label: `Agent Document ${index + 1}`,
        value: doc
      }))
    ];
    setPickerItems(items);
    if (items.length > 0) {
      setSelectedItem(items[0].value);
    }
  }, [bookingData.client_documents, bookingData.agent_document]);

  const getBase64FromUrl = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch image from URL");
      }
      const blob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error fetching and converting image to Base64:", error);
    }
  };
  const handleDragabbleSignatureData = async (signatureData) => {
    if (!signatureData) {
      console.error("signatureData is undefined");
      return;
    }
    const { width, height, x, y, delete: deleteStatus, signatureData: imageData, type } = signatureData;
    setSignatureDimensions({
      width,
      height,
      x,
      y,
      Deletestatus: deleteStatus
    });
    if (deleteStatus === true) {
      setPdfEditMode(false);
    }
    setSignatureImageMimeType(type)
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
            console.error("Error fetching image data from URL:", error);
          }
        } else {
          console.error("Unknown format for signature data:", signatureData);
        }
      } else {
        console.error("signatureData.signatureData is undefined");
      }
    }
    else if (type === 'text') {
      setPdfEditMode(true);
      setSignatureArrayBuffer(imageData)
    }
    else {
      let data = imageData.toLocaleDateString()
      setPdfEditMode(true);
      setSignatureArrayBuffer(data)
    }
  };
  useEffect(() => {
    downloadFile();
    if (signatureBase64) {
      setPdfEditMode(true);
      setSignatureArrayBuffer(_base64ToArrayBuffer(signatureBase64));
    }
    if (stampBase64) {
      setSignatureArrayBuffer(_base64ToArrayBuffer(stampBase64));
    }
    if (newPdfSaved) {
      setFilePath(newPdfPath);
    }
  }, [filePath, newPdfSaved, sourceUrl, newPdfPath]);
  const _base64ToArrayBuffer = base64 => {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
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
  const downloadFile = async () => {
    console.log("soureurl", sourceUrl, fileDownloaded)
    if (!fileDownloaded && sourceUrl) {
      try {
        // console.log("soureurl", sourceUrl)
        const destinationPath = newPdfPath ? newPdfPath : filePath;
        console.log("destinationpath", destinationPath)
        const downloadResult = await RNFS.downloadFile({
          fromUrl: sourceUrl,
          toFile: destinationPath,
        }).promise;
        if (downloadResult.statusCode === 200) {
          setFileDownloaded(true);
          await readFile(destinationPath);
        } else {
          console.error('File download failed with status code:', downloadResult.statusCode);
        }
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    } else {
      console.warn('Source URL is empty or file already downloaded. File download skipped.');
    }
  };

  const readFile = async (path) => {
    try {
      const fileExists = await RNFS.exists(path);
      if (fileExists) {
        const contents = await RNFS.readFile(path, 'base64');
        setPdfBase64(contents);
      } else {
        const arrayBuffer = await fetch(path).then(res => res.arrayBuffer());
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };
  const getSignature = () => {
    setSignaturePad(!getSignaturePad);
    setSignatureImageMimeType(null);
  };
  const handleSignature = React.useCallback(async (signature) => {
    try {
      let signaturesigns = await uploadSignatureOnS3(signature);
      const signupdated = await handleNotarysignUpdate(signaturesigns);
      if (signupdated) {
        await fetchUserInfo();
      }
      setSignatureBase64(signature.replace('data:image/png;base64,', ''));
      setSignaturePad(false);
      setPdfEditMode(true);
      setSignatureData(signature);
      insertObject(new Date().toISOString(), {
        type: 'image',
        sourceUrl: signaturesigns,
        page: currentPage,
        position: {
          x: 100,
          y: 100,
        },
      });
    } catch (error) {
      console.error("Error handling signature:", error);
    }
  }, [currentPage, insertObject]);

  const onAddSignatureImage = async (isStamp = false) => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
      });
      const s3Url = await uploadimageToS3(result.assets[0].uri);
      if (result && result.assets && result.assets.length > 0) {
        if (isStamp) {
          setStampBase64(result.assets[0].base64);
          setSignatureImageMimeType(result.assets[0].type);
          setSignatureData(s3Url)
          setSignaturePad(false);
          setPdfEditMode(true);
          insertObject(new Date().toISOString(), {
            type: 'image',
            sourceUrl: s3Url,
            page: currentPage,
            position: {
              x: 100,
              y: 100,
            },
          });
        } else {
          setSignatureBase64(result.assets[0].base64);
          setSignatureData(s3Url)
          setSignatureImageMimeType(result.assets[0].type);
          setSignaturePad(false);
          setPdfEditMode(true);
          insertObject(new Date().toISOString(), {
            type: 'image',
            sourceUrl: s3Url,
            page: currentPage,
            position: {
              x: 100,
              y: 100,
            },
          });
        }
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  const handlePresentModalPress = () => {
    bottomSheetModalRef.current?.present();
  };
  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);
  ////////////// live bolcks ////////////////
  const insertObject = useLiveblocks(state => state.insertObject);
  const setPdfFilePath = useLiveblocks(state => state.setPdfFilePath);
  const handleTextonLiveblock = () => {
    handleCloseModalPress();
    insertObject(new Date().toISOString(), {
      type: 'text',
      text: documentText,
      page: currentPage,
      position: {
        x: 200,
        y: 200,
      },
    });
  }
  const handleDateonLiveblock = () => {
    insertObject(new Date().toISOString(), {
      type: 'date',
      text: date,
      page: currentPage,
      position: {
        x: 200,
        y: 200,
      },
    });
  }
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
      if (signatureImageMimeType == 'image' || signatureImageMimeType == 'jpg' || signatureImageMimeType == 'png') {
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
            const l = await uploadSignedDocumentsOnS3(pdfBase64);
            await updatedDocument(l)
          })
          .catch(err => {
            console.log('eeee', err.message);
          });
      }
      else {
        const { width: width, height: height } = signatureDimensions;
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
            setFilePath(path)
            setNewPdfSaved(true);
            const l = await uploadSignedDocumentsOnS3(pdfBase64);
            // const d = await uploadAllDocuments(pdfBase64)
            await updatedDocument(l)
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
  const handleLinkChange = async (linkId: string, itemLabel: Number) => {
    setFilePath(filePath);
    setNewPdfPath(filePath);
    setSourceUrl(linkId);
    setNewPdfSaved(true);
    readFile(linkId);
    setFileDownloaded(false)
    for (let i = 0; i < pickerItems.length; i++) {
      if (pickerItems[i].value === selectedItem) {
        const newFilePath = `${RNFS.DocumentDirectoryPath}/react-native_signed_${Date.now()}.pdf`;
        const l = await uploadSignedDocumentsOnS3(pdfBase64);
        setFilePath(newFilePath);
        setNewPdfPath(newFilePath);
        readFile(l);
        setFileDownloaded(false);
        pickerItems[i].value = l;
        break;
      }
    }
    setSelectedItem(linkId);
  };
  const updatedDocument = async url => {
    const urlResponse = {
      key: sourceKey,
      value: url
    }
    const request = {
      variables: {
        sessionId: bookingData?._id,
        updatedDocuments: [urlResponse],
      },
    };
    const success = await updatedDocumentsession(request)
  }
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

  const addSignedDocFunc = async docs => {
    try {
      const urls = docs.map(doc => doc.value);
      const request = {
        variables: {
          bookingId: bookingData?._id,
          notarizedDocs: urls,
          bookingType:
            bookingData?.__typename == 'Booking' ? 'booking' : 'session',
        },
      };
      console.log("usrlsfd", request)
      const response = await AddSignedDocs(request);
      if (response.data.bookingAddNotarizedDocs.status === "200") {
        const request = {
          variables: {
            sessionId: bookingData?._id
          },
        };
        let sessiondata = await getSession(request);
        dispatch(setBookingInfoState(sessiondata.data.getSession.session));
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  /////////////////////////////////////
  ///////////////////////////////

  const { channel, token: CutomToken, routeFrom } = route.params;
  const uid = 0;
  const channelName = channel;
  const token = CutomToken;
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUids, setRemoteUids] = useState<any[]>([]);
  const agoraEngineRef = useRef<IRtcEngine>();
  const [isJoined, setIsJoined] = useState(false);
  const remoteCurrentPage = useLiveblocks(state => state.currentPage);
  const pdfRef = React.useRef<Pdf>(null);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const [currentPage, setCurrentPage] =
    React.useState<number>(remoteCurrentPage);
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
  useEffect(() => {
    const setupVideoSDKEngine = async () => {
      try {
        if (Platform.OS === 'android') {
          await getPermission();
        }
        agoraEngineRef.current = createAgoraRtcEngine();
        const agoraEngine = agoraEngineRef.current;
        const currentUserIsHost = true;
        agoraEngine.registerEventHandler({
          onJoinChannelSuccess: () => {
            showMessage('Successfully joined ' + channelName);
            setIsJoined(true);
          },
          onUserJoined: (_connection, uid) => {
            showMessage('Remote user joined with uid ' + uid);
            setRemoteUids(prevUids => [...prevUids, uid]);
          },
          onUserOffline: (_connection, uid) => {
            showMessage('Remote user left the channel. uid: ' + uid);
            if (remoteUids[0] === 'Leave') {
              navigation.navigate('MedicalBookingScreen');
            }
            setRemoteUids(prevUids => prevUids.filter(prevUid => prevUid !== uid));
            // Host left the call, navigate to AgentCallFinishing
            navigation.navigate('MedicalBookingScreen');
          },
          onRequestToken(connection) { },
        });
        agoraEngine.initialize({
          appId: appId,
          channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
        });
        agoraEngine.enableVideo();
      } catch (e) {
        console.log(e);
      }
    };
    setupVideoSDKEngine().then(() => {
      join();
    });
    return () => {
      agoraEngineRef.current?.leaveChannel();
    };
  }, []);
  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      let b = agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngineRef.current?.startPreview();
      agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };
  const leave = async () => {
    try {
      for (let i = 0; i < pickerItems.length; i++) {
        if (pickerItems[i].value === selectedItem) {
          const newFilePath = `${RNFS.DocumentDirectoryPath}/react-native_signed_${Date.now()}.pdf`;
          const l = await uploadSignedDocumentsOnS3(pdfBase64);
          setFilePath(newFilePath);
          setNewPdfPath(newFilePath);
          readFile(l);
          setFileDownloaded(false);
          pickerItems[i].value = l;
          break;
        }
      }
      // let b = await updateSignedDocumentToDb(notarisedDocument)
      let c = await addSignedDocFunc(pickerItems);
      let a = agoraEngineRef.current?.leaveChannel();
      setRemoteUids(["Leave"]);
      setIsJoined(false);
      showMessage('You left the session');
      await updateSession("completed", bookingData?._id);
      navigation.navigate('AgentCallFinishing');
    } catch (e) {
      console.log(e);
    }
  };
  function showMessage(msg: string) {
    console.log(msg);
    Toast.show({
      type: 'success',
      text1: msg,
    });
  }
  const mute = () => {
    if (agoraEngineRef.current) {
      agoraEngineRef.current.muteLocalAudioStream(!isMuted);
      setIsMuted((prev) => !prev);
    }
  };
  const toggleVideoMute = () => {
    if (agoraEngineRef.current) {
      agoraEngineRef.current.enableLocalVideo(!isJoined);
      setIsJoined((prev) => !prev);
    }
  };
  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };
  const [drawingMode, setDrawingMode] = useState<'pen' | 'line' | 'arrow' | 'rectangle'>('pen');
  const [paths, setPaths] = useState<any[]>([]);
  function rgbStringToRgb(rgbString) {
    const colorArray = rgbString.match(/\d+/g).map(Number);
    return rgb(colorArray[0] / 255, colorArray[1] / 255, colorArray[2] / 255);
  }

  console.log("current page", currentPage)
  const handlePathsChange = (newPaths) => {
    console.log("pahedfdfd", newPaths)
    setPaths([...paths, newPaths]); // Assuming newPaths is a single path object
  };
  const handleSavedStamp = (stampPath) => {
    console.log("pahedfdfddddddddddd", stampPath)
    onAddSavedStamp(stampPath);
  };
  const identifyFileType = (url) => {
    const fileExtension = url.split('.').pop().toLowerCase();
    if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      return 'jpg';
    } else if (fileExtension === 'png') {
      return 'png';
    } else {
      return 'unknown';
    }
  };
  const onAddSavedStamp = async (stampPath) => {
    const fileType = await identifyFileType(stampPath);
    setSignatureImageMimeType(fileType);
    setSignatureData(stampPath)
    setSignaturePad(false);
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
  }
  const _uint8ToBase641 = (uint8Array) => {
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  };
  const convertPointsToSvgPath = (points) => {
    let path = '';
    if (points.length > 0) {
      path += `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
    }
    return path;
  };
  const drawPathsOnPdf = async (paths) => {
    const pdfDoc = await PDFDocument.load(pdfBase64, {
      ignoreEncryption: true,
    });
    const page = pdfDoc.getPages()[currentPage - 1];
    const { width, height } = page.getSize();
    paths.forEach((path, index) => {
      if (path[0].type === 'pen' && Array.isArray(path[0].points) && path[0].points.length > 0) {
        const svgPath = convertPointsToSvgPath(path[0].points, width, height);
        const x = path[0].points[0].x;
        const y = path[0].points[0].y;
        const colorString = path[0].color;
        const color = rgbStringToRgb(colorString);
        page.drawSvgPath(svgPath, {
          x: (page.getWidth() * x) / pageWidth,
          y:
            page.getHeight() -
            (page.getHeight() * y) / pageHeight,
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
    setPdfEditMode(true)
    const updatedPdfBytes = await drawPathsOnPdf(paths);
    const pdfBase64 = _uint8ToBase641(updatedPdfBytes);
    const path = `${RNFS.DocumentDirectoryPath}/react-native_signed_${Date.now()}.pdf`;
    await RNFS.writeFile(path, pdfBase64, 'base64')
      .then(async success => {
        setNewPdfPath(path);
        setNewPdfSaved(true);
        setPdfBase64(pdfBase64);
        const l = await uploadSignedDocumentsOnS3(pdfBase64);
        console.log("ffffffffffffffffffffffffff", l)
        await updatedDocument(l)
        await handleClearPaths();
      })
      .catch(err => {
        console.log('eeee', err.message);
      });
  };
  return (
    <SafeAreaView style={styles.Maincontainer}>
      <View style={styles.SecondContainer}>
        <View style={styles.flexContainer}>
          <ScrollView
            style={styles.scroll}
            horizontal={true}
            contentContainerStyle={styles.scrollContainer}>
            {isJoined ? (
              <React.Fragment key={0}>
                <RtcSurfaceView canvas={{ uid: 0 }} style={styles.videoView} />
              </React.Fragment>
            ) : (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  source={{ uri: User?.profile_picture }}
                  style={{
                    width: widthToDp(25),
                    height: widthToDp(25),
                    borderRadius: 100,
                  }}
                />
              </View>
            )}
            {remoteUids.map((uid, index) => (
              <View key={index}>
                <RtcSurfaceView canvas={{ uid }} style={styles.videoView} />
              </View>
            ))}
          </ScrollView>
          <View style={{ flex: 0.2, justifyContent: 'space-evenly' }}>
            {isJoined ? (
              <TouchableOpacity
                style={styles.hourGlass}
                onPress={toggleVideoMute}>
                <Image
                  source={require('../../../assets/videoOff.png')}
                  style={{ width: widthToDp(10), height: widthToDp(10) }}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.hourGlass}
                onPress={toggleVideoMute}>
                <Image
                  source={require('../../../assets/video.png')}
                  style={{ width: widthToDp(10), height: widthToDp(10) }}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.hourGlass} onPress={() => mute()}>
              <Image
                source={
                  isMuted
                    ? require('../../../assets/unmute.png')
                    : require('../../../assets/mute.png')
                }
                style={{ width: widthToDp(10), height: widthToDp(10) }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ backgroundColor: Colors.white }}>

        <RNPickerSelect
          style={pickerSelectStyles}
          onValueChange={(itemValue, itemLabel) => handleLinkChange(itemValue, itemLabel)}
          items={pickerItems}
        />
      </View>
      <View style={styles.container}>
        <View style={styles.pdfWrapper}>
          {getSignaturePad ? (
            <Signature
              onOK={sig => handleSignature(sig)}
              onEmpty={() => console.log('___onEmpty')}
              descriptionText="Sign"
              clearText="Clear"
              confirmText="Save"
            />
          ) : (
            fileDownloaded && (
              <>
                {filePath ? (
                  <>
                    <PdfView
                      ref={pdfRef}
                      style={styles.pdfView}
                      source={{ uri: filePath }}
                      trustAllCerts={false}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                      // horizontal={true}
                      enablePaging={true}
                      minScale={1.0}
                      maxScale={20.0}
                      scale={1.0}
                      spacing={0}
                      fitPolicy={0}
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
                      onPageChanged={(page, numberOfPages) => {
                        setCurrentPage(page);
                        // setRemoteCurrentPage(page);
                      }}
                      onPageSingleTap={(page, x, y) => {
                        handleSingleTap(page, x, y);
                      }}
                      onError={error => console.error(error)}
                    />
                    {drawingMode && User.account_type != 'client' && (
                      <SketchCanvasComponent onPathsChange={handlePathsChange} stamps={User} onStampChanges={handleSavedStamp} saveToPdf={saveToPdf} />
                    )}
                    <View style={styles.currentPageTextContainer}>
                      <RNText
                        style={styles.currentPageText}>
                        {currentPage}
                      </RNText>
                    </View>
                    {/* <View style={styles.penToolcanva}>
                      <DrawingControls setDrawingMode={setDrawingMode} clearCanvas={clearCanvas} />
                    </View> */}
                    {/* </View> */}
                    {/* <View style={styles.objectsWrapper}>
                      {Object.entries(objects).map(([objectId, object]) => {
                        // console.log("objerect", object)
                        if (object.page !== currentPage) {
                          return null;
                        }
                        return (
                          <PdfObject
                            id={objectId}
                            key={objectId}
                            object={object}
                            selected={selectedObjectId === objectId}
                          />
                        );
                      })}
                    </View> */}
                    {/* <View style={styles.actions}>
                      <View style={styles.editActions}>
                        <Pressable onPress={() => onSignatureAdd()}>
                          <Edit width={30} height={30} color="#000000" />
                        </Pressable>
                        <Pressable onPress={() => onLabelAdd()}>
                          <Text width={32} height={32} color="#000000" />
                        </Pressable>
                        <Pressable onPress={() => onStampAdd()}>
                          <PageEdit width={26} height={26} color="#000000" />
                        </Pressable>
                        <HeaderRight />
                      </View>
                      <View style={styles.navigation}>
                        <Pressable
                          onPress={() => {
                            if (currentPage !== 1) {
                              pdfRef.current?.setPage(currentPage - 1);
                            }
                          }}>
                          <NavArrowLeft
                            width={36}
                            height={36}
                            color={currentPage === 1 ? '#dddddd' : '#000000'}
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            pdfRef.current?.setPage(currentPage + 1);
                          }}>
                          <NavArrowRight
                            width={36}
                            height={36}
                            color={currentPage === totalPages ? '#dddddd' : '#000000'}
                          />
                        </Pressable>
                      </View>
                    </View> */}
                  </>
                ) : (
                  <View
                    style={{
                      width: widthToDp(100),
                      flex: 1,
                      height: height,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 999,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <ActivityIndicator
                      size="large"
                      color={Colors.Orange}
                      style={{ marginTop: -200 }}
                    />
                    <RNText
                      style={{
                        color: Colors.Orange,
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginTop: 20,
                      }}>
                      Saving the Pdf file
                    </RNText>
                  </View>
                )}
              </>
            )
          )
          }
          <SignatureContainer
            signatureData={signatureData}
            onSignatureChange={handleDragabbleSignatureData}
          />
        </View>
        <View style={styles.actions}>

          <MainButton
            Title="Sign"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            styles={{
              paddingHorizontal: widthToDp(3),
              paddingVertical: widthToDp(2),
            }}
            onPress={() => {
              // onSignatureAdd();
              getSignature();
            }}
          />
          <MainButton
            Title="Upload sign"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            styles={{
              paddingHorizontal: widthToDp(1),
              paddingVertical: widthToDp(2),
            }}
            onPress={() => {
              onAddSignatureImage(false);
            }}
          />
          {User.account_type != 'client' && (
            <MainButton
              Title="Add stamp"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              styles={{
                paddingHorizontal: widthToDp(1),
                paddingVertical: widthToDp(2),
              }}
              onPress={() => {
                onAddSignatureImage(true);
              }}
            />
          )}
          {User.account_type != 'client' && (
            <MainButton
              Title="Add Text"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              styles={{
                paddingHorizontal: widthToDp(1),
                paddingVertical: widthToDp(2),
              }}
              onPress={() => {
                handlePresentModalPress();
              }}
            />
          )}
          {User.account_type != 'client' && (
            <MainButton
              Title="Add Date"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              styles={{
                paddingHorizontal: widthToDp(1),
                paddingVertical: widthToDp(2),
              }}
              onPress={() => {
                setOpen(true);
              }}
            />
            // </View>
          )}
          {/* </View> */}
          {User.account_type != 'client' && (

            <MainButton
              Title="Complete call"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              styles={{
                paddingHorizontal: widthToDp(4),
                paddingVertical: widthToDp(2),
              }}
              onPress={() => {
                leave();
              }}
            />
          )}
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            snapPoints={snapPoints}
          // onChange={handleSheetChanges}
          >
            <AddText
              text={documentText}
              onChangeText={(text: string) => setDocumentText(text)}
              onPress={() => handleTextonLiveblock()}
            />
          </BottomSheetModal>
          <View style={styles.buttonFlex}>
            <DatePicker
              modal
              mode="datetime"
              minimumDate={new Date()}
              open={open}
              date={date}
              onConfirm={date => {
                setOpen(false);
                setDate(date);
                handleDateonLiveblock();
              }}
              onCancel={() => {
                setOpen(false);
              }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdfWrapper: {
    flex: 1,
  },
  pdfView: {
    flex: 1,
    // height: height * 0.6,
  },
  currentPageTextContainer: {
    backgroundColor: 'green',
    width: 25,
    height: 25,
    position: 'absolute',
    bottom: 0,
    right: 0,
    justifyContent: 'center',   // Center the text vertically
    alignItems: 'center',
  },
  currentPageText: {
    color: 'white',             // Use a color that contrasts with the background
    fontSize: 18,
    fontWeight: 'bold',

  },
  objectsWrapper: {
    // backgroundColor: 'blue',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: '#e2e2e2',
    backgroundColor: '#ffffff',
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: 16,
    rowGap: 16,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
  },
  Maincontainer: {
    flex: 1,
    //backgroundColor: Colors.PinkBackground,
  },
  NavbarContainer: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(2),
    justifyContent: 'space-between',
  },
  NavContainer: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(2),
    marginVertical: widthToDp(2),
    // borderWidth: 1,
  },
  waitingNav: {
    width: widthToDp(6),
    height: heightToDp(6),
    marginVertical: widthToDp(2),
  },
  profilePic: {
    marginVertical: widthToDp(2),
  },
  flexContainer: {
    flexDirection: 'row',
    height: heightToDp(40),
  },
  scrollBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthToDp(5),
  },
  picker: {
    borderWidth: 2,
    backgroundColor: Colors.white,
    borderColor: Colors.DisableColor,
  },
  NavTextContainer: {
    // borderWidth: 1,
    marginLeft: widthToDp(5),
  },
  textHead: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontWeight: '700',
    fontFamily: 'Manrope-Regular',
  },
  textSubHead: {
    color: Colors.TextColor,
    fontSize: widthToDp(3.5),
    fontWeight: '700',
    marginLeft: widthToDp(2),
    fontFamily: 'Manrope-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    // borderWidth: 1,
    justifyContent: 'center',
  },
  SecondContainer: {
    backgroundColor: Colors.white,
  },
  hourGlass: {
    alignSelf: 'center',
  },
  textSession: {
    color: Colors.TextColor,
    marginHorizontal: widthToDp(5),
    marginTop: heightToDp(10),
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  sessionDesc: {
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  btn: {
    marginVertical: heightToDp(2),
  },
  btncontain: {
    flex: 1,
    justifyContent: 'flex-end',
    marginVertical: heightToDp(5),
  },
  slideContainer: {
    flex: 1,
    marginHorizontal: widthToDp(5),
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 4,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#0055cc',
    margin: 5,
  },
  main: {
    flex: 1,
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    margin: widthToDp(3),
    columnGap: widthToDp(4),
  },
  videoView: {
    width: widthToDp(25),
    height: heightToDp(30),
    resizeMode: 'contain',
    borderRadius: 15,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  head: {
    fontSize: 20,
  },
  info: {
    backgroundColor: '#ffffe0',
    color: '#0000ff',
  },

  penToolcanva: {
    position: 'absolute',

    top: 0,
    left: 0,
    // bottom: 0,
    right: 0,
  }
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
// const appId = 'abd7df71ee024625b2cc979e12aec405';
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