import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useMutation} from '@apollo/client';
import {CREATE_BOOKING} from '../../request/mutations/createBooking.mutation';
import {useNavigation} from '@react-navigation/native';
import {CREATE_LOCAL_NOTARY_BOOKING} from '../../request/mutations/createLocalNotaryBooking.mutation';
import {useSelector} from 'react-redux';

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
  const FinalBookingData = useSelector(state => state.booking.booking);
  const [createBooking] = useMutation(CREATE_BOOKING);
  const [createLocalBooking] = useMutation(CREATE_LOCAL_NOTARY_BOOKING);
  const handleBookingCreation = async (User, Service) => {
    console.log('finalbookingdate', FinalBookingData);
    const request = {
      variables: {
        ...FinalBookingData,
        service: Service,
        agent: User,
      },
    };
    console.log('finalbookingdate', request);
    try {
      const response = await createBooking(request);
      console.log('====================================', response);
      // console.log('Booking', response);
      // console.log('====================================');
      return response.data.createBookingR;
    } catch (error) {
      console.warn('is error from here:', error);
    }
  };

  const handleLocalNotaryBookingCreation = async (data, time) => {
    const request = {
      variables: {
        ...LocalBookingData,
        dateOfBooking: data,
        timeOfBooking: time,
      },
    };

    await createLocalBooking(request)
      .then(response => {
        if (response.data.createBookingR.status === '201') {
          navigation.navigate('AgentBookCompletion');
        }
      })
      .catch(error => {
        console.warn(error);
      });
  };

  const consoleData = async data => {
    // console.log(data);
  };
  return {
    handleBookingCreation,
    handleLocalNotaryBookingCreation,
    consoleData,
    setBookingData,
    setLocalBookingData,
  };
};

export default useCreateBooking;
