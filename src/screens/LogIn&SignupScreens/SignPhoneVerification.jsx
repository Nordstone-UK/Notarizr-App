import React, {useState} from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {useLazyQuery} from '@apollo/client';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import AuthOtpVerificationView from '../../components/AuthFlow/AuthOtpVerificationView';
import AuthProgressHeader from '../../components/AuthFlow/AuthProgressHeader';
import {
  ceredentailSet,
  setFilledCount,
  setProgress,
} from '../../features/register/registerSlice';
import {GET_VALID_PHONE_OTP} from '../../../request/queries/getValidPhoneOTP.query';
import {VERIFY_SIGNUP_WITH_OTP} from '../../../request/queries/verifySignupotp.query';
import {goBackOrNavigate} from '../../utils/navigationHelpers';

export default function SignPhoneVerification({route, navigation}) {
  const {
    description,
    email,
    firstName,
    lastName,
    location,
    gender,
    phoneNumber,
    date,
  } = route.params;
  const [otp, setOtp] = useState('');
  const [getPhoneOtp, {loading: resendLoading}] =
    useLazyQuery(GET_VALID_PHONE_OTP);
  const [verifyOtp, {loading: verifyLoading}] = useLazyQuery(
    VERIFY_SIGNUP_WITH_OTP,
    {fetchPolicy: 'no-cache'},
  );
  const dispatch = useDispatch();
  const registerData = useSelector(state => state.register);
  const totalFields = registerData.accountType === 'client' ? 8 : 12;

  const handleOtpVerification = async () => {
    if (otp.length !== 6) {
      Toast.show({
        type: 'warning',
        text1: 'Enter the complete code',
        text2: 'The verification code contains six digits.',
      });
      return;
    }

    try {
      const response = await verifyOtp({variables: {phoneNumber, otp}});
      if (response?.data?.verifySignUpOTP?.status !== '200') {
        Toast.show({
          type: 'error',
          text1: 'Invalid code',
          text2:
            response?.data?.verifySignUpOTP?.message ||
            'Please check the code and try again.',
        });
        return;
      }

      dispatch(
        ceredentailSet({
          firstName,
          lastName,
          location,
          gender,
          email,
          phoneNumber,
          description,
          date,
        }),
      );
      const filledCount = Math.min(registerData.filledCount + 1, totalFields);
      dispatch(setFilledCount(filledCount));
      dispatch(setProgress(filledCount / totalFields));
      navigation.navigate('ProfilePictureScreen');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification failed',
        text2: 'Something went wrong. Please try again.',
      });
    }
  };

  const handleResend = async () => {
    try {
      const response = await getPhoneOtp({variables: {phoneNumber}});
      if (response?.data?.getValidPhoneOtp?.status !== '200') {
        Toast.show({
          type: 'error',
          text1: 'Code not sent',
          text2: 'Please try again.',
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1: 'New code sent',
        text2: `Check ${phoneNumber}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Code not sent',
        text2: 'Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AuthProgressHeader
        title="Phone verification"
        progress={registerData.progress}
        onBack={() => goBackOrNavigate(navigation, 'SignUpDetailScreen')}
      />
      <AuthOtpVerificationView
        phoneNumber={phoneNumber}
        otp={otp}
        onChangeOtp={setOtp}
        onResend={handleResend}
        onVerify={handleOtpVerification}
        resendLoading={resendLoading}
        verifyLoading={verifyLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
