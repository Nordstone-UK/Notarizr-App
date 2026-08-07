import {useLazyQuery, useMutation} from '@apollo/client';
import {GET_CLIENT_BOOKING} from '../../request/queries/getClientBooking.query';
import {GET_AGENT_BOOKING} from '../../request/queries/getAgentBooking.query';
import {GET_BOOKING_BY_ID} from '../../request/queries/getBookingByID.query';
import {UPDATE_BOOKING_INFO} from '../../request/mutations/updateBookingInfo.mutation';
import {GET_CLIENT_SESSION} from '../../request/queries/getClientSession.query';
import {GET_AGENT_SESSION} from '../../request/queries/getAgentSessions.query';
import {UPDATE_BOOKING_PRICE} from '../../request/mutations/updateBookingPrice.mutation';
import {UPDATE_SESSION_PRICEDOCS} from '../../request/mutations/updateSessionPriceDocs.mutation';
import {UPDATE_SESSION_AGENTDOCS} from '../../request/mutations/updateSessionAgentdocs';
import {GET_ADMIN_ALLOCATIONS} from '../../request/queries/getAdminAllocation.query';
import {useSelector} from 'react-redux';

const BOOKING_CACHE_MS = 30000;
const bookingCache = new Map();
const bookingRequests = new Map();

const readThroughCache = async (key, loader, forceRefresh = false) => {
  const cached = bookingCache.get(key);
  if (
    !forceRefresh &&
    cached &&
    Date.now() - cached.updatedAt < BOOKING_CACHE_MS
  ) {
    return cached.value;
  }

  if (!forceRefresh && bookingRequests.has(key)) {
    return bookingRequests.get(key);
  }

  const request = loader()
    .then(value => {
      const safeValue = Array.isArray(value) ? value : [];
      bookingCache.set(key, {updatedAt: Date.now(), value: safeValue});
      return safeValue;
    })
    .finally(() => {
      bookingRequests.delete(key);
    });

  bookingRequests.set(key, request);
  return request;
};

const useFetchBooking = () => {
  const currentUserId =
    useSelector(state => state.user.user?._id) || 'anonymous';
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
  const clientBooking = {
    status: 'pending',
    page: 1,
    pageSize: 50,
  };
  const fetchBookingInfo = async (status, forceRefresh = false) => {
    const request = {
      variables: {
        ...clientBooking,
        status: status,
      },
    };
    return readThroughCache(
      `${currentUserId}:client-bookings:${status}`,
      async () => {
        const data = await getClientBooking(request);
        return sortBookingByDate(data?.data?.getClientBookings?.bookings);
      },
      forceRefresh,
    );
  };
  const fetchAgentBookingInfo = async (status, forceRefresh = false) => {
    const request = {
      variables: {
        ...clientBooking,
        status: status,
      },
    };
    return readThroughCache(
      `${currentUserId}:agent-bookings:${status}`,
      async () => {
        const {data} = await getAgentBooking(request);
        return sortBookingByDate(data?.getAgentBookings?.bookings);
      },
      forceRefresh,
    );
  };
  const fetchAdminAllocations = async (status, forceRefresh = false) => {
    const request = {
      variables: {
        page: 1,
        pageSize: 50,
        agentRequestStatus: status,
      },
    };
    return readThroughCache(
      `${currentUserId}:agent-allocations:${status}`,
      async () => {
        const {data} = await getAdminAllocation(request);
        return sortBookingByDate(data?.getAdminAllocations?.allocation);
      },
      forceRefresh,
    );
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
      return response?.data?.updateSessionR;
    } catch (error) {
      console.log(error);
    }
  };
  const sortBookingByDate = bookingArray => {
    if (!Array.isArray(bookingArray)) {
      return [];
    }

    return [...bookingArray].sort(
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
  const handleClientSessions = async (status, forceRefresh = false) => {
    const request = {
      variables: {
        ...clientBooking,
        status: status,
      },
    };
    return readThroughCache(
      `${currentUserId}:client-sessions:${status}`,
      async () => {
        const {data} = await getClientSession(request);
        return sortBookingByDate(data?.getClientSessions?.sessions);
      },
      forceRefresh,
    );
  };
  const handleAgentSessions = async (status, forceRefresh = false) => {
    const request = {
      variables: {
        ...clientBooking,
        status: status,
      },
    };
    return readThroughCache(
      `${currentUserId}:agent-sessions:${status}`,
      async () => {
        const {data} = await getAgentSession(request);
        return sortBookingByDate(data?.getAgentSessions?.sessions);
      },
      forceRefresh,
    );
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
