import {useLazyQuery, useMutation} from '@apollo/client';
import {UPDATE_BOOKING_STATUS} from '../../request/mutations/updateBookingStatus.mutation';
import {VERIFY_BOOKING_ARRIVAL_OTP} from '../../request/mutations/verifyBookingArrivalOTP.mutation';
import {useLayoutEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {GET_BOOKING_STATUS} from '../../request/queries/getBookingStatus.query';
import {GET_SESSION_STATUS} from '../../request/queries/getSessionStatus.query';
const useBookingStatus = () => {
  const navigation = useNavigation();
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS);
  const [verifyArrivalOtp] = useMutation(VERIFY_BOOKING_ARRIVAL_OTP);
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
