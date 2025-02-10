import {useLazyQuery, useMutation} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {GET_CLIENT_BOOKING} from '../../request/queries/getClientBooking.query';
import {setBookingState} from '../features/bookingInfo/bookingInfoSlice';
import {useState} from 'react';
import {GET_AGENT_BOOKING} from '../../request/queries/getAgentBooking.query';
import {setBookingInfoState} from '../features/booking/bookingSlice';
import {GET_BOOKING_BY_ID} from '../../request/queries/getBookingByID.query';
import {UPDATE_BOOKING_INFO} from '../../request/mutations/updateBookingInfo.mutation';
import {GET_CLIENT_SESSION} from '../../request/queries/getClientSession.query';
import {GET_AGENT_SESSION} from '../../request/queries/getAgentSessions.query';
import {UPDATE_BOOKING_PRICE} from '../../request/mutations/updateBookingPrice.mutation';
import {UPDATE_SESSION_PRICEDOCS} from '../../request/mutations/updateSessionPriceDocs.mutation';
import {UPDATE_SESSION_AGENTDOCS} from '../../request/mutations/updateSessionAgentdocs';
import {GET_ADMIN_ALLOCATIONS} from '../../request/queries/getAdminAllocation.query';

const useFetchBooking = () => {
  const [getClientBooking] = useLazyQuery(GET_CLIENT_BOOKING);
  const [getAgentBooking] = useLazyQuery(GET_AGENT_BOOKING);
  const [getAdminAllocation] = useLazyQuery(GET_ADMIN_ALLOCATIONS);
  const [getBookingByID] = useLazyQuery(GET_BOOKING_BY_ID);
  const [updateBookingInfo] = useMutation(UPDATE_BOOKING_INFO);
  const [getClientSession] = useLazyQuery(GET_CLIENT_SESSION);
  const [getAgentSession] = useLazyQuery(GET_AGENT_SESSION);
  const [updateBookingPrice] = useMutation(UPDATE_BOOKING_PRICE);
  const [updateAgentDocuments] = useMutation(UPDATE_SESSION_AGENTDOCS);
  const [updateSessionPricsDoc] = useMutation(UPDATE_SESSION_PRICEDOCS);
  const dispatch = useDispatch();
  const [clientBooking, setClientBooking] = useState({
    status: 'pending',
    page: 1,
    pageSize: 50,
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
      // console.log('frhdkgvhkhdktg', data);
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
      console.log('requestdat', request);
      const {data} = await getAgentBooking(request);
      // console.log('Agent Booking iNfo', data);
      return sortBookingByDate(data?.getAgentBookings?.bookings);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchAdminAllocations = async status => {
    const request = {
      variables: {
        page: 1,
        pageSize: 50,
        agentRequestStatus: status,
      },
    };
    try {
      console.log('requestdat', request);
      const {data} = await getAdminAllocation(request);
      console.log('Admin alloction iiiiiiiiii iNfo', data);
      return sortBookingByDate(data?.getAdminAllocations?.allocation);
    } catch (error) {
      console.log(error);
    }
  };
  const updateAgentdocs = async (id, docs) => {
    const request = {
      variables: {
        sessionId: id,
        agentDocuments: docs,
      },
    };
    try {
      console.log('reqddddddddddddt', request);
      const response = await updateAgentDocuments(request);
      console.log('Agent Booking sdsdd', response);
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
      console.log('reqeusrere', request);
      const response = await updateBookingInfo(request);
      console.log('====================================');
      console.log('Documents and Notes', response);
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
  const getTotalSessions = async () => {
    const request = {
      variables: {
        status: 'completed',
        page: 1,
        pageSize: 1000,
      },
    };
    try {
      const {data} = await getAgentSession(request);

      return data?.getAgentSessions?.totalDocs;
    } catch (error) {
      console.log(error);
    }
  };
  const handleClientSessions = async status => {
    const request = {
      variables: {
        ...clientBooking,
        status: status,
      },
    };
    try {
      const {data} = await getClientSession(request);

      return sortBookingByDate(data?.getClientSessions?.sessions);
    } catch (error) {
      console.log(error);
    }
  };
  const handleAgentSessions = async status => {
    const request = {
      variables: {
        ...clientBooking,
        status: status,
      },
    };
    try {
      const {data} = await getAgentSession(request);
      return sortBookingByDate(data?.getAgentSessions?.sessions);
    } catch (error) {
      console.log(error);
    }
  };
  const setBookingPrice = async (
    id,
    price,
    review,
    rating,
    notes,
    documents,
    client_docs,
  ) => {
    const request = {
      variables: {
        bookingId: id,
        totalPrice: parseFloat(price),
        review: review,
        rating: rating,
        notes: notes,
        proofDocuments: documents,
        documents: client_docs,
      },
    };
    console.log('Request', request);
    const response = await updateBookingPrice(request);
    console.log('Answer', response?.data?.updateBookingsInfo?.status);
    return response?.data?.updateBookingsInfo?.status;
  };
  const setSessionPrice = async (id, price, docs) => {
    const request = {
      variables: {
        sessionId: id,
        price: parseFloat(price),
        clientDocuments: docs,
      },
    };
    console.log('Request', request);
    const response = await updateSessionPricsDoc(request);
    console.log('Answer', response);
    return response?.data?.updateSessionR?.status;
  };
  return {
    fetchBookingInfo,
    fetchAgentBookingInfo,
    fetchAdminAllocations,
    handleupdateBookingInfo,
    fetchBookingByID,
    handleReviewSubmit,
    getTotalBookings,
    getTotalSessions,
    handleClientSessions,
    handleAgentSessions,
    setBookingPrice,
    setSessionPrice,
    updateAgentdocs,
  };
};

export default useFetchBooking;
