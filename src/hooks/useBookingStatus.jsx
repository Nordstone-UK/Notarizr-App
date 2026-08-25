import {useLazyQuery, useMutation} from '@apollo/client';
import {UPDATE_BOOKING_STATUS} from '../../request/mutations/updateBookingStatus.mutation';
import {VERIFY_BOOKING_ARRIVAL_OTP} from '../../request/mutations/verifyBookingArrivalOTP.mutation';
import {useNavigation} from '@react-navigation/native';
import {GET_BOOKING_STATUS} from '../../request/queries/getBookingStatus.query';
import {GET_SESSION_STATUS} from '../../request/queries/getSessionStatus.query';
const useBookingStatus = () => {
  const navigation = useNavigation();
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS);
  const [verifyArrivalOtp] = useMutation(VERIFY_BOOKING_ARRIVAL_OTP);
  const [getBookingStatus] = useLazyQuery(GET_BOOKING_STATUS);
  const [getSession] = useLazyQuery(GET_SESSION_STATUS);
  const handleUpdateBookingStatus = async (status, id, options = {}) => {
    const shouldNavigate = options.navigate !== false;
    const request = {
      variables: {
        bookingId: id,
        status: status,
      },
    };
    try {
      const response = await updateBookingStatus(request);
      const booking = response.data.updateBookingStatusR.booking;
      if (shouldNavigate && booking.status === 'accepted') {
        navigation.navigate('BookingAcceptedScreen');
      } else if (shouldNavigate && booking.status === 'rejected') {
        navigation.goBack();
      }
      return booking;
    } catch (error) {
      console.error(error);
      if (options.verifyPersistedStatus) {
        try {
          const verification = await getBookingStatus({
            variables: {bookingId: id},
            fetchPolicy: 'network-only',
          });
          const persistedStatus =
            verification?.data?.getBookingStatus?.booking_status;

          if (
            String(persistedStatus).toLowerCase() ===
            String(status).toLowerCase()
          ) {
            return {_id: id, status: persistedStatus};
          }
        } catch (verificationError) {
          console.warn(
            'Could not verify the persisted booking status:',
            verificationError,
          );
        }
      }
      if (options.throwOnError) {
        throw error;
      }
      return undefined;
    }
  };
  const handlegetBookingStatus = async id => {
    const request = {
      variables: {
        bookingId: id,
      },
    };
    try {
      const response = await getBookingStatus(request);
      return response.data.getBookingStatus.booking_status;
    } catch (error) {
      console.error(error);
    }
  };
  const handleSessionStatus = async id => {
    const request = {
      variables: {
        sessionId: id,
      },
    };
    try {
      const response = await getSession(request);
      return response.data.getSession.session?.status;
    } catch (error) {
      console.error(error);
    }
  };
  const handleVerifyArrivalOtp = async (bookingId, otp) => {
    const request = {
      variables: {
        bookingId,
        otp,
      },
    };
    const response = await verifyArrivalOtp(request);
    return response?.data?.verifyBookingArrivalOTPR;
  };
  return {
    handleUpdateBookingStatus,
    handlegetBookingStatus,
    handleSessionStatus,
    handleVerifyArrivalOtp,
  };
};

export default useBookingStatus;
