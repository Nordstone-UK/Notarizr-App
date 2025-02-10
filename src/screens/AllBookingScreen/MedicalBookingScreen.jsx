import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  RefreshControl,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, {useState, useEffect, useRef, useMemo} from 'react';
import PdfView from 'react-native-pdf';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {
  formatDateTime,
  heightToDp,
  width,
  widthToDp,
} from '../../utils/Responsive';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';
import AgentCard from '../../components/AgentCard/AgentCard';
import MainButton from '../../components/MainGradientButton/MainButton';
import AgentReviewCard from '../../components/AgentReviewCard/AgentReviewCard';
import {useDispatch, useSelector} from 'react-redux';
import {BottomSheet} from '@rneui/themed';
import ReviewPopup from '../../components/ReviewPopup/ReviewPopup';
import {useFocusEffect} from '@react-navigation/native';
import {paymentCheck} from '../../features/review/reviewSlice';
import useBookingStatus from '../../hooks/useBookingStatus';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import moment from 'moment';
import useFetchBooking from '../../hooks/useFetchBooking';
import useCustomerSuport from '../../hooks/useCustomerSupport';
import ModalCheck from '../../components/ModalComponent/ModalCheck';
import {useSession} from '../../hooks/useSession';
import {useLiveblocks} from '../../store/liveblocks';
import Loading from '../../components/LiveBlocksComponents/loading';
import useRegister from '../../hooks/useRegister';
import {
  setBookingInfoState,
  setCoordinates,
} from '../../features/booking/bookingSlice';
import {CheckCircle, CheckCircleSolid, Xmark} from 'iconoir-react-native';
import {useLazyQuery, useMutation} from '@apollo/client';
import {
  UPDATE_OR_CREATE_BOOKING_CLIENT_DOCS,
  UPDATE_OR_CREATE_SESSION_CLIENT_DOCS,
  UPDATE_SESSION_CLIENT_DOCS,
} from '../../../request/mutations/updateSessionClientDocs';
import {GET_SESSION_BY_ID} from '../../../request/queries/getSessionByID.query';
import AddressCard from '../../components/AddressCard/AddressCard';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

export default function MedicalBookingScreen({route, navigation}) {
  const token = useSelector(state => state.chats.chatToken);
  console.log('clienttokenchagfdfddfdfdfd', token);
  const {
    handlegetBookingStatus,
    handleSessionStatus,
    handleUpdateBookingStatus,
  } = useBookingStatus();
  const {updateSession, handleUpdateSessionReview} = useSession();
  const {handleReviewSubmit, setBookingPrice, fetchBookingByID} =
    useFetchBooking();
  const payment = useSelector(state => state.payment.payment);
  const dispatch = useDispatch();
  const {handleCallSupport} = useCustomerSuport();
  const bookingDetail = useSelector(state => state.booking.booking);
  console.log('boookingsdfdsddfd', bookingDetail);
  const [getSession] = useLazyQuery(GET_SESSION_BY_ID);

  const {uploadMultipleFiles, uploadAllDocuments} = useRegister();
  const [feedback, setFeedback] = useState();
  const documents = bookingDetail?.documents;
  //const {booked_for} = bookingDetail;
  const [modalShow, setModalShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [status, setStatus] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [uploadingDocs, setUploadingDocs] = useState();
  const [updatedDocs, setUpdatedDocs] = useState();
  let statusUpdate;
  const enterRoom = useLiveblocks(state => state.liveblocks.enterRoom);
  const leaveRoom = useLiveblocks(state => state.liveblocks.leaveRoom);
  const [uploadShow, setUploadShow] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [pdfUrl, setPdfUrl] = useState('');
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState(bookingDetail?.price);
  console.log('pppppppppppppppppppppppppricee', price);
  const [newPdfPath, setNewPdfPath] = useState(null);
  const [newPdfSaved, setNewPdfSaved] = useState(false);
  const [bookedByAddress, setBookedByAddress] = useState(null);
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => [300, 350], []);

  // const pdfRef = React.useRef<Pdf>(null);

  const [updateSessionClientDocs] = useMutation(
    UPDATE_OR_CREATE_SESSION_CLIENT_DOCS,
  );
  const [updateBookingClientDocs] = useMutation(
    UPDATE_OR_CREATE_BOOKING_CLIENT_DOCS,
  );

  function isEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }

    return true;
  }
  const documentCheck = isEmpty(bookingDetail?.documents);

  const selectDocuments = async () => {
    setLoading(true);
    setShowIcon(false);
    try {
      let urlResponse;
      const response = await uploadMultipleFiles();
      console.log('response', response);
      // setUploadingDocs(response);
      if (response) {
        urlResponse = await uploadAllDocuments(response);
        const documentKeys = Object.keys(bookingDetail.client_documents);

        // Get the length of the keys array, which corresponds to the number of documents
        const numberOfDocuments = documentKeys.length;
        console.log('urlrespdddddddddddddddddddddddddons', urlResponse);
        urlResponse = urlResponse.map(item => ({
          key: item.name + numberOfDocuments,
          value: item.url,
        }));
        console.log('urlresponssssssssssssss', urlResponse);
        const request = {
          variables: {
            sessionId: bookingDetail?._id,
            clientDocuments: urlResponse,
          },
        };

        const requestBooking = {
          variables: {
            bookingId: bookingDetail?._id,
            clientDocuments: urlResponse,
          },
        };
        console.log('rewqesressssssssssssssssssss', request);
        const res =
          bookingDetail.__typename == 'Session'
            ? await updateSessionClientDocs(request)
            : await updateBookingClientDocs(requestBooking);
        var reponse;
        if (bookingDetail.__typename == 'Session') {
          const request = {
            variables: {
              sessionId: bookingDetail?._id,
            },
          };
          reponse = await getSession(request);
          console.log('ressss', reponse.data.getSession.session);
          dispatch(setBookingInfoState(reponse.data.getSession.session));
        } else {
          reponse = await fetchBookingByID(bookingDetail?._id);

          dispatch(setBookingInfoState(reponse?.getBookingById?.booking));
          // console.log('#########', reponse?.getBookingById?.booking);
        }

        setUploadShow(false);
        setShowIcon(true);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error uploading documents:', error);
      setLoading(false); // Stop loading
    }
    setShowIcon(true);
  };
  // console.log(documentCheck);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        enterRoom('test-room');
        const request = {
          variables: {
            sessionId: bookingDetail?._id,
          },
        };
        // const response = await getSession(request);
        // console.log('response', response.data.getSession.session);
        // dispatch(setBookingInfoState(response.data.getSession.session));
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchData();

    return () => {
      leaveRoom();
    };
  }, [enterRoom, leaveRoom, dispatch]);

  const handleStarPress = selectedRating => {
    setRating(selectedRating);
  };
  const handleReview = reviewGiven => {
    console.log('reoveiee', reviewGiven);
    setReview(reviewGiven);
  };
  function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  console.log('sssssstattussdfd');
  const handleStatusChange = async StatusPassed => {
    console.log('sssssssss', StatusPassed);
    setLoading(true);
    try {
      if (bookingDetail?.__typename !== 'Session') {
        await handleUpdateBookingStatus(StatusPassed, bookingDetail?._id);
      } else {
        await updateSession(StatusPassed, bookingDetail?._id);
      }
      await getBookingStatus();
    } catch (error) {
      console.error('Error updating and fetching booking status:', error);
    }
    setLoading(false);
  };
  const getBookingStatus = async () => {
    try {
      if (bookingDetail?.__typename === 'Session') {
        statusUpdate = await handleSessionStatus(bookingDetail?._id);
      } else {
        statusUpdate = await handlegetBookingStatus(bookingDetail?._id);
      }
      setStatus(capitalizeFirstLetter(statusUpdate));
    } catch (error) {
      console.error('Error retrieving booking status:', error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      if (
        status === 'Completed' &&
        !bookingDetail.review &&
        !bookingDetail.rating
      ) {
        bottomSheetModalRef.current?.present();
        // setIsVisible(true);
      }
    }, [status]),
  );
  useEffect(() => {
    // bottomSheetModalRef.current?.present();

    const unsubscribe = navigation.addListener('focus', () => {
      getBookingStatus();
    });
    return unsubscribe;
  }, [status]);
  const handleReduxPayment = async () => {
    // setIsVisible(false);
    bottomSheetModalRef.current?.close();

    dispatch(paymentCheck());
    if (bookingDetail.__typename === 'Booking') {
      const response = await handleReviewSubmit(
        bookingDetail._id,
        review,
        rating,
      );
      if (response === '200') {
        setModalShow(true);
      }
    } else {
      console.log('reiveinindisosd');
      const response = await handleUpdateSessionReview(
        bookingDetail._id,
        review,
        rating,
      );
      console.log('respoonse', response);
      if (response === '200') {
        setModalShow(true);
      }
    }
  };
  const handleClose = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getBookingStatus();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  const showConfirmation = () => {
    Alert.alert('Is the agent at the location?', '', [
      {
        text: 'No',
        onPress: () => {},
      },
      {
        text: 'Yes',
        onPress: () => {
          handleStatusChange('ongoing');
        },
        style: 'cancel',
      },
    ]);
  };
  const closeModal = () => {
    setModalShow(false);
    navigation.navigate('HomeScreen');
  };
  function displayNamesWithCommas(arr) {
    const names = arr?.map(obj => obj.name);

    const namesString = names.join(', ');

    return namesString;
  }

  if (!bookingDetail) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={Colors.Orange} />
      </View>
    );
  }

  const highestPriceDocument =
    Array.isArray(bookingDetail.document_type) &&
    bookingDetail.document_type.length > 0
      ? bookingDetail.document_type.reduce(
          (maxDoc, doc) => (doc.price > maxDoc.price ? doc : maxDoc),
          bookingDetail.document_type[0], // Initialize with the first document if the array is not empty
        )
      : null; // Return null or some default value if document_type is undefined or empty

  // console.log(highestPriceDocument);

  const additionalSignatureCharges =
    bookingDetail.total_signatures_required * 10;

  const handleMakePayment = () => {
    if (bookingDetail.payment_type === 'on_notarizr' && status !== 'Accepted') {
      if (bookingDetail.price === 0) {
        // Display a message if the price is 0
        alert('Payment amount is zero. No payment required.');
      } else {
        // Check if the agent has requested for payment
        // if (bookingDetail.agent_requested_payment) {
        // Check if the price is greater than 0
        if (bookingDetail.price > 0) {
          // Navigate to ToBePaidScreen with bookingData
          navigation.navigate('ToBePaidScreen', {
            bookingData: bookingDetail,
          });
        } else {
          // Display a message if the price is not greater than 0
          alert(
            'Payment amount is zero. Please request payment from the agent.',
          );
        }
        // }
        // else {
        //   // Display a message if the agent has not requested payment
        //   alert('Agent has not requested for payment.');
        // }
      }
    }
  };
  const handleDocumentPress = (documentUri: string) => {
    console.log('documentur', documentUri);
    navigation.navigate('NotaryDocumentDownloadScreen', {
      document: documentUri,
    });
    // setSelectedDocument(documentUri);
    // setShowModal(true);
    setNewPdfPath(documentUri);
    setNewPdfSaved(true);
  };

  useEffect(() => {
    if (bookingDetail) {
      const addressId = bookingDetail?.address;
      console.log('book', bookingDetail.booked_by?.addresses);

      const address = bookingDetail?.booked_by?.addresses.find(
        address => address._id === addressId,
      );
      setBookedByAddress(address);
      setPrice(bookingDetail?.price);
    }
  }, [bookingDetail]);
  const handleAddressPress = coordinates => {
    if (!coordinates || coordinates.length === 0) {
      // Use fallbackCoordinates if coordinates are empty or undefined
      coordinates = bookingDetail?.booked_by.current_location?.coordinates;
    }
    navigation.navigate('AgentMapArrivalScreen', {
      user: 'Client',
    });
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
        let dirs = ReactNativeBlobUtil.fs.dirs;
        let downloadPath = `${dirs.DownloadDir}/${fileName}`;
        setLoadingStates(prev => ({...prev, [name]: true}));

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

          setLoadingStates(prev => ({...prev, [name]: false}));
        } finally {
          // Stop loading for this document
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
  const handleReject = async () => {
    Alert.alert(
      'Confirm Rejection',
      'The payment is high. Are you sure you want to reject the session and create a new session?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancellation pressed'),
          style: 'cancel',
        },
        {
          text: 'Reject and Book New',
          onPress: async () => {
            console.log('Session rejected and new booking created');
            await handleStatusChange('cancelled');
            // Add your logic to create a new booking here
            navigation.navigate('RonDateDocScreen');
          },
        },
      ],
      {cancelable: true},
    );
  };
  const handleAccept = async () => {
    await handleStatusChange('payment_confirmed');
  };
  console.log('setBookedByAddress', bookingDetail.payment_type);
  console.log('bookingdetails', bookingDetail);
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        payment={true}
        reset={true}
        lastImg={require('../../../assets/chatIcon.png')}
        lastImgPress={() =>
          navigation.navigate('ChatScreen', {
            sender: bookingDetail?.booked_by || bookingDetail?.client,
            receiver: bookingDetail?.agent,
            chat: bookingDetail?._id,
            channel: bookingDetail?.agora_channel_name,
            voiceToken: bookingDetail?.agora_channel_token,
          })
        }
        midImg={require('../../../assets/supportIcon.png')}
        midImgPress={() => handleCallSupport()}
      />
      <View style={styles.headingContainer}>
        {/* <Text style={styles.lightHeading}>Selected Service</Text> */}
        {bookingDetail?.service_type === 'mobile_notary' && (
          <Text style={styles.Heading}>Mobile Notary</Text>
        )}
        {bookingDetail?.service_type !== 'mobile_notary' && (
          <Text style={styles.Heading}>Remote Online Notary</Text>
        )}
      </View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.insideContainer}>
            <Text style={styles.insideHeading}> </Text>
            <View style={styles.iconContainer}>
              {(status === 'Pending' || status === 'Cancelled') && (
                <Image
                  source={require('../../../assets/pending.png')}
                  style={styles.greenIcon}
                />
              )}
              {(status === 'Completed' ||
                status === 'Accepted' ||
                status === 'Travelling' ||
                status === 'Paid' ||
                status === 'Payment_confirmed' ||
                status === 'Ongoing') && (
                <Image
                  source={require('../../../assets/greenIcon.png')}
                  style={styles.greenIcon}
                />
              )}
              {status === 'To_be_paid' ? (
                <>
                  <Image
                    source={require('../../../assets/greenIcon.png')}
                    style={styles.greenIcon}
                  />
                  <Text style={styles.insideText}>To Be Paid</Text>
                </>
              ) : (
                <Text style={styles.insideText}>
                  {status === 'Payment_confirmed'
                    ? 'Payment Confirmed'
                    : status}
                </Text>
              )}
            </View>
          </View>

          {/* {bookingDetail.client && (
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
                  // marginLeft: 3,
                }}>
                <View style={{marginRight: 10}}>
                  <Image
                    source={{
                      uri:
                        bookingDetail.client.profile_picture != 'none'
                          ? bookingDetail.client.profile_picture
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
                  <Text style={{color: 'black', fontFamily: 'Poppins-Bold'}}>
                    {bookingDetail.client.first_name}{' '}
                    {bookingDetail.client.last_name}
                  </Text>
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: 'Poppins-Regular',
                    }}>
                    {bookingDetail.client?.email}
                  </Text>
                </View>
              </View>
            </View>
          )} */}

          {bookingDetail.agent && (
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
                <View style={{marginRight: 10}}>
                  <Image
                    source={{
                      uri:
                        bookingDetail.agent.profile_picture != 'none'
                          ? bookingDetail.agent.profile_picture
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
                  <Text style={{color: 'black', fontFamily: 'Poppins-Bold'}}>
                    {bookingDetail.agent.first_name}{' '}
                    {bookingDetail.agent.last_name}
                  </Text>
                  {/* <Text
                    style={{
                      color: 'black',
                      fontFamily: 'Poppins-Regular',
                    }}>
                    {bookingDetail.agent?.email}
                  </Text> */}
                </View>
              </View>
            </View>
          )}

          {bookingDetail.observers && bookingDetail.observers.length > 0 && (
            <View>
              <Text style={[styles.insideHeading]}>Observers </Text>
              <View>
                {bookingDetail.observers.map(item => {
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
                      <View style={{marginRight: 10}}>
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
          {bookedByAddress?.location ? (
            <View style={{paddingHorizontal: widthToDp(3)}}>
              <Text style={[styles.insideHeading, styles.addressMargin]}>
                {bookingDetail.address ? 'Address' : 'Booked For Location'}
              </Text>
              <AddressCard
                location={
                  bookedByAddress?.location ||
                  bookingDetail.booked_for?.location
                }
                // onPress={() =>
                //   handleAddressPress(bookedByAddress.location_coordinates)
                // }
                booking="true"
              />
            </View>
          ) : null}

          {bookingDetail.document_type &&
            bookingDetail.document_type.length > 0 && (
              <View style={{marginTop: heightToDp(2)}}>
                <Text style={[styles.insideHeading]}>Selected Documents</Text>
                {bookingDetail.document_type &&
                  bookingDetail.document_type.map(item => (
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
                        {item.name} - $ {item.price}
                      </Text>
                    </View>
                  ))}
              </View>
            )}
          {bookingDetail.documents && bookingDetail.documents.length > 0 && (
            <View style={{marginTop: heightToDp(2), marginVertical: 10}}>
              <View style={styles.downloadButtonContainer}>
                <Text style={[styles.insideHeading]}>
                  Print uploaded documents
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleNotarizrDocumentPress(
                      bookingDetail.documents,
                      'printuploaded',
                    )
                  }
                  style={styles.downloadButton}>
                  {loadingStates.printuploaded ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.downloadButtonText}>Download</Text>
                  )}
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: heightToDp(4),
                  marginLeft: widthToDp(5),
                  columnGap: widthToDp(3),
                }}>
                {bookingDetail.documents &&
                  Array.isArray(bookingDetail.documents) &&
                  bookingDetail.documents.map((item, index) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleDocumentPress(item.url)}>
                        <Image
                          source={require('../../../assets/docPic.png')}
                          style={{width: widthToDp(10), height: heightToDp(10)}}
                        />
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </View>
          )}
          <View style={{marginVertical: 10}}>
            <Text style={[styles.insideHeading]}>Preferred date and time</Text>
            <View style={{paddingHorizontal: widthToDp(7)}}>
              {bookingDetail?.date_time_session && (
                <Text style={{fontFamily: 'Poppins-Regular', color: 'black'}}>
                  {moment(bookingDetail.date_time_session).format('MM/DD/YYYY')}{' '}
                  at {moment(bookingDetail.date_time_session).format('h:mm a')}
                </Text>
              )}

              {bookingDetail?.date_of_booking && (
                <Text style={{fontFamily: 'Poppins-Regular', color: 'black'}}>
                  {moment(bookingDetail?.date_of_booking).format('MM/DD/YYYY')}{' '}
                  at {bookingDetail.time_of_booking}
                </Text>
              )}
            </View>
          </View>

          {/* {bookingDetail.payment_type && (
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
                  {bookingDetail.payment_type == 'on_notarizr'
                    ? 'Invoice the client on Notarizr'
                    : 'Invoice the client on your own'}
                </Text>
              </View>
            </View>
          )} */}
          {bookingDetail.payment_type == 'on_notarizr' && (
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
                <Text style={{fontFamily: 'Poppins-Regular', color: 'white'}}>
                  $ {price}
                  {status === 'Accepted' || status === 'Paid'
                    ? '  - > Paid'
                    : ''}
                </Text>
              </View>
              {bookingDetail?.payment_type == 'on_notarizr' &&
                status == 'To_be_paid' &&
                price > 0 && (
                  <View style={styles.addressView}>
                    <View style={styles.paymentbuttons}>
                      <MainButton
                        Title="Reject"
                        colors={[
                          Colors.OrangeGradientStart,
                          Colors.OrangeGradientEnd,
                        ]}
                        onPress={() => handleReject()}
                        GradiStyles={{
                          width: widthToDp(30),
                          paddingHorizontal: widthToDp(0),
                          paddingVertical: heightToDp(3),
                        }}
                        // loading={loadingReject}
                        // isDisabled={loadingReject}
                        styles={{
                          padding: widthToDp(0),
                          fontSize: widthToDp(4),
                        }}
                      />
                    </View>
                    <View style={styles.paymentbuttons}>
                      <MainButton
                        Title="Accept"
                        colors={[
                          Colors.OrangeGradientStart,
                          Colors.OrangeGradientEnd,
                        ]}
                        onPress={() => handleAccept()}
                        GradiStyles={{
                          width: widthToDp(30),
                          paddingHorizontal: widthToDp(0),
                          paddingVertical: heightToDp(3),
                        }}
                        // loading={loadingReject}
                        // isDisabled={loadingReject}
                        styles={{
                          padding: widthToDp(0),
                          fontSize: widthToDp(4),
                        }}
                      />
                    </View>
                  </View>
                )}
            </View>
          )}
          {bookingDetail && typeof bookingDetail.totalPrice === 'number' && (
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
                <Text style={{fontFamily: 'Poppins-Regular', color: 'white'}}>
                  Total Price: ${bookingDetail.totalPrice}{' '}
                  {status === 'Accepted' || status === 'Paid'
                    ? ' - > Paid'
                    : ''}
                </Text>
              </View>
            </View>
          )}
          {typeof bookingDetail.total_signatures_required === 'number' && (
            <View>
              <Text style={[styles.insideHeading]}>
                Additional Signature Required
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
                <Text style={{fontFamily: 'Poppins-Regular', color: 'white'}}>
                  {bookingDetail.total_signatures_required}
                </Text>
              </View>
            </View>
          )}
          {bookingDetail.__typename === 'Booking' && (
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
                  Notary charges: ${highestPriceDocument?.price}
                </Text>
              </View>
              {typeof bookingDetail.total_signatures_required === 'number' && (
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
                    Additional signatures :
                    {bookingDetail.total_signatures_required} x $ 10 ={' '}
                    {additionalSignatureCharges}
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
                  {bookingDetail.documents.length > 0 ? 10 : 0}
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
                  Total : $ {bookingDetail.totalPrice}
                </Text>
              </View>
            </View>
          )}
          {bookingDetail.identity_authentication && (
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
                <Text style={{fontFamily: 'Poppins-Regular', color: 'white'}}>
                  {bookingDetail.identity_authentication == 'user_id'
                    ? 'ID Card'
                    : bookingDetail.identity_authentication == 'user_passport'
                    ? 'Passport'
                    : 'Allow user to choose'}
                </Text>
              </View>
            </View>
          )}
          {bookingDetail.client_documents &&
            Object.values(bookingDetail.client_documents)?.length > 0 && (
              <View style={{marginVertical: 10}}>
                <View style={styles.downloadButtonContainer}>
                  <View style={styles.uplodaText}>
                    <Text style={[styles.insideHeading]}>
                      Client uploaded documents
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      handleNotarizrDocumentPress(
                        bookingDetail.client_documents,
                        'clientuploaded',
                      )
                    }
                    style={styles.downloadButton}>
                    {loadingStates.clientuploaded ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.downloadButtonText}>Download</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.documentContainer}>
                  {Object.values(bookingDetail.client_documents)?.map(
                    (item, index) => {
                      const url = typeof item === 'string' ? item : item;
                      const isLoading = loadingStates[url];
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleDocumentPress(item)}>
                          <Image
                            source={require('../../../assets/docPic.png')}
                            style={{
                              width: widthToDp(10),
                              height: heightToDp(10),
                            }}
                          />
                        </TouchableOpacity>
                      );
                    },
                  )}
                </View>
              </View>
            )}
          {isPdfVisible && (
            <>
              {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
              <PdfView
                // ref={pdfRef}
                style={styles.pdfView}
                source={{uri: pdfUrl}}
                trustAllCerts={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                // horizontal={true}
                enablePaging={true}
                minScale={1.0}
                maxScale={1.0}
                scale={1.0}
                spacing={0}
                fitPolicy={0}
                onLoadComplete={({numberOfPages, filePath, width, height}) => {
                  setPageWidth(width);
                  setPageHeight(height);
                }}
                onPageChanged={(page, numberOfPages) => {}}
                onPageSingleTap={(page, x, y) => {
                  handleSingleTap(page, x, y);
                }}
                onError={error => console.error(error)}
              />
            </>
          )}

          {bookingDetail.agent_document &&
            bookingDetail.agent_document.length > 0 && (
              <View>
                <View style={styles.downloadButtonContainer}>
                  <View style={styles.uplodaText}>
                    <Text style={[styles.insideHeading]}>
                      Agent uploaded documents
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      handleNotarizrDocumentPress(
                        bookingDetail.agent_document,
                        'agentuploaded',
                      )
                    }
                    style={styles.downloadButton}>
                    {loadingStates.agentuploaded ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.downloadButtonText}>Download</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: heightToDp(4),
                    marginLeft: widthToDp(5),
                    columnGap: widthToDp(3),
                    flexWrap: 'wrap',
                    gap: widthToDp(3),
                  }}>
                  {bookingDetail.agent_document?.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleDocumentPress(item)}>
                      <Image
                        source={require('../../../assets/docPic.png')}
                        style={{width: widthToDp(10), height: heightToDp(10)}}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

          {bookingDetail.notarized_docs &&
            bookingDetail.notarized_docs.length > 0 && (
              <View style={{marginTop: 10}}>
                <View style={styles.downloadButtonContainer}>
                  <View style={styles.uplodaText}>
                    <Text style={[styles.insideHeading]}>
                      Notarized documents
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      handleNotarizrDocumentPress(
                        bookingDetail.notarized_docs,
                        'notarydocuments',
                      )
                    }
                    style={styles.downloadButton}>
                    {loadingStates.notarydocuments ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.downloadButtonText}>Download</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: heightToDp(4),
                    marginLeft: widthToDp(5),
                    columnGap: widthToDp(3),
                    flexWrap: 'wrap',
                    gap: widthToDp(3),
                  }}>
                  {bookingDetail.notarized_docs?.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleDocumentPress(item)}>
                      <Image
                        source={require('../../../assets/docPic.png')}
                        style={{width: widthToDp(10), height: heightToDp(10)}}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              paddingHorizontal: widthToDp(2),
              paddingBottom: 20,
            }}>
            {(bookingDetail.client_documents ||
              bookingDetail.agent_documents) &&
              (status === 'Accepted' ||
                (bookingDetail.status === 'to_be_paid' &&
                  bookingDetail.payment_type === 'on_agent')) &&
              bookingDetail.__typename !== 'Booking' && (
                <GradientButton
                  Title={'Join session'}
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    width: widthToDp(30),
                    paddingVertical: widthToDp(4),
                    marginTop: widthToDp(10),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                  onPress={() => {
                    navigation.navigate('WaitingRoomScreen', {
                      uid: bookingDetail?._id,
                      channel: bookingDetail?.agora_channel_name,
                      token: bookingDetail?.agora_channel_token,
                      time: bookingDetail?.time_of_booking,
                      date: bookingDetail?.date_of_booking,
                    });
                  }}
                  fontSize={widthToDp(4)}
                />
              )}
            {status === 'Travelling' && (
              <GradientButton
                Title={'Track Agent'}
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                GradiStyles={{
                  width: widthToDp(37),
                  paddingVertical: widthToDp(4),
                  marginTop: widthToDp(10),
                }}
                styles={{
                  padding: widthToDp(0),
                  fontSize: widthToDp(4),
                }}
                onPress={() => {
                  handleAddressPress(bookedByAddress?.location_coordinates);
                }}
                fontSize={widthToDp(3.5)}
                // loading={loading}
              />
            )}

            {status !== 'Completed' &&
              status !== 'To_be_paid' &&
              status !== 'Pending' && (
                <GradientButton
                  Title={'Upload documents'}
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    width: widthToDp(37),
                    paddingVertical: widthToDp(4),
                    marginTop: widthToDp(10),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                  onPress={() => {
                    selectDocuments();
                  }}
                  fontSize={widthToDp(3.5)}
                  loading={loading}
                />
              )}
            {bookingDetail.payment_type == 'on_notarizr' &&
              status == 'Payment_confirmed' &&
              status !== 'Accepted' &&
              status !== 'Completed' && (
                <GradientButton
                  Title={'Make payment'}
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    width: widthToDp(30),
                    paddingVertical: widthToDp(4),
                    marginTop: widthToDp(10),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                  onPress={handleMakePayment}
                  // onPress={() => {
                  //   navigation.navigate('ToBePaidScreen', {
                  //     bookingData: bookingDetail,
                  //   });
                  // }}
                  fontSize={widthToDp(3.5)}
                />
              )}
            {bookingDetail.__typename === 'Booking' &&
              status == 'To_be_paid' && (
                <GradientButton
                  Title={'Make payments'}
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    width: widthToDp(30),
                    paddingVertical: widthToDp(4),
                    marginTop: widthToDp(10),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                  onPress={() => {
                    navigation.navigate('ToBePaidScreen', {
                      bookingData: bookingDetail,
                    });
                  }}
                  fontSize={widthToDp(3.5)}
                />
              )}
          </View>
        </ScrollView>
        {/* {isVisible ? ( */}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          snapPoints={snapPoints}
          index={1}>
          <ReviewPopup
            onPress={() => handleReduxPayment()}
            rating={rating}
            handleStarPress={handleStarPress}
            handleReviewSubmit={handleReview}
            onClose={handleClose}
          />
        </BottomSheetModal>

        <ModalCheck
          modalVisible={modalShow}
          setModalVisible={setModalShow}
          onSubmit={() => closeModal()}
          onChangeText={text => setFeedback(text)}
          defaultValue={feedback}
        />
      </BottomSheetStyle>
    </SafeAreaView>
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
  },
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
  },
  headingContainer: {
    marginLeft: widthToDp(6),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    flex: 3,
    color: Colors.TextColor,
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(6),
  },
  insideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightToDp(2),
  },
  iconContainer: {
    alignContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  insideText: {
    marginHorizontal: widthToDp(3),
    fontSize: widthToDp(4.5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  greenIcon: {
    width: widthToDp(5),
    height: heightToDp(5),
  },
  nameContainer: {
    marginVertical: heightToDp(2),
    alignSelf: 'center',
  },

  preference: {
    marginLeft: widthToDp(2),
    fontSize: widthToDp(4.5),
    color: Colors.TextColor,
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
  addressMargin: {
    marginTop: heightToDp(4),
    marginBottom: heightToDp(-2),
  },
  buttonFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: heightToDp(2),
  },
  dottedContianer: {
    alignItems: 'center',
    alignSelf: 'center',
    borderStyle: 'dotted',
    borderWidth: 2,
    borderColor: Colors.DisableColor,
    borderRadius: 5,
    marginTop: heightToDp(5),
    paddingVertical: heightToDp(2),
    width: widthToDp(80),
  },
  documentContainer: {
    flexDirection: 'row',
    marginTop: heightToDp(4),
    marginLeft: widthToDp(5),
    columnGap: widthToDp(3),
    rowGap: heightToDp(4),
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginHorizontal: 10,
  },
  downloadButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  uplodaText: {
    flex: 3,
  },
  downloadButton: {
    // flex: 1,
    width: 100,
    backgroundColor: Colors.Orange,
    padding: 10,
    borderRadius: 5,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  paymentbuttons: {
    paddingHorizontal: widthToDp(7),
    // backgroundColor: Colors.OrangeGradientEnd,
    marginLeft: widthToDp(5),
    width: widthToDp(30),
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 30,
    alignItems: 'center',
  },
});
{
  /* <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: widthToDp(8),
                  marginVertical: widthToDp(2),
                  flexWrap: 'wrap',
                  columnGap: widthToDp(2),
                  rowGap: widthToDp(2),
                }}>
                {/* {updatedDocs &&
                  updatedDocs.map((image, index) => (
                    <Image
                      key={index}
                      source={require('../../../assets/docPic.png')}
                      style={{width: widthToDp(10), height: heightToDp(10)}}
                    />
                  ))} 
              </View> */
}
