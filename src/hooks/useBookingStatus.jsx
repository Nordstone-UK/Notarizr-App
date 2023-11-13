import {useLazyQuery, useMutation} from '@apollo/client';
import {UPDATE_BOOKING_STATUS} from '../../request/mutations/updateBookingStatus.mutation';
import {useLayoutEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {GET_BOOKING_STATUS} from '../../request/queries/getBookingStatus.query';
const useBookingStatus = () => {
  const navigation = useNavigation();
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS);
  const [getBookingStatus] = useLazyQuery(GET_BOOKING_STATUS);
  const handleUpdateBookingStatus = async (status, id) => {
    const request = {
      variables: {
        bookingId: id,
        status: status,
      },
    };
    try {
      const response = await updateBookingStatus(request);
      console.log('response for Booking Status', response.data);
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
      // console.log(
      //   'response for Booking Status',
      //   response.data.getBookingStatus.booking_status,
      // );
      return response.data.getBookingStatus.booking_status;
    } catch (error) {
      console.error(error);
    }
  };
  return {handleUpdateBookingStatus, handlegetBookingStatus};
};

export default useBookingStatus;
