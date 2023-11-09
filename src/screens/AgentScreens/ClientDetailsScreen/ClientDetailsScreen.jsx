import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  SafeAreaView,
  RefreshControl,
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
import moment from 'moment';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import useRegister from '../../../hooks/useRegister';

export default function AgentMobileNotaryStartScreen({route, navigation}) {
  // const {clientDetail} = route.params;
  const clientDetail = useSelector(state => state.booking.booking);
  const {handlegetBookingStatus, handleUpdateBookingStatus} =
    useBookingStatus();
  const {uploadMultipleFiles} = useRegister();
  let {documents: documentArray} = clientDetail;
  const dispatch = useDispatch();
  const [status, setStatus] = useState();
  const [notary, setNotary] = useState();
  const [documents, setDocuments] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadDocs, setUploadDocs] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getBookingStatus();
      setRefreshing(false);
      console.log('Refreshing.....');
    }, 2000);
  }, []);
  // const handleRequestPayment = () => {
  //   navigation.navigate('PaymentCompletionScreen');
  // };
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
  const selectDocuments = async () => {
    const response = await uploadMultipleFiles();
    setDocuments(response);
    console.log('Uploaded Files', response);
  };
  const deleteDocument = index => {
    const updatedUris = [...documents];
    updatedUris.splice(index, 1);
    setDocuments(updatedUris);
  };
  const handleNext = () => {
    setNotary(null);
    setUploadDocs(false);
    setShowNotes(true);
  };
  const handleStatusChange = async string => {
    setLoading(true);
    try {
      await handleUpdateBookingStatus(string, clientDetail?._id);
      await getBookingStatus();
      console.log('====================================');
      console.log('status', status);
      console.log('====================================');
      if (status === 'Completed') {
        navigation.navigate('PaymentCompletionScreen');
      }
    } catch (error) {
      console.error('Error updating and fetching booking status:', error);
    }
    setLoading(false);
  };
  const handleComplete = () => {
    setUploadDocs(true);
    documentArray = {};
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        lastImg={require('../../../../assets/chatIcon.png')}
        lastImgPress={() => navigation.navigate('ChatScreen')}
      />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>{clientDetail.document_type.name}</Text>
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
              <Text style={styles.insideText}>{status}</Text>
            </View>
          </View>
          <ClientServiceCard
            image={require('../../../../assets/agentLocation.png')}
            source={{uri: clientDetail.booked_by.profile_picture}}
            bottomRightText={clientDetail.document_type.price}
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
            <View style={styles.addressView}>
              <Text
                style={{
                  fontSize: widthToDp(4),
                  marginLeft: widthToDp(1),
                  fontFamily: 'Manrope-Bold',
                  color: Colors.TextColor,
                }}>
                Service Type:
              </Text>
              {clientDetail?.service_type === 'mobile_notary' && (
                <Text style={styles.detail}>Mobile Notary</Text>
              )}
              {clientDetail?.service_type === 'ron' && (
                <Text style={styles.detail}>Remote Online Notary</Text>
              )}
            </View>
            <View style={styles.addressView}>
              <Image
                source={require('../../../../assets/locationIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                {capitalizeFirstLetter(clientDetail?.booked_by?.location)}
              </Text>
            </View>
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
            <Text style={styles.insideHeading}>Uploaded Documents</Text>

            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: widthToDp(7),
                marginVertical: widthToDp(2),
                flexWrap: 'wrap',
                columnGap: widthToDp(2),
                rowGap: widthToDp(2),
              }}>
              {Object.keys(documentArray).length !== 0 ? (
                Object.keys(documentArray).map((key, index) => (
                  <Image
                    key={index}
                    source={require('../../../../assets/docPic.png')}
                    style={{width: widthToDp(10), height: heightToDp(10)}}
                  />
                ))
              ) : (
                <Text style={styles.preference}>No Documents</Text>
              )}
            </View>
          </View>

          {showNotes && (
            <LabelTextInput
              LabelTextInput="Notes"
              placeholder="Write notes here"
              Label={true}
            />
          )}
          <View style={styles.buttonFlex}>
            {status === 'Pending' && (
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
          <View style={styles.buttonBottom}>
            {notary === 'Ongoing' && !uploadDocs && (
              <GradientButton
                Title="Complete Notary"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() => handleComplete()}
                loading={loading}
              />
            )}
            {uploadDocs && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: widthToDp(1),
                }}>
                <GradientButton
                  Title="Upload Documents"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{paddingHorizontal: widthToDp(3)}}
                  styles={{padding: 0}}
                  onPress={() => selectDocuments()}
                />
                <GradientButton
                  Title="Next"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    marginHorizontal: widthToDp(3),
                    paddingVertical: heightToDp(1),
                  }}
                  styles={{
                    padding: widthToDp(3),
                  }}
                  onPress={() => handleNext()}
                />
              </View>
            )}
            {notary === null && showNotes ? (
              <GradientButton
                Title="Request Payment"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() => handleStatusChange('completed')}
                loading={loading}
                GradiStyles={{marginVertical: widthToDp(5)}}
              />
            ) : null}
          </View>
        </ScrollView>
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
    marginTop: heightToDp(5),
  },
  buttonFlex: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
