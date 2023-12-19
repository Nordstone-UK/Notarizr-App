import {Image, StyleSheet, Text, SafeAreaView} from 'react-native';
import React, {useEffect, useRef} from 'react';
import Colors from '../../themes/Colors';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import useGetService from '../../hooks/useGetService';
import LottieView from 'lottie-react-native';
import useCreateBooking from '../../hooks/useCreateBooking';
import Toast from 'react-native-toast-message';
import useFetchBooking from '../../hooks/useFetchBooking';

export default function NearbyLoadingScreen({route, navigation}) {
  const {serviceType} = route.params;
  const {FetchMobileNotary, RONfetchAPI} = useGetService();
  const {fetchBookingByID} = useFetchBooking();
  const {handleBookingCreation} = useCreateBooking();
  const handleAgentSearch = async () => {
    try {
      const response = await FetchMobileNotary(serviceType);
      console.log('====================================');
      console.log('fetching agent', response);
      console.log('====================================');
      const {user} = response;
      const {service} = user;

      if (response?.status === '200') {
        try {
          const response = await handleBookingCreation(user._id, service._id);
          console.log('====================================');
          console.log(response);
          console.log('====================================');
          const {booking} = response;

          const bookingData = await fetchBookingByID(booking._id);
          // console.log('====================================');
          // console.log('booking', bookingData.getBookingById);
          // console.log('====================================');
          if (response.status === '201') {
            navigation.navigate('ToBePaidScreen', {
              bookingData: bookingData.getBookingById.booking,
            });
          } else {
            Toast.show({
              type: 'error',
              text1: 'Please try again',
            });
            navigation.navigate('HomeScreen');
          }
        } catch (error) {
          console.warn(error);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Please try again',
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error Somwhere', error);
    }
  };
  // const handleRONSearch = async () => {
  //   try {
  //     const response = await RONfetchAPI();
  //     console.log('====================================');
  //     console.log('response', response.data);
  //     console.log('====================================');
  //     // const {user} = response;
  //     // const {service} = user;
  //     //  if (response?.status === '200') {
  //     //    try {
  //     //      const response = await handleBookingCreation(user._id, service._id);
  //     //      const {booking} = response;

  //     //      const bookingData = await fetchBookingByID(booking._id);
  //     //      // console.log('====================================');
  //     //      // console.log('booking', bookingData.getBookingById);
  //     //      // console.log('====================================');
  //     //      if (response.status === '201') {
  //     //        navigation.navigate('ToBePaidScreen', {
  //     //          bookingData: bookingData.getBookingById.booking,
  //     //        });
  //     //      } else {
  //     //        Toast.show({
  //     //          type: 'error',
  //     //          text1: 'Please try again',
  //     //        });
  //     //        navigation.navigate('HomeScreen');
  //     //      }
  //     //    } catch (error) {
  //     //      console.warn(error);
  //     //    }
  //     //  } else {
  //     //    Toast.show({
  //     //      type: 'error',
  //     //      text1: 'Please try again',
  //     //    });
  //     //    navigation.goBack();
  //     //  }
  //   } catch (error) {
  //     console.error('Error Somwhere', error);
  //   }
  // };
  // const init = () => {
  //   ron ? handleRONSearch() : handleAgentSearch();
  // };
  useEffect(() => {
    handleAgentSearch();
    // init();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Loading" />
      <LottieView
        source={require('../../../assets/loadingAnimation.json')}
        autoPlay
        loop
        style={{width: widthToDp(100), height: heightToDp(100)}}
      />
      <Text style={styles.heading}>
        We are allocating our best agents to perform the job
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  loading: {
    alignSelf: 'center',
  },
  heading: {
    alignSelf: 'center',
    marginTop: heightToDp(5),
    fontSize: widthToDp(6.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    width: widthToDp(90),
    textAlign: 'center',
  },
  subhheading: {
    alignSelf: 'center',
    marginTop: heightToDp(5),
    fontSize: widthToDp(5),
    fontFamily: 'Manrop-Bold',
    color: Colors.TextColor,
    textAlign: 'center',
  },
});
