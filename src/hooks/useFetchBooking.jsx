import {useLazyQuery} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {GET_BOOKING} from '../../request/queries/getBooking.query';
import {setBookingState} from '../features/bookingInfo/bookingInfoSlice';

const useFetchBooking = () => {
  const [getBooking] = useLazyQuery(GET_BOOKING);
  const dispatch = useDispatch();

  const fetchBookingInfo = async () => {
    await getBooking().then(response => {
      dispatch(setBookingState(response.data.getBookings.bookings));
    });
  };

  return {fetchBookingInfo};
};

export default useFetchBooking;
