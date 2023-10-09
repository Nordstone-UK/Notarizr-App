import {useMutation} from '@apollo/client';
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

const useAgentService = () => {
  const [createService] = useMutation(CREATE_SERVICE);
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
  const dispatchAvailability = async (weeks, startTime, endTime) => {
    const availability = orderWeekdays(weeks);
    dispatch(setAvailability({availability, startTime, endTime}));
    navigation.navigate('AgentServicePereference');
  };
  const LocalNotaryRegister = async () => {
    const request = {
      variables: {
        ...agentService,
        name: first_name + ' ' + last_name,
        location: location,
      },
    };
    console.log('Variables sent to API', request);
    const {data} = await createService(request);
    console.log('wdawd', data);
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
  const handleRegistration = async variables => {
    const request = {
      variables: {
        ...variables,
      },
    };
    const {data} = await createService(request);
    console.log('wdawd', data);
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
  function convertWeekdaysToLowerCase(weekdays) {
    return weekdays.map(weekday => weekday.toLowerCase());
  }
  return {
    dispatchMobile,
    dispatchLocal,
    handleRegistration,
    dispatchRON,
    dispatchAvailability,
    dispatchCategory,
  };
};

export default useAgentService;
