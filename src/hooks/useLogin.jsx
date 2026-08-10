import {useLazyQuery} from '@apollo/client';
import {GET_PHONE_OTP} from '../../request/queries/getPhoneOTP.query';
import {VERIFY_PHONE_OTP} from '../../request/queries/verifyPhoneOTP.query';
import {useNavigation} from '@react-navigation/native';
import useFetchUser from './useFetchUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const useLogin = () => {
  const [verifYOTP] = useLazyQuery(VERIFY_PHONE_OTP, {
    fetchPolicy: 'no-cache',
  });
  const [getPhoneOTP] = useLazyQuery(GET_PHONE_OTP, {
    fetchPolicy: 'no-cache',
  });
  const {fetchUserInfo} = useFetchUser();
  const navigation = useNavigation();

  // const user = useSelector(state => state.user.user);
  const handleOtpVerification = async (phone, otp) => {
    await verifYOTP({
      variables: {phone, otp},
    })
      .then(response => {
        if (response?.data?.verifyPhoneOTP?.status !== '200') {
          Toast.show({
            type: 'error',
            text1: 'Verification failed',
            text2:
              response?.data?.verifyPhoneOTP?.message ||
              'Check the code and try again.',
          });
        } else {
          saveAccessTokenToStorage(response?.data?.verifyPhoneOTP?.accessToken);
          resetStack('login');
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  const resetStack = async login => {
    if (login === 'login') {
      Toast.show({
        type: 'success',
        text1: 'Login Successfull!',
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Registration Successfull!',
      });
    }
    try {
      const userInfo = await fetchUserInfo();

      if (userInfo.account_type === 'client') {
        navigation.reset({
          index: 0,
          routes: [{name: 'HomeScreen'}],
        });
      } else {
        if (userInfo.isVerified) {
          navigation.reset({
            index: 0,
            routes: [{name: 'HomeScreen'}],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{name: 'HomeScreen'}],
          });
        }
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };
  const handleResendOtp = async email => {
    await getPhoneOTP({
      variables: {email},
    })
      .then(response => {
        console.log(response.data);

        console.log(response.data.getPhoneOTP.phoneNumber);
        if (response?.data?.getPhoneOTP?.status !== '200') {
          // Alert.alert('OTP not sent');
          Toast.show({
            type: 'error',
            text1: 'OTP not sent!',
            text2: 'Please try again after some time.',
          });
        } else {
          // Alert.alert('Resent OTP');
          Toast.show({
            type: 'success',
            text1: 'OTP sent!',
            text2: 'Please enter your OTP to verify.',
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  const saveAccessTokenToStorage = async token => {
    try {
      await AsyncStorage.setItem('token', token);
      // console.log('Access token saved successfully');
    } catch (error) {
      console.log('Error saving access token: ', error);
    }
  };
  return {
    handleOtpVerification,
    handleResendOtp,
    saveAccessTokenToStorage,
    resetStack,
  };
};

export default useLogin;
