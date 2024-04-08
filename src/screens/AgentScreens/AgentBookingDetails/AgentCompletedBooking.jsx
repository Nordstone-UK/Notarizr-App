import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import React, {useDebugValue, useEffect, useState} from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import useFetchBooking from '../../../hooks/useFetchBooking';
import {ScrollView} from 'react-native-virtualized-view';
import {useDispatch} from 'react-redux';
import {setBookingInfoState} from '../../../features/booking/bookingSlice';

export default function AgentCompletedBooking({navigation}) {
  const {fetchAgentBookingInfo} = useFetchBooking();
  const [Booking, setBooking] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  const init = async status => {
    const bookingDetail = await fetchAgentBookingInfo(status);
    setBooking(bookingDetail);
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Completed sending...');
      init('completed');
    });
    return unsubscribe;
  }, [navigation]);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setBooking(null);
    init('completed');
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  const checkStatusNavigation = item => {
    // console.log('item?.status', item._id, item?.status);

    dispatch(setBookingInfoState(item));
    navigation.navigate('ClientDetailsScreen');
  };
  return (
    <SafeAreaView style={styles.container}>
      <AgentHomeHeader Title="Completed Bookings" Switch={true} />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.Heading}>Completed Booking</Text>
          <View style={{flex: 1}}>
            {Booking ? (
              Booking.length !== 0 ? (
                <FlatList
                  data={Booking}
                  keyExtractor={item => item._id}
                  renderItem={({item}) => {
                    return (
                      <ClientServiceCard
                        image={require('../../../../assets/agentLocation.png')}
                        calendarImage={require('../../../../assets/calenderIcon.png')}
                        servicetype={item.service_type}
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
                        onPress={() => checkStatusNavigation(item)}
                        dateofBooking={item.date_of_booking}
                        timeofBooking={item.time_of_booking}
                        createdAt={item.createdAt}
                       
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
  Heading: {
    fontSize: widthToDp(6.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginHorizontal: widthToDp(3),
  },
  contentContainer: {
    paddingVertical: heightToDp(5),
  },

  subheading: {
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
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
