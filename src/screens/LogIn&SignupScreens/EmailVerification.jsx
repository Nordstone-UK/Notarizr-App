import React, {useEffect, useState} from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import AuthOtpVerificationView from '../../components/AuthFlow/AuthOtpVerificationView';
import AuthProgressHeader from '../../components/AuthFlow/AuthProgressHeader';
import useLogin from '../../hooks/useLogin';
import {goBackOrNavigate} from '../../utils/navigationHelpers';

export default function EmailVerification({route, navigation}) {
  const {email, isAgentLogin = false} = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const {handleEmailOtpVerification, handleResendEmailOtp} = useLogin();

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const verify = async () => {
    if (otp.length !== 4 && otp.length !== 6) {
      Toast.show({type: 'warning', text1: 'Enter the complete code'});
      return;
    }
    setLoading(true);
    try {
      await handleEmailOtpVerification(email, otp, isAgentLogin);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResendLoading(true);
    try {
      await handleResendEmailOtp(email);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AuthProgressHeader
        title="Email verification"
        onBack={() => goBackOrNavigate(navigation, 'LoginScreen')}
      />
      <AuthOtpVerificationView
        channel="email"
        phoneNumber={email || 'your email address'}
        otp={otp}
        onChangeOtp={setOtp}
        onResend={resend}
        onVerify={verify}
        resendLoading={resendLoading}
        verifyLoading={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF'},
});
