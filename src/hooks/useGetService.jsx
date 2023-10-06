import {View, Text} from 'react-native';
import React, {useState} from 'react';
import {useLazyQuery} from '@apollo/client';
import {GET_SERVICE_BY_SERVICE_TYPE} from '../../request/queries/getServicebyServiceType';
import {useNavigation} from '@react-navigation/native';

const useGetService = () => {
  const [getServiceByServiceType] = useLazyQuery(GET_SERVICE_BY_SERVICE_TYPE);
  const navigation = useNavigation();
  const [data, setData] = useState();
  const fetchGetServiceAPI = async serviceType => {
    const request = {
      variables: {
        serviceType,
      },
    };
    console.log(request);
    const response = await getServiceByServiceType(request);
    console.log(response.data);

    console.log(response.data.getServiceByServiceType.services);
  };

  return {fetchGetServiceAPI, data};
};

export default useGetService;

// if (serviceType === 'mobile_notary') {
//   navigation.navigate('MapScreen');
// } else if (serviceType === 'ron') {
//   navigation.navigate('OnlineNotaryScreen');
// } else {
//   navigation.navigate('LocalNotaryMapScreen');
// }
