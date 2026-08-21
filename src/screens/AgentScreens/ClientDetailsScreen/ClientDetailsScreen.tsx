import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  DeviceEventEmitter,
  Button,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Linking,
  TextInput,
  ToastAndroid,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import ReactNativeBlobUtil from 'react-native-blob-util';
import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import Pdf from 'react-native-pdf';
import PdfView from 'react-native-pdf';

import RNFS from 'react-native-fs';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import BookingColors from '../../../themes/BookingColors';
import {formatDateTime, heightToDp, widthToDp} from '../../../utils/Responsive';
import DocumentComponent from '../../../components/DocumentComponent/DocumentComponent';
import MainButton from '../../../components/MainGradientButton/MainButton';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import useBookingStatus from '../../../hooks/useBookingStatus';
import {useDispatch, useSelector} from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setNavigationStatus,
  setUser,
} from '../../../features/booking/bookingSlice';
import DocumentScanner from 'react-native-document-scanner-plugin';

import moment from 'moment';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import useRegister from '../../../hooks/useRegister';
import useFetchBooking from '../../../hooks/useFetchBooking';
import useCustomerSuport from '../../../hooks/useCustomerSupport';
import Toast from 'react-native-toast-message';
// import {BottomSheet} from '@rneui/base';
import UploadDocsSheet from '../../../components/UploadDocsSheet/UploadDocsSheet';
import {useSession} from '../../../hooks/useSession';
import {useLiveblocks} from '../../../store/liveblocks';
import Loading from '../../../components/LiveBlocksComponents/loading';
import RequestPayment from '../../../components/RequestPayment/RequestPayment';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {CheckCircle, CheckCircleSolid, Xmark} from 'iconoir-react-native';
import useFetchUser from '../../../hooks/useFetchUser';
import {
  UPDATE_OR_CREATE_BOOKING_CLIENT_DOCS,
  UPDATE_OR_CREATE_SESSION_CLIENT_DOCS,
  UPDATE_SESSION_CLIENT_DOCS,
} from '../../../../request/mutations/updateSessionClientDocs';

import AddressCard from '../../../components/AddressCard/AddressCard';
import {useLazyQuery, useMutation} from '@apollo/client';
import {GET_SESSION_BY_ID} from '../../../../request/queries/getSessionByID.query';
import {UPDATE_SESSION_PRICEDOCS} from '../../../../request/mutations/updateSessionPriceDocs.mutation';
import {Alert} from 'react-native';
import {
  ACCEPT_ALLOCATION_REQUEST,
  REJECT_ALLOCATION_REQUEST,
} from '../../../../request/mutations/updateAllocationRequest.mutation';

const WORKSPACE_STATUS = {
  Pending: {
    background: BookingColors.warningSoft,
    color: BookingColors.warning,
    icon: 'clock',
  },
  To_be_paid: {
    background: BookingColors.warningSoft,
    color: BookingColors.warning,
    icon: 'credit-card',
  },
  Paid: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'credit-card',
  },
  Payment_confirmed: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'check-circle',
  },
  Accepted: {
    background: BookingColors.successSoft,
    color: BookingColors.success,
    icon: 'check-circle',
  },
  Travelling: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'navigation',
  },
  Ongoing: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'activity',
  },
  Completed: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'check-circle',
  },
  Rejected: {
    background: BookingColors.errorSoft,
    color: BookingColors.error,
    icon: 'x-circle',
  },
};

export default function AgentMobileNotaryStartScreen({route, navigation}: any) {
  const downloadPdf = useRef(null);
  const token = useSelector(state => state.chats.chatToken);
  const storedClientDetail = useSelector(
    (state: any) => state?.booking?.booking,
  );
  const routeClientDetail = route?.params?.clientDetail;
  const latestClientDetailRef = useRef(
    storedClientDetail || routeClientDetail || null,
  );
  const currentClientDetail = storedClientDetail || routeClientDetail;
  if (currentClientDetail?._id) {
    latestClientDetailRef.current = currentClientDetail;
  }
  const rawClientDetail = currentClientDetail || latestClientDetailRef.current;
  const clientDetail = useMemo(() => {
    const detail = rawClientDetail || {};

    return {
      ...detail,
      documents: Array.isArray(detail.documents) ? detail.documents : [],
      document_type: Array.isArray(detail.document_type)
        ? detail.document_type
        : [],
      observers: Array.isArray(detail.observers) ? detail.observers : [],
      proof_documents: Array.isArray(detail.proof_documents)
        ? detail.proof_documents
        : [],
      booked_for: detail.booked_for || {},
      total_signatures_required: detail.total_signatures_required || 0,
    };
  }, [rawClientDetail]);
  const hasClientDetail = Boolean(clientDetail?._id);
  const navigationStatus = useSelector(state => state.booking.navigationStatus);
  const {
    handlegetBookingStatus,
    handleSessionStatus,
    handleUpdateBookingStatus,
  } = useBookingStatus();
  const {
    handleupdateBookingInfo,
    setSessionPrice,
    setBookingPrice,
    fetchBookingByID,
    updateAgentdocs,
  } = useFetchBooking();

  const {handleCallSupport} = useCustomerSuport();
  const {updateSession, handleSessionUpdation, getSessionByID} = useSession();
  const {searchUserByEmail} = useFetchUser();
  const {documents: documentArray} = clientDetail;
  const {booked_for} = clientDetail;
  const {proof_documents} = clientDetail;
  const dispatch = useDispatch();
  const [status, setStatus] = useState();
  const [allocationStatus, setAllocationStatus] = useState();
  const [isVisible, setIsVisible] = useState(false);
  const enterRoom = useLiveblocks(state => state.liveblocks.enterRoom);
  const leaveRoom = useLiveblocks(state => state.liveblocks.leaveRoom);
  const [notary, setNotary] = useState();
  const [showNotes, setShowNotes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [notes, setNotes] = useState('');
  const [signaturePage, setSignaturePage] = useState();
  const [notaryBlock, setNotaryBlock] = useState();
  const [AmountEntered, setAmountEntered] = useState<number>();
  const [searchFor, setSearchFor] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [uploadShow, setUploadShow] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('on_notarizr');
  const [price, setPrice] = useState(clientDetail?.price);
  const [totalPrice, setTotalPrice] = useState(clientDetail?.totalPrice);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [filePath, setFilePath] = useState(
    `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
  );
  const [newPdfSaved, setNewPdfSaved] = useState(false);
  const [newPdfPath, setNewPdfPath] = useState(null);
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [lastRNBFTask, setLastRNBFTask] = useState({cancel: () => {}});
  // const [navigationStatus, setNavigationStatus] = useState('');
  const [selected, setSelected] = useState('client_choose');
  const [bookedByAddress, setBookedByAddress] = useState(null);
  const [numOfWitnesses, setNumOfWitnesses] = useState(1);
  const [witnessFields, setWitnessFields] = useState(['']);
  const [searchTexts, setSearchTexts] = useState(['']);
  const [searchedUser, setSearchedUser] = useState([]);
  const [observers, setObservers] = useState([]);
  const [showObserverSearchView, setShowObserverSearchView] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeFieldIndex, setActiveFieldIndex] = useState(null);

  useEffect(() => {
    if (!storedClientDetail && routeClientDetail?._id) {
      dispatch(setBookingInfoState(routeClientDetail));
    }
  }, [dispatch, routeClientDetail, storedClientDetail]);

  useEffect(() => {
    if (!hasClientDetail) {
      return;
    }

    setPrice(clientDetail.price);
    setTotalPrice(clientDetail.totalPrice);
  }, [clientDetail.price, clientDetail.totalPrice, hasClientDetail]);

  const handleWitnessCountChange = text => {
    let number = parseInt(text, 10) || 1;
    if (number > 5) {
      Toast.show({
        type: 'error',
        text1: 'Only 5 observers are allowed',
      });
      number = 5;
    }
    setNumOfWitnesses(number);
    setWitnessFields(Array(number).fill(''));
    setSearchTexts(Array(number).fill(''));
  };

  const handleSearchChange = (text, index) => {
    const updatedSearchTexts = [...searchTexts];
    updatedSearchTexts[index] = text;
    setSearchTexts(updatedSearchTexts);

    // Search logic
    setSearchedUser([]); // Clear existing results
    setShowObserverSearchView(true);
    setisLoading(true);
    // setSearchText(text);
    SearchUser(text);
    setSearchFor('Observer');
    setShowObserverSearchView(true);
    setActiveFieldIndex(index);
    // Simulate async search (replace with actual API call)
    // setTimeout(() => {
    //   setSearchedUser([
    //     { _id: `${index}-1`, email: `user${index}@example.com` },
    //     { _id: `${index}-2`, email: `user${index + 1}@example.com` },
    //   ]);
    //   setisLoading(false);
    // }, 1000);
  };

  const handleSelectObserver = observer => {
    setObservers(prev => [...prev, observer]);
    setShowObserverSearchView(false);
  };

  const handleRemoveObserver = id => {
    setObservers(prev => prev.filter(observer => observer._id !== id));
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getBookingStatus();
      setRefreshing(false);
      console.log('Refreshing.....');
    }, 2000);
  }, []);

  const {uploadMultipleFiles, uploadAllDocuments, uploadDocArray} =
    useRegister();

  const [updateSessionClientDocs] = useMutation(
    UPDATE_OR_CREATE_SESSION_CLIENT_DOCS,
  );
  const [updateSessionAgentDocs] = useMutation(UPDATE_SESSION_PRICEDOCS);
  const [updateBookingClientDocs] = useMutation(
    UPDATE_OR_CREATE_BOOKING_CLIENT_DOCS,
  );

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['25%', '40%'], []);
  const [getSession] = useLazyQuery(GET_SESSION_BY_ID);
  const handleClientData = async () => {
    setLoadingUpdate(true);

    if (
      clientDetail?.service_type === 'mobile_notary' &&
      status === 'Accepted'
    ) {
      handleUpdateBookingStatus('accepted', clientDetail._id);
      dispatch(setBookingInfoState(clientDetail));
      dispatch(
        setCoordinates(
          clientDetail?.booked_by?.current_location?.coordinates
            ? clientDetail?.booked_by?.current_location?.coordinates
            : clientDetail?.client?.current_location?.coordinates,
        ),
      );
      dispatch(
        setUser(
          clientDetail?.booked_by
            ? clientDetail?.booked_by
            : clientDetail?.client,
        ),
      );
      navigation.navigate('MapArrivalScreen');
    } else if (clientDetail?.__typename === 'Session' && status === 'Pending') {
      // const observersString = `${observers._id}:${observers.email}`;
      // return;

      const params = {
        sessionId: clientDetail?._id,
        // identityAuthentication: selected,
        // observers: observers.map(item => item.email),
        paymentType: paymentMethod,
      };
      const response = await handleSessionUpdation(params);
      console.log('respndfpareamd', response);
      if (response.status == '200') {
        const sessionData = await getSessionByID(clientDetail?._id);
        console.log('sesssiondataaaaaaaaaaaaaaa', sessionData);
        if (response.status === '200') {
          // if (sessionData?.__typename == 'Session') {
          //   await updateSession('pending', session._id);
          // }
        }
        dispatch(setBookingInfoState(sessionData));
        // return;
      }
    } else if (clientDetail?.__typename === 'Session' && status === 'Paid') {
      const params = {
        sessionId: clientDetail?._id,
        identityAuthentication: selected,
        observers: observers.map(
          item => `${item.first_name} ${item.last_name}`,
        ),
        paymentType: paymentMethod,
      };
      const response = await handleSessionUpdation(params);
      console.log('respndfpareamd', response);
      if (response.status == '200') {
        const sessionData = await getSessionByID(clientDetail?._id);
        console.log('sesssiondataaaaaaaaaaaaaaa', sessionData);
        if (response.status === '200') {
          // if (sessionData?.__typename == 'Session') {
          //   await updateSession('pending', session._id);
          // }
        }
        dispatch(setBookingInfoState(sessionData));
        // return;
      }
    } else {
      // console.log("responserddddddddddddd")
      // handleUpdateBookingStatus('To_be_paid', clientDetail._id);
      // getBookingStatus();
    }
    setLoadingUpdate(false);
  };

  const [
    acceptAllocation,
    {data: acceptData, loading: acceptLoading, error: acceptError},
  ] = useMutation(ACCEPT_ALLOCATION_REQUEST, {
    onCompleted: data => {
      console.log('Allocation accepted:', data);
      if (data?.acceptAllocationRequest.status === 'success') {
        setAllocationStatus('To_be_paid');
      }
    },
    onError: error => {
      console.error('Error accepting allocation:', error);
    },
  });
  const [
    rejectAllocation,
    {data: rejectData, loading: rejectLoading, error: rejectError},
  ] = useMutation(REJECT_ALLOCATION_REQUEST, {
    onCompleted: data => {
      console.log('Allocation rejected:', data);
      if (data?.rejectAllocationRequest.status === 'success') {
        setAllocationStatus('Rejected');
      }
    },
    onError: error => {
      console.error('Error rejecting allocation:', error);
    },
  });
  const handleAllocationAccept = async allocationId => {
    acceptAllocation({
      variables: {allocationId},
    });
  };
  const handleAllocationReject = async allocationId => {
    rejectAllocation({
      variables: {allocationId},
    });
  };
  const handleUpdateClientStatus = async (updatestatus: string) => {
    console.log('sttererer', updatestatus);
    // return;
    await updateSession(updatestatus, clientDetail?._id);
  };
  const getBookingStatus = async () => {
    if (!clientDetail?._id) {
      return;
    }

    let statusUpdate;
    try {
      if (clientDetail?.__typename === 'Session') {
        statusUpdate = await handleSessionStatus(clientDetail?._id);
      } else {
        statusUpdate = await handlegetBookingStatus(clientDetail?._id);
      }
      console.log('statusd', statusUpdate);
      setStatus(capitalizeFirstLetter(statusUpdate));
    } catch (error) {
      console.error('Error retrieving booking status:', error);
    }
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getBookingStatus();
    });
    return unsubscribe;
  }, [clientDetail?._id, navigation, status]);
  const handleNext = () => {
    if (!signaturePage || !notaryBlock) {
      Toast.show({
        type: 'error',
        text1: 'Please upload documents',
      });
    } else {
      setNotary(null);
      setShowNotes(true);
    }
  };
  const handleStatusChange = async (string: string) => {
    if (string === 'to_be_paid') {
      setLoadingAccept(true);
    } else {
      setLoadingReject(true);
    }

    try {
      if (clientDetail?.__typename !== 'Session') {
        await handleUpdateBookingStatus(string, clientDetail?._id);
      } else {
        await updateSession(string, clientDetail?._id);
      }
      await getBookingStatus();
    } catch (error) {
      console.error('Error updating and fetching booking status:', error);
    }
    setLoadingAccept(false);
    setLoadingReject(false);
  };
  const handleComplete = async () => {
    setLoading(true);
    const signatureURL = await uploadAllDocuments(signaturePage);
    const notaryURL = await uploadAllDocuments(notaryBlock);
    const documents = {
      Signature_Page: signatureURL,
      Notary_Block: notaryURL,
    };
    await handleStatusChange('completed', clientDetail._id);
    const response = await handleupdateBookingInfo(
      clientDetail._id,
      notes,
      documents,
    );
    if (!response) {
      Toast.show({
        type: 'error',
        text1: 'Problem occured while uploading documents',
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Your payout will be received in 48 hours',
      });
    }
    setShowNotes(false);
    setLoading(false);
  };
  const scanDocument = async () => {
    const {scannedImages} = await DocumentScanner.scanDocument();
    return scannedImages;
  };
  const handleSignaturePage = async () => {
    const signatureResponse = await scanDocument();
    setSignaturePage(signatureResponse);
    setIsVisible(false);
  };
  const handleNotaryBlock = async () => {
    const NotaryResponse = await scanDocument();
    setNotaryBlock(NotaryResponse);
    setIsVisible(false);
  };
  const handleCancel = async () => {
    setIsVisible(false);
  };
  function displayNamesWithCommas(arr: any[]) {
    const names = arr.map((obj: {name: any}) => obj.name);
    const namesString = names.join(', ');
    return namesString;
  }
  const setBookingAmount = async () => {
    if (!AmountEntered) {
      Alert.alert('Please fill in the amount');
      return;
    }
    try {
      let response;

      if (clientDetail?.__typename === 'Session') {
        response = await setSessionPrice(
          clientDetail?._id,
          AmountEntered,
          clientDetail?.documents,
        );
        console.log(response);
      } else {
        // response = await setBookingPrice(
        //   clientDetail?._id,
        //   AmountEntered,
        //   clientDetail?.review,
        //   clientDetail?.rating,
        //   clientDetail?.notes,
        //   clientDetail?.documents,
        // );
      }
      handleCloseModalPress();
      if (response == 200) {
        if (clientDetail.__typename !== 'Booking') {
          setPrice(AmountEntered);
        } else {
          setTotalPrice(AmountEntered);
        }

        Toast.show({
          type: 'success',
          text1: 'Amount requested successfully',
        });
      }
    } catch (error) {
      console.error('Error setting booking price:', error);
    }
  };
  const isStorageLoading = useLiveblocks(
    state => state.liveblocks.isStorageLoading,
  );
  const handlePresentModalPress = () => {
    if (clientDetail.payment_type == 'on_notarizr') {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.present();
      // navigation.navigate('NotaryCallScreen', {
      //   routeFrom: 'agent',
      //   uid: clientDetail?._id,
      //   channel: clientDetail?.agora_channel_name,
      //   token: clientDetail?.agora_channel_token,
      // });
    }
  };

  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);
  React.useEffect(() => {
    enterRoom('test-room');

    return () => {
      leaveRoom();
    };
  }, [enterRoom, leaveRoom]);

  // console.log('lietder', clientDetail);
  const SearchUser = async query => {
    console.log('alsddfdf', query);
    setisLoading(true);
    const response = await searchUserByEmail(query);
    setSearchedUser(response);
    setisLoading(false);
  };

  const selectDocuments = async () => {
    setLoading(true);
    let urlResponse;
    const response = await uploadMultipleFiles();
    console.log('responsessssssssss', response);
    if (response) {
      urlResponse = await uploadDocArray(response);
      console.log('sssssssssssssssssssssssss', urlResponse);
      // urlResponse = urlResponse.map(item => ({
      //   key: item.name,
      //   value: item.url,
      // }));

      const request = {
        variables: {
          sessionId: clientDetail?._id,
          agentDocuments: urlResponse,
        },
      };
      const requestBooking = {
        variables: {
          bookingId: clientDetail?._id,
          agentDocuments: urlResponse,
        },
      };
      console.log('ttttttttttttttttt', request);
      const res =
        clientDetail.__typename == 'Session'
          ? // await updateAgentdocs(request)
            await updateAgentdocs(clientDetail?._id, urlResponse)
          : await updateBookingClientDocs(requestBooking);

      var reponse;
      if (clientDetail.__typename == 'Session') {
        const request = {
          variables: {
            sessionId: clientDetail?._id,
          },
        };
        reponse = await getSession(request);
        dispatch(setBookingInfoState(reponse.data.getSession.session));
        setLoading(false);
      } else {
        reponse = await fetchBookingByID(clientDetail?._id);
        dispatch(setBookingInfoState(reponse?.getBookingById?.booking));
        setLoading(false);
      }
    }
  };
  const highestPriceDocument = clientDetail.document_type?.length
    ? clientDetail.document_type.reduce(
        (maxDoc, doc) => (doc.price > maxDoc.price ? doc : maxDoc),
        clientDetail.document_type[0],
      )
    : {};

  const additionalSignatureCharges =
    clientDetail.total_signatures_required * 10;
  const handleDocumentPress = (documentUri: string) => {
    if (!documentUri) {
      console.warn('Document URI is empty');
      return;
    }
    console.log('documentur', documentUri);
    navigation.navigate('NotaryDocumentDownloadScreen', {
      document: documentUri,
    });
    // setSelectedDocument(documentUri);
    // setShowModal(true);
    setNewPdfPath(documentUri);
    setNewPdfSaved(true);
  };
  const handleDownload = () => {
    // Implement download functionality here
    // Example: open a link to download the document
    if (selectedDocument && selectedDocument) {
      // downloadFile(selectedDocument);
      // Open a download link or perform download action
      // This is a placeholder, replace with actual download logic
      console.log(`Downloading document: ${selectedDocument}`);
    }
  };
  useEffect(() => {
    downloadFile();

    if (newPdfSaved) {
      console.log('newfilepath', newPdfPath);
      setFilePath(newPdfPath);
      setNewPdfSaved(false);
      // setPdfArrayBuffer(_base64ToArrayBuffer(pdfBase64));
    }
  }, [filePath, newPdfSaved, selectedDocument, newPdfPath]);

  const cancelTaskAndCloseModal = () => {
    // if (lastRNBFTask && typeof lastRNBFTask.cancel === 'function') {
    //   lastRNBFTask.cancel(); // Cancel the task if cancel method is available
    // }
    setShowModal(false); // Close the modal
  };
  console.log('clienfdfdd', clientDetail);
  const downloadFile = () => {
    if (!fileDownloaded && selectedDocument) {
      // Check if sourceUrl is not empty
      RNFS.downloadFile({
        fromUrl: selectedDocument,
        toFile: newPdfPath ? newPdfPath : selectedDocument,
      })
        .promise.then(res => {
          setFileDownloaded(true);
          console.log('respnsere', res);
          readFile();
        })
        .catch(error => {
          console.error('Error downloading file:', error);
          // Handle the error (e.g., show an error message to the user)
        });
    } else {
      console.warn('Source URL is empty. File download skipped.');
      // Handle the case where sourceUrl is empty (e.g., show a message to the user)
    }
  };
  const readFile = () => {
    RNFS.readFile(
      `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
      'base64',
    ).then(contents => {
      // setPdfBase64(contents);
      // setPdfArrayBuffer(_base64ToArrayBuffer(contents));
    });
  };
  const openLocalFile = () => {
    if (filePath) {
      RNFS.readFile(filePath, 'base64')
        .then(contents => {
          // Handle file contents, e.g., display PDF using a library
          console.log('File contents:', contents);
        })
        .catch(error => {
          console.error('Error reading file:', error);
        });
    } else {
      console.warn('File path is empty.');
    }
  };
  useEffect(() => {
    let isMounted = true;

    const handleDimensionsUpdate = () => {
      // Handle dimension update logic here
    };

    if (isMounted) {
      // Subscribe to the event using useRef
      downloadPdf.current = DeviceEventEmitter.addListener(
        'didUpdateDimensions',
        handleDimensionsUpdate,
      );

      // Check if the modal should be visible and show it
      if (showModal) {
        // Logic to show the modal
      }
    }

    return () => {
      // Unsubscribe from the event when component unmounts
      downloadPdf.current?.remove();
      isMounted = false;
    };
  }, [showModal]); // Ensure useEffect runs when showModal changes

  useEffect(() => {
    const fetchAddress = async () => {
      if (
        clientDetail &&
        clientDetail.booked_by &&
        Array.isArray(clientDetail.booked_by.addresses)
      ) {
        const addressId = clientDetail.address;
        const addressdetail = clientDetail.booked_by.addresses.find(
          address => address._id == addressId,
        );
        setBookedByAddress(addressdetail);
      } else {
        console.log('Client detail or addresses are not properly loaded.');
      }
    };

    fetchAddress();
  }, [clientDetail]);

  const handleStartNavigation = async () => {
    if (clientDetail?.service_type === 'mobile_notary') {
      await handleStatusChange('travelling');
      dispatch(setCoordinates(bookedByAddress?.location_coordinates));

      navigation.navigate('AgentMapArrivalScreen', {
        user: 'Agent',
      });
    }
    dispatch(setNavigationStatus('ongoing'));
    // setNavigationStatus('ongoing');
    // navigation.navigate('MapArrivalScreen');
  };
  const handleAddressPress = coordinates => {
    navigation.navigate('MapArrivalScreen');
    dispatch(setCoordinates(coordinates));
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        let permissionsToRequest = [];

        if (Platform.Version >= 33) {
          permissionsToRequest.push(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          );
          permissionsToRequest.push(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          );
          permissionsToRequest.push(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          );
        } else {
          permissionsToRequest.push(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
        }

        console.log('Permissions to request:', permissionsToRequest);

        const granted = await PermissionsAndroid.requestMultiple(
          permissionsToRequest,
          {
            title: 'Storage Permission Needed',
            message:
              'This app needs access to your storage to save media files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        const allPermissionsGranted = permissionsToRequest.every(
          permission =>
            granted[permission] === PermissionsAndroid.RESULTS.GRANTED,
        );

        if (allPermissionsGranted) {
          console.log('Storage permissions granted');
          return true;
        } else {
          console.log('Some or all storage permissions denied');
          return false;
        }
      } catch (err) {
        console.warn('Error requesting storage permissions:', err);
        return false;
      }
    } else {
      console.log('Platform is not Android');
      return true; // Assume permission granted for non-Android platforms
    }
  };

  const checkDownloadDirectory = async () => {
    let downloadDir = '/storage/emulated/0/Download'; // This is the correct path to check

    try {
      const dirInfo = await ReactNativeBlobUtil.fs.exists(downloadDir); // Check if the download directory exists
      console.log('dirInfo', dirInfo);
      if (dirInfo) {
        console.log('Download directory exists:', downloadDir);
        return true;
      } else {
        console.log(
          'Download directory does not exist or is not accessible:',
          downloadDir,
        );
        return false;
      }
    } catch (error) {
      console.error('Error checking download directory:', error);
      return false;
    }
  };

  const handleNotarizrDocumentPress = async (documents, name) => {
    try {
      setLoadingStates(prev => ({...prev, [name]: true}));
      Toast.show({
        type: 'info',
        text1: 'Download Starting',
        text2: 'Preparing to download documents...',
      });
      const hasPermission = await requestStoragePermission();
      console.log('Permission status:', hasPermission);
      if (!hasPermission) {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Storage permission is required to download files.',
        });
        setLoadingStates(prev => ({...prev, [name]: false}));

        return;
      }

      const downloadDirExists = await checkDownloadDirectory();
      if (!downloadDirExists) {
        Toast.show({
          type: 'error',
          text1: 'Download Directory Not Found',
          text2: 'The download directory does not exist or is not accessible.',
        });
        setLoadingStates(prev => ({...prev, [name]: false}));

        return;
      }

      const processDownload = async url => {
        const fileName = decodeURIComponent(url.split('/').pop()); // decodeURIComponent to handle encoded characters
        let dirs = '/storage/emulated/0/Download';
        let downloadPath = `${dirs}/${fileName}`;

        try {
          const result = await ReactNativeBlobUtil.config({
            fileCache: true,
            path: downloadPath,
          }).fetch('GET', url);

          if (result.info().status === 200) {
            console.log(`File ${fileName} downloaded to ${downloadPath}`);
            Toast.show({
              type: 'success',
              text1: 'Download Successful',
              text2: `File downloaded to ${downloadPath}`,
            });
            setLoadingStates(prev => ({...prev, [name]: false}));
          } else {
            Toast.show({
              type: 'error',
              text1: 'Download Failed',
              text2: `Failed to download the file ${fileName}.`,
            });
            setLoadingStates(prev => ({...prev, [name]: false}));
          }
        } catch (error) {
          console.error(`Failed to download ${fileName}:`, error);
          Toast.show({
            type: 'error',
            text1: 'Download Error',
            text2: `An error occurred while downloading the file ${fileName}.`,
          });
        } finally {
          setLoadingStates(prev => ({...prev, [name]: false}));
        }
      };

      if (Array.isArray(documents)) {
        for (const document of documents) {
          if (typeof document === 'string') {
            await processDownload(document);
          } else {
            await processDownload(document.url);
          }
        }
      } else {
        for (const url of Object.values(documents)) {
          await processDownload(url);
        }
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Download Error',
        text2: 'An error occurred while downloading the files.',
      });
    }
  };

  console.log('cliendetails', allocationStatus);
  console.log(
    'cliendetailssssssssssssssssssssssss',
    clientDetail?.status,
    clientDetail.observers,
  );
  const workspaceStatus = allocationStatus || status || 'Pending';
  const workspaceStatusStyle =
    WORKSPACE_STATUS[workspaceStatus] || WORKSPACE_STATUS.Pending;
  const workspaceStatusLabel = String(workspaceStatus).replaceAll('_', ' ');
  const workspaceServiceType =
    clientDetail?.service?.service_type || clientDetail?.service_type;
  const workspaceIsMobile = workspaceServiceType === 'mobile_notary';
  const workspaceReference = String(clientDetail?._id || '')
    .slice(-8)
    .toUpperCase();

  if (!hasClientDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={BookingColors.surface}
        />
        <View style={styles.workspaceHeader}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.headerIconButton}>
            <Feather
              name="arrow-left"
              size={21}
              color={BookingColors.textPrimary}
            />
          </TouchableOpacity>
          <View style={styles.workspaceHeaderCopy}>
            <Text style={styles.workspaceHeaderTitle}>Booking workspace</Text>
            <Text style={styles.workspaceHeaderSubtitle}>
              Loading booking details
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}>
          <ActivityIndicator size="large" color={BookingColors.primary} />
          <Text style={styles.workspaceHeaderSubtitle}>
            Getting the latest booking information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <View style={styles.workspaceHeader}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.headerIconButton}>
          <Feather
            name="arrow-left"
            size={21}
            color={BookingColors.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.workspaceHeaderCopy}>
          <Text style={styles.workspaceHeaderTitle}>Booking workspace</Text>
          <Text style={styles.workspaceHeaderSubtitle}>
            {workspaceReference ? `#${workspaceReference}` : 'Manage service'}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="Contact support"
          activeOpacity={0.7}
          onPress={() => handleCallSupport()}
          style={styles.headerIconButton}>
          <Feather
            name="help-circle"
            size={20}
            color={BookingColors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Message client"
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('ChatScreen', {
              sender: clientDetail?.agent,
              receiver: clientDetail?.booked_by || clientDetail?.client,
              chat: clientDetail?._id,
              channel: clientDetail?.agora_channel_name,
              voiceToken: clientDetail?.agora_channel_token,
            })
          }
          style={[styles.headerIconButton, styles.messageHeaderButton]}>
          <Feather
            name="message-circle"
            size={20}
            color={BookingColors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.workspaceSummary}>
        <View style={styles.summaryTopRow}>
          <View
            style={[
              styles.workspaceStatusBadge,
              {backgroundColor: workspaceStatusStyle.background},
            ]}>
            <Feather
              name={workspaceStatusStyle.icon}
              size={13}
              color={workspaceStatusStyle.color}
            />
            <Text
              style={[
                styles.workspaceStatusText,
                {color: workspaceStatusStyle.color},
              ]}>
              {workspaceStatusLabel}
            </Text>
          </View>
          <View style={styles.workspaceTypeIcon}>
            <Feather
              name={workspaceIsMobile ? 'map-pin' : 'video'}
              size={18}
              color={BookingColors.primary}
            />
          </View>
        </View>
        <Text style={styles.workspaceServiceTitle}>
          {workspaceIsMobile ? 'Mobile notary' : 'Remote online notary'}
        </Text>
        <Text style={styles.workspaceServiceSubtitle}>
          Review the client, documents and next required action.
        </Text>
        {!workspaceIsMobile && (
          <View style={styles.platformFeeNotice}>
            <Feather name="info" size={14} color={BookingColors.info} />
            <Text style={styles.platformFeeText}>
              Notarizr platform fee for this session: $2.99
            </Text>
          </View>
        )}
      </View>

      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {/* Legacy status — hidden, kept for logic compatibility */}
          <View style={styles.legacyStatusContainer}>
            <View style={styles.iconContainer}>
              {(status === 'Pending' ||
                (status === 'to_be_paid' &&
                  clientDetail.payment_type === 'on_agent')) && (
                <Image
                  source={require('../../../../assets/pending.png')}
                  style={styles.greenIcon}
                />
              )}
              {(status === 'Completed' ||
                status === 'Accepted' ||
                status === 'Ongoing' ||
                status === 'Travelling' ||
                status === 'Paid' ||
                status === 'Payment_confirmed' ||
                (status === 'to_be_paid' &&
                  clientDetail.payment_type === 'on_agent')) && (
                <Image
                  source={require('../../../../assets/greenIcon.png')}
                  style={styles.greenIcon}
                />
              )}
              {status === 'To_be_paid' && (
                <>
                  <Image
                    source={require('../../../../assets/greenIcon.png')}
                    style={styles.greenIcon}
                  />
                  {clientDetail.payment_type === 'on_agent' ? (
                    <Text style={styles.insideText}>Accepted</Text>
                  ) : (
                    <Text style={styles.insideText}>To Be Paid</Text>
                  )}
                </>
              )}
              {status !== 'To_be_paid' && (
                <Text style={styles.insideText}>
                  {status === 'Payment_confirmed'
                    ? 'Payment Confirmed'
                    : status}
                </Text>
              )}
              {clientDetail?.agentResquesStatus === 'pending' &&
                (allocationStatus === 'To_be_paid' ? (
                  <>
                    <Image
                      source={require('../../../../assets/greenIcon.png')}
                      style={styles.greenIcon}
                    />
                    <Text style={styles.insideText}>To Be Paid</Text>
                  </>
                ) : (
                  <>
                    <Image
                      source={require('../../../../assets/pending.png')}
                      style={styles.greenIcon}
                    />
                    <Text style={styles.insideText}>
                      {allocationStatus == null ? 'Pending' : allocationStatus}
                    </Text>
                  </>
                ))}
            </View>
          </View>

          <View style={styles.sheetContainer}>
            {/* ── CLIENT DETAILS ── */}
            <Text style={styles.insideHeading}>Client Details</Text>
            <View style={styles.infoCard}>
              {clientDetail.client ? (
                <View style={styles.personRow}>
                  <View style={styles.avatarRing}>
                    <Image
                      source={{
                        uri:
                          clientDetail.client.profile_picture ||
                          'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                      }}
                      style={styles.personAvatar}
                    />
                  </View>
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>
                      {clientDetail.client.first_name}{' '}
                      {clientDetail.client.last_name}
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={BookingColors.textMuted}
                  />
                </View>
              ) : (
                <View style={styles.personRow}>
                  <View style={styles.avatarRing}>
                    <Image
                      source={{
                        uri: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                      }}
                      style={styles.personAvatar}
                    />
                  </View>
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>
                      {clientDetail?.booked_for?.first_name ||
                        clientDetail?.booked_by?.first_name ||
                        clientDetail?.first_name ||
                        ''}{' '}
                      {clientDetail.booked_for?.last_name ||
                        clientDetail.booked_by?.last_name ||
                        clientDetail?.last_name ||
                        ''}
                    </Text>
                    {clientDetail?.booked_for?.email ||
                    clientDetail?.booked_by?.email ||
                    clientDetail?.email ? (
                      <Text style={styles.personMeta}>
                        {clientDetail?.booked_for?.email ||
                          clientDetail?.booked_by?.email ||
                          clientDetail?.email}
                      </Text>
                    ) : null}
                  </View>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={BookingColors.textMuted}
                  />
                </View>
              )}
            </View>

            {/* ── OBSERVERS (existing) ── */}
            {clientDetail.observers && clientDetail.observers.length > 0 && (
              <>
                <Text style={styles.insideHeading}>Observers</Text>
                {clientDetail.observers.map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.infoCard,
                      {
                        marginBottom:
                          idx < clientDetail.observers.length - 1
                            ? 2
                            : undefined,
                      },
                    ]}>
                    <View style={styles.personRow}>
                      <View style={styles.avatarRing}>
                        <Image
                          source={{
                            uri: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                          }}
                          style={styles.personAvatar}
                        />
                      </View>
                      <View style={styles.personInfo}>
                        <Text style={styles.personName}>{item}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* ── WITNESS INVITE ── */}
            {(!clientDetail.observers ||
              (status === 'Paid' && clientDetail.observers.length === 0)) &&
              clientDetail.__typename === 'Session' && (
                <>
                  <Text style={styles.insideHeading}>
                    Make Observers as Witnesses
                  </Text>
                  <View style={styles.infoCard}>
                    <View style={{padding: 14}}>
                      <Text style={styles.witnessDescription}>
                        An Observer is anyone with relevant information for all
                        the signing that may need to be on the notarization
                        session.
                      </Text>
                      <View style={styles.witnessCountRow}>
                        <Text style={styles.witnessCountLabel}>
                          How many witnesses?
                        </Text>
                        <TextInput
                          style={styles.witnessCountInput}
                          placeholder="1"
                          placeholderTextColor={BookingColors.textMuted}
                          keyboardType="numeric"
                          onChangeText={text => {
                            let number = parseInt(text, 10) || 1;
                            if (number > 5) {
                              Toast.show({
                                type: 'error',
                                text1: 'Only 5 observers are allowed',
                              });
                              number = 5;
                            }
                            setNumOfWitnesses(number);
                            setWitnessFields(Array(number).fill(''));
                          }}
                        />
                      </View>
                    </View>
                  </View>

                  {witnessFields.map((_, index) => (
                    <View key={index} style={{marginTop: 8}}>
                      <LabelTextInput
                        placeholder={`Search observer ${index + 1} by email`}
                        value={searchTexts[index]}
                        defaultValue={''}
                        onChangeText={text => handleSearchChange(text, index)}
                        rightImagePress={() => {
                          const updatedSearchTexts = [...searchTexts];
                          updatedSearchTexts[index] = '';
                          setSearchTexts(updatedSearchTexts);
                          setSearchedUser([]);
                          setShowObserverSearchView(false);
                        }}
                        InputStyles={{padding: widthToDp(2)}}
                        AdjustWidth={{
                          width: widthToDp(92),
                          borderColor: BookingColors.primary,
                        }}
                        rightImageSoucre={require('../../../../assets/close.png')}
                      />
                      {showObserverSearchView &&
                      searchFor == 'Observer' &&
                      activeFieldIndex === index &&
                      searchedUser.length !== 0 ? (
                        isLoading ? (
                          <ActivityIndicator
                            size="large"
                            color={BookingColors.primary}
                            style={{height: heightToDp(40)}}
                          />
                        ) : (
                          <ScrollView
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            style={{
                              height: heightToDp(40),
                              marginBottom: widthToDp(3),
                            }}>
                            {searchedUser.map(item => (
                              <TouchableOpacity
                                key={item._id}
                                onPress={() => {
                                  const updatedSearchTexts = [...searchTexts];
                                  updatedSearchTexts[index] = item.email;
                                  setSearchTexts(updatedSearchTexts);
                                  setObservers(prev => [...prev, item]);
                                  setShowObserverSearchView(false);
                                }}
                                style={styles.observerSearchResult}>
                                <Text style={styles.observerSearchResultText}>
                                  {item.email}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )
                      ) : null}
                    </View>
                  ))}

                  {observers.length > 0 &&
                    observers.map(item => (
                      <View
                        key={item._id}
                        style={[styles.infoCard, {marginTop: 8}]}>
                        <View style={styles.personRow}>
                          <View style={styles.avatarRing}>
                            <Image
                              source={{
                                uri:
                                  item?.profile_picture != 'none'
                                    ? item.profile_picture
                                    : 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                              }}
                              style={styles.personAvatar}
                            />
                          </View>
                          <View style={styles.personInfo}>
                            <Text style={styles.personName}>
                              {item.first_name} {item.last_name}
                            </Text>
                            <Text style={styles.personMeta}>{item?.email}</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() =>
                              setObservers(
                                observers.filter(i => i._id !== item._id),
                              )
                            }
                            style={styles.removeObserverBtn}>
                            <Xmark
                              width={16}
                              height={16}
                              strokeWidth={2.5}
                              color={BookingColors.error}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                </>
              )}

            {/* ── LOCATION ── */}
            {(clientDetail.__typename === 'Booking' ||
              clientDetail.__typename === 'Allocation') &&
              clientDetail.address && (
                <>
                  <Text style={[styles.insideHeading, styles.addressMargin]}>
                    Booked For Location
                  </Text>
                  <View style={{paddingHorizontal: 16, marginBottom: 4}}>
                    <AddressCard
                      location={
                        bookedByAddress?.location || clientDetail.address
                      }
                      onPress={handleStartNavigation}
                      booking="true"
                    />
                  </View>
                </>
              )}

            {/* ── NOTARY DOCUMENTS ── */}
            {clientDetail.document_type &&
              clientDetail.document_type.length > 0 && (
                <>
                  <Text style={styles.insideHeading}>Notary Documents</Text>
                  <View style={styles.infoCard}>
                    {clientDetail.document_type.map((item, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.docRow,
                          idx === clientDetail.document_type.length - 1 && {
                            borderBottomWidth: 0,
                          },
                        ]}>
                        <View style={styles.docIconCircle}>
                          <Feather
                            name="file-text"
                            size={14}
                            color={BookingColors.primary}
                          />
                        </View>
                        <Text style={styles.docName}>{item.name}</Text>
                        <View style={styles.docPricePill}>
                          <Text style={styles.docPriceText}>${item.price}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}

            {/* ── PREFERRED DATE & TIME ── */}
            <Text style={styles.insideHeading}>Preferred Date & Time</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconCircle}>
                  <Feather
                    name="calendar"
                    size={14}
                    color={BookingColors.primary}
                  />
                </View>
                <Text style={styles.infoRowText}>
                  {clientDetail.date_time_session
                    ? `${moment(clientDetail.date_time_session).format(
                        'MM/DD/YYYY',
                      )} at ${moment(clientDetail.date_time_session).format(
                        'h:mm a',
                      )}`
                    : clientDetail?.date_of_booking ||
                      clientDetail?.time_of_booking
                    ? `${moment(clientDetail?.date_of_booking).format(
                        'MM/DD/YYYY',
                      )} at ${clientDetail.time_of_booking}`
                    : clientDetail?.preferredDate
                    ? `${moment(clientDetail?.preferredDate).format(
                        'MM/DD/YYYY',
                      )} at ${clientDetail.preferredTime}`
                    : '—'}
                </Text>
              </View>
            </View>

            {/* ── PAYING AMOUNT ── */}
            {clientDetail.__typename === 'Booking' &&
              typeof clientDetail.totalPrice === 'number' && (
                <>
                  <Text style={styles.insideHeading}>Paying Amount</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>Total Price</Text>
                      <View style={styles.amountBadge}>
                        <Text style={styles.amountBadgeText}>
                          ${totalPrice}
                          {status === 'Accepted' || status === 'Paid'
                            ? '  ✓ Paid'
                            : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

            {/* ── ADDITIONAL SIGNATURES ── */}
            {typeof clientDetail.total_signatures_required === 'number' && (
              <>
                <Text style={styles.insideHeading}>
                  Additional Signature Documents
                </Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconCircle}>
                      <Feather
                        name="edit-3"
                        size={14}
                        color={BookingColors.primary}
                      />
                    </View>
                    <Text style={styles.infoRowText}>
                      {clientDetail.total_signatures_required} additional{' '}
                      {clientDetail.total_signatures_required === 1
                        ? 'signature'
                        : 'signatures'}{' '}
                      required
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* ── PRINT UPLOADED DOCUMENTS ── */}
            {clientDetail.documents && clientDetail.documents.length > 0 && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.insideHeading}>
                    Print Uploaded Documents
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleNotarizrDocumentPress(
                        clientDetail.documents,
                        'printuploaded',
                      )
                    }
                    style={styles.downloadBtn}>
                    {loadingStates.printuploaded ? (
                      <ActivityIndicator
                        size="small"
                        color={BookingColors.white}
                      />
                    ) : (
                      <>
                        <Feather
                          name="download"
                          size={12}
                          color={BookingColors.white}
                        />
                        <Text style={styles.downloadBtnText}>Download</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.infoCard}>
                  {clientDetail.documents.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleDocumentPress(item.url)}
                      style={[
                        styles.docListItem,
                        index === clientDetail.documents.length - 1 && {
                          borderBottomWidth: 0,
                        },
                      ]}>
                      <View style={styles.docListIcon}>
                        <Feather
                          name="file"
                          size={16}
                          color={BookingColors.textSecondary}
                        />
                      </View>
                      <Text style={styles.docListName}>
                        Document {index + 1}
                      </Text>
                      <View style={styles.docListAction}>
                        <Feather
                          name="eye"
                          size={14}
                          color={BookingColors.primary}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* ── REQUESTED AMOUNT ── */}
            {clientDetail.payment_type == 'on_notarizr' && (
              <>
                <Text style={styles.insideHeading}>Requested Amount</Text>
                <View style={styles.infoCard}>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Session Fee</Text>
                    <View style={styles.amountBadge}>
                      <Text style={styles.amountBadgeText}>
                        ${price}
                        {status === 'Accepted' || status === 'Paid'
                          ? '  ✓ Paid'
                          : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* ── ID OPTIONS ── */}
            {clientDetail.identity_authentication && (
              <>
                <Text style={styles.insideHeading}>ID Options</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconCircle}>
                      <Feather
                        name="credit-card"
                        size={14}
                        color={BookingColors.primary}
                      />
                    </View>
                    <Text style={styles.infoRowLabel}>
                      Identity Verification
                    </Text>
                    <View style={styles.idChip}>
                      <Text style={styles.idChipText}>
                        {clientDetail.identity_authentication == 'user_id'
                          ? 'ID Card'
                          : clientDetail.identity_authentication ==
                            'user_passport'
                          ? 'Passport'
                          : 'User Choice'}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* ── AUTH SELECTION ── */}
            {!clientDetail.identity_authentication &&
              clientDetail.__typename === 'Session' &&
              status === 'Paid' && (
                <View style={styles.headingContainer}>
                  <Text
                    style={[
                      styles.insideHeading,
                      {marginHorizontal: widthToDp(2)},
                    ]}>
                    Choose Client Session Authentication
                  </Text>
                  <View style={styles.authbuttoncontainer}>
                    <MainButton
                      Title="Allow user to choose"
                      colors={
                        selected === 'client_choose'
                          ? [BookingColors.primary, BookingColors.primary]
                          : [
                              BookingColors.borderStrong,
                              BookingColors.borderStrong,
                            ]
                      }
                      GradiStyles={{
                        paddingVertical: heightToDp(1),
                        paddingHorizontal: widthToDp(5),
                      }}
                      styles={{
                        padding: heightToDp(2),
                        fontSize: widthToDp(3.5),
                      }}
                      onPress={() => setSelected('client_choose')}
                    />
                    <MainButton
                      Title="ID Card"
                      colors={
                        selected === 'user_id'
                          ? [BookingColors.primary, BookingColors.primary]
                          : [
                              BookingColors.borderStrong,
                              BookingColors.borderStrong,
                            ]
                      }
                      GradiStyles={{
                        paddingVertical: heightToDp(1),
                        paddingHorizontal: widthToDp(5),
                      }}
                      styles={{
                        padding: heightToDp(2),
                        fontSize: widthToDp(3.5),
                      }}
                      onPress={() => setSelected('user_id')}
                    />
                    <MainButton
                      Title="Passport"
                      colors={
                        selected === 'user_passport'
                          ? [BookingColors.primary, BookingColors.primary]
                          : [
                              BookingColors.borderStrong,
                              BookingColors.borderStrong,
                            ]
                      }
                      GradiStyles={{
                        paddingVertical: heightToDp(1),
                        paddingHorizontal: widthToDp(5),
                      }}
                      styles={{
                        padding: heightToDp(2),
                        fontSize: widthToDp(3.5),
                      }}
                      onPress={() => setSelected('user_passport')}
                    />
                  </View>
                </View>
              )}

            {/* ── CLIENT UPLOADED DOCS (no agent_document) ── */}
            {!clientDetail.agent_document &&
              clientDetail.documents &&
              clientDetail.documents.length > 0 && (
                <>
                  <Text style={styles.insideHeading}>
                    Client Uploaded Documents
                  </Text>
                  <View style={styles.infoCard}>
                    <TouchableOpacity
                      style={[
                        styles.docListItem,
                        {
                          borderBottomWidth: 1,
                          borderBottomColor: BookingColors.border,
                        },
                      ]}>
                      <View style={styles.docListIcon}>
                        <Feather
                          name="printer"
                          size={16}
                          color={BookingColors.textSecondary}
                        />
                      </View>
                      <Text style={styles.docListName}>Print Invoice</Text>
                      <View style={styles.docListAction}>
                        <Feather
                          name="chevron-right"
                          size={14}
                          color={BookingColors.primary}
                        />
                      </View>
                    </TouchableOpacity>
                    {clientDetail.documents.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.docListItem,
                          index === clientDetail.documents.length - 1 && {
                            borderBottomWidth: 0,
                          },
                        ]}>
                        <View style={styles.docListIcon}>
                          <Feather
                            name="file"
                            size={16}
                            color={BookingColors.textSecondary}
                          />
                        </View>
                        <Text style={styles.docListName}>
                          Document {index + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

            {/* ── CLIENT_DOCUMENTS ── */}
            {clientDetail.client_documents &&
              Object.values(clientDetail.client_documents)?.length > 0 && (
                <>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.insideHeading}>
                      Client Uploaded Documents
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleNotarizrDocumentPress(
                          clientDetail.client_documents,
                          'clientuploaded',
                        )
                      }
                      style={styles.downloadBtn}>
                      {loadingStates.clientuploaded ? (
                        <ActivityIndicator
                          size="small"
                          color={BookingColors.white}
                        />
                      ) : (
                        <>
                          <Feather
                            name="download"
                            size={12}
                            color={BookingColors.white}
                          />
                          <Text style={styles.downloadBtnText}>Download</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.infoCard}>
                    {Object.values(clientDetail.client_documents)?.map(
                      (item, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleDocumentPress(item)}
                          style={[
                            styles.docListItem,
                            index ===
                              Object.values(clientDetail.client_documents)
                                .length -
                                1 && {
                              borderBottomWidth: 0,
                            },
                          ]}>
                          <View style={styles.docListIcon}>
                            <Feather
                              name="file"
                              size={16}
                              color={BookingColors.textSecondary}
                            />
                          </View>
                          <Text style={styles.docListName}>
                            Document {index + 1}
                          </Text>
                          <View style={styles.docListAction}>
                            <Feather
                              name="eye"
                              size={14}
                              color={BookingColors.primary}
                            />
                          </View>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </>
              )}

            {/* ── AGENT UPLOADED DOCS ── */}
            {clientDetail.agent_document &&
              clientDetail.agent_document.length > 0 && (
                <>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.insideHeading}>
                      Agent Uploaded Documents
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleNotarizrDocumentPress(
                          clientDetail.agent_document,
                          'agentuploaded',
                        )
                      }
                      style={styles.downloadBtn}>
                      {loadingStates.agentuploaded ? (
                        <ActivityIndicator
                          size="small"
                          color={BookingColors.white}
                        />
                      ) : (
                        <>
                          <Feather
                            name="download"
                            size={12}
                            color={BookingColors.white}
                          />
                          <Text style={styles.downloadBtnText}>Download</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.infoCard}>
                    {clientDetail.agent_document?.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleDocumentPress(item)}
                        style={[
                          styles.docListItem,
                          index === clientDetail.agent_document.length - 1 && {
                            borderBottomWidth: 0,
                          },
                        ]}>
                        <View style={styles.docListIcon}>
                          <Feather
                            name="file"
                            size={16}
                            color={BookingColors.textSecondary}
                          />
                        </View>
                        <Text style={styles.docListName}>
                          Document {index + 1}
                        </Text>
                        <View style={styles.docListAction}>
                          <Feather
                            name="eye"
                            size={14}
                            color={BookingColors.primary}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

            {/* ── NOTARIZED DOCS ── */}
            {clientDetail.notarized_docs &&
              clientDetail.notarized_docs.length > 0 && (
                <>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.insideHeading}>
                      Notarized Documents
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleNotarizrDocumentPress(
                          clientDetail.notarized_docs,
                          'notarydocuments',
                        )
                      }
                      style={styles.downloadBtn}>
                      {loadingStates.notarydocuments ? (
                        <ActivityIndicator
                          size="small"
                          color={BookingColors.white}
                        />
                      ) : (
                        <>
                          <Feather
                            name="download"
                            size={12}
                            color={BookingColors.white}
                          />
                          <Text style={styles.downloadBtnText}>Download</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.infoCard}>
                    {clientDetail.notarized_docs?.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleDocumentPress(item)}
                        style={[
                          styles.docListItem,
                          index === clientDetail.notarized_docs.length - 1 && {
                            borderBottomWidth: 0,
                          },
                        ]}>
                        <View
                          style={[
                            styles.docListIcon,
                            {backgroundColor: BookingColors.successSoft},
                          ]}>
                          <Feather
                            name="file-text"
                            size={16}
                            color={BookingColors.success}
                          />
                        </View>
                        <Text style={styles.docListName}>
                          Notarized Doc {index + 1}
                        </Text>
                        <View
                          style={[
                            styles.docListAction,
                            {backgroundColor: BookingColors.successSoft},
                          ]}>
                          <Feather
                            name="eye"
                            size={14}
                            color={BookingColors.success}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

            {/* PDF Modal */}
            <Modal visible={showModal} animationType="slide">
              <PdfView
                style={styles.pdfView}
                source={{uri: filePath}}
                trustAllCerts={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                enablePaging={true}
                minScale={1.0}
                maxScale={20.0}
                scale={1.0}
                spacing={0}
                fitPolicy={0}
                onLoadComplete={(numberOfPages, filePath) => {
                  console.log('completed');
                }}
                onPageChanged={(page, numberOfPages) => {}}
                onError={error => console.error(error)}
              />
              <View style={styles.modalButtons}>
                <Button title="Download" onPress={openLocalFile} />
                <Button title="Close" onPress={cancelTaskAndCloseModal} />
              </View>
            </Modal>

            {/* ── PAYMENT DETAILS (Booking) ── */}
            {clientDetail.__typename === 'Booking' && (
              <>
                <Text style={styles.insideHeading}>Payment Details</Text>
                <View style={styles.infoCard}>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Notary Charges</Text>
                    <Text style={styles.paymentValue}>
                      ${highestPriceDocument?.price}
                    </Text>
                  </View>
                  {typeof clientDetail.total_signatures_required ===
                    'number' && (
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>
                        Additional Signatures (
                        {clientDetail.total_signatures_required} × $10)
                      </Text>
                      <Text style={styles.paymentValue}>
                        ${additionalSignatureCharges}
                      </Text>
                    </View>
                  )}
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Printing Charges</Text>
                    <Text style={styles.paymentValue}>
                      ${clientDetail.documents.length > 0 ? 10 : 0}
                    </Text>
                  </View>
                  <View style={[styles.paymentRow, styles.paymentTotalRow]}>
                    <Text style={styles.paymentTotalLabel}>Total</Text>
                    <Text style={styles.paymentTotalValue}>
                      ${clientDetail.totalPrice}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* ── BOOKED FOR ── */}
            {booked_for?.first_name && (
              <>
                <Text style={styles.insideHeading}>Booked For</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconCircle}>
                      <Feather
                        name="user"
                        size={14}
                        color={BookingColors.primary}
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.infoRowText}>
                        {booked_for?.first_name} {booked_for?.last_name}
                      </Text>
                      {booked_for?.phone_number ? (
                        <Text style={styles.personMeta}>
                          {booked_for?.phone_number}
                        </Text>
                      ) : null}
                      {booked_for?.location ? (
                        <Text style={styles.personMeta}>
                          {capitalizeFirstLetter(booked_for?.location)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </>
            )}

            <View style={{height: 8}} />
          </View>

          {/* ── NOTES ── */}
          {showNotes && (
            <View style={{paddingHorizontal: 16, marginBottom: 8}}>
              <LabelTextInput
                LabelTextInput="Notes"
                placeholder="Write notes here"
                Label={true}
                onChangeText={(text: React.SetStateAction<string>) =>
                  setNotes(text)
                }
              />
            </View>
          )}

          {/* ── ACTION BUTTONS ── */}
          <View style={styles.actionContainer}>
            {clientDetail.__typename !== 'Booking' && status === 'Paid' && (
              <TouchableOpacity
                style={[styles.primaryBtn, loadingUpdate && styles.btnDisabled]}
                onPress={() => {
                  handleClientData();
                  handleStatusChange('accepted');
                }}
                disabled={loadingUpdate}>
                {loadingUpdate ? (
                  <ActivityIndicator size="small" color={BookingColors.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Update</Text>
                )}
              </TouchableOpacity>
            )}

            {allocationStatus == null &&
              (clientDetail?.__typename == 'Allocation' ||
                status === 'Pending') && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      loadingAccept && styles.btnDisabled,
                    ]}
                    onPress={() => {
                      if (clientDetail?.__typename !== 'Allocation') {
                        handleStatusChange('to_be_paid');
                        handleClientData();
                      } else {
                        handleAllocationAccept(clientDetail?._id);
                      }
                    }}
                    disabled={loadingAccept}>
                    {loadingAccept ? (
                      <ActivityIndicator
                        size="small"
                        color={BookingColors.white}
                      />
                    ) : (
                      <Text style={styles.primaryBtnText}>Accept Booking</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dangerBtn,
                      loadingReject && styles.btnDisabled,
                    ]}
                    onPress={() => {
                      if (clientDetail?.__typename !== 'Allocation') {
                        handleStatusChange('rejected');
                      } else {
                        handleAllocationReject(clientDetail?._id);
                      }
                    }}
                    disabled={loadingReject}>
                    {loadingReject ? (
                      <ActivityIndicator
                        size="small"
                        color={BookingColors.error}
                      />
                    ) : (
                      <Text style={styles.dangerBtnText}>Decline Booking</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

            {/* RON — Accepted / Ongoing / Payment_confirmed */}
            {clientDetail?.service_type !== 'mobile_notary' &&
              (status === 'Accepted' ||
                status === 'Ongoing' ||
                status === 'Payment_confirmed') &&
              !isStorageLoading && (
                <>
                  {status === 'Accepted' && (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() =>
                        navigation.navigate('NotaryCallScreen', {
                          routeFrom: 'agent',
                          uid: clientDetail?._id,
                          channel: clientDetail?.agora_channel_name,
                          token: clientDetail?.agora_channel_token,
                          date: clientDetail?.date_of_booking,
                          time: clientDetail?.time_of_booking,
                        })
                      }>
                      <Text style={styles.primaryBtnText}>Join Session</Text>
                    </TouchableOpacity>
                  )}
                  {clientDetail.payment_type == 'on_notarizr' &&
                    status !== 'Accepted' &&
                    status == 'To_be_paid' && (
                      <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => handlePresentModalPress()}>
                        <Text style={styles.primaryBtnText}>
                          Request Payment [RON]
                        </Text>
                      </TouchableOpacity>
                    )}
                </>
              )}

            {/* RON — To_be_paid */}
            {clientDetail?.service_type !== 'mobile_notary' &&
              status === 'To_be_paid' && (
                <>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => {
                      if (clientDetail.payment_type == 'on_notarizr') {
                        handlePresentModalPress();
                      } else {
                        navigation.navigate('NotaryCallScreen', {
                          routeFrom: 'agent',
                          uid: clientDetail?._id,
                          channel: clientDetail?.agora_channel_name,
                          token: clientDetail?.agora_channel_token,
                          date: clientDetail?.date_of_booking,
                          time: clientDetail?.time_of_booking,
                        });
                      }
                    }}>
                    <Text style={styles.primaryBtnText}>
                      {clientDetail.payment_type == 'on_notarizr'
                        ? 'Request Payment [RON]'
                        : 'Join Session'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

            {/* Mobile Notary */}
            {clientDetail?.service_type === 'mobile_notary' &&
              (status === 'Accepted' ||
                status === 'Ongoing' ||
                status === 'Travelling') && (
                <>
                  {status === 'Accepted' && (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={handleStartNavigation}>
                      <Text style={styles.primaryBtnText}>
                        Start Navigation
                      </Text>
                    </TouchableOpacity>
                  )}
                  {status === 'Travelling' && (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => handleStatusChange('ongoing')}>
                      <Text style={styles.primaryBtnText}>Start Notary</Text>
                    </TouchableOpacity>
                  )}
                  {status === 'Ongoing' && (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => handleStatusChange('completed')}>
                      <Text style={styles.primaryBtnText}>End Notary</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

            {/* Ongoing — upload */}
            {notary === 'Ongoing' && (!notaryBlock || !signaturePage) && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setIsVisible(true)}>
                <Text style={styles.primaryBtnText}>Upload Documents</Text>
              </TouchableOpacity>
            )}

            {signaturePage &&
              notaryBlock &&
              !showNotes &&
              status !== 'Completed' && (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => handleNext()}>
                  <Text style={styles.primaryBtnText}>Next</Text>
                </TouchableOpacity>
              )}

            {showNotes && (
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={() => handleComplete()}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color={BookingColors.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Complete Notary</Text>
                )}
              </TouchableOpacity>
            )}

            {notary === 'Ongoing' && (
              <View style={styles.dashedContainer}>
                <Text style={styles.supportText}>
                  If you have any issues completing this Notary service, please
                  contact customer support.
                </Text>
                <TouchableOpacity onPress={() => handleCallSupport()}>
                  <Text style={styles.supportLink}>Contact Support</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{height: 32}} />
          </View>
        </ScrollView>

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}>
          <RequestPayment
            amount={AmountEntered}
            onChangeText={(text: number) => setAmountEntered(text)}
            onPress={() => setBookingAmount()}
          />
        </BottomSheetModal>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BookingColors.surface,
  },
  workspaceHeader: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  messageHeaderButton: {
    marginLeft: 8,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.primarySoft,
  },
  workspaceHeaderCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  workspaceHeaderTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
  },
  workspaceHeaderSubtitle: {
    marginTop: 1,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  workspaceSummary: {
    margin: 16,
    padding: 20,
    borderRadius: 8,
    backgroundColor: BookingColors.textPrimary,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workspaceStatusBadge: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderRadius: 7,
  },
  workspaceStatusText: {
    marginLeft: 5,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  workspaceTypeIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  workspaceServiceTitle: {
    marginTop: 12,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 21,
  },
  workspaceServiceSubtitle: {
    marginTop: 4,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
  },
  platformFeeNotice: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 11,
    borderRadius: 8,
    backgroundColor: BookingColors.infoSoft,
  },
  platformFeeText: {
    flex: 1,
    marginLeft: 8,
    color: BookingColors.info,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  legacyStatusContainer: {
    display: 'none',
  },
  lightHeading: {
    color: BookingColors.textPrimary,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    marginHorizontal: widthToDp(2),
  },
  insideText: {
    marginHorizontal: widthToDp(3),
    fontSize: widthToDp(4.5),
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
  },
  Heading: {
    color: BookingColors.textPrimary,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    marginLeft: widthToDp(2),
  },
  dashedContainer: {
    marginVertical: widthToDp(3),
    marginHorizontal: widthToDp(5),
    borderWidth: 3,
    borderColor: BookingColors.textSecondary,
    borderStyle: 'dashed',
    backgroundColor: BookingColors.primarySoft,
    borderRadius: 10,
    padding: widthToDp(2),
  },
  headingContainer: {
    marginLeft: widthToDp(5),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    flex: 3,
    color: BookingColors.textSecondary,
    fontSize: 10,
    fontFamily: 'Manrope-Bold',
    marginTop: 18,
    marginBottom: 9,
    marginHorizontal: 20,
    textTransform: 'uppercase',
  },
  insideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightToDp(2),
    // marginHorizontal: widthToDp(5),
  },
  flexContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightToDp(2),
    marginHorizontal: widthToDp(5),
  },
  iconContainer: {
    alignContent: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },

  greenIcon: {
    width: widthToDp(5),
    height: heightToDp(5),
  },
  preference: {
    marginLeft: widthToDp(4),
    marginVertical: widthToDp(1),
    fontSize: widthToDp(4),
    color: BookingColors.textSecondary,
  },
  detail: {
    marginLeft: widthToDp(2),
    marginVertical: widthToDp(2),
    fontSize: widthToDp(4),
    color: BookingColors.textSecondary,
  },
  sheetContainer: {
    backgroundColor: BookingColors.backgroundSubtle,
  },
  locationImage: {
    width: widthToDp(7),
    height: heightToDp(7),
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: widthToDp(6),
  },
  buttonBottom: {
    marginTop: heightToDp(3),
  },
  authbuttoncontainer: {
    flexDirection: 'row',
    marginTop: heightToDp(3),
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
    rowGap: widthToDp(2),
    columnGap: heightToDp(1),
    marginHorizontal: widthToDp(2),
  },
  buttonFlex: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  addressMargin: {
    marginTop: heightToDp(4),
    marginBottom: heightToDp(-2),
  },
  pdfView: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  downloadButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 15,
  },
  uplodaText: {
    flex: 3,
  },
  downloadButton: {
    width: 120,
    backgroundColor: BookingColors.primary,
    padding: 10,
    borderRadius: 5,
  },
  downloadButtonText: {
    color: BookingColors.white,
    fontSize: 16,
    textAlign: 'center',
  },

  // ── Modern card-based design system ──
  infoCard: {
    backgroundColor: BookingColors.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: BookingColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: BookingColors.textPrimary,
  },
  personMeta: {
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    color: BookingColors.textSecondary,
    marginTop: 2,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  docIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BookingColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  docName: {
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    color: BookingColors.textPrimary,
  },
  docPricePill: {
    backgroundColor: BookingColors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  docPriceText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: BookingColors.success,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BookingColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoRowText: {
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    color: BookingColors.textPrimary,
  },
  infoRowLabel: {
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    color: BookingColors.textSecondary,
  },
  idChip: {
    backgroundColor: BookingColors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  idChipText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: BookingColors.primary,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  amountLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    color: BookingColors.textSecondary,
  },
  amountBadge: {
    backgroundColor: BookingColors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  amountBadgeText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: BookingColors.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  paymentLabel: {
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    color: BookingColors.textSecondary,
    marginRight: 8,
  },
  paymentValue: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: BookingColors.textPrimary,
  },
  paymentTotalRow: {
    borderBottomWidth: 0,
    paddingVertical: 14,
  },
  paymentTotalLabel: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: BookingColors.textPrimary,
  },
  paymentTotalValue: {
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
    color: BookingColors.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BookingColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 5,
  },
  downloadBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: BookingColors.white,
  },
  docListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  docListIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: BookingColors.backgroundSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docListName: {
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    color: BookingColors.textPrimary,
  },
  docListAction: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeObserverBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: BookingColors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  witnessDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: BookingColors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  witnessCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  witnessCountLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    color: BookingColors.textSecondary,
    flex: 1,
  },
  witnessCountInput: {
    borderWidth: 1.5,
    borderColor: BookingColors.primary,
    borderRadius: 10,
    width: 56,
    height: 44,
    textAlign: 'center',
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: BookingColors.textPrimary,
  },
  observerSearchResult: {
    borderWidth: 1,
    borderColor: BookingColors.border,
    padding: 12,
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: BookingColors.surface,
  },
  observerSearchResultText: {
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    color: BookingColors.textPrimary,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: BookingColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: BookingColors.white,
  },
  secondaryBtn: {
    backgroundColor: BookingColors.surface,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BookingColors.borderStrong,
  },
  secondaryBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: BookingColors.textPrimary,
  },
  dangerBtn: {
    backgroundColor: BookingColors.errorSoft,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: BookingColors.error,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  supportText: {
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  supportLink: {
    marginTop: 8,
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    alignSelf: 'flex-end',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
});
