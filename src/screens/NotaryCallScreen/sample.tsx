import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  ActivityIndicator, Modal, DeviceEventEmitter, Button, Dimensions
} from 'react-native';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import { formatDateTime, heightToDp, widthToDp } from '../../../utils/Responsive';
import DocumentComponent from '../../../components/DocumentComponent/DocumentComponent';
import MainButton from '../../../components/MainGradientButton/MainButton';
import NavigationHeader from '../../../components/Navigation Header/NavigationHeader';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import useBookingStatus from '../../../hooks/useBookingStatus';
import { useDispatch, useSelector } from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../../features/booking/bookingSlice';
import DocumentScanner from 'react-native-document-scanner-plugin';
import moment from 'moment';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import useRegister from '../../../hooks/useRegister';
import useFetchBooking from '../../../hooks/useFetchBooking';
import useCustomerSuport from '../../../hooks/useCustomerSupport';
import Toast from 'react-native-toast-message';
import UploadDocsSheet from '../../../components/UploadDocsSheet/UploadDocsSheet';
import { useSession } from '../../../hooks/useSession';
import { useLiveblocks } from '../../../store/liveblocks';
import Loading from '../../../components/LiveBlocksComponents/loading';
import RequestPayment from '../../../components/RequestPayment/RequestPayment';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CheckCircle, CheckCircleSolid, Xmark } from 'iconoir-react-native';
import useFetchUser from '../../../hooks/useFetchUser';
import {
  UPDATE_OR_CREATE_BOOKING_CLIENT_DOCS,
  UPDATE_OR_CREATE_SESSION_CLIENT_DOCS,
  UPDATE_SESSION_CLIENT_DOCS,
} from '../../../../request/mutations/updateSessionClientDocs';
import AddressCard from '../../../components/AddressCard/AddressCard';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_SESSION_BY_ID } from '../../../../request/queries/getSessionByID.query';
import { UPDATE_SESSION_PRICEDOCS } from '../../../../request/mutations/updateSessionPriceDocs.mutation';

export default function AgentMobileNotaryStartScreen({ route, navigation }) {
  const downloadPdf = useRef(null);
  const clientDetail = useSelector(state => state?.booking?.booking);
  const { handlegetBookingStatus, handleSessionStatus, handleUpdateBookingStatus } = useBookingStatus();
  const { handleupdateBookingInfo, setSessionPrice, setBookingPrice, fetchBookingByID, updateAgentdocs } = useFetchBooking();
  const { handleCallSupport } = useCustomerSuport();
  const { updateSession, handleSessionUpdation, getSessionByID } = useSession();
  const { searchUserByEmail } = useFetchUser();
  let { documents: documentArray } = clientDetail;
  const { booked_for } = clientDetail;
  const { proof_documents } = clientDetail;
  const dispatch = useDispatch();
  const [status, setStatus] = useState();
  const [isVisible, setIsVisible] = useState(false);
  const enterRoom = useLiveblocks(state => state.liveblocks.enterRoom);
  const leaveRoom = useLiveblocks(state => state.liveblocks.leaveRoom);
  const [notary, setNotary] = useState();
  const [showNotes, setShowNotes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [notes, setNotes] = useState('');
  const [signaturePage, setSignaturePage] = useState();
  const [notaryBlock, setNotaryBlock] = useState();
  const [AmountEntered, setAmountEntered] = useState<number>(0);
  const [searchFor, setSearchFor] = useState('');
  const [showObserverSearchView, setShowObserverSearchView] = useState(false);
  const [searchedUser, setSearchedUser] = useState([]);
  const [observers, setObservers] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [uploadShow, setUploadShow] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('on_notarizr');
  const [price, setPrice] = useState(clientDetail.price);
  const [totalPrice, setTotalPrice] = useState(clientDetail.totalPrice);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [filePath, setFilePath] = useState(`${RNFS.DocumentDirectoryPath}/react-native.pdf`);
  const [newPdfSaved, setNewPdfSaved] = useState(false);
  const [newPdfPath, setNewPdfPath] = useState(null);
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [lastRNBFTask, setLastRNBFTask] = useState({ cancel: () => { } });
  const [navigationStatus, setNavigationStatus] = useState('');
  const [selected, setSelected] = useState('client_choose');
  const [bookedByAddress, setBookedByAddress] = useState(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getBookingStatus();
      setRefreshing(false);
      console.log('Refreshing.....');
    }, 2000);
  }, []);

  const { uploadMultipleFiles, uploadAllDocuments, uploadDocArray } = useRegister();

  const [updateSessionClientDocs] = useMutation(UPDATE_OR_CREATE_SESSION_CLIENT_DOCS);
  const [updateSessionAgentDocs] = useMutation(UPDATE_SESSION_PRICEDOCS);
  const [updateBookingClientDocs] = useMutation(UPDATE_OR_CREATE_BOOKING_CLIENT_DOCS);

  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['25%', '40%'], []);
  const [getSession] = useLazyQuery(GET_SESSION_BY_ID);

  const handleClientData = async () => {
    setLoadingUpdate(true);
    if (clientDetail?.service_type === 'mobile_notary' && status === 'Accepted') {
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
      const params = {
        sessionId: clientDetail?._id,
        identityAuthentication: selected,
        observers: observers.map(item => item.email),
        paymentType: paymentMethod,
      };
      const response = await handleSessionUpdation(params);
      if (response.status === '200') {
        const sessionData = await getSessionByID(clientDetail?._id);
        if (response.status === '200') {
          dispatch(setBookingInfoState(sessionData));
        }
      }
    }
    setLoadingUpdate(false);
  };

  const handleUpdateClientStatus = async updatestatus => {
    await updateSession(updatestatus, clientDetail?._id);
  };

  const getBookingStatus = async () => {
    let statusUpdate;
    try {
      if (clientDetail?.__typename === 'Session') {
        statusUpdate = await handleSessionStatus(clientDetail?._id);
      } else {
        statusUpdate = await handlegetBookingStatus(clientDetail?._id);
      }
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
  }, [status]);

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

  const handleCancelFileDownload = async () => {
    if (lastRNBFTask) {
      try {
        await lastRNBFTask.cancel();
      } catch (e) {
        console.error('Error cancelling file download:', e);
      }
    }
  };

  const handleGetDocument = () => {
    setLoading(true);
    if (clientDetail?.__typename === 'Booking') {
      fetchBookingByID(clientDetail?._id);
    } else if (clientDetail?.__typename === 'Session') {
      getSession({
        variables: { sessionId: clientDetail?._id },
        onCompleted: data => {
          dispatch(setBookingInfoState(data.getSessionById));
        },
        onError: error => {
          console.error('Error fetching session:', error);
        },
      });
    }
    setLoading(false);
  };

  const callSupport = () => {
    handleCallSupport(
      `Booking ID: ${clientDetail?.bookingId || clientDetail?._id}`,
    );
  };

  useEffect(() => {
    const bookingDoc = clientDetail?.documents.find(
      item => item.type === 'identity_verification',
    );
    if (bookingDoc) {
      setNotaryBlock(bookingDoc?.notary_block);
      setSignaturePage(bookingDoc?.signature_page);
    }
  }, [clientDetail]);

  useEffect(() => {
    setisLoading(true);
    const getAddress = async () => {
      try {
        let address = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${clientDetail?.booked_by?.current_location?.coordinates[1]},${clientDetail?.booked_by?.current_location?.coordinates[0]}&key=AIzaSyDtdPHg0-7dZDPGBXNQQKqS6oG9b56wdOc`,
        );
        let responseJson = await address.json();
        setBookedByAddress(responseJson?.results[0]?.formatted_address);
      } catch (error) {
        console.error(error);
      }
    };
    getAddress();
    setisLoading(false);
  }, [clientDetail]);

  const handlePdfSave = async path => {
    try {
      const newPath = `${RNFS.DocumentDirectoryPath}/${moment().unix()}.pdf`;
      await RNFS.moveFile(path, newPath);
      setNewPdfPath(newPath);
      setFilePath(newPath);
      setNewPdfSaved(true);
      setFileDownloaded(false);
      Toast.show({
        type: 'success',
        text1: 'File saved successfully',
      });
    } catch (e) {
      console.error('Error saving PDF:', e);
    }
  };

  const openDownloadModal = document => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  const handleDownload = async url => {
    setLoading(true);
    const downloadTask = RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
      progress: res => {
        const progressPercent = Math.round(
          (res.bytesWritten / res.contentLength) * 100,
        );
        console.log(`Downloaded: ${progressPercent}%`);
      },
    });

    setLastRNBFTask(downloadTask);
    downloadTask.promise
      .then(() => {
        setFileDownloaded(true);
        setShowModal(false);
        setLoading(false);
      })
      .catch(err => {
        console.error('Download error:', err);
        setLoading(false);
      });
  };

  const closeDownloadModal = () => {
    setShowModal(false);
  };

  const renderDoc = ({ item }) => (
    <DocumentComponent
      key={item._id}
      document={item}
      openDownloadModal={openDownloadModal}
    />
  );

  const handleSubmitNotes = async () => {
    if (!notes) {
      Toast.show({
        type: 'error',
        text1: 'Please enter notes',
      });
      return;
    }
    try {
      const updated = await updateSessionAgentDocs({
        variables: {
          sessionId: clientDetail?._id,
          notaryBlock,
          signaturePage,
          notes,
        },
      });
      if (updated.data.updateSessionPriceDocs.success) {
        setShowNotes(false);
        setNotary(null);
        setSignaturePage(null);
        setNotaryBlock(null);
        setNotes('');
        setNewPdfSaved(false);
        setFileDownloaded(false);
        Toast.show({
          type: 'success',
          text1: 'Documents submitted successfully',
        });
      }
    } catch (error) {
      console.error('Error updating session agent docs:', error);
      Toast.show({
        type: 'error',
        text1: 'Error submitting documents',
      });
    }
  };

  const handleObserverSearch = async () => {
    setShowObserverSearchView(true);
    const response = await searchUserByEmail(searchFor);
    setSearchedUser(response.data.searchUserByEmail);
  };

  const handleObserverSelect = observer => {
    if (observers.length < 5) {
      setObservers(prev => [...prev, observer]);
    }
    setSearchFor('');
    setSearchedUser([]);
    setShowObserverSearchView(false);
  };

  const handleObserverRemove = observer => {
    const filtered = observers.filter(item => item.email !== observer.email);
    setObservers(filtered);
  };

  const renderObserver = observer => (
    <View key={observer.email} style={styles.observerContainer}>
      <Text>{observer.email}</Text>
      <TouchableOpacity
        onPress={() => handleObserverRemove(observer)}
        style={styles.removeObserverButton}
      >
        <Xmark width={24} height={24} color="black" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        navigation={navigation}
        title="Service Details"
        callSupport={callSupport}
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
        keyboardVerticalOffset={heightToDp(10)}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <ClientServiceCard
              clientDetail={clientDetail}
              bookedByAddress={bookedByAddress}
            />
          </View>
          <View style={styles.documentsContainer}>
            {documentArray.length > 0 ? (
              documentArray.map(renderDoc)
            ) : (
              <Text style={styles.noDocumentsText}>No documents found</Text>
            )}
          </View>
          {uploadShow && (
            <View style={styles.uploadContainer}>
              <GradientButton
                title="Upload Documents"
                onPress={() => bottomSheetModalRef.current?.present()}
              />
            </View>
          )}
          <View style={styles.buttonContainer}>
            <MainButton title="Next" onPress={handleNext} />
          </View>
        </ScrollView>
        {showModal && (
          <Modal
            transparent={true}
            visible={showModal}
            onRequestClose={closeDownloadModal}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Download Document</Text>
                <Text style={styles.modalDescription}>
                  Are you sure you want to download this document?
                </Text>
                {loading ? (
                  <ActivityIndicator size="large" color={Colors.primary} />
                ) : (
                  <View style={styles.modalButtonsContainer}>
                    <Button
                      title="Cancel"
                      onPress={closeDownloadModal}
                      color={Colors.red}
                    />
                    <Button
                      title="Download"
                      onPress={() =>
                        handleDownload(selectedDocument.downloadUrl)
                      }
                      color={Colors.green}
                    />
                  </View>
                )}
              </View>
            </View>
          </Modal>
        )}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
        >
          <UploadDocsSheet
            handlePdfSave={handlePdfSave}
            handleCancelFileDownload={handleCancelFileDownload}
          />
        </BottomSheetModal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  documentsContainer: {
    marginBottom: 16,
  },
  noDocumentsText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  uploadContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: Dimensions.get('window').width - 40,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
