import {useMutation} from '@apollo/client';
import {UPDATE_BOOKING_STATUS} from '../../request/mutations/updateBookingStatus.mutation';
import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
const useBookingStatus = () => {
  const navigation = useNavigation();
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS);
  const [bookingRequest, setBookingRequset] = useState({
    bookingId: null,
    status: null,
  });
  const handleUpdateBookingStatus = async (status, id) => {
    const request = {
      variables: {
        bookingId: id,
        status: status,
      },
    };
    console.log('request', request);
    try {
      const response = await updateBookingStatus(request);
      console.log('response for Booking', response);
      console.log(
        'response for Booking Status',
        response.data.updateBookingStatusR.booking.status,
      );
      if (response.data.updateBookingStatusR.booking.status === 'accepted') {
        navigation.navigate('BookingAcceptedScreen');
      } else if (
        response.data.updateBookingStatusR.booking.status === 'rejected'
      ) {
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {handleUpdateBookingStatus, setBookingRequset};
};

export default useBookingStatus;
