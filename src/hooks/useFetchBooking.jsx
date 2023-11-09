import {useLazyQuery} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {GET_CLIENT_BOOKING} from '../../request/queries/getClientBooking.query';
import {setBookingState} from '../features/bookingInfo/bookingInfoSlice';
import {useState} from 'react';
import {GET_AGENT_BOOKING} from '../../request/queries/getAgentBooking.query';
import {setBookingInfoState} from '../features/booking/bookingSlice';
import {GET_BOOKING_BY_ID} from '../../request/queries/getBookingByID.query';

const useFetchBooking = () => {
  const [getClientBooking] = useLazyQuery(GET_CLIENT_BOOKING);
  const [getAgentBooking] = useLazyQuery(GET_AGENT_BOOKING);
  const [getBookingByID] = useLazyQuery(GET_BOOKING_BY_ID);
  const dispatch = useDispatch();
  const [clientBooking, setClientBooking] = useState({
    status: 'pending',
    page: 1,
    pageSize: 5,
  });
  const fetchBookingInfo = async status => {
    const request = {
      variables: {
        ...clientBooking,
        status: status,
      },
    };
    try {
      const data = await getClientBooking(request);
      // dispatch(setBookingState(data?.getBookings?.bookings));
      // console.log('Client Booking iNfo', data?.data);

      return sortBookingByDate(data?.data?.getClientBookings?.bookings);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchAgentBookingInfo = async status => {
    const request = {
      variables: {
        ...clientBooking,
        status: status,
      },
    };
    try {
      const {data} = await getAgentBooking(request);
      // console.log('Agent Booking iNfo', data);
      return sortBookingByDate(data?.getAgentBookings?.bookings);
    } catch (error) {
      console.log(error);
    }
  };
  const sortBookingByDate = bookingArray => {
    return bookingArray.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  };
  const fetchBookingByID = async id => {
    const request = {
      variables: {
        bookingId: id,
      },
    };
    try {
      const response = await getBookingByID(request);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  return {fetchBookingInfo, fetchAgentBookingInfo, fetchBookingByID};
};

export default useFetchBooking;
