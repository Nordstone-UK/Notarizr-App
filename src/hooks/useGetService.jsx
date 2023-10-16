import {View, Text} from 'react-native';
import React, {useState} from 'react';
import {useLazyQuery} from '@apollo/client';
import {GET_SERVICE_BY_SERVICE_TYPE} from '../../request/queries/getServicebyServiceType';
import {useNavigation} from '@react-navigation/native';

const useGetService = () => {
  const [getServiceByServiceType] = useLazyQuery(GET_SERVICE_BY_SERVICE_TYPE);
  const navigation = useNavigation();
  const fetchGetServiceAPI = async (serviceType, documentData) => {
    const request = {
      variables: {
        serviceType,
      },
    };
    console.log(request);
    await getServiceByServiceType(request)
      .then(response => {
        console.log('In hook', response.data.getServiceByServiceType.services);

        if (serviceType === 'mobile_notary') {
          navigation.navigate('MapScreen', {
            agents: response?.data?.getServiceByServiceType?.services,
            documents: documentData,
          });
        } else if (serviceType === 'local') {
          navigation.navigate('LocalNotaryMapScreen', {
            agents: response?.data?.getServiceByServiceType?.services,
            documents: documentData,
          });
        } else {
          navigation.navigate('NearbyLoadingScreen', {
            agents: response?.data?.getServiceByServiceType?.services,
            documents: documentData,
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const RONfetchAPI = async (serviceType, documentData) => {
    const request = {
      variables: {
        serviceType: 'ron',
      },
    };
    await getServiceByServiceType(request)
      .then(response => {
        console.log('In hook', response.data.getServiceByServiceType.services);
        navigation.navigate('NearbyLoadingScreen', {
          agents: response?.data?.getServiceByServiceType?.services,
          documents: documentData,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };
  return {fetchGetServiceAPI};
};

export default useGetService;
