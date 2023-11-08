import {Image, StyleSheet, Text, SafeAreaView} from 'react-native';
import React, {useEffect, useRef} from 'react';
import Colors from '../../themes/Colors';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import useGetService from '../../hooks/useGetService';
import LottieView from 'lottie-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setBookingInfoState} from '../../features/booking/bookingSlice';
import useCreateBooking from '../../hooks/useCreateBooking';

export default function NearbyLoadingScreen({route, navigation}) {
  const {FetchMobileNotary} = useGetService();
  const {handleBookingCreation} = useCreateBooking();
  const handleAgentSearch = async () => {
    try {
      const response = await FetchMobileNotary();
      const {user} = response;
      const {service} = user;
      if (response?.status === '200') {
        try {
          const response = await handleBookingCreation(user._id, service._id);
          if (response === '201') {
            navigation.navigate('AgentBookCompletion');
          }
        } catch (error) {
          console.warn(error);
        }
      }
    } catch (error) {
      console.error('Error Somwhere', error);
    }
  };
  useEffect(() => {
    handleAgentSearch();
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
