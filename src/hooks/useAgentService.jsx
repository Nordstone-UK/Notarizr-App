import {useLazyQuery, useMutation} from '@apollo/client';
import {useDispatch, useSelector} from 'react-redux';
import {
  setAvailability,
  setCategories,
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

  const getMutationErrorMessage = (error, fallback) =>
    error?.networkError?.result?.errors?.[0]?.message ||
    error?.graphQLErrors?.[0]?.message ||
    error?.message ||
    fallback;

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
  const dispatchAvailability = async (schedule, canPrint, serviceData) => {
    dispatch(setAvailability({schedule}));
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
    try {
      const {data, errors} = await createService(request);
      const result = data?.createService;

      if (errors?.length) {
        throw new Error(errors[0].message);
      }
      if (result?.status !== '201') {
        throw new Error(result?.message || 'Unable to create service.');
      }

      navigation.navigate('ProfilePreferenceCompletion');
      return result;
    } catch (error) {
      throw new Error(
        getMutationErrorMessage(error, 'Unable to create service.'),
      );
    }
  };
  const handleUpdateService = async variables => {
    const request = {
      variables: {
        ...variables,
        name: first_name + ' ' + last_name,
      },
    };
    try {
      const {data, errors} = await updateServiceById(request);
      const response = data?.updateServiceById;

      // The backend uses 204 for a successful update and older deployments
      // returned 200. Support both response contracts during migration.
      if (errors?.length) {
        throw new Error(errors[0].message);
      }
      if (!['200', '204'].includes(response?.status)) {
        throw new Error(response?.message || 'Unable to update service.');
      }

      navigation.navigate('ProfilePreferenceCompletion');
      return response;
    } catch (error) {
      const message = getMutationErrorMessage(
        error,
        'Unable to update service.',
      );
      Toast.show({
        type: 'error',
        text1: 'Service availability not updated',
        text2: message,
      });
      throw new Error(message);
    }
  };
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
