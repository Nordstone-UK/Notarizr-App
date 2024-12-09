import {useLazyQuery, useMutation} from '@apollo/client';
import {useDispatch, useSelector} from 'react-redux';
import {
  setAvailability,
  setCategories,
  setServiceLocation,
  setServiceType,
} from '../features/agentService/agentServiceSlice';
import {useNavigation} from '@react-navigation/native';
import {CREATE_SERVICE} from '../../request/mutations/createService.mutation';
import Toast from 'react-native-toast-message';
import {UPDATE_AGENT_CURRENT_LOCATION} from '../../request/mutations/updateAgentLocation.mutation';
import {GET_AGENT_LIVE_LOCATION} from '../../request/queries/getAgentLiveLocation.query';
import {UPDATE_SERVICE_BY_ID} from '../../request/mutations/updateservice.mutation';

const useAgentService = () => {
  const [createService] = useMutation(CREATE_SERVICE);
  const [updateServiceById] = useMutation(UPDATE_SERVICE_BY_ID);
  const [updateLocation] = useMutation(UPDATE_AGENT_CURRENT_LOCATION);
  const [getLiveLocation] = useLazyQuery(GET_AGENT_LIVE_LOCATION);
  const {first_name, last_name, location} = useSelector(
    state => state.user.user,
  );
  const agentService = useSelector(state => state.agentService);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const serviceType = useSelector(state => state.agentService.serviceType);

  const dispatchMobile = async service_type => {
    dispatch(setServiceType(service_type));

    navigation.navigate('AgentMainAvailabilityScreen');
  };
  const dispatchRON = async service_type => {
    dispatch(setServiceType(service_type));
    navigation.navigate('AgentRemoteOnlineNotaryScreen');
  };
  const dispatchLocal = async service_type => {
    dispatch(setServiceType(service_type));
    navigation.navigate('AgentMainAvailabilityScreen');
    // navigation.navigate('AgentAvailabilitySetupScreen');
  };
  const dispatchAvailability = async (
    weeks,
    startTime,
    endTime,
    canPrint,
    serviceData,
  ) => {
    const availability = orderWeekdays(weeks);
    dispatch(setAvailability({availability, startTime, endTime}));
    navigation.navigate('AgentRONLocationScreen', {
      canPrint: canPrint,
      serviceData: serviceData,
    });
  };
  const LocalNotaryRegister = async () => {
    const request = {
      variables: {
        ...agentService,
        name: first_name + ' ' + last_name,
        location: [location],
      },
    };
    // console.log('Variables sent to API', request);
    const {data} = await createService(request);
    // console.log('wdawd', data);
    if (data.createService.status === '201') {
      navigation.navigate('ProfilePreferenceCompletion');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong!',
        text2: 'Please try again later',
      });
    }
  };
  const dispatchCategory = async category => {
    dispatch(setCategories(category));
    serviceType === 'local'
      ? LocalNotaryRegister(agentService)
      : navigation.navigate('AgentRONLocationScreen');
  };
  function orderWeekdays(weekdays) {
    const selectedWeekdays = convertWeekdaysToLowerCase(weekdays);
    const weekdaysOrder = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'];

    const validWeekdays = selectedWeekdays.filter(day =>
      weekdaysOrder.includes(day),
    );
    const orderedWeekdays = validWeekdays.sort(
      (a, b) => weekdaysOrder.indexOf(a) - weekdaysOrder.indexOf(b),
    );

    return orderedWeekdays;
  }
  const getCurrentLocation = async variables => {
    const {data} = await getLiveLocation({variables});
    // console.log('dsssssssssadfdf', data);
    return data?.getCurrentLocation;
  };

  const agentLocationUpdate = async variables => {
    const {data} = await updateLocation({variables});
    // console.log('dddddddddddddd', data);
    return data?.updateAgentcurrentLocation?.status;
  };
  const handleRegistration = async variables => {
    const request = {
      variables: {
        ...variables,
        name: first_name + ' ' + last_name,
      },
    };
    // console.log(request);
    const {data} = await createService(request);
    // console.log('wdawd', data);

    if (data.createService.status === '201') {
      navigation.navigate('ProfilePreferenceCompletion');
    } else if (data?.createService?.status === '400') {
      Toast.show({
        type: 'error',
        text1: 'Service already exists for this agent!',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong!',
        text2: 'Please try again later',
      });
    }
  };
  const handleUpdateService = async variables => {
    const request = {
      variables: {
        ...variables,
        // id: '667a81a49a4436e6b6702c7c',
        name: first_name + ' ' + last_name,
      },
    };
    console.log('reidfododofdo', request);

    const {data} = await updateServiceById(request);
    console.log('datafdfdfd', data);

    if (data.updateServiceById.status === '200') {
      navigation.navigate('ProfilePreferenceCompletion');
    } else if (data?.updateServiceById?.status === '400') {
      Toast.show({
        type: 'error',
        text1: 'Error updating service!',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong!',
        text2: 'Please try again later',
      });
    }
  };
  function convertWeekdaysToLowerCase(weekdays) {
    return weekdays.map(weekday => weekday.toLowerCase());
  }
  return {
    dispatchMobile,
    dispatchLocal,
    handleRegistration,
    handleUpdateService,
    dispatchRON,
    dispatchAvailability,
    dispatchCategory,
    agentLocationUpdate,
    getCurrentLocation,
  };
};

export default useAgentService;
