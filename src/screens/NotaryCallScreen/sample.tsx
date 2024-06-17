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
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import HomeScreenHeader from '../../../components/HomeScreenHeader/HomeScreenHeader';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import AgentCard from '../../../components/AgentCard/AgentCard';
import Colors from '../../../themes/Colors';
import { height, heightToDp, widthToDp } from '../../../utils/Responsive';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import useFetchBooking from '../../../hooks/useFetchBooking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { useDispatch, useSelector } from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../../features/booking/bookingSlice';
import WebView from 'react-native-webview';
import useStripeApi from '../../../hooks/useStripeApi';
import BigButton from '../../../components/BigButton/BigButton';
import OneSignal from 'react-native-onesignal';
import BottomSheet, {
  BottomSheetModal,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import useAgentService from '../../../hooks/useAgentService';

export default function AgentHomeScreen({ navigation }) {
  const { _id, isVerified } = useSelector(state => state.user.user);
  const data = useSelector(state => state.user.user);

  const { dispatchMobile, dispatchLocal, dispatchRON } = useAgentService();
  const bottomSheetRef = useRef(null);

  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const { fetchAgentBookingInfo, getTotalBookings } = useFetchBooking();
  const { checkUserStipeAccount } = useStripeApi();
  const [Booking, setBooking] = useState([]);
  const [totalBooking, setTotalBooknig] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null);

  const init = useCallback(async (status) => {
    const bookingDetail = await fetchAgentBookingInfo(status);
    const totalBookings = await getTotalBookings();
    setTotalBooknig(totalBookings);
    setBooking(bookingDetail);
  }, [fetchAgentBookingInfo, getTotalBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    init('pending');
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [init]);

  useEffect(() => {
    OneSignal.setExternalUserId(_id);
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Home screen sending...');
      init('pending');
    });
    return unsubscribe;
  }, [navigation, _id, init]);

  const handleNavigation = useCallback((item) => {
    navigation.navigate('ClientDetailsScreen', {
      clientDetail: item,
    });
    dispatch(setBookingInfoState(item));
    dispatch(setUser(item?.booked_by));
    dispatch(setCoordinates(item?.booked_by?.current_location?.coordinates));
  }, [dispatch, navigation]);

  const handleStripeAccount = useCallback(async (service) => {
    setLoading(true);
    setLoadingButton(service);
    try {
      const { isUserStripeOnboard } = await checkUserStipeAccount();
      if (
        isUserStripeOnboard.has_stripe_account &&
        isUserStripeOnboard.has_details_submitted
      ) {
        if (service === 'mobile_notary') {
          dispatchMobile('mobile_notary');
        } else {
          dispatchRON('ron');
        }
      } else {
        Alert.alert(
          'Please make a stripe account before using our services',
          '',
          [
            {
              text: 'Setup Stripe',
              onPress: () => {
                navigation.navigate('PaymentUpdateScreen');
              },
              style: 'default',
            },
          ],
          { cancelable: false },
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Congratulations! Welcome to Notarizr.',
        'Please setup your Stripe account in the profile section to accept bookings.',
        [
          {
            text: 'Setup Stripe',
            onPress: () => {
              navigation.navigate('PaymentUpdateScreen');
            },
            style: 'default',
          },
        ],
        { cancelable: false },
      );
    }
    setLoading(false);
    setLoadingButton(null);
  }, [checkUserStipeAccount, dispatchMobile, dispatchRON, navigation]);

  useEffect(() => {
    if (isVerified) {
      handleStripeAccount();
    }
  }, [isVerified, handleStripeAccount]);

  const verifiedStatus = useMemo(() => isVerified, [isVerified]);

  return (
    <>
      <SafeAreaView style={styles.container}>
        <AgentHomeHeader
          Title="Explore your opportunities here."
          Switch={true}
        />
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
                number={totalBooking || 0}
                Heading="Total Bookings"
                onPress={() => navigation.navigate('BookScreen')}
              />
            </View>
            <View
              style={{
                marginVertical: heightToDp(5),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <GradientButton
                viewStyle={{ width: widthToDp(35) }}
                Title="Mobile Notary Preferences"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() => {
                  setLoadingButton('mobile_notary');
                  handleStripeAccount('mobile_notary');
                }}
                loading={loading && loadingButton === 'mobile_notary'}
                fontSize={widthToDp(4)}
                GradiStyles={{ height: height * 0.1, paddingVertical: 10 }}
              />
              <GradientButton
                viewStyle={{ width: widthToDp(35) }}
                Title="Book RON Services"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() => {
                  setLoadingButton('ron');
                  handleStripeAccount('ron');
                }}
                loading={loading && loadingButton === 'ron'}
                fontSize={widthToDp(4)}
                GradiStyles={{ height: height * 0.1, paddingVertical: 10 }}
              />
            </View>
            <View style={styles.flexContainer}>
              <Text style={styles.Heading}>Service requests</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AllBookingScreen')}>
                <Text style={styles.subheaing}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              {Booking ? (
                Booking.length !== 0 ? (
                  <FlatList
                    data={Booking.slice(0, 2)}
                    keyExtractor={item => item._id}
                    style={{ marginBottom: heightToDp(50) }}
                    renderItem={({ item }) => {
                      return (
                        <ClientServiceCard
                          image={require('../../../../assets/agentLocation.png')}
                          calendarImage={require('../../../../assets/calenderIcon.png')}
                          source={{ uri: item.booked_by.profile_picture }}
                          bottomRightText={item.document_type}
                          bottomLeftText="Total"
                          agentName={
                            item.booked_by.first_name +
                            ' ' +
                            item.booked_by.last_name
                          }
                          agentAddress={item.booked_by.location}
                          status={item?.status}
                          OrangeText="At Home"
                          Button={true}
                          clientDetail={item}
                          onPress={() => handleNavigation(item)}
                          dateofBooking={item.date_of_booking}
                          timeofBooking={item.time_of_booking}
                          createdAt={item.createdAt}
                          servicetype={item.service_type}
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

      {!isVerified && (
        <BottomSheet
          snapPoints={['45%', '45%']}
          enableContentPanningGesture={false}
          enableHandlePanningGesture={false}
          enableOverDrag={false}
          index={1}
          backdropComponent={backdropProps => (
            <BottomSheetBackdrop
              {...backdropProps}
              opacity={0}
            />
          )}
        >
          {/* Your BottomSheet content */}
        </BottomSheet>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  contentContainer: {
    paddingBottom: heightToDp(10),
  },
  picture: {
    width: widthToDp(60),
    height: widthToDp(60),
    resizeMode: 'contain',
  },
  subheading: {
    color: Colors.LightGray,
    fontSize: widthToDp(4),
  },
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: widthToDp(5),
    marginTop: heightToDp(3),
  },
  Heading: {
    fontSize: widthToDp(5),
    fontWeight: 'bold',
    color: Colors.Black,
  },
  subheaing: {
    fontSize: widthToDp(4),
    color: Colors.Orange,
  },
});
