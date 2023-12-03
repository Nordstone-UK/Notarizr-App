import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import {formatDateTime, heightToDp, widthToDp} from '../../../utils/Responsive';
import DocumentComponent from '../../../components/DocumentComponent/DocumentComponent';
import MainButton from '../../../components/MainGradientButton/MainButton';
import NavigationHeader from '../../../components/Navigation Header/NavigationHeader';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import useBookingStatus from '../../../hooks/useBookingStatus';
import {useDispatch, useSelector} from 'react-redux';
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
import {BottomSheet, Overlay} from '@rneui/base';
import UploadDocsSheet from '../../../components/UploadDocsSheet/UploadDocsSheet';
import {downloadFile} from '../../../utils/RnDownload';

export default function AgentMobileNotaryStartScreen({route, navigation}) {
  // const {clientDetail} = route.params;
  const clientDetail = useSelector(state => state.booking.booking);

  const {handlegetBookingStatus, handleUpdateBookingStatus} =
    useBookingStatus();
  const {handleupdateBookingInfo} = useFetchBooking();
  const {uploadMultipleFiles, uploadAllDocuments} = useRegister();
  const {handleCallSupport} = useCustomerSuport();
  let {documents: documentArray} = clientDetail;
  const {booked_for} = clientDetail;
  const {proof_documents} = clientDetail;
  const dispatch = useDispatch();
  const [status, setStatus] = useState();
  const [isVisible, setIsVisible] = useState(false);
  const [notary, setNotary] = useState();
  // const [documents, setDocuments] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [signaturePage, setSignaturePage] = useState();
  const [notaryBlock, setNotaryBlock] = useState();
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getBookingStatus();
      setRefreshing(false);
      console.log('Refreshing.....');
    }, 2000);
  }, []);
  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const handleClientData = item => {
    handleUpdateBookingStatus('accepted', clientDetail._id);
    dispatch(setBookingInfoState(clientDetail));
    dispatch(
      setCoordinates(clientDetail?.booked_by?.current_location?.coordinates),
    );
    dispatch(setUser(clientDetail?.booked_by));
  };
  const getBookingStatus = async () => {
    try {
      const status = await handlegetBookingStatus(clientDetail._id);
      setNotary(capitalizeFirstLetter(status));
      setStatus(capitalizeFirstLetter(status));
      // console.log('status', clientDetail._id, status);
    } catch (error) {
      console.error('Error retrieving booking status:', error);
    }
  };
  useEffect(() => {
    getBookingStatus();
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
  const handleStatusChange = async string => {
    setLoading(true);
    try {
      await handleUpdateBookingStatus(string, clientDetail?._id);
      await getBookingStatus();
      console.log('====================================');
      console.log('status', status);
      console.log('====================================');
      if (status === 'to_be_paid') {
        navigation.navigate('PaymentCompletionScreen');
      }
    } catch (error) {
      console.error('Error updating and fetching booking status:', error);
    }
    setLoading(false);
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
  function displayNamesWithCommas(arr) {
    const names = arr.map(obj => obj.name);
    const namesString = names.join(', ');
    return namesString;
  }
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        lastImg={require('../../../../assets/chatIcon.png')}
        lastImgPress={() => navigation.navigate('ChatScreen')}
        midImg={require('../../../../assets/supportIcon.png')}
        midImgPress={() => handleCallSupport()}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          // borderWidth: 1,
          justifyContent: 'space-between',
        }}>
        <View style={styles.headingContainer}>
          <Text style={styles.lightHeading}>Selected Service</Text>
          {clientDetail?.service_type === 'mobile_notary' && (
            <Text style={styles.Heading}>Mobile Notary</Text>
          )}
          {clientDetail?.service_type === 'ron' && (
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
            <Text style={styles.insideHeading}>Client details</Text>
            <View style={[styles.iconContainer]}>
              {status === 'Pending' && (
                <Image
                  source={require('../../../../assets/pending.png')}
                  style={styles.greenIcon}
                />
              )}
              {(status === 'Completed' ||
                status === 'Accepted' ||
                status === 'Ongoing') && (
                <Image
                  source={require('../../../../assets/greenIcon.png')}
                  style={styles.greenIcon}
                />
              )}
              {status === 'To_be_paid' ? (
                <>
                  <Image
                    source={require('../../../../assets/greenIcon.png')}
                    style={styles.greenIcon}
                  />
                  <Text style={styles.insideText}>To Be Paid</Text>
                </>
              ) : (
                <Text style={styles.insideText}>{status}</Text>
              )}
            </View>
          </View>
          <ClientServiceCard
            image={require('../../../../assets/agentLocation.png')}
            source={{uri: clientDetail.booked_by.profile_picture}}
            bottomRightText={clientDetail.document_type}
            bottomLeftText="Total"
            agentName={
              clientDetail.booked_by.first_name +
              ' ' +
              clientDetail.booked_by.last_name
            }
            agentAddress={clientDetail.booked_by.location}
            task={clientDetail?.status}
            OrangeText="At Home"
            onPress={() =>
              navigation.navigate('ClientDetailsScreen', {
                clientDetail: clientDetail,
              })
            }
            status={clientDetail.status}
            dateofBooking={clientDetail.date_of_booking}
            timeofBooking={clientDetail.time_of_booking}
            createdAt={clientDetail.createdAt}
          />
          <View style={styles.sheetContainer}>
            <Text style={[styles.insideHeading]}>Booking Preferences</Text>
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
                {displayNamesWithCommas(clientDetail.document_type)}
              </Text>
            </View>
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
            {!booked_for?.location && (
              <View style={styles.addressView}>
                <Image
                  source={require('../../../../assets/locationIcon.png')}
                  style={styles.locationImage}
                />
                <Text style={styles.detail}>
                  {capitalizeFirstLetter(clientDetail?.agent?.location)}
                </Text>
              </View>
            )}
            <View style={styles.addressView}>
              <Image
                source={require('../../../../assets/calenderIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                {moment(clientDetail?.date_of_booking).format('MM/DD/YYYY')}
                {'  '}
                {clientDetail?.time_of_booking}
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
                Client Documents
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: widthToDp(7),
                marginVertical: widthToDp(2),
                flexWrap: 'wrap',
                columnGap: widthToDp(2),
                rowGap: widthToDp(2),
              }}>
              {documentArray !== null ? (
                Object.keys(documentArray).length !== 0 ? (
                  Object.keys(documentArray).map((key, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => downloadFile(documentArray[key])}>
                      <Image
                        source={require('../../../../assets/docPic.png')}
                        style={{width: widthToDp(10), height: heightToDp(10)}}
                      />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.preference}>No Documents</Text>
                )
              ) : (
                <Text style={styles.preference}>No Documents</Text>
              )}
            </View>
          </View>
          <View style={styles.addressView}>
            <Text
              style={{
                fontSize: widthToDp(4),
                marginLeft: widthToDp(1),
                fontFamily: 'Manrope-Bold',
                color: Colors.TextColor,
              }}>
              Agent Documents
            </Text>
          </View>
          <View>
            {notaryBlock && signaturePage ? (
              <>
                <DocumentComponent
                  Title="Signature Page"
                  image={require('../../../../assets/Pdf.png')}
                  onPress={() => setSignaturePage(null)}
                />

                <DocumentComponent
                  Title="Notary Block"
                  image={require('../../../../assets/Pdf.png')}
                  onPress={() => setNotaryBlock(null)}
                />
              </>
            ) : notaryBlock ? (
              <DocumentComponent
                Title="Notary Block"
                image={require('../../../../assets/Pdf.png')}
                onPress={() => setNotaryBlock(null)}
              />
            ) : signaturePage ? (
              <DocumentComponent
                Title="Signature Page"
                image={require('../../../../assets/Pdf.png')}
                onPress={() => setSignaturePage(null)}
              />
            ) : (
              <Text style={[styles.preference, {marginLeft: widthToDp(10)}]}>
                No Documents
              </Text>
            )}
          </View>
          {showNotes && (
            <LabelTextInput
              LabelTextInput="Notes"
              placeholder="Write notes here"
              Label={true}
              onChangeText={text => setNotes(text)}
            />
          )}
          <View style={styles.buttonFlex}>
            {clientDetail?.service_type === 'mobile_notary' &&
              status === 'Pending' && (
                <>
                  <MainButton
                    Title="Accept"
                    colors={[
                      Colors.OrangeGradientStart,
                      Colors.OrangeGradientEnd,
                    ]}
                    onPress={() => handleClientData()}
                    GradiStyles={{
                      width: widthToDp(40),
                      paddingHorizontal: widthToDp(0),
                      paddingVertical: heightToDp(3),
                    }}
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
                    onPress={() =>
                      handleUpdateBookingStatus('rejected', clientDetail._id)
                    }
                    GradiStyles={{
                      width: widthToDp(40),
                      paddingHorizontal: widthToDp(0),
                      paddingVertical: heightToDp(3),
                    }}
                    styles={{
                      padding: widthToDp(0),
                      fontSize: widthToDp(4),
                    }}
                  />
                </>
              )}
          </View>
          <View style={styles.buttonFlex}>
            {clientDetail?.service_type === 'ron' && (
              <>
                <MainButton
                  Title="Add Observers"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() =>
                    navigation.navigate('AddObserverScreen', {
                      bookingId: clientDetail?._id,
                    })
                  }
                  GradiStyles={{
                    width: widthToDp(40),
                    paddingHorizontal: widthToDp(0),
                    paddingVertical: heightToDp(3),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                />
                <MainButton
                  Title="Join Session"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() =>
                    navigation.navigate('NotaryCallScreen', {
                      u_id: clientDetail?._id,
                    })
                  }
                  GradiStyles={{
                    width: widthToDp(40),
                    paddingHorizontal: widthToDp(0),
                    paddingVertical: heightToDp(3),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                />
              </>
            )}
          </View>
          <View style={styles.buttonBottom}>
            {notary === 'Ongoing' && (!notaryBlock || !signaturePage) && (
              <GradientButton
                Title="Upload Documents"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                GradiStyles={{padding: widthToDp(4)}}
                styles={{padding: 0, fontSize: widthToDp(5)}}
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
                  GradiStyles={{padding: widthToDp(4)}}
                  styles={{padding: 0, fontSize: widthToDp(5)}}
                  onPress={() => handleNext()}
                />
              )}
            {showNotes && (
              <View style={{marginBottom: widthToDp(5)}}>
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
        {isVisible ? (
          <BottomSheet
            isVisible={isVisible}
            modalProps={{
              statusBarTranslucent: true,
            }}>
            <UploadDocsSheet
              SignaturePagePress={() => handleSignaturePage()}
              NotaryBlockPress={() => handleNotaryBlock()}
              CancelPress={() => handleCancel()}
            />
          </BottomSheet>
        ) : null}
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
    fontSize: widthToDp(6),
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
    fontSize: widthToDp(6),
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
  buttonFlex: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

{
  {
    /* <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: widthToDp(90),
                  alignSelf: 'center',
                }}> */
  }

  {
    /* <GradientButton
                  Title="Next"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    marginHorizontal: widthToDp(3),
                  }}
                  styles={{
                    padding: widthToDp(3),
                    fontSize: widthToDp(5),
                  }}
                  onPress={() => handleNext()}
                /> */
  }
  {
    /* </View> */
  }
  /* {notary === null && showNotes ? (
              <GradientButton
                Title="Request Payment"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() => handlePaymentRequest()}
                loading={loading}
                GradiStyles={{marginVertical: widthToDp(5)}}
              />
            ) : null} */
}
