import {
  NavigationContainer,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import React, {FC, useEffect, useRef} from 'react';
import {Linking} from 'react-native';
import {EventRegister} from 'react-native-event-listeners';
import AppNavigation from '../screens/Navigation/AppNavigation';
import useFetchBooking from '../hooks/useFetchBooking';
import {useDispatch} from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../features/booking/bookingSlice';
import {useSession} from '../hooks/useSession';
import IncomingCallManager from '../components/Calls/IncomingCallManager';
import {
  normalizeSessionInviteParams,
  savePendingSessionInvite,
} from '../utils/sessionInvitation';

const Root: FC = (): JSX.Element => {
  const navigation: any = useNavigation();
  const dispatch: any = useDispatch();
  const {fetchBookingByID} = useFetchBooking();
  const {getSessionByID} = useSession();
  const fetchBookingByIDRef = useRef(fetchBookingByID);
  const getSessionByIDRef = useRef(getSessionByID);

  fetchBookingByIDRef.current = fetchBookingByID;
  getSessionByIDRef.current = getSessionByID;

  useEffect(() => {
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

    const openDeepLinkUrl = async (url?: string | null) => {
      const invite = normalizeSessionInviteParams(url || '');
      if (!invite) {
        if (/^notarizr:\/\/stripe\/card-return/i.test(url || '')) {
          return;
        }

        if (/^notarizr:\/\/stripe/i.test(url || '')) {
          navigation.navigate('PaymentUpdateScreen');
          return;
        }

        const bookingDetailId =
          (url || '').match(/^notarizr:\/\/booking-detail\/([^?]+)/i)?.[1] ||
          (url || '').match(/[?&]bookingId=([^&]+)/)?.[1];
        if (bookingDetailId) {
          const bookingData = await fetchBookingByIDRef.current(
            decodeURIComponent(bookingDetailId),
          );
          const booking = bookingData?.getBookingById?.booking;
          if (booking) {
            await dispatchingClientData(booking);
            navigation.navigate('MedicalBookingScreen');
          }
          return;
        }

        if (/^notarizr:\/\/book/i.test(url || '')) {
          const previewStep = (url || '').match(/[?&]previewStep=([^&]+)/)?.[1];
          navigation.dispatch(
            StackActions.replace('BookingFlowScreen', {
              serviceType: /mobile_notary/i.test(url || '')
                ? 'mobile_notary'
                : 'remote_online_notary',
              previewStep: previewStep ? decodeURIComponent(previewStep) : '',
            }),
          );
        }
        return;
      }
      await savePendingSessionInvite(invite);
      navigation.navigate('SessionInvitationScreen', invite);
    };

    const urlSubscription = Linking.addEventListener('url', event => {
      openDeepLinkUrl(event.url);
    });

    const listener = EventRegister.addEventListener(
      'notification',
      async data => {
        const {type, value} = data?.notification?.additionalData;

        if (type === 'session_created') {
          const item = await getSessionByIDRef.current(value);
          dispatch(setBookingInfoState(item));
          dispatch(setCoordinates(item?.client?.current_location?.coordinates));
          dispatch(setUser(item?.agent));
          navigation.navigate('MedicalBookingScreen');
        } else if (type === 'booking_accepted') {
          console.log('Am I running? ');
          const bookingData = await fetchBookingByIDRef.current(value);
          await dispatchingClientData(bookingData?.getBookingById?.booking);
          navigation.navigate('MedicalBookingScreen');
        } else if (
          type === 'booking_completed' ||
          type === 'booking_ongoing' ||
          type === 'booking_paid'
        ) {
          const bookingData = await fetchBookingByIDRef.current(value);
          await dispatchingAgentData(bookingData?.getBookingById?.booking);
          navigation.navigate('ClientDetailsScreen');
        }
      },
    );
    return () => {
      urlSubscription.remove();
      EventRegister.removeEventListener(listener);
    };
  }, [dispatch, navigation]);
  return (
    <>
      <AppNavigation />
      <IncomingCallManager navigation={navigation} />
    </>
  );
};

const Wrapper: FC<{}> = ({}) => {
  return (
    <NavigationContainer>
      <Root />
    </NavigationContainer>
  );
};

export default Wrapper;
