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

export default function EmailVerification() {
  const email = useSelector(state => state.register.email);
  console.log(email);
  const [otp, setOTPcode] = useState('');
  const [verifYOTP, {loadingVerify}] = useLazyQuery(VERIFY_EMAIL_OTP);
  const [resendOTP, {loadingResend}] = useLazyQuery(RESEND_EMAIL_OTP);
  const handleOtpVerification = async () => {
    await verifYOTP({
      variables: {email, otp},
    }).then(response => {
      console.log(response);

      //   if (emailValid) {
      //     Alert.alert('OTP not sent');
      //   } else {
      //     Alert.alert('OTP Sent');
      //     separateFullName(fullName);
      //   }
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
            setOTPcode(JSON.stringify(code));
          }}
          codeInputFieldStyle={styles.underlineStyleBase}
          codeInputHighlightStyle={styles.underlineStyleHighLighted}
          onCodeFilled={code => {
            handleOtpVerification();
            console.log(`Code is ${code}, you are good to go!`);
          }}
        />
        <Text style={styles.subheading}>
          In order to verify your email addreses. We have sent an OTP on the
          provided email address.
        </Text>
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
          loading={loadingVerify}
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          onPress={() => handleResendOtp()}
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
