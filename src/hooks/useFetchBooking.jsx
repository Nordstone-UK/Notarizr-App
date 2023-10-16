import {useLazyQuery} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {GET_BOOKING} from '../../request/queries/getBooking.query';
import {setBookingState} from '../features/bookingInfo/bookingInfoSlice';

const useFetchBooking = () => {
  const [getBooking] = useLazyQuery(GET_BOOKING);
  const dispatch = useDispatch();

  const fetchBookingInfo = async () => {
    try {
      const {data, error} = await getBooking();
      // console.log('Printing', data);
      // dispatch(setBookingState(data?.getBookings?.bookings));
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  return {fetchBookingInfo};
};

export default useFetchBooking;
