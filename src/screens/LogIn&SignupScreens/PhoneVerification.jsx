import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import MainButton from '../../components/MainGradientButton/MainButton';
import {ScrollView} from 'react-native';
import {useSelector} from 'react-redux';
import useLogin from '../../hooks/useLogin';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import CustomToast from '../../components/CustomToast/CustomToast';

export default function PhoneVerification({route, navigation}) {
  const email = useSelector(state => state.register.email);
  // console.log(email);
  const {message} = route.params;
  const [otp, setOTPcode] = useState('');
  const {handleOtpVerification, handleResendOtp} = useLogin();
  const [loading, setLoading] = useState(false);
  const [resendloading, setresendLoading] = useState(false);
  const [refresh, setRefresh] = useState(true);

  const verifyOTP = async () => {
    setLoading(true);
    if (!otp) {
      Toast.show({
        type: 'warning',
        text1: 'Warning!',
        text2: 'Please enter OTP',
      });
      setLoading(false);
    } else {
      await handleOtpVerification(email, otp);
      setLoading(false);
    }
  };
  const handleResend = async () => {
    setresendLoading(true);
    await handleResendOtp(email);
    setresendLoading(false);
  };
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.subContainer}>
          <Text style={styles.heading}>Enter OTP to Verify</Text>
          <Image source={require('../../../assets/otp.png')} />
          <OTPInputView
            style={{
              width: widthToDp(80),
              height: heightToDp(50),
              color: Colors.TextColor,
            }}
            code={otp}
            autoFocusOnLoad={false}
            editable={true}
            pinCount={4}
            onCodeChanged={code => {
              setOTPcode(code);
            }}
            codeInputFieldStyle={styles.underlineStyleBase}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
          />
          <Text style={styles.subheading}>
            We have sent an OTP on this number:
          </Text>
          <Text style={styles.subheading}>{message}</Text>

          <View style={{marginVertical: heightToDp(5)}}>
            <MainButton
              Title="Resend OTP"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                width: widthToDp(40),
                marginTop: heightToDp(2),
                paddingVertical: heightToDp(2),
              }}
              loading={resendloading}
              styles={{
                padding: 0,
                fontSize: widthToDp(4),
              }}
              onPress={() => handleResend()}
            />
          </View>
        </View>
        <View style={{marginVertical: heightToDp(5)}}>
          <GradientButton
            Title="Verify OTP"
            loading={loading}
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            onPress={() => verifyOTP()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  borderStyleHighLighted: {
    borderColor: Colors.Orange,
  },
  underlineStyleBase: {
    width: widthToDp(12),
    height: heightToDp(12),
    borderWidth: 1,
    borderRadius: 5,
    color: Colors.TextColor,
    borderColor: Colors.Black,
  },
  underlineStyleHighLighted: {
    borderColor: Colors.Orange,
  },
  heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(7),
    fontFamily: 'Manrope-Bold',
  },
  subheading: {
    color: Colors.OTPSubHeadingColor,
    fontSize: widthToDp(4),
    marginHorizontal: widthToDp(5),
    fontFamily: 'Manrope-SemiBold',
    textAlign: 'center',
  },
  subContainer: {
    marginTop: heightToDp(15),
    alignItems: 'center',
  },
});
