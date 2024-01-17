import {useLazyQuery, useMutation} from '@apollo/client';
import {UPDATE_BOOKING_STATUS} from '../../request/mutations/updateBookingStatus.mutation';
import {useLayoutEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {GET_BOOKING_STATUS} from '../../request/queries/getBookingStatus.query';
import {GET_SESSION_STATUS} from '../../request/queries/getSessionStatus.query';
const useBookingStatus = () => {
  const navigation = useNavigation();
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS);
  const [getBookingStatus] = useLazyQuery(GET_BOOKING_STATUS);
  const [getSession] = useLazyQuery(GET_SESSION_STATUS);
  const handleUpdateBookingStatus = async (status, id) => {
    const request = {
      variables: {
        bookingId: id,
        status: status,
      },
    };
    try {
      const response = await updateBookingStatus(request);
      // console.log('response for Booking Status', response.data);
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
  return {
    handleUpdateBookingStatus,
    handlegetBookingStatus,
    handleSessionStatus,
  };
};

export default useBookingStatus;
