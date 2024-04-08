import {Image, StyleSheet, Text, SafeAreaView, BackHandler} from 'react-native';
import React, {useEffect, useRef} from 'react';
import Colors from '../../themes/Colors';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import useGetService from '../../hooks/useGetService';
import LottieView from 'lottie-react-native';
import useCreateBooking from '../../hooks/useCreateBooking';
import Toast from 'react-native-toast-message';
import useFetchBooking from '../../hooks/useFetchBooking';
import {useDispatch, useSelector} from 'react-redux';
import useBookingStatus from '../../hooks/useBookingStatus';
import {useSession} from '../../hooks/useSession';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../features/booking/bookingSlice';

export default function NearbyLoadingScreen({route, navigation}) {
  const serviceType = useSelector(state => state.booking?.booking?.serviceType);
 
  const {FetchMobileNotary} = useGetService();
  const {fetchBookingByID} = useFetchBooking();
  const {handleBookingCreation} = useCreateBooking();
  const {handleUpdateBookingStatus} = useBookingStatus();
  const {updateSession} = useSession();
  const dispatch = useDispatch();

  const handleAgentSearch = async () => {
    try {
      const response = await FetchMobileNotary(serviceType);
      const {user} = response;
      const {service} = user;
      // console.log('Agent Search Response:', response);
      if (response?.status === '200') {
        
        try {
          const response = await handleBookingCreation(user._id, service._id);
          console.log("sdsdsdsds",user._id,service._id)
          const {booking} = response;
          
          const bookingData = await fetchBookingByID(booking._id);

          console.log('booking', booking._id);

          const getBookingById = bookingData?.getBookingById;
           
          // console.log(getBookingById);
          if (response.status === '201') {
            if (bookingData?.__typename !== 'Session') {
              await handleUpdateBookingStatus('pending', booking._id);
            } else {
             
              await updateSession('accepted', booking._id);
            }
            dispatch(setBookingInfoState(getBookingById?.booking));
            dispatch(
              setCoordinates(
                getBookingById?.agent?.current_location?.coordinates,
              ),
            );

            dispatch(setUser(getBookingById?.agent));
            navigation.navigate('AgentBookCompletion');
            // navigation.navigate('ToBePaidScreen', {
            //   bookingData: bookingData?.getBookingById?.booking,
            // });
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
  React.useEffect(() => {
    const disableBackButtonHandler = () => {
      return true; // Returning `true` will prevent the default back behavior
    };

    BackHandler.addEventListener('hardwareBackPress', disableBackButtonHandler);

    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        disableBackButtonHandler,
      );
    };
  }, []);
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
