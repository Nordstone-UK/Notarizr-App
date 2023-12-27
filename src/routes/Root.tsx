import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {FC, useEffect, useState} from 'react';
import {EventRegister} from 'react-native-event-listeners';
import notificationCacheMethods from '../cache/notification';
import AppNavigation from '../screens/Navigation/AppNavigation';
import useFetchBooking from '../hooks/useFetchBooking';
import {useDispatch} from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../features/booking/bookingSlice';

const Root: FC = (): JSX.Element => {
  const navigation: any = useNavigation();
  const dispatch: any = useDispatch();
  const {fetchBookingByID} = useFetchBooking();
  const dispatchingAgentData = async (bookingData: any) => {
    await dispatch(setBookingInfoState(bookingData));
    await dispatch(
      setCoordinates(bookingData?.agent?.current_location?.coordinates),
    );
    await dispatch(setUser(bookingData?.agent));
  };
  const dispatchingClientData = async (bookingData: any) => {
    await dispatch(setBookingInfoState(bookingData));
    await dispatch(
      setCoordinates(bookingData?.booked_by?.current_location?.coordinates),
    );
    await dispatch(setUser(bookingData?.booked_by));
  };
  useEffect(() => {
    const listener = EventRegister.addEventListener(
      'notfication',
      async data => {
        const {type, value} = data?.notification?.additionalData;
        console.log(type, value);
        if (type === 'session_created') {
          //get session by ID API
          //navigation.navigate('MedicalBookingScreen);
        } else if (type === 'booking_accepted') {
          console.log('Am I running? ');
          const bookingData = await fetchBookingByID(value);
          await dispatchingClientData(bookingData?.getBookingById?.booking);
          navigation.navigate('MedicalBookingScreen');
        } else if (type === 'booking_completed') {
          const bookingData = await fetchBookingByID(value);
          await dispatchingAgentData(bookingData?.getBookingById?.booking);
          navigation.navigate('ClientDetailsScreen');
        }
      },
    );
    return () => {
      EventRegister.removeAllListeners();
    };
  }, [navigation]);
  return <AppNavigation />;
};

const Wrapper: FC<{}> = ({}) => {
  return (
    <NavigationContainer>
      <Root />
    </NavigationContainer>
  );
};

export default Wrapper;
