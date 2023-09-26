import {StyleSheet, Text, View, Image} from 'react-native';
import React, {useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import MainBookingScreen from '../MainBookingScreen/MainBookingScreen';
import MainButton from '../../components/MainGradientButton/MainButton';
import {ScrollView} from 'react-native';
import {useLazyQuery} from '@apollo/client';
import {VERIFY_EMAIL_OTP} from '../../../request/queries/verifyEmailOTP.query';
import {RESEND_EMAIL_OTP} from '../../../request/queries/resendEmailOTP.query';
import {useSelector} from 'react-redux';
import {VERIFY_PHONE_OTP} from '../../../request/queries/verifyPhoneOTP.query';

export default function PhoneVerification({route, navigation}) {
  //   const email = useSelector(state => state.register.email);
  const email = 'abdul1@gmail.com';
  const {message} = route.params;
  console.log(route);
  const [otp, setOTPcode] = useState('');
  const [verifYOTP, {loading}] = useLazyQuery(VERIFY_PHONE_OTP);
  const handleOtpVerification = async () => {
    await verifYOTP({
      variables: {email, otp},
    })
      .then(response => {
        console.log(response?.data);
        console.log(response?.data?.verifyPhoneOTP?.message);
      })
      .catch(error => {
        console.error(error);
      });
  };
  const handleResendOtp = () => {};
  return (
    <ScrollView style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.heading}>Enter OTP to Verify</Text>
        <Image source={require('../../../assets/otp.png')} />
        <OTPInputView
          style={{
            width: widthToDp(80),
            height: heightToDp(50),
            color: Colors.TextColor,
          }}
          pinCount={4}
          onCodeChanged={code => {
            setOTPcode(code);
          }}
          codeInputFieldStyle={styles.underlineStyleBase}
          codeInputHighlightStyle={styles.underlineStyleHighLighted}
          onCodeFilled={code => {
            // handleOtpVerification();
            console.log(`Code is ${code}, you are good to go!`);
          }}
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
              paddingVertical: heightToDp(2),
            }}
            styles={{
              padding: 0,
              fontSize: widthToDp(4),
            }}
          />
        </View>
      </View>
      <View style={{marginVertical: heightToDp(5)}}>
        <GradientButton
          Title="Verify OTP"
          loading={loading}
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          onPress={() => handleOtpVerification()}
        />
      </View>
    </ScrollView>
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
