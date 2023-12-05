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
} from 'react-native';
import React, {useState, useEffect} from 'react';
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
import {downloadFile} from '../../utils/RnDownload';

export default function MedicalBookingScreen({route, navigation}) {
  const {handlegetBookingStatus, handleUpdateBookingStatus} =
    useBookingStatus();
  const {handleReviewSubmit} = useFetchBooking();
  const payment = useSelector(state => state.payment.payment);
  const dispatch = useDispatch();
  const {handleCallSupport} = useCustomerSuport();
  const bookingDetail = useSelector(state => state.booking.booking);
  const [feedback, setFeedback] = useState();
  const {documents} = bookingDetail;
  const {booked_for} = bookingDetail;
  const [modalShow, setModalShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [status, setStatus] = useState();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const handleStarPress = selectedRating => {
    setRating(selectedRating);
  };
  const handleReview = reviewGiven => {
    setReview(reviewGiven);
  };
  function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const handleStatusChange = async () => {
    setLoading(true);
    try {
      await handleUpdateBookingStatus('ongoing', bookingDetail?._id);
      await getBookingStatus();
    } catch (error) {
      console.error('Error updating and fetching booking status:', error);
    }
    setLoading(false);
  };
  const getBookingStatus = async () => {
    try {
      const status = await handlegetBookingStatus(bookingDetail?._id);
      setStatus(capitalizeFirstLetter(status));
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
        setIsVisible(true);
      }
    }, [status]),
  );
  useEffect(() => {
    getBookingStatus();
    console.log('====================================');
    console.log(bookingDetail);
    console.log('====================================');
  }, [status]);
  const handleReduxPayment = async () => {
    setIsVisible(false);
    dispatch(paymentCheck());
    const response = await handleReviewSubmit(
      bookingDetail._id,
      review,
      rating,
    );
    console.log('====================================');
    console.log(response);
    console.log('====================================');
    if (response === '200') {
      setModalShow(true);
    }
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
          handleStatusChange();
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
    const names = arr.map(obj => obj.name);
    const namesString = names.join(', ');
    return namesString;
  }
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        payment={true}
        reset={true}
        lastImg={require('../../../assets/chatIcon.png')}
        lastImgPress={() => navigation.navigate('ChatScreen')}
        midImg={require('../../../assets/supportIcon.png')}
        midImgPress={() => handleCallSupport()}
      />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        {bookingDetail?.service_type === 'mobile_notary' && (
          <Text style={styles.Heading}>Mobile Notary</Text>
        )}
        {bookingDetail?.service_type === 'ron' && (
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
            <Text style={styles.insideHeading}>Selected agent</Text>
            <View style={styles.iconContainer}>
              {status === 'Pending' && (
                <Image
                  source={require('../../../assets/pending.png')}
                  style={styles.greenIcon}
                />
              )}
              {(status === 'Completed' ||
                status === 'Accepted' ||
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
                <Text style={styles.insideText}>{status}</Text>
              )}
            </View>
          </View>
          {bookingDetail &&
            (status !== 'Completed' ? (
              <AgentCard
                source={{uri: bookingDetail?.agent?.profile_picture}}
                bottomRightText={bookingDetail?.document_type}
                bottomLeftText="Total"
                image={require('../../../assets/agentLocation.png')}
                agentName={
                  bookingDetail?.agent?.first_name +
                  ' ' +
                  bookingDetail?.agent?.last_name
                }
                agentAddress={bookingDetail?.agent?.location}
                task={status || 'Loading'}
                OrangeText={'At Office'}
                dateofBooking={bookingDetail?.date_of_booking}
                timeofBooking={bookingDetail?.time_of_booking}
                createdAt={bookingDetail?.createdAt}
              />
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginHorizontal: widthToDp(5),
                  marginVertical: widthToDp(2),
                }}>
                <Image
                  source={{uri: bookingDetail?.agent?.profile_picture}}
                  style={{
                    width: widthToDp(15),
                    height: widthToDp(15),
                    borderRadius: widthToDp(5),
                  }}
                />
                <Text
                  style={[styles.insideHeading, {fontSize: widthToDp(4.5)}]}>
                  {bookingDetail?.agent?.first_name +
                    ' ' +
                    bookingDetail?.agent?.last_name}
                </Text>
              </View>
            ))}
          <View style={styles.sheetContainer}>
            <Text style={styles.insideHeading}>Booking Preferences</Text>
            <View>
              <Text
                style={{
                  fontSize: widthToDp(4),
                  marginLeft: widthToDp(1),
                  fontFamily: 'Manrope-Bold',
                  color: Colors.TextColor,
                  marginLeft: widthToDp(6),
                }}>
                Document Type:
              </Text>
              <Text style={[styles.detail, {marginLeft: widthToDp(6)}]}>
                {displayNamesWithCommas(bookingDetail.document_type)}
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
                    source={require('../../../assets/locationIcon.png')}
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
                  source={require('../../../assets/locationIcon.png')}
                  style={styles.locationImage}
                />
                <Text style={styles.detail}>
                  {capitalizeFirstLetter(bookingDetail?.agent?.location) ||
                    capitalizeFirstLetter(booked_for?.location)}
                </Text>
              </View>
            )}
            <View style={styles.addressView}>
              <Image
                source={require('../../../assets/calenderIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                {moment(bookingDetail?.date_of_booking).format('MM/DD/YYYY')}
                {'  '}
                {bookingDetail?.time_of_booking}
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
              {documents !== null ? (
                Object.keys(documents).length !== 0 ? (
                  Object.keys(documents).map((key, index) => (
                    <Image
                      key={index}
                      source={require('../../../assets/docPic.png')}
                      style={{width: widthToDp(10), height: heightToDp(10)}}
                    />
                  ))
                ) : (
                  <Text style={styles.preference}>No Documents</Text>
                )
              ) : (
                <Text style={styles.preference}>No Documents</Text>
              )}
            </View>
            {bookingDetail?.review && (
              <View>
                <View style={styles.addressView}>
                  <Text
                    style={{
                      fontSize: widthToDp(4),
                      marginLeft: widthToDp(1),
                      fontFamily: 'Manrope-Bold',
                      color: Colors.TextColor,
                    }}>
                    Rating:
                  </Text>
                  <Text style={styles.detail}>{bookingDetail?.rating}</Text>
                </View>
                <View style={styles.addressView}>
                  <Text
                    style={{
                      fontSize: widthToDp(4),
                      marginLeft: widthToDp(1),
                      fontFamily: 'Manrope-Bold',
                      color: Colors.TextColor,
                    }}>
                    Review:
                  </Text>
                  <Text style={styles.detail}>"{bookingDetail?.review}"</Text>
                </View>
              </View>
            )}
          </View>
          {bookingDetail?.service_type === 'ron' && (
            <GradientButton
              Title="Join Session"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                width: widthToDp(90),
                paddingVertical: widthToDp(4),
                marginTop: widthToDp(10),
              }}
              styles={{
                padding: widthToDp(0),
                fontSize: widthToDp(6),
              }}
              onPress={() =>
                navigation.navigate('NotaryCallScreen', {
                  uid: bookingDetail?._id,
                })
              }
            />
          )}
          {status === 'Pending' ? null : (
            <View style={styles.buttonFlex}>
              {status === 'Accepted' && (
                <>
                  <MainButton
                    Title="Track"
                    colors={[
                      Colors.OrangeGradientStart,
                      Colors.OrangeGradientEnd,
                    ]}
                    GradiStyles={{
                      width: widthToDp(40),
                      paddingVertical: widthToDp(2),
                    }}
                    styles={{
                      padding: widthToDp(0),
                      fontSize: widthToDp(5),
                    }}
                    onPress={() => navigation.navigate('MapArrivalScreen')}
                  />
                  <MainButton
                    Title="Start Notary"
                    colors={[
                      Colors.OrangeGradientStart,
                      Colors.OrangeGradientEnd,
                    ]}
                    GradiStyles={{
                      width: widthToDp(40),
                      paddingVertical: widthToDp(2),
                    }}
                    styles={{
                      padding: widthToDp(0),
                      fontSize: widthToDp(5),
                    }}
                    onPress={() => showConfirmation()}
                    loading={loading}
                  />
                </>
              )}
              {status === 'To_be_paid' && (
                <GradientButton
                  Title="Make Payment"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    width: widthToDp(90),
                    paddingVertical: widthToDp(4),
                    marginTop: widthToDp(10),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(6),
                  }}
                  onPress={() =>
                    navigation.navigate('ToBePaidScreen', {
                      bookingData: bookingDetail,
                    })
                  }
                />
              )}
            </View>
          )}
        </ScrollView>
        {isVisible ? (
          <BottomSheet modalProps={{}} isVisible={isVisible}>
            <ReviewPopup
              onPress={() => handleReduxPayment()}
              rating={rating}
              handleStarPress={handleStarPress}
              handleReviewSubmit={handleReview}
            />
          </BottomSheet>
        ) : null}
      </BottomSheetStyle>
      <ModalCheck
        modalVisible={modalShow}
        onSubmit={() => closeModal()}
        onChangeText={text => setFeedback(text)}
        defaultValue={feedback}
      />
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
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  headingContainer: {
    marginLeft: widthToDp(6),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
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
  buttonFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: heightToDp(2),
  },
});
