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
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const RONfetchAPI = async documentData => {
    const request = {
      variables: {
        serviceType: 'ron',
      },
    };
    await matchAgent(request)
      .then(response => {
        console.log('In hook', response.data?.matchAgent);
        navigation.navigate('AgentReviewScreen', {
          agents: response?.data?.matchAgent?.user,
          documents: documentData,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };
  return {fetchGetServiceAPI, RONfetchAPI};
};

export default useGetService;
