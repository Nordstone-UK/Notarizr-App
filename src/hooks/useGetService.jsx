import {View, Text} from 'react-native';
import React, {useState} from 'react';
import {useLazyQuery} from '@apollo/client';
import {GET_SERVICE_BY_SERVICE_TYPE} from '../../request/queries/getServicebyServiceType';
import {useNavigation} from '@react-navigation/native';
import {GET_MATCHED_AGENT} from '../../request/queries/matchAgent.query';

const useGetService = () => {
  const [getServiceByServiceType] = useLazyQuery(GET_SERVICE_BY_SERVICE_TYPE);
  const [matchAgent] = useLazyQuery(GET_MATCHED_AGENT);
  const navigation = useNavigation();
  const fetchGetServiceAPI = async (serviceType, documentData) => {
    const request = {
      variables: {
        serviceType,
      },
    };
    // console.log(request);
    await getServiceByServiceType(request)
      .then(response => {
        if (serviceType === 'mobile_notary') {
          navigation.navigate('MapScreen', {
            agents: response?.data?.getServiceByServiceType?.users,
            documents: documentData,
          });
        } else if (serviceType === 'local') {
          navigation.navigate('LocalNotaryMapScreen', {
            agents: response?.data?.getServiceByServiceType?.users,
            documents: documentData,
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const RONfetchAPI = async () => {
    const request = {
      variables: {
        serviceType: 'ron',
      },
    };
    // console.log('documentData', request);
    try {
      const response = await matchAgent(request);

      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const FetchMobileNotary = async serviceType => {
    const request = {
      variables: {
        serviceType: serviceType,
      },
    };
    try {
      const response = await matchAgent(request);
      // console.log('====================================');
      // console.log(response.error);
      // console.log('====================================');
      return response?.data?.matchAgent;
    } catch (error) {
      console.log(error);
    }
  };
  return {fetchGetServiceAPI, RONfetchAPI, FetchMobileNotary};
};

export default useGetService;
