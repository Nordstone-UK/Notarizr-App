import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  Image,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import MainButton from '../../../components/MainGradientButton/MainButton';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import Colors from '../../../themes/Colors';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import useFetchBooking from '../../../hooks/useFetchBooking';
import {ScrollView} from 'react-native-virtualized-view';
import {useDispatch, useSelector} from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../../features/booking/bookingSlice';

export default function AgentAllBookingScreen({navigation}) {
  const [isFocused, setIsFocused] = useState('accepted');
  const {fetchAgentBookingInfo, handleAgentSessions} = useFetchBooking();
  const [Booking, setBooking] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mergerData, setMergerData] = useState([]);
  const [loading, setLoading] = useState(false);

  const account_type = useSelector(state => state.user.user.account_type);
  const dispatch = useDispatch();
  const init = async status => {
    console.log('astssdfdfff', status);
    setLoading(true);
    const bookingDetail = await fetchAgentBookingInfo(status);
    const sessionDetail = await handleAgentSessions(status);
    const mergedDetails = [...bookingDetail, ...sessionDetail];
    const sortedDetails = mergedDetails.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    setMergerData(sortedDetails);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // console.log('sending...');
      init('accepted');
      setIsFocused('accepted');
    });
    return unsubscribe;
  }, [navigation]);
  const callBookingsAPI = async status => {
    setBooking(null);
    setIsFocused(status);
    init(status);
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setBooking(null);
    init('accepted');
    setIsFocused('accepted');
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  const checkStatusNavigation = (status, item) => {
    if (status === 'accepted' && item?.__typename === 'mobile_notary') {
      dispatch(setBookingInfoState(item));
      dispatch(setUser(item?.booked_by));
      dispatch(setCoordinates(item?.booked_by?.current_location?.coordinates));
      navigation.navigate('MapArrivalScreen');
    } else {
      dispatch(setBookingInfoState(item));
      navigation.navigate('ClientDetailsScreen', {
        clientDetail: item,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AgentHomeHeader
        Title="Bookings"
        // SearchEnabled={true}
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
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{}}>
            <View
              style={{
                flexDirection: 'row',
                columnGap: widthToDp(5),
                marginHorizontal: widthToDp(10),
                alignSelf: 'center',
              }}>
              <MainButton
                Title="Accepted"
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
                        fontSize: widthToDp(5),
                      }
                    : {
                        color: Colors.TextColor,
                        paddingHorizontal: widthToDp(2),
                        paddingVertical: widthToDp(1),
                        fontSize: widthToDp(5),
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
                        fontSize: widthToDp(5),
                      }
                    : {
                        color: Colors.TextColor,
                        paddingHorizontal: widthToDp(2),
                        paddingVertical: widthToDp(1),
                        fontSize: widthToDp(5),
                      }
                }
                onPress={() => callBookingsAPI('pending')}
              />
              {account_type === 'client' && (
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
                          fontSize: widthToDp(5),
                        }
                      : {
                          color: Colors.TextColor,
                          paddingHorizontal: widthToDp(2),
                          paddingVertical: widthToDp(1),
                          fontSize: widthToDp(5),
                        }
                  }
                  onPress={() => callBookingsAPI('completed')}
                />
              )}
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
                        fontSize: widthToDp(5),
                      }
                    : {
                        color: Colors.TextColor,
                        paddingHorizontal: widthToDp(2),
                        paddingVertical: widthToDp(1),
                        fontSize: widthToDp(5),
                      }
                }
                onPress={() => callBookingsAPI('rejected')}
              />
            </View>
          </ScrollView>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              marginVertical: widthToDp(3),
            }}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.Orange} />
              </View>
            ) : mergerData.length !== 0 ? (
              <FlatList
                data={mergerData}
                keyExtractor={item => item._id}
                renderItem={({item}) => {
                  console.log('items', item);
                  return (
                    <ClientServiceCard
                      image={require('../../../../assets/agentLocation.png')}
                      calendarImage={require('../../../../assets/calenderIcon.png')}
                      servicetype={item.service_type}
                      source={{
                        uri: item?.booked_by?.profile_picture
                          ? `${item?.booked_by?.profile_picture}`
                          : `${item?.client?.profile_picture}`,
                      }}
                      bottomRightText={item?.document_type}
                      bottomLeftText="Total"
                      agentName={
                        item?.booked_by?.first_name &&
                        item?.booked_by?.last_name
                          ? `${item.booked_by.first_name} ${item.booked_by.last_name}`
                          : `${item.client.first_name} ${item.client.last_name}`
                      }
                      agentAddress={
                        item?.booked_by?.location
                          ? `${item?.booked_by?.location}`
                          : `${item?.client?.location}`
                      }
                      status={item?.status}
                      OrangeText="At Home"
                      onPress={
                        () => checkStatusNavigation(item?.status, item)
                        // navigation.navigate('ClientDetailsScreen', {
                        //   clientDetail: item,
                        // })
                      }
                      paymentType={item?.payment_type}
                      datetimesession={item?.date_time_session}
                      dateofBooking={item?.date_of_booking}
                      timeofBooking={item?.time_of_booking}
                      createdAt={item?.createdAt}
                    />
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
                  source={require('../../../../assets/emptyBox.png')}
                  style={[styles.picture]}
                />
                <Text style={styles.subheading}>No Booking Found...</Text>
              </View>
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
    // justifyContent: 'center',
    // alignContent: 'center',
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
  loadingContainer: {
    height: heightToDp(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
