import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
  FlatList,
  SafeAreaView,
  Image,
  Text,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import {ScrollView} from 'react-native-virtualized-view';
import useFetchBooking from '../../hooks/useFetchBooking';
import {useDispatch, useSelector} from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../features/booking/bookingSlice';

export default function AllBookingScreen({route, navigation}) {
  const user = useSelector(state => state.user.user);
  const [isFocused, setIsFocused] = useState('accepted');
  const {fetchBookingInfo, handleClientSessions} = useFetchBooking();
  const [refreshing, setRefreshing] = useState(false);
  const [mergerData, setMergerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const init = async status => {
    setLoading(true);
    const bookingDetail = await fetchBookingInfo(status);
    const sessionDetail = await handleClientSessions(status);
    const mergedDetails = [...bookingDetail, ...sessionDetail];
    const sortedDetails = mergedDetails.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    setMergerData(sortedDetails);
    setLoading(false);
  };
  useEffect(() => {
    if (user != null) {
      const unsubscribe = navigation.addListener('focus', () => {
        init(isFocused);
        setIsFocused(isFocused);
      });
      return unsubscribe;
    }
  }, [navigation]);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (user != null) {
      init(isFocused);
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  const callBookingsAPI = async status => {
    setIsFocused(status);
    if (user != null) {
      init(status);
    }
  };
  const handleAgentData = item => {
    navigation.navigate('MedicalBookingScreen');
    dispatch(setBookingInfoState(item));
    dispatch(setCoordinates(item?.booked_by?.current_location?.coordinates));
    dispatch(setUser(item?.agent));
  };
  return (
    <SafeAreaView style={styles.container}>
      <HomeScreenHeader Title="My Journal" />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}>
          <ScrollView
            horizontal={true}
            contentContainerStyle={{}}
            showsHorizontalScrollIndicator={false}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                alignContent: 'center',
                columnGap: widthToDp(5),
                marginHorizontal: widthToDp(5),
              }}>
              <MainButton
                Title="Active"
                colors={
                  isFocused === 'accepted'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={
                  isFocused === 'accepted'
                    ? {
                        paddingHorizontal: widthToDp(2),
                        paddingVertical: widthToDp(1),
                        fontSize: widthToDp(4),
                      }
                    : {
                        color: Colors.TextColor,
                        paddingHorizontal: widthToDp(2),
                        paddingVertical: widthToDp(1),
                        fontSize: widthToDp(4),
                      }
                }
                onPress={() => callBookingsAPI('accepted')}
              />
              <MainButton
                Title="Pending"
                colors={
                  isFocused === 'pending'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={
                  isFocused === 'pending'
                    ? {
                        paddingHorizontal: widthToDp(2),
                        paddingVertical: widthToDp(1),
                        fontSize: widthToDp(4),
                      }
                    : {
                        color: Colors.TextColor,
                        paddingHorizontal: widthToDp(2),
                        paddingVertical: widthToDp(1),
                        fontSize: widthToDp(4),
                      }
                }
                onPress={() => callBookingsAPI('pending')}
              />
              <MainButton
                Title="Completed"
                colors={
                  isFocused === 'completed'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={
                  isFocused === 'completed'
                    ? {
                        paddingHorizontal: widthToDp(2),
                        paddingVertical: widthToDp(1),
                        fontSize: widthToDp(4),
                      }
                    : {
                        color: Colors.TextColor,
                        paddingHorizontal: widthToDp(2),
                        paddingVertical: widthToDp(1),
                        fontSize: widthToDp(4),
                      }
                }
                onPress={() => callBookingsAPI('completed')}
              />
              <MainButton
                Title="Rejected / Cancelled"
                colors={
                  isFocused === 'rejected'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={
                  isFocused === 'rejected'
                    ? {
                        paddingHorizontal: widthToDp(2),
                        paddingVertical: widthToDp(1),
                        fontSize: widthToDp(4),
                      }
                    : {
                        color: Colors.TextColor,
                        paddingHorizontal: widthToDp(2),
                        paddingVertical: widthToDp(1),
                        fontSize: widthToDp(4),
                      }
                }
                onPress={() => callBookingsAPI('rejected')}
              />
            </View>
          </ScrollView>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.Orange} />
            </View>
          ) : user != null ? (
            <View style={styles.bookingContainer}>
              {mergerData ? (
                mergerData.length !== 0 ? (
                  <FlatList
                    data={mergerData}
                    keyExtractor={item => item._id}
                    renderItem={({item}) => {
                      return (
                        <TouchableOpacity onPress={() => handleAgentData(item)}>
                          <AgentCard
                            source={{uri: item?.agent?.profile_picture}}
                            calendarImage={require('../../../assets/calenderIcon.png')}
                            servicetype={item.service_type}
                            bottomRightText={item?.document_type}
                            bottomLeftText="Total"
                            image={require('../../../assets/locationIcon.png')}
                            agentName={
                              item?.agent?.first_name +
                              ' ' +
                              item?.agent?.last_name
                            }
                            paymentType={item?.payment_type}
                            agentAddress={item?.agent?.location}
                            status={item?.status || 'Loading'}
                            OrangeText={'At Office'}
                            datetimesession={item?.date_time_session}
                            dateofBooking={item?.date_of_booking}
                            timeofBooking={item?.time_of_booking}
                            createdAt={item?.createdAt}
                          />
                        </TouchableOpacity>
                      );
                    }}
                  />
                ) : (
                  <View
                    style={{
                      height: heightToDp(100),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../../../assets/emptyBox.png')}
                      style={styles.picture}
                    />
                    <Text style={styles.subheading}>No Booking Found...</Text>
                  </View>
                )
              ) : (
                <View
                  style={{
                    height: heightToDp(100),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <ActivityIndicator size="large" color={Colors.Orange} />
                </View>
              )}
            </View>
          ) : (
            <View
              style={{
                minHeight: heightToDp(100),
                justifyContent: 'center',
                alignSelf: 'center',
              }}>
              <Image
                source={require('../../../assets/emptyBox.png')}
                style={styles.picture}
              />
              <Text
                style={[
                  styles.Heading,

                  {
                    fontSize: widthToDp(4),
                    fontFamily: 'Manrope-SemiBold',
                    fontWeight: '600',
                  },
                ]}>
                Please Login to see bookings
              </Text>
            </View>
          )}
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
  picture: {
    width: widthToDp(20),
    alignSelf: 'center',
    height: heightToDp(20),
  },
  Heading: {
    fontSize: widthToDp(6.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    paddingLeft: widthToDp(2),
  },
  contentContainer: {
    paddingVertical: heightToDp(5),
  },
  subheading: {
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    alignSelf: 'center',
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
  bookingContainer: {
    // borderWidth: 1,
    marginVertical: widthToDp(3),
  },
  loadingContainer: {
    height: heightToDp(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
