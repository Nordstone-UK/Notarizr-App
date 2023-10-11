import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useMutation} from '@apollo/client';
import {CREATE_BOOKING} from '../../request/mutations/createBooking.mutation';
import {useNavigation} from '@react-navigation/native';
import {CREATE_LOCAL_NOTARY_BOOKING} from '../../request/mutations/createLocalNotaryBooking.mutation';

const useCreateBooking = () => {
  const navigation = useNavigation();
  const [BookingData, setBookingData] = useState({
    serviceType: null,
    service: null,
    agent: null,
    documentType: {
      price: null,
      name: null,
    },
  });
  const [LocalBookingData, setLocalBookingData] = useState({
    serviceType: null,
    service: null,
    agent: null,
    documentType: {
      price: null,
      name: null,
    },
    dateOfBooking: null,
    timeOfBooking: null,
  });
  const [createBooking] = useMutation(CREATE_BOOKING);
  const [createLocalBooking] = useMutation(CREATE_LOCAL_NOTARY_BOOKING);
  const handleBookingCreation = async () => {
    console.log(BookingData);
    const request = {
      variables: {
        ...BookingData,
      },
    };
    console.log('prev', request);
    await createBooking(request)
      .then(response => {
        console.log('Booking', response.data.createBookingR.status);
        if (response.data.createBookingR.status === '201') {
          navigation.navigate('AgentBookCompletion');
        }
      })
      .catch(error => {
        console.warn(error);
      });
  };

  const handleLocalNotaryBookingCreation = async () => {
    console.log(LocalBookingData);
    const request = {
      variables: {
        ...LocalBookingData,
      },
    };
    console.log('prev', request);
    await createLocalBooking(request)
      .then(response => {
        console.log('Booking', response.data.createBookingR.status);
        if (response.data.createBookingR.status === '201') {
          navigation.navigate('AgentBookCompletion');
        }
      })
      .catch(error => {
        console.warn(error);
      });
  };

  const consoleData = () => {
    console.log(BookingData);
  };
  return {
    handleBookingCreation,
    handleLocalNotaryBookingCreation,
    consoleData,
    BookingData,
    setBookingData,
    LocalBookingData,
    setLocalBookingData,
  };
};

export default useCreateBooking;
