import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
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
import {useDispatch} from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
} from '../../../features/booking/bookingSlice';
import WebView from 'react-native-webview';

export default function AgentHomeScreen({navigation}) {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const {fetchAgentBookingInfo} = useFetchBooking();
  const [Booking, setBooking] = useState([]);
  const init = async status => {
    const bookingDetail = await fetchAgentBookingInfo(status);
    // console.log(bookingDetail);
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
    init('pending');
  }, []);
  const handleNavigation = item => {
    navigation.navigate('ClientDetailsScreen', {clientDetail: item});
    // console.log('Redux sending item: ', item);
    dispatch(setCoordinates(item?.booked_by?.current_location?.coordinates));
    dispatch(setBookingInfoState(item.booked_by));
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
          <Text style={styles.mainHeading}>
            Know how Notarizr helps you in getting more oppurtunities
          </Text>
          <WebView
            source={{uri: 'https://www.youtube.com/watch?v=SgD7g0COp-I'}}
            style={{
              flex: 1,
              width: widthToDp(95),
              height: heightToDp(52),
              alignSelf: 'center',
              marginVertical: heightToDp(3),
            }}
          />
          <View style={{marginVertical: heightToDp(5)}}>
            <GradientButton
              Title="Select a service"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => navigation.navigate('AgentMainBookingScreen')}
            />
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.Heading}>Service requests</Text>
            <Text style={styles.subheaing}>View All</Text>
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
                        bottomLeftText={item.document_type.price}
                        agentName={
                          item.booked_by.first_name +
                          ' ' +
                          item.booked_by.last_name
                        }
                        agentAddress={item.booked_by.location}
                        task="Mobile"
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
