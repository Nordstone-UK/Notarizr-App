import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import HomeScreenHeader from '../../../components/HomeScreenHeader/HomeScreenHeader';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import AgentCard from '../../../components/AgentCard/AgentCard';
import Colors from '../../../themes/Colors';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import useFetchBooking from '../../../hooks/useFetchBooking';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-virtualized-view';
import {useDispatch, useSelector} from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../../features/booking/bookingSlice';
import WebView from 'react-native-webview';
import useStripeApi from '../../../hooks/useStripeApi';
import BigButton from '../../../components/BigButton/BigButton';
import OneSignal from 'react-native-onesignal';

export default function AgentHomeScreen({navigation}) {
  const {_id} = useSelector(state => state.user.user);

  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const {fetchAgentBookingInfo, getTotalBookings} = useFetchBooking();
  const {checkUserStipeAccount} = useStripeApi();
  const [Booking, setBooking] = useState([]);
  const [totalBooking, setTotalBooknig] = useState(0);
  const [loading, setLoading] = useState(false);
  const init = async status => {
    const bookingDetail = await fetchAgentBookingInfo(status);
    const totalBookings = await getTotalBookings();
    setTotalBooknig(totalBookings);
    setBooking(bookingDetail);
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    init('pending');
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  useEffect(() => {
    OneSignal.setExternalUserId(_id);
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Home screen sending...');
      init('pending');
    });
    return unsubscribe;
  }, [navigation]);
  const handleNavigation = item => {
    navigation.navigate('ClientDetailsScreen');
    dispatch(setBookingInfoState(item));
    dispatch(setUser(item?.booked_by));
    dispatch(setCoordinates(item?.booked_by?.current_location?.coordinates));
  };
  const handleStripeAccount = async () => {
    setLoading(true);
    const {isUserStripeOnboard} = await checkUserStipeAccount();
    if (
      isUserStripeOnboard.has_stripe_account &&
      isUserStripeOnboard.has_details_submitted
    ) {
      navigation.navigate('AgentMainBookingScreen');
    } else {
      Alert.alert(
        'Please make a stripe account before using our services',
        '',
        [
          {
            text: 'OK',
            onPress: async () => {
              navigation.navigate('PaymentUpdateScreen');
            },
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
    setLoading(false);
  };
  return (
    <SafeAreaView style={styles.container}>
      <AgentHomeHeader Title="Explore your opportunities here." Switch={true} />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.contentContainer}>
          <View
            style={{
              alignSelf: 'center',
            }}>
            <BigButton
              Heading="Total Payout"
              onPress={() => navigation.navigate('TransactionScreen')}
            />
            <BigButton
              number={totalBooking || 2}
              Heading="Total Bookings"
              onPress={() => navigation.navigate('BookScreen')}
            />
            <BigButton
              number={50}
              unitOfMeasurment="Miles"
              Heading="Miles Travelled"
            />
          </View>
          <View style={{marginVertical: heightToDp(5)}}>
            <GradientButton
              Title="Service Preferences"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => handleStripeAccount()}
              loading={loading}
            />
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.Heading}>Service requests</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllBookingScreen')}>
              <Text style={styles.subheaing}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1}}>
            {Booking ? (
              Booking.length !== 0 ? (
                <FlatList
                  data={Booking.slice(0, 2)}
                  keyExtractor={item => item._id}
                  renderItem={({item}) => {
                    return (
                      <ClientServiceCard
                        image={require('../../../../assets/agentLocation.png')}
                        source={{uri: item.booked_by.profile_picture}}
                        bottomRightText={item.document_type}
                        bottomLeftText="Total"
                        agentName={
                          item.booked_by.first_name +
                          ' ' +
                          item.booked_by.last_name
                        }
                        agentAddress={item.booked_by.location}
                        task={item?.status}
                        OrangeText="At Home"
                        Button={true}
                        clientDetail={item}
                        onPress={() => handleNavigation(item)}
                        dateofBooking={item.date_of_booking}
                        timeofBooking={item.time_of_booking}
                        createdAt={item.createdAt}
                        status={item.status}
                      />
                    );
                  }}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: widthToDp(10),
                  }}>
                  <Image
                    source={require('../../../../assets/emptyBox.png')}
                    style={styles.picture}
                  />
                  <Text style={styles.subheading}>No Booking Found...</Text>
                </View>
              )
            ) : (
              <ActivityIndicator size="large" color={Colors.Orange} />
            )}
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
  mainHeading: {
    fontSize: widthToDp(6.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginHorizontal: widthToDp(3),
  },
  Heading: {
    fontSize: widthToDp(6.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
  },
  contentContainer: {
    paddingVertical: heightToDp(5),
  },
  flexContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthToDp(3),
  },
  subheaing: {
    fontSize: widthToDp(4),
    fontWeight: '700',
    color: Colors.TextColor,
    alignSelf: 'center',
  },
  subheading: {
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    alignSelf: 'center',
    paddingRight: widthToDp(2),
  },
  CategoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: heightToDp(3),
  },
  PictureBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: heightToDp(1),
  },
  CategoryPictures: {
    marginVertical: heightToDp(2),
  },
  picture: {
    width: widthToDp(20),
    height: heightToDp(20),
  },
});
