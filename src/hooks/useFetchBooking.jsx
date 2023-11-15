import {useLazyQuery, useMutation} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {GET_CLIENT_BOOKING} from '../../request/queries/getClientBooking.query';
import {setBookingState} from '../features/bookingInfo/bookingInfoSlice';
import {useState} from 'react';
import {GET_AGENT_BOOKING} from '../../request/queries/getAgentBooking.query';
import {setBookingInfoState} from '../features/booking/bookingSlice';
import {GET_BOOKING_BY_ID} from '../../request/queries/getBookingByID.query';
import {UPDATE_BOOKING_INFO} from '../../request/mutations/updateBookingInfo.mutation';

const useFetchBooking = () => {
  const [getClientBooking] = useLazyQuery(GET_CLIENT_BOOKING);
  const [getAgentBooking] = useLazyQuery(GET_AGENT_BOOKING);
  const [getBookingByID] = useLazyQuery(GET_BOOKING_BY_ID);
  const [updateBookingInfo] = useMutation(UPDATE_BOOKING_INFO);
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
  const handleupdateBookingInfo = async (id, notes, docs) => {
    const request = {
      variables: {
        bookingId: id,
        proofDocuments: docs,
        notes: notes,
        review: null,
        rating: null,
      },
    };
    try {
      const response = await updateBookingInfo(request);
      console.log('====================================');
      console.log(
        'Documents and Notes',
        response.data.updateBookingsInfo.status,
      );
      console.log('====================================');
      return response.data.updateBookingsInfo.status;
    } catch (error) {
      console.log(error);
    }
  };
  const handleReviewSubmit = async (id, review, rating) => {
    const request = {
      variables: {
        bookingId: id,
        review: review,
        rating: rating,
      },
    };
    try {
      const response = await updateBookingInfo(request);
      console.log('====================================');
      console.log(
        'Documents and Notes',
        response.data.updateBookingsInfo.status,
      );
      console.log('====================================');
      return response.data.updateBookingsInfo.status;
    } catch (error) {
      console.log(error);
    }
  };
  const getTotalBookings = async () => {
    const request = {
      variables: {
        status: 'completed',
        page: 1,
        pageSize: 1000,
      },
    };
    try {
      const {data} = await getAgentBooking(request);
      // console.log('Agent Booking iNfo', data);
      return data?.getAgentBookings?.totalDocs;
    } catch (error) {
      console.log(error);
    }
  };
  return {
    fetchBookingInfo,
    fetchAgentBookingInfo,
    handleupdateBookingInfo,
    fetchBookingByID,
    handleReviewSubmit,
    getTotalBookings,
  };
};

export default useFetchBooking;
