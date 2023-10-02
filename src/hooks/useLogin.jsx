import {useLazyQuery} from '@apollo/client';
import {GET_PHONE_OTP} from '../../request/queries/getPhoneOTP.query';
import {VERIFY_PHONE_OTP} from '../../request/queries/verifyPhoneOTP.query';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {FETCH_USER_INFO} from '../../request/queries/user.query';
import useFetchUser from './useFetchUser';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useLogin = () => {
  const [verifYOTP] = useLazyQuery(VERIFY_PHONE_OTP);
  const [getPhoneOTP] = useLazyQuery(GET_PHONE_OTP);
  const {fetchUserInfo} = useFetchUser();
  const navigation = useNavigation();
  const handleOtpVerification = async (email, otp) => {
    await verifYOTP({
      variables: {email, otp},
    })
      .then(response => {
        console.log(response?.data);
        Alert.alert(response?.data?.verifyPhoneOTP?.message);
        if (response?.data?.verifyPhoneOTP?.status !== '200') {
          Alert.alert('Something went wrong.');
        } else {
          saveAccessTokenToStorage(response?.data?.verifyPhoneOTP?.accessToken);
          resetStack();
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  const resetStack = async () => {
    await fetchUserInfo();
    navigation.reset({
      index: 0,
      routes: [{name: 'HomeScreen'}],
    });
  };
  const handleResendOtp = async email => {
    await getPhoneOTP({
      variables: {email},
    })
      .then(response => {
        console.log(response.data);

        console.log(response.data.getPhoneOTP.phoneNumber);
        if (response?.data?.getPhoneOTP?.status !== '200') {
          Alert.alert('OTP not sent');
        } else {
          Alert.alert('Resent OTP');
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  const saveAccessTokenToStorage = async token => {
    try {
      await AsyncStorage.setItem('token', token);
      console.log('Access token saved successfully');
    } catch (error) {
      console.log('Error saving access token: ', error);
    }
  };
  return {handleOtpVerification, handleResendOtp, saveAccessTokenToStorage};
};

export default useLogin;
