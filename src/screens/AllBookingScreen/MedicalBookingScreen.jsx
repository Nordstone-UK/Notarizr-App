import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';
import AgentCard from '../../components/AgentCard/AgentCard';
import MainButton from '../../components/MainGradientButton/MainButton';
import AgentReviewCard from '../../components/AgentReviewCard/AgentReviewCard';
import {useDispatch, useSelector} from 'react-redux';
import {BottomSheet, Button, ListItem} from '@rneui/themed';
import ReviewPopup from '../../components/ReviewPopup/ReviewPopup';
import {useFocusEffect} from '@react-navigation/native';
import {paymentCheck} from '../../features/review/reviewSlice';
import useBookingStatus from '../../hooks/useBookingStatus';
import GradientButton from '../../components/MainGradientButton/GradientButton';

export default function MedicalBookingScreen({route, navigation}) {
  const {handlegetBookingStatus} = useBookingStatus();
  const payment = useSelector(state => state.payment.payment);
  const item = route.params.item;
  // console.log('item', item);
  const [isVisible, setIsVisible] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [status, setStatus] = useState();
  function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const dispatch = useDispatch();
  useFocusEffect(
    React.useCallback(() => {
      setIsVisible(payment);
    }, [payment]),
  );
  const getBookingStatus = async () => {
    try {
      const status = await handlegetBookingStatus(item._id);
      setStatus(capitalizeFirstLetter(status));
    } catch (error) {
      console.error('Error retrieving booking status:', error);
    }
  };
  useEffect(() => {
    getBookingStatus();
    console.log('adwwadaawd', status);
  }, [status]);
  const handleReduxPayment = () => {
    setIsVisible(false);
    dispatch(paymentCheck());
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getBookingStatus();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Booking" />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>Medical documents</Text>
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
              {status === 'Pending' ? (
                <Image
                  source={require('../../../assets/pending.png')}
                  style={styles.greenIcon}
                />
              ) : (
                <Image
                  source={require('../../../assets/greenIcon.png')}
                  style={styles.greenIcon}
                />
              )}
              <Text style={styles.insideText}>{status}</Text>
            </View>
          </View>
          {status !== 'Completed' ? (
            <AgentCard
              source={{uri: item.agent.profile_picture}}
              bottomRightText="$400"
              bottomLeftText="Total"
              image={require('../../../assets/agentLocation.png')}
              agentName={item.agent.first_name + ' ' + item.agent.last_name}
              agentAddress={item.agent.location}
              task={item.status}
              OrangeText={'At Office'}
              dateofBooking={item.date_of_booking}
              timeofBooking={item.time_of_booking}
              createdAt={item.createdAt}
            />
          ) : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                marginHorizontal: widthToDp(5),
                marginVertical: widthToDp(2),
              }}>
              <Image
                source={{uri: item.agent.profile_picture}}
                style={{
                  width: widthToDp(15),
                  height: widthToDp(15),
                  borderRadius: widthToDp(5),
                }}
              />
              <Text style={[styles.insideHeading, {fontSize: widthToDp(4)}]}>
                {item.agent.first_name + ' ' + item.agent.last_name}
              </Text>
            </View>
          )}

          <View style={styles.sheetContainer}>
            <Text style={styles.insideHeading}>Booking Preferences</Text>
            <View style={styles.addressView}>
              <Image
                source={require('../../../assets/locationIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                Legal building, James street, New York
              </Text>
            </View>
            <View style={styles.addressView}>
              <Image
                source={require('../../../assets/calenderIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>02/08/1995 , 04:30 PM</Text>
            </View>
            <Text style={styles.preference}>Notes:</Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences
            </Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences
            </Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences
            </Text>
          </View>
          {status === 'Pending' ? null : (
            <View style={styles.buttonFlex}>
              {status !== 'Completed' ? (
                <>
                  <MainButton
                    Title="Chat"
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
                    onPress={() => navigation.navigate('ChatScreen')}
                  />
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
                </>
              ) : (
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
                  onPress={() => navigation.navigate('PaymentScreen')}
                />
              )}
            </View>
          )}
        </ScrollView>
        {isVisible ? (
          <BottomSheet modalProps={{}} isVisible={isVisible}>
            <ReviewPopup onPress={() => handleReduxPayment()} />
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
    fontWeight: '500',
  },
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  headingContainer: {
    marginLeft: widthToDp(4),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(5),
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
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
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
    tintColor: Colors.DullTextColor,
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: widthToDp(4),
  },
  buttonFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: heightToDp(2),
  },
});
