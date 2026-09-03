import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import useLogin from '../../hooks/useLogin';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import AuthOtpVerificationView from '../../components/AuthFlow/AuthOtpVerificationView';
import AuthProgressHeader from '../../components/AuthFlow/AuthProgressHeader';
import {goBackOrNavigate} from '../../utils/navigationHelpers';

export default function PhoneVerification({route, navigation}) {
  // const email = useSelector(state => state.register.email);
  const phone = useSelector(state => state.register.phoneNumber);

  const {message} = route.params || {};
  const [otp, setOTPcode] = useState('');
  const {handleOtpVerification, handleResendOtp} = useLogin();
  const [loading, setLoading] = useState(false);
  const [resendloading, setresendLoading] = useState(false);

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      Toast.show({
        type: 'warning',
        text1: 'Enter the complete code',
        text2: 'The verification code contains six digits.',
      });
      return;
    }

    setLoading(true);
    try {
      await handleOtpVerification(phone, otp);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setresendLoading(true);
    try {
      await handleResendOtp(phone);
    } finally {
      setresendLoading(false);
    }
  };

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AuthProgressHeader
        title="Phone verification"
        onBack={() => goBackOrNavigate(navigation, 'LoginScreen')}
      />
      <AuthOtpVerificationView
        phoneNumber={message || phone || 'your phone number'}
        otp={otp}
        onChangeOtp={setOTPcode}
        onResend={handleResend}
        onVerify={verifyOTP}
        resendLoading={resendloading}
        verifyLoading={loading}
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
