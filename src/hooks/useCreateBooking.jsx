import {View, Text} from 'react-native';
import React, {useState} from 'react';
import {useMutation} from '@apollo/client';
import {CREATE_BOOKING} from '../../request/mutations/createBooking.mutation';
import {useNavigation} from '@react-navigation/native';

const useCreateBooking = () => {
  const navigation = useNavigation();
  const [BookingData, setBookingData] = useState({
    serviceType: null,
    service: null,
    agent: null,
    documentType: {
      price: 500,
      name: 'Legal Docs',
    },
  });
  const [createBooking] = useMutation(CREATE_BOOKING);
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
  const consoleData = () => {
    console.log(BookingData);
  };
  return {handleBookingCreation, consoleData, BookingData, setBookingData};
};

export default useCreateBooking;
