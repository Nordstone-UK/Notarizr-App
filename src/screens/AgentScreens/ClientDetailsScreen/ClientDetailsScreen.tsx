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
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Pdf from 'react-native-pdf';
import PdfView from 'react-native-pdf';

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
import { Alert } from 'react-native';

export default function AgentMobileNotaryStartScreen({ route, navigation }: any) {
  const downloadPdf = useRef(null);

  const clientDetail = useSelector((state: any) => state?.booking?.booking);
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
    fetchBookingByID, updateAgentdocs

  } = useFetchBooking();


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
  const [filePath, setFilePath] = useState(
    `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
  );
  const [newPdfSaved, setNewPdfSaved] = useState(false);
  const [newPdfPath, setNewPdfPath] = useState(null);
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [lastRNBFTask, setLastRNBFTask] = useState({ cancel: () => { } });
  // const [navigationStatus, setNavigationStatus] = useState('');
  const [selected, setSelected] = useState('client_choose');
  const [bookedByAddress, setBookedByAddress] = useState(null);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getBookingStatus();
      setRefreshing(false);
      console.log('Refreshing.....');
    }, 2000);
  }, []);

  const { uploadMultipleFiles, uploadAllDocuments, uploadDocArray, } = useRegister();

  const [updateSessionClientDocs] = useMutation(
    UPDATE_OR_CREATE_SESSION_CLIENT_DOCS,
  );
  const [updateSessionAgentDocs] = useMutation(
    UPDATE_SESSION_PRICEDOCS,
  );
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
    }
    else if (clientDetail?.__typename === 'Session' &&
      status === 'Pending') {

      // const observersString = `${observers._id}:${observers.email}`;
      // return;

      const params = {
        sessionId: clientDetail?._id,
        identityAuthentication: selected,
        observers: observers.map(item => item.email),
        paymentType: paymentMethod,

      };
      const response = await handleSessionUpdation(params)
      console.log("respndfpareamd", response)
      if (response.status == '200') {
        const sessionData = await getSessionByID(clientDetail?._id);
        console.log("sesssiondataaaaaaaaaaaaaaa", sessionData)
        if (response.status === '200') {
          // if (sessionData?.__typename == 'Session') {
          //   await updateSession('pending', session._id);
          // }
        }
        dispatch(setBookingInfoState(sessionData));
        // return;
      }
    }
    else {
      // console.log("responserddddddddddddd")
      // handleUpdateBookingStatus('To_be_paid', clientDetail._id);
      // getBookingStatus();
    }
    setLoadingUpdate(false);
  };
  const handleUpdateClientStatus = async (updatestatus: string) => {
    console.log("sttererer", updatestatus)
    // return;
    await updateSession(updatestatus, clientDetail?._id);
  }
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
  const handleStatusChange = async (string: string) => {
    if (string === "to_be_paid") {
      setLoadingAccept(true);
    }
    else {
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
    const { scannedImages } = await DocumentScanner.scanDocument();
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
    const names = arr.map((obj: { name: any }) => obj.name);
    const namesString = names.join(', ');
    return namesString;
  }
  const setBookingAmount = async () => {
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
        response = await setBookingPrice(
          clientDetail?._id,
          AmountEntered,
          clientDetail?.review,
          clientDetail?.rating,
          clientDetail?.notes,
          clientDetail?.documents,
        );
      }
      handleCloseModalPress();
      if (response == 200) {
        if (clientDetail.__typename !== "Booking") {
          setPrice(AmountEntered);
        }
        else {
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
          ?
          // await updateAgentdocs(request)
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
  const highestPriceDocument = clientDetail.document_type.reduce(
    (maxDoc, doc) => (doc.price > maxDoc.price ? doc : maxDoc),
    clientDetail.document_type[0],
  );
  const additionalSignatureCharges =
    clientDetail.total_signatures_required * 10;
  const handleDocumentPress = (documentUri: string) => {
    console.log("documentur", documentUri)
    navigation.navigate('NotaryDocumentDownloadScreen', { document: documentUri })
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
      console.log("newfilepath", newPdfPath)
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

  const downloadFile = () => {
    if (!fileDownloaded && selectedDocument) { // Check if sourceUrl is not empty
      RNFS.downloadFile({
        fromUrl: selectedDocument,
        toFile: newPdfPath ? newPdfPath : selectedDocument,
      }).promise.then(res => {
        setFileDownloaded(true);
        console.log("respnsere", res)
        readFile();
      }).catch(error => {
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
        handleDimensionsUpdate
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
      if (clientDetail && clientDetail.booked_by && Array.isArray(clientDetail.booked_by.addresses)) {
        const addressId = clientDetail.address;

        const addressdetail = clientDetail.booked_by.addresses.find(
          address => address._id == addressId
        );

        console.log('Found address:', addressdetail);
        setBookedByAddress(addressdetail);
      } else {
        console.log('Client detail or addresses are not properly loaded.');
      }
    };

    fetchAddress();
  }, [clientDetail]);
  console.log("navigationStatus", navigationStatus)
  const handleStartNavigation = async () => {
    if (
      clientDetail?.service_type === 'mobile_notary'
    ) {
      await handleStatusChange('travelling')
      dispatch(
        setCoordinates(
          bookedByAddress?.location_coordinates
        ),
      );

      navigation.navigate('AgentMapArrivalScreen', {
        user: "Agent"
      });
    }
    dispatch(
      setNavigationStatus(
        "ongoing"
      ));
    // setNavigationStatus('ongoing');
    // navigation.navigate('MapArrivalScreen');
  };
  const handleAddressPress = (coordinates) => {
    navigation.navigate('MapArrivalScreen');
    dispatch(
      setCoordinates(
        coordinates
      ),
    );
  };

  const handleNotarizrDocumentPress = async (documents) => {
    console.log("documents", documents);
    try {
      for (const document of documents) {
        const fileName = document.split('/').pop(); // Extract the file name from the URL
        const downloadDest = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        console.log("documentsdddddddddd", document);
        const result = await RNFS.downloadFile({
          fromUrl: document,
          toFile: downloadDest,
        }).promise;

        if (result.statusCode === 200) {
          console.log(`File ${fileName} downloaded to ${downloadDest}`);
        } else {
          Alert.alert('Download Failed', `Failed to download the file ${fileName}.`);
        }
      }
      Alert.alert('Download Successful', 'All files downloaded successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('Download Error', 'An error occurred while downloading the files.');
    }
  };

  console.log("cliendetails", clientDetail)
  console.log("cliendetailssssssssssssssssssssssss", clientDetail?.booked_by?.current_location)
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        lastImg={require('../../../../assets/chatIcon.png')}
        lastImgPress={() =>
          navigation.navigate('ChatScreen', {
            sender: clientDetail?.agent,
            receiver: clientDetail?.booked_by || clientDetail?.client,
            chat: clientDetail?._id,
            channel: clientDetail?.agora_channel_name,
            voiceToken: clientDetail?.agora_channel_token,
          })
        }
        midImg={require('../../../../assets/supportIcon.png')}
        midImgPress={() => handleCallSupport()}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
        <View style={styles.headingContainer}>
          <Text style={styles.lightHeading}>Selected Service</Text>
          {clientDetail?.service_type === 'mobile_notary' && (
            <Text style={styles.Heading}>Mobile Notary</Text>
          )}
          {clientDetail?.service_type !== 'mobile_notary' && (
            <Text style={styles.Heading}>Remote Online Notary</Text>
          )}
        </View>
      </View>

      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.insideContainer}>
            <Text style={[styles.insideHeading, { fontSize: widthToDp(6) }]}>
              {' '}
            </Text>

            <View style={[styles.iconContainer]}>
              {(status === 'Pending' || (status === 'to_be_paid' && clientDetail.payment_type === 'on_agent')) && (
                <Image
                  source={require('../../../../assets/pending.png')}
                  style={styles.greenIcon}
                />
              )}
              {(status === 'Completed' ||
                status === 'Accepted' ||
                status === 'Ongoing' ||
                status === 'Travelling' ||
                (status === 'to_be_paid' && clientDetail.payment_type === 'on_agent')) && (
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
                <Text style={styles.insideText}>{status}</Text>
              )}
            </View>

          </View>
          {/* <ClientServiceCard
            image={require('../../../../assets/agentLocation.png')}
            source={{
              uri: clientDetail?.booked_by?.profile_picture
                ? `${clientDetail?.booked_by?.profile_picture}`
                : `${clientDetail?.client?.profile_picture}`,
            }}
            bottomRightText={clientDetail?.document_type}
            bottomLeftText="Total"
            agentName={
              clientDetail?.booked_by?.first_name &&
              clientDetail?.booked_by?.last_name
                ? `${clientDetail?.booked_by?.first_name} ${clientDetail?.booked_by?.last_name}`
                : `${clientDetail?.client?.first_name} ${clientDetail?.client?.last_name}`
            }
            agentAddress={
              clientDetail?.booked_by?.location
                ? `${clientDetail?.booked_by?.location}`
                : `${clientDetail?.client.location}`
            }
            task={clientDetail?.status}
            OrangeText="At Home"
            onPress={() =>
              navigation.navigate('ClientDetailsScreen', {
                clientDetail: clientDetail,
              })
            }
            status={clientDetail?.status}
            dateofBooking={clientDetail?.date_of_booking}
            timeofBooking={clientDetail?.time_of_booking}
            createdAt={clientDetail?.createdAt}
          /> */}
          <View style={styles.sheetContainer}>
            {/* <Text style={[styles.insideHeading]}>Booking Preferences</Text>
            {clientDetail?.service_type === 'mobile_notary' && (
              <View>
                <Text
                  style={{
                    fontSize: widthToDp(4),
                    marginLeft: widthToDp(7),
                    fontFamily: 'Manrope-Bold',
                    color: Colors.TextColor,
                  }}>
                  Document Type:
                </Text>
                <Text style={[styles.detail, {marginLeft: widthToDp(7)}]}>
                  {displayNamesWithCommas(clientDetail?.document_type)}
                </Text>
              </View>
            )} */}
            {clientDetail.client ? (
              <View>
                <Text style={[styles.insideHeading]}>Client details</Text>
                <View
                  style={{
                    width: widthToDp(90),
                    marginTop: 10,
                    marginHorizontal: widthToDp(5),
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: widthToDp(3),
                    borderRadius: widthToDp(2),
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                  <View style={{ marginRight: 10 }}>
                    <Image
                      source={{
                        uri:
                          clientDetail.client.profile_picture ||
                          'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                      }}
                      style={{
                        width: widthToDp(14),
                        height: widthToDp(14),
                        borderRadius: widthToDp(7),
                      }}
                    />
                  </View>
                  <View>
                    <Text style={{ color: 'black', fontFamily: 'Poppins-Bold' }}>
                      {clientDetail.client.email}
                    </Text>
                    <Text
                      style={{ color: 'black', fontFamily: 'Poppins-Regular' }}>
                      {clientDetail.client.first_name}{' '}
                      {clientDetail.client.last_name}
                    </Text>
                    {/* Render other client details here if available */}
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <Text style={[styles.insideHeading]}>Client details</Text>
                <View
                  style={{
                    width: widthToDp(90),
                    marginTop: 10,
                    marginHorizontal: widthToDp(5),
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: widthToDp(3),
                    borderRadius: widthToDp(2),
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                  <View style={{ marginRight: 10 }}>
                    <Image
                      source={{
                        uri: 'https://notarizr-app-data.s3.us-east-2.amazonaws.com/images/Profile%20Pictures/aa1e15ff-46d1-4c5d-95fe-569e6f2239f8.JPEG',
                      }}
                      style={{
                        width: widthToDp(14),
                        height: widthToDp(14),
                        borderRadius: widthToDp(7),
                      }}
                    />
                  </View>
                  <View>
                    <Text style={{ color: 'black', fontFamily: 'Poppins-Bold' }}>
                      {clientDetail.booked_by.email}
                    </Text>
                    <Text
                      style={{ color: 'black', fontFamily: 'Poppins-Regular' }}>
                      {clientDetail.booked_by.first_name}{' '}
                      {clientDetail.booked_by.last_name}
                    </Text>
                    {/* Render other alternative client details here */}
                  </View>
                </View>
              </View>
            )}

            {clientDetail.agent && (
              <View>
                <Text style={[styles.insideHeading]}>
                  Allocated agent details
                </Text>

                <View
                  style={{
                    width: widthToDp(90),
                    marginTop: 10,
                    marginHorizontal: widthToDp(5),

                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: widthToDp(3),
                    borderRadius: widthToDp(2),
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,

                    elevation: 5,
                    // marginLeft: 3,
                  }}>
                  <View style={{ marginRight: 10 }}>
                    <Image
                      source={{
                        uri:
                          clientDetail.agent.profile_picture != 'none'
                            ? clientDetail.agent.profile_picture
                            : 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                      }}
                      style={{
                        width: widthToDp(14),
                        height: widthToDp(14),
                        borderRadius: widthToDp(7),
                      }}
                    />
                  </View>
                  <View>
                    <Text style={{ color: 'black', fontFamily: 'Poppins-Bold' }}>
                      {clientDetail.agent?.email}
                    </Text>
                    <Text
                      style={{
                        color: 'black',
                        fontFamily: 'Poppins-Regular',
                      }}>
                      {clientDetail.agent.first_name}{' '}
                      {clientDetail.agent.last_name}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {clientDetail.observers && clientDetail.observers.length > 0 && (
              <View>
                <Text style={[styles.insideHeading]}>Observers </Text>
                <View>
                  {clientDetail.observers.map(item => {
                    return (
                      <View
                        style={{
                          width: widthToDp(90),
                          marginTop: 10,
                          marginHorizontal: widthToDp(5),

                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: widthToDp(3),
                          borderRadius: widthToDp(2),
                          backgroundColor: 'white',
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,

                          elevation: 5,
                          // marginLeft: 3,
                        }}>
                        <View style={{ marginRight: 10 }}>
                          <Image
                            source={{
                              uri: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                            }}
                            style={{
                              width: widthToDp(14),
                              height: widthToDp(14),
                              borderRadius: widthToDp(7),
                            }}
                          />
                        </View>
                        <View>
                          <Text
                            style={{
                              color: 'black',
                              fontFamily: 'Poppins-Bold',
                            }}>
                            {item}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
            {(!clientDetail.observers || status === "Accepted" &&
              clientDetail.observers.length === 0) &&
              clientDetail.__typename === "Session" &&
              (
                <View>
                  <Text style={styles.insideHeading}>Observers</Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      color: 'black',
                      paddingHorizontal: 40,
                    }}>
                    An Observer is anyone with relevant information for all the
                    signing that may need to be on the notarization session.
                  </Text>

                  <LabelTextInput
                    placeholder="Search observer by email"
                    defaultValue={''}
                    onChangeText={text => {
                      SearchUser(text);
                      setSearchFor('Observer');
                      setShowObserverSearchView(true);
                    }}
                    InputStyles={{ padding: widthToDp(2) }}
                    AdjustWidth={{
                      width: widthToDp(92),
                      borderColor: Colors.Orange,
                    }}
                    rightImageSoucre={require('../../../../assets/close.png')}
                    rightImagePress={() => {
                      setSearchedUser([]);
                    }}
                  />

                  {observers.length > 0 && (
                    <View>
                      {observers.map(item => {
                        return (
                          <View
                            style={{
                              width: widthToDp(90),
                              marginTop: 10,

                              backgroundColor: 'red',
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: widthToDp(3),
                              borderRadius: widthToDp(2),
                              backgroundColor: 'white',
                              shadowColor: '#000',
                              shadowOffset: {
                                width: 0,
                                height: 2,
                              },
                              shadowOpacity: 0.25,
                              shadowRadius: 3.84,

                              elevation: 5,
                              marginLeft: widthToDp(6),
                            }}>
                            <View style={{ marginRight: 10 }}>
                              <Image
                                source={{
                                  uri:
                                    item?.profile_picture != 'none'
                                      ? item.profile_picture
                                      : 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                                }}
                                style={{
                                  width: widthToDp(14),
                                  height: widthToDp(14),
                                  borderRadius: widthToDp(7),
                                }}
                              />
                            </View>
                            <View>
                              <Text
                                style={{
                                  color: 'black',
                                  fontFamily: 'Poppins-Bold',
                                }}>
                                {item?.email}
                              </Text>
                              <Text
                                style={{
                                  color: 'black',
                                  fontFamily: 'Poppins-Regular',
                                }}>
                                {item.first_name} {item.last_name}
                              </Text>
                            </View>

                            <TouchableOpacity
                              onPress={() => {
                                setObservers(
                                  observers.filter(i => i._id !== item._id),
                                );
                              }}
                              style={{ position: 'absolute', right: 5, top: 5 }}>
                              <Xmark
                                width={24}
                                height={24}
                                strokeWidth={2}
                                color={Colors.Orange}
                              />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {showObserverSearchView &&
                    searchFor == 'Observer' &&
                    searchedUser.length !== 0 ? (
                    isLoading ? (
                      <ActivityIndicator
                        size="large"
                        color={Colors.Orange}
                        style={{ height: heightToDp(40) }}
                      />
                    ) : (
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{
                          height: heightToDp(40),
                          marginBottom: widthToDp(3),
                        }}>
                        {searchedUser.map(item => (
                          <TouchableOpacity
                            key={item._id}
                            onPress={() => {
                              setObservers(prev => [...prev, item]);
                              setShowObserverSearchView(false);
                            }}
                            style={{
                              borderColor: Colors.Orange,
                              borderWidth: 1,
                              padding: widthToDp(1),
                              marginLeft: widthToDp(6),
                              marginBottom: widthToDp(3),
                              borderRadius: widthToDp(2),
                              width: widthToDp(88),
                              // backgroundColor: 'red'
                            }}>
                            <Text
                              style={{
                                color: Colors.TextColor,
                                fontSize: widthToDp(4),
                              }}>
                              {item.email}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )
                  ) : null}

                </View>
              )}
            {clientDetail.__typename === 'Booking' && clientDetail.address && (
              <View style={{ paddingHorizontal: widthToDp(3) }}>
                <Text style={[styles.insideHeading, styles.addressMargin]}>
                  Booked For Location
                </Text>
                <AddressCard
                  location={
                    bookedByAddress?.location
                  }
                  onPress={() => handleAddressPress(bookedByAddress.location_coordinates)}
                  booking="true"
                />
              </View>
            )}

            {clientDetail.document_type &&
              clientDetail.document_type.length > 0 && (
                <View style={{ marginTop: heightToDp(2) }}>
                  <Text style={[styles.insideHeading]}>Notary Documents</Text>
                  {clientDetail.document_type &&
                    clientDetail.document_type.map(item => (
                      <View
                        style={{
                          paddingHorizontal: widthToDp(7),
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <CheckCircleSolid
                          width={24}
                          height={24}
                          strokeWidth={2}
                          color={Colors.Orange}
                        />
                        <Text
                          style={{
                            fontFamily: 'Poppins-Regular',
                            color: 'black',
                            marginLeft: 10,
                          }}>
                          {item.name}- $ {item.price}
                        </Text>
                      </View>
                    ))}
                </View>
              )}
            {/* {clientDetail.date_time_session && ( */}

            <View style={{ marginVertical: 10 }}>
              <Text style={[styles.insideHeading]}>Preferred date and time</Text>
              <View style={{ paddingHorizontal: widthToDp(7) }}>
                {clientDetail.date_time_session && (
                  <Text style={{ fontFamily: 'Poppins-Regular', color: 'black' }}>
                    {moment(clientDetail.date_time_session).format(
                      'MM/DD/YYYY',
                    )}{' '}
                    at {moment(clientDetail.date_time_session).format('h:mm a')}
                  </Text>
                )}
                {clientDetail?.date_of_booking && (
                  <Text style={{ fontFamily: 'Poppins-Regular', color: 'black' }}>
                    {moment(clientDetail?.date_of_booking).format('MM/DD/YYYY')}{' '}
                    at {clientDetail.time_of_booking}
                  </Text>
                )}
              </View>
            </View>
            {/* )} */}
            {clientDetail.__typename === "Booking" && typeof clientDetail.totalPrice === 'number' && (
              <View>
                <Text style={[styles.insideHeading]}>Paying Amount</Text>
                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    backgroundColor: Colors.OrangeGradientEnd,
                    marginLeft: widthToDp(5),
                    width: widthToDp(60),
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}>
                  <Text style={{ fontFamily: 'Poppins-Regular', color: 'white' }}>
                    Total Price: ${totalPrice}{status === 'Accepted' || status === 'Paid'
                      ? '  - > Paid'
                      : ''}
                  </Text>
                </View>
              </View>
            )}
            {typeof clientDetail.total_signatures_required === 'number' && (
              <View>
                <Text style={[styles.insideHeading]}>
                  Additional Signature Documents
                </Text>
                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    backgroundColor: Colors.OrangeGradientEnd,
                    marginLeft: widthToDp(5),
                    width: widthToDp(60),
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}>
                  <Text style={{ fontFamily: 'Poppins-Regular', color: 'white' }}>
                    {clientDetail.total_signatures_required}
                  </Text>
                </View>
              </View>
            )}
            {clientDetail.documents && clientDetail.documents.length > 0 && (
              <View style={{ marginTop: heightToDp(2), marginVertical: 10 }}>
                <Text style={[styles.insideHeading]}>
                  {' '}
                  Print uploaded documents
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: widthToDp(5),
                    columnGap: widthToDp(3),
                  }}>
                  {clientDetail.documents &&
                    Array.isArray(clientDetail.documents) &&
                    clientDetail.documents.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          handleDocumentPress(item.url)
                        }}>
                        <Image
                          source={require('../../../../assets/docPic.png')}
                          style={{ width: widthToDp(10), height: heightToDp(10) }}
                        />
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}
            {clientDetail.payment_type && (
              <View>
                <Text style={[styles.insideHeading]}>Payment Info </Text>
                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <CheckCircleSolid
                    width={24}
                    height={24}
                    strokeWidth={2}
                    color={Colors.Orange}
                  />
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      color: 'black',
                      marginLeft: 10,
                    }}>
                    {clientDetail.payment_type == 'on_notarizr'
                      ? ' Invoice the client on Notarizr'
                      : 'Invoice the client on your own'}
                  </Text>
                </View>
              </View>
            )}
            {!clientDetail.payment_type && clientDetail.__typename === "Session" && (
              <View style={styles.headingContainer}>
                <Text style={styles.Heading}>Payment Info</Text>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        setPaymentMethod('on_agent');
                      }}>
                      {paymentMethod == 'on_agent' ? (
                        <CheckCircleSolid
                          width={24}
                          height={24}
                          strokeWidth={2}
                          color={Colors.Orange}
                        />
                      ) : (
                        <CheckCircle
                          width={24}
                          height={24}
                          strokeWidth={2}
                          color={'gray'}
                        />
                      )}
                    </TouchableOpacity>
                    <Text style={{ color: 'black', marginLeft: 10 }}>
                      Invoice the client on your own{' '}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        setPaymentMethod('on_notarizr');
                      }}>
                      {paymentMethod == 'on_notarizr' ? (
                        <CheckCircleSolid
                          width={24}
                          height={24}
                          strokeWidth={2}
                          color={Colors.Orange}
                        />
                      ) : (
                        <CheckCircle
                          width={24}
                          height={24}
                          strokeWidth={2}
                          color={'gray'}
                        />
                      )}
                    </TouchableOpacity>
                    <Text style={{ color: 'black', marginLeft: 10 }}>
                      Invoice the client on Notarizr{' '}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            {clientDetail.payment_type == "on_notarizr" && (
              <View>
                <Text style={[styles.insideHeading]}>Requested Amount</Text>
                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    backgroundColor: Colors.OrangeGradientEnd,
                    marginLeft: widthToDp(5),
                    width: widthToDp(60),
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}>
                  <Text style={{ fontFamily: 'Poppins-Regular', color: 'white' }}>$ {price} {status === 'Accepted' || status === 'Paid'
                    ? '  - > Paid'
                    : ''}</Text>
                </View>
              </View>

            )}
            {clientDetail.identity_authentication && (
              <View>
                <Text style={[styles.insideHeading]}>ID options</Text>
                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    backgroundColor: Colors.OrangeGradientEnd,
                    marginLeft: widthToDp(5),
                    width: widthToDp(60),
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}>
                  <Text style={{ fontFamily: 'Poppins-Regular', color: 'white' }}>
                    {clientDetail.identity_authentication == 'user_id'
                      ? 'ID Card'
                      : clientDetail.identity_authentication == 'user_passport'
                        ? 'Passport'
                        : 'Allow user to choose'}
                  </Text>
                </View>
              </View>
            )}
            {!clientDetail.identity_authentication && clientDetail.__typename === "Session" && (
              <View style={styles.headingContainer}>
                <Text style={styles.Heading}>
                  Type of identity Authentication for Session
                </Text>
                <View style={styles.authbuttoncontainer}>
                  <MainButton
                    Title="Allow user to choose"
                    colors={
                      selected === 'client_choose'
                        ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                        : [Colors.DisableColor, Colors.DisableColor]
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
                        ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                        : [Colors.DisableColor, Colors.DisableColor]
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
                        ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                        : [Colors.DisableColor, Colors.DisableColor]
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
            {!clientDetail.agent_document &&
              clientDetail.documents &&
              clientDetail.documents.length > 0 && (
                <View style={{ marginVertical: 10 }}>
                  <Text style={[styles.insideHeading]}>
                    Client uploaded documents
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: widthToDp(5),
                      columnGap: widthToDp(3),
                    }}>
                    {clientDetail.documents.map((item, index) => (
                      <TouchableOpacity key={index}>
                        <Image
                          source={require('../../../../assets/docPic.png')}
                          style={{ width: widthToDp(10), height: heightToDp(10) }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

            {clientDetail.client_documents &&
              Object.values(clientDetail.client_documents)?.length > 0 && (
                <View style={{ marginVertical: 10 }}>
                  <Text style={[styles.insideHeading]}>
                    Client uploaded documents
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: widthToDp(5),
                      columnGap: widthToDp(3),
                    }}>
                    {Object.values(clientDetail.client_documents)?.map(
                      (item, index) => (
                        <TouchableOpacity key={index} onPress={() => handleDocumentPress(item)}>
                          <Image
                            source={require('../../../../assets/docPic.png')}
                            style={{
                              width: widthToDp(10),
                              height: heightToDp(10),
                            }}
                          />
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>
              )}
            {clientDetail.agent_document && clientDetail.agent_document.length > 0 && (
              <View>
                <Text style={[styles.insideHeading]}>
                  Agent uploaded documents
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: widthToDp(5),
                    columnGap: widthToDp(3),
                  }}>
                  {clientDetail.agent_document?.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => handleDocumentPress(item)}>
                      <Image
                        source={require('../../../../assets/docPic.png')}
                        style={{ width: widthToDp(10), height: heightToDp(10) }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {clientDetail.notarized_docs &&
              clientDetail.notarized_docs.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.insideHeading]}>
                    Notarized documents
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: widthToDp(5),
                      columnGap: widthToDp(3),
                    }}>
                    {clientDetail.notarized_docs?.map((item, index) => (
                      <TouchableOpacity key={index} onPress={() => handleDocumentPress(item)}>
                        <Image
                          source={require('../../../../assets/docPic.png')}
                          style={{ width: widthToDp(10), height: heightToDp(10) }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  {clientDetail.notarized_docs.length >= 0 && (
                    <View style={styles.downloadButtonContainer}>
                      <TouchableOpacity
                        onPress={() => handleNotarizrDocumentPress(clientDetail.notarized_docs)}
                        style={styles.downloadButton}
                      >
                        <Text style={styles.downloadButtonText}>Download All</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                </View>
              )}
            <Modal visible={showModal} animationType="slide">
              {/* <View style={styles.modalContainer}>
                <Text style={styles.modalHeading}>Document Preview</Text> */}
              {/* {/* Display the document PDF */}
              <PdfView
                // ref={pdfRef}
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
                onLoadComplete={(numberOfPages, filePath) => {
                  console.log('completed')
                }}
                onPageChanged={(page, numberOfPages) => { }}
                // onPageSingleTap={(page, x, y) => {
                //   handleSingleTap(page, x, y);
                // }}
                onError={error => console.error(error)}
              />
              <View style={styles.modalButtons}>
                <Button title="Download" onPress={openLocalFile} />
                <Button title="Close" onPress={cancelTaskAndCloseModal} />
              </View>
              {/* </View> */}
            </Modal>

            {/* {clientDetail.agent_document && (
              <View style={{marginTop: 10}}>
                <Text style={[styles.insideHeading]}>Notarized documents</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: widthToDp(5),
                    columnGap: widthToDp(3),
                  }}>
                  {clientDetail.agent_document?.map((item, index) => (
                    <TouchableOpacity key={index}>
                      <Image
                        source={require('../../../../assets/docPic.png')}
                        style={{ width: widthToDp(10), height: heightToDp(10) }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )} */}
            {clientDetail.__typename === 'Booking' && (
              <View>
                <Text style={[styles.insideHeading]}>Payment details</Text>

                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <CheckCircleSolid
                    width={24}
                    height={24}
                    strokeWidth={2}
                    color={Colors.Orange}
                  />
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      color: 'black',
                      marginLeft: 10,
                    }}>
                    Notary charges:{" "} ${highestPriceDocument?.price}
                  </Text>
                </View>
                {typeof clientDetail.total_signatures_required === 'number' && (
                  <View
                    style={{
                      paddingHorizontal: widthToDp(7),
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <CheckCircleSolid
                      width={24}
                      height={24}
                      strokeWidth={2}
                      color={Colors.Orange}
                    />

                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        color: 'black',
                        marginLeft: 10,
                      }}>
                      Additional signatures :{" "}
                      {clientDetail.total_signatures_required} x $ 10 ={' '}
                      ${additionalSignatureCharges}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <CheckCircleSolid
                    width={24}
                    height={24}
                    strokeWidth={2}
                    color={Colors.Orange}
                  />

                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      color: 'black',
                      marginLeft: 10,
                    }}>
                    Printing charges : ${' '}
                    {clientDetail.documents.length > 0 ? 10 : 0}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <CheckCircleSolid
                    width={24}
                    height={24}
                    strokeWidth={2}
                    color={Colors.Orange}
                  />

                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      color: 'black',
                      marginLeft: 10,
                    }}>
                    Total : $ {clientDetail.totalPrice}
                  </Text>
                </View>
              </View>
            )}
            {booked_for?.first_name && (
              <View>
                <View style={styles.addressView}>
                  <Text
                    style={{
                      fontSize: widthToDp(4),
                      marginLeft: widthToDp(1),
                      fontFamily: 'Manrope-Bold',
                      color: Colors.TextColor,
                    }}>
                    Booked For:
                  </Text>
                  <Text style={styles.detail}>
                    {booked_for?.first_name} {booked_for?.last_name}
                  </Text>
                </View>
                <View style={styles.addressView}>
                  <Text
                    style={{
                      fontSize: widthToDp(4),
                      marginLeft: widthToDp(1),
                      fontFamily: 'Manrope-Bold',
                      color: Colors.TextColor,
                    }}>
                    Phone Number:
                  </Text>
                  <Text style={styles.detail}>{booked_for?.phone_number}</Text>
                </View>
                <View style={styles.addressView}>
                  <Image
                    source={require('../../../../assets/locationIcon.png')}
                    style={styles.locationImage}
                  />
                  <Text style={styles.detail}>
                    {capitalizeFirstLetter(booked_for?.location)}
                  </Text>
                </View>
              </View>
            )}

          </View>

          {showNotes && (
            <LabelTextInput
              LabelTextInput="Notes"
              placeholder="Write notes here"
              Label={true}
              onChangeText={(text: React.SetStateAction<string>) =>
                setNotes(text)
              }
            />
          )}
          <View style={[styles.buttonFlex, { marginTop: heightToDp(5) }]}>
            {status === 'Pending' && (
              <>
                {(clientDetail.observers.length === 0 || clientDetail.payment_type === null && clientDetail.identity_authentication === null) && clientDetail.__typename !== "Booking" && (
                  <MainButton
                    Title="Update"
                    colors={[
                      Colors.OrangeGradientStart,
                      Colors.OrangeGradientEnd,
                    ]}
                    onPress={() => handleClientData()}
                    GradiStyles={{
                      width: widthToDp(30),
                      paddingHorizontal: widthToDp(0),
                      paddingVertical: heightToDp(3),
                    }}
                    loading={loadingUpdate}
                    isDisabled={loadingUpdate}
                    styles={{
                      padding: widthToDp(0),
                      fontSize: widthToDp(4),
                    }}
                  />
                )}
                <MainButton
                  Title="Accept"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() => handleStatusChange('to_be_paid')}
                  GradiStyles={{
                    width: widthToDp(30),
                    paddingHorizontal: widthToDp(0),
                    paddingVertical: heightToDp(3),
                  }}
                  loading={loadingAccept}
                  isDisabled={loadingAccept}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                />
                <MainButton
                  Title="Reject"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() => handleStatusChange('rejected')
                    // handleUpdateBookingStatus('rejected', clientDetail._id)
                  }
                  GradiStyles={{
                    width: widthToDp(30),
                    paddingHorizontal: widthToDp(0),
                    paddingVertical: heightToDp(3),
                  }}
                  loading={loadingReject}
                  isDisabled={loadingReject}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                />
              </>
            )}
          </View>
          <View style={[styles.buttonFlex,

          ]}>
            {clientDetail?.service_type !== 'mobile_notary' &&
              (status === 'Accepted' || status === 'Ongoing') &&
              !isStorageLoading ? (
              <>
                <GradientButton
                  Title=
                  'Upload documents'

                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() => selectDocuments()}
                  GradiStyles={{
                    width: widthToDp(42),
                    paddingHorizontal: widthToDp(0),
                    paddingVertical: heightToDp(3),

                  }}
                  styles={{
                    fontSize: widthToDp(4),
                  }}
                  fontSize={widthToDp(4)}
                  loading={loading}
                />
                <GradientButton
                  Title="Join Session"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() =>
                    navigation.navigate('NotaryCallScreen', {
                      routeFrom: 'agent',
                      uid: clientDetail?._id,
                      channel: clientDetail?.agora_channel_name,
                      token: clientDetail?.agora_channel_token,
                    })
                  }
                  GradiStyles={{
                    width: widthToDp(30),
                    paddingHorizontal: widthToDp(0),
                    paddingVertical: heightToDp(3.5),
                  }}
                  styles={{
                    fontSize: widthToDp(4),

                  }}
                  fontSize={widthToDp(4)}
                />
                {clientDetail.payment_type == 'on_notarizr' && status !== 'Accepted' && (
                  <GradientButton
                    Title=
                    'Request Payment'
                    colors={[
                      Colors.OrangeGradientStart,
                      Colors.OrangeGradientEnd,
                    ]}
                    GradiStyles={{
                      width: widthToDp(30),
                      paddingHorizontal: widthToDp(0),
                      paddingVertical: heightToDp(3),
                    }}
                    styles={{
                      padding: widthToDp(0),
                      fontSize: widthToDp(4),
                    }}
                    onPress={() => {

                      handlePresentModalPress();

                    }}
                    fontSize={widthToDp(4)}
                  />
                )}

              </>
            ) : null}
            {clientDetail?.service_type === 'mobile_notary' &&
              (status === 'Accepted' || status === 'Ongoing' || status === 'Travelling') && (
                <>
                  {(navigationStatus === '' || (navigationStatus === 'ongoing' && navigationStatus !== 'completed')) && (
                    <GradientButton
                      Title='Start Navigation'
                      colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                      GradiStyles={{
                        width: widthToDp(30),
                        paddingHorizontal: widthToDp(0),
                        paddingVertical: heightToDp(3),
                      }}
                      styles={{
                        padding: widthToDp(0),
                        fontSize: widthToDp(4),
                      }}
                      onPress={handleStartNavigation}
                      fontSize={widthToDp(4)}
                    />
                  )}



                  {navigationStatus === 'completed' && (
                    <>
                      {status !== 'Ongoing' && (
                        <GradientButton
                          Title='Start Notary'
                          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                          GradiStyles={{
                            width: widthToDp(30),
                            paddingHorizontal: widthToDp(0),
                            paddingVertical: heightToDp(3),
                          }}
                          styles={{
                            padding: widthToDp(0),
                            fontSize: widthToDp(4),
                          }}
                          onPress={() => handleStatusChange('ongoing')}
                          fontSize={widthToDp(4)}
                        />
                      )}
                      <GradientButton
                        Title='End Notary'
                        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                        GradiStyles={{
                          width: widthToDp(30),
                          paddingHorizontal: widthToDp(0),
                          paddingVertical: heightToDp(3),
                        }}
                        styles={{
                          padding: widthToDp(0),
                          fontSize: widthToDp(4)
                        }}
                        onPress={() => handleStatusChange('completed')}
                        fontSize={widthToDp(4)}
                      />
                    </>
                  )}
                </>
              )}
            {/* {clientDetail?.service_type === 'mobile_notary' &&
              (status === 'Accepted' || status === 'Ongoing') && (
                <>
                  {
                    status !== 'Ongoing' && (
                      <GradientButton
                        Title='Start notary'
                        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                        GradiStyles={{
                          width: widthToDp(30),
                          paddingHorizontal: widthToDp(0),
                          paddingVertical: heightToDp(3),
                        }}
                        styles={{
                          padding: widthToDp(0),
                          fontSize: widthToDp(4),
                        }}
                        onPress={() => handleStatusChange('ongoing')}
                        fontSize={widthToDp(4)}
                      />
                    )
                  }
                  <GradientButton
                    Title='End notary'
                    colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                    GradiStyles={{
                      width: widthToDp(30),
                      paddingHorizontal: widthToDp(0),
                      paddingVertical: heightToDp(3),
                    }}
                    styles={{
                      padding: widthToDp(0),
                      fontSize: widthToDp(4),
                    }}
                    onPress={() => handleStatusChange('completed')}
                    fontSize={widthToDp(4)}
                  />

                </>
              )
            } */}


          </View>
          {clientDetail?.service_type !== 'mobile_notary' &&
            status === 'To_be_paid' && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: widthToDp(2),
                }}>
                <GradientButton
                  Title={
                    clientDetail.payment_type == 'on_notarizr'
                      ? 'Request Payment'
                      : 'Join session'
                  }
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    width: widthToDp(41),
                    paddingVertical: widthToDp(4),
                    marginTop: widthToDp(10),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                  onPress={() => {
                    if (clientDetail.payment_type == 'on_notarizr') {
                      handlePresentModalPress();
                    } else {
                      navigation.navigate('NotaryCallScreen', {
                        routeFrom: 'agent',
                        uid: clientDetail?._id,
                        channel: clientDetail?.agora_channel_name,
                        token: clientDetail?.agora_channel_token,
                      });
                    }
                  }}
                  fontSize={widthToDp(4)}
                />
                <GradientButton
                  Title={

                    'Upload documents'
                  }
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    width: widthToDp(41),
                    paddingVertical: widthToDp(4),
                    marginTop: widthToDp(10),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(6),
                  }}
                  onPress={() => {
                    selectDocuments();
                  }}
                  fontSize={widthToDp(4)}
                  loading={loading}
                />
              </View>
            )}
          <View style={styles.buttonBottom}>
            {notary === 'Ongoing' && (!notaryBlock || !signaturePage) && (
              <GradientButton
                Title="Upload Documents"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                GradiStyles={{ padding: widthToDp(4) }}
                styles={{ padding: 0, fontSize: widthToDp(5) }}
                onPress={() => setIsVisible(true)}
              />
            )}
            {signaturePage &&
              notaryBlock &&
              !showNotes &&
              status !== 'Completed' && (
                <GradientButton
                  Title="Next"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{ padding: widthToDp(4) }}
                  styles={{ padding: 0, fontSize: widthToDp(5) }}
                  onPress={() => handleNext()}
                />
              )}
            {showNotes && (
              <View style={{ marginBottom: widthToDp(5) }}>
                <GradientButton
                  Title="Complete Notary"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() => handleComplete()}
                  loading={loading}
                />
              </View>
            )}
            {notary === 'Ongoing' && (
              <View style={styles.dashedContainer}>
                <Text
                  style={{
                    color: Colors.TextColor,
                    fontFamily: 'Manrope-Regular',
                    fontSize: widthToDp(4),
                  }}>
                  If you have any issues completing this Notary service, please
                  contact customer support.
                </Text>
                <TouchableOpacity onPress={() => handleCallSupport()}>
                  <Text
                    style={{
                      flex: 1,
                      marginTop: widthToDp(2),
                      color: Colors.Orange,
                      fontFamily: 'Manrope-Regular',
                      fontSize: widthToDp(4),
                      alignSelf: 'flex-end',
                    }}>
                    [Contact Support]
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
        {/* {isVisible ? (
            <BottomSheetModal
              ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}>
              <UploadDocsSheet
                SignaturePagePress={() => handleSignaturePage()}
                NotaryBlockPress={() => handleNotaryBlock()}
                CancelPress={() => handleCancel()}
              />
            </BottomSheetModal>
          ) : null} */}

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
        // onChange={handleSheetChanges}
        >
          <RequestPayment
            amount={AmountEntered}
            onChangeText={(text: number) => setAmountEntered(text)}
            onPress={() => setBookingAmount()}
          />
        </BottomSheetModal>
      </BottomSheetStyle>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  lightHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    marginHorizontal: widthToDp(2),
  },
  insideText: {
    marginHorizontal: widthToDp(3),
    fontSize: widthToDp(4.5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    marginLeft: widthToDp(2),
  },
  dashedContainer: {
    marginVertical: widthToDp(3),
    marginHorizontal: widthToDp(5),
    borderWidth: 3,
    borderColor: Colors.DullTextColor,
    borderStyle: 'dashed',
    backgroundColor: Colors.PinkBackground,
    borderRadius: 10,
    padding: widthToDp(2),
  },
  headingContainer: {
    marginLeft: widthToDp(5),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(7),
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
    color: Colors.DullTextColor,
  },
  detail: {
    marginLeft: widthToDp(2),
    marginVertical: widthToDp(2),
    fontSize: widthToDp(4),
    color: Colors.DullTextColor,
  },
  sheetContainer: {},
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
    // height: height * 0.6,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  downloadButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  downloadButton: {
    width: widthToDp(50),
    backgroundColor: Colors.Orange,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,

  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
