import {StyleSheet, Text, View, Image, Alert} from 'react-native';
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
import {useDispatch, useSelector} from 'react-redux';
import {VERIFY_PHONE_OTP} from '../../../request/queries/verifyPhoneOTP.query';
import {GET_PHONE_OTP} from '../../../request/queries/getPhoneOTP.query';
import {ceredentailSet} from '../../features/register/registerSlice';

export default function EmailVerification({route, navigation}) {
  const {ceredentials, message} = route.params;
  // console.log(ceredentials);
  const email = useSelector(state => state.register.email);
  const [otp, setOTPcode] = useState('');
  const [verifYOTP, {loading: verifyLoading}] = useLazyQuery(VERIFY_PHONE_OTP);
  const [getPhoneOtp, {loading: phoneLoading}] = useLazyQuery(GET_PHONE_OTP);
  const dispatch = useDispatch();
  const handleOtpVerification = async () => {
    await verifYOTP({
      variables: {email, otp},
    })
      .then(response => {
        // console.log(response?.data);
        // Alert.alert(response?.data?.verifyPhoneOTP?.message);
        // dispatch(ceredentailSet({firstName, lastName, number, city, email}));
        navigation.navigate('ProfilePictureScreen');
      })
      .catch(error => {
        console.error(error);
      });
  };
  const resetStack = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'HomeScreen'}],
    });
  };
  const handleResendOtp = () => {
    try {
      getPhoneOtp({
        variables: {email},
      }).then(response => {
        // console.log(response.data.getPhoneOTP.phoneNumber);
        if (response?.data?.getPhoneOTP?.status !== '200') {
          Alert.alert('OTP not sent');
        } else {
          Alert.alert('Resent OTP');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
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
            loading={phoneLoading}
            styles={{
              padding: 0,
              fontSize: widthToDp(4),
            }}
            onPress={() => handleResendOtp()}
          />
        </View>
      </View>
      <View style={{marginVertical: heightToDp(5)}}>
        <GradientButton
          Title="Verify OTP"
          loading={verifyLoading}
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
