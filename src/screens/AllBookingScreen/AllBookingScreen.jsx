import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
  FlatList,
  SafeAreaView,
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
import AcceptAgentCard from '../../components/AcceptAgentCard/AcceptAgentCard';
import AgentReviewCard from '../../components/AgentReviewCard/AgentReviewCard';
import {ScrollView} from 'react-native-virtualized-view';
import useFetchBooking from '../../hooks/useFetchBooking';
import {useDispatch} from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../features/booking/bookingSlice';
import {useStripe} from '@stripe/stripe-react-native';

export default function AllBookingScreen({route, navigation}) {
  const [isFocused, setIsFocused] = useState('accepted');
  const {fetchBookingInfo} = useFetchBooking();
  const [booking, setBooking] = useState();
  const dispatch = useDispatch();
  const init = async status => {
    const bookingDetail = await fetchBookingInfo(status);
    setBooking(bookingDetail);
  };
  useEffect(() => {
    init('accepted');
  }, []);
  const callBookingsAPI = async status => {
    setBooking(null);
    setIsFocused(status);
    init(status);
  };
  const handleAgentData = item => {
    navigation.navigate('MedicalBookingScreen', {
      item: item,
    });
    dispatch(setBookingInfoState(item));
    dispatch(setCoordinates(item?.booked_by?.current_location?.coordinates));
    dispatch(setUser(item?.agent));
  };
  return (
    <SafeAreaView style={styles.container}>
      <HomeScreenHeader Title="Find all your bookings with our agents here" />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
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
              <MainButton
                Title="Rejected"
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
          {booking ? (
            <FlatList
              data={booking}
              keyExtractor={item => item._id}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity onPress={() => handleAgentData(item)}>
                    <AgentCard
                      source={{uri: item.agent.profile_picture}}
                      bottomRightText="$400"
                      bottomLeftText="Total"
                      image={require('../../../assets/agentLocation.png')}
                      agentName={
                        item.agent.first_name + ' ' + item.agent.last_name
                      }
                      agentAddress={item.agent.location}
                      task={item.status}
                      OrangeText={'At Office'}
                      dateofBooking={item.date_of_booking}
                      timeofBooking={item.time_of_booking}
                      createdAt={item.createdAt}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <View>
              <ActivityIndicator size="large" color={Colors.Orange} />
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
});
