import {
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

import React, {useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import MainBookingScreen from '../MainBookingScreen/MainBookingScreen';
import MainButton from '../../components/MainGradientButton/MainButton';
import {ScrollView} from 'react-native';
import {useLazyQuery} from '@apollo/client';

import {useDispatch, useSelector} from 'react-redux';
import {VERIFY_PHONE_OTP} from '../../../request/queries/verifyPhoneOTP.query';
import {GET_PHONE_OTP} from '../../../request/queries/getPhoneOTP.query';
import {
  ceredentailSet,
  setProgress,
  setFilledCount,
} from '../../features/register/registerSlice';
import {SafeAreaView} from 'react-native';
import {VERIFY_SIGNUP_WITH_OTP} from '../../../request/queries/verifySignupotp.query';
import Toast from 'react-native-toast-message';
import {GET_VALID_PHONE_OTP} from '../../../request/queries/getValidPhoneOTP.query';

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
    filledFieldsCount,
  } = route.params;
  // console.log('route.params', route.params);
  // const Statemail = useSelector(state => state.register.email);
  const [otp, setOTPcode] = useState('');
  const [verifYOTP, {loading: verifyLoading}] = useLazyQuery(VERIFY_PHONE_OTP);
  const [getPhoneOtp, {loading: phoneLoading}] =
    useLazyQuery(GET_VALID_PHONE_OTP);
  const [
    verifyOTPWithMobileNo,
    {loading: Verifywithmobileloaing, data, error},
  ] = useLazyQuery(VERIFY_SIGNUP_WITH_OTP, {
    fetchPolicy: 'no-cache', // Ensures fresh data is fetched every time
    onCompleted: response => {
      console.log('Success:', response);
    },
    onError: err => {
      console.error('Error:', err.message);
    },
  });

  const dispatch = useDispatch();
  const registerData = useSelector(state => state.register); // Access progress from Redux store
  const totalFields = registerData.accountType === 'client' ? 8 : 12;

  const handleNavigateToBackScreen = () => {
    navigation.goBack();
  };
  const handleOtpVerification = async () => {
    try {
      const response = await verifyOTPWithMobileNo({
        variables: {phoneNumber, otp},
      });

      if (response?.data?.verifySignUpOTP?.status === '200') {
        // OTP verification successful
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
        const progressValue = (registerData.filledCount + 1) / totalFields;
        dispatch(setFilledCount(registerData.filledCount + 1));
        dispatch(setProgress(progressValue));

        navigation.navigate('ProfilePictureScreen');
      } else {
        // OTP verification failed
        Toast.show({
          type: 'error',
          text1: 'We are Sorry!',
          text2:
            response?.data?.verifySignUpOTP?.message ||
            'Invalid OTP. Please try again.',
        });
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'Something went wrong. Please try again later.',
      });
    }
  };
  // const handleOtpVerification = async () => {
  //   await verifyOTPWithMobileNo({
  //     variables: {phoneNumber, otp},
  //   })
  //     .then(response => {
  //       console.log('reospondfndnfd', response.data.verifySignUpOTP);
  //       // navigation.navigate('ProfilePictureScreen');
  //       if (response.data.verifySignUpOTP.status === '200') {
  //         dispatch(
  //           ceredentailSet({
  //             firstName,
  //             lastName,
  //             location,
  //             gender,
  //             email,
  //             phoneNumber,
  //             description,
  //             date,
  //           }),
  //         );
  //         navigation.navigate('ProfilePictureScreen');
  //       } else {
  //         Toast.show({
  //           type: 'error',
  //           text1: 'We are Sorry!',
  //           text2: 'Invalid OTP. Please try again.',
  //         });
  //       }

  //       // navigation.navigate('ProfilePictureScreen');
  //     })
  //     .catch(error => {
  //       console.error(error);
  //     });
  // };
  const resetStack = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'HomeScreen'}],
    });
  };
  const handleResend = () => {
    try {
      getPhoneOtp({
        variables: {phoneNumber},
      }).then(response => {
        if (response?.data?.getValidPhoneOtp?.status === '403') {
          Toast.show({
            type: 'error',
            text1: 'We are Sorry!',
            text2: 'This User is Blocked',
          });
        } else if (response?.data?.getValidPhoneOtp?.status !== '200') {
          Toast.show({
            type: 'error',
            text1: 'OTP not sent!',
            text2: 'We encountered a problem please try again',
          });
        } else {
          Toast.show({
            type: 'success',
            text1: `OTP Sent on ${response.data.getValidPhoneOtp.phoneNumber}`,
            text2: '',
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity
          onPress={() => handleNavigateToBackScreen()}
          style={styles.touchContainer}>
          <Image
            source={require('../../../assets/backIcon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={styles.subContainer}>
          <Text style={styles.heading}>Enter OTP to Verify</Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={registerData.progress}
              width={width * 0.9}
              color={Colors.OrangeGradientEnd}
              unfilledColor={Colors.OrangeGradientStart}
              borderWidth={0}
            />
            <Text style={styles.percentageText}>
              {Math.round(registerData?.progress * 100)}%
            </Text>
          </View>
          <Image source={require('../../../assets/otp.png')} />
          <Text style={styles.subheading}>
            We have sent an OTP on this number:
          </Text>
          <Text style={styles.subheading}>{phoneNumber}</Text>
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

          <TouchableOpacity
            onPress={() => handleResend()}
            style={{marginVertical: heightToDp(5)}}>
            <Text
              style={{
                color: Colors.Orange,
                fontFamily: 'Manrope-Bold',
                textAlign: 'center',
              }}>
              Resend OTP
            </Text>

            {/* <MainButton
              Title="Resend OTP"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                width: widthToDp(40),
                marginTop: heightToDp(2),
                paddingVertical: heightToDp(2),
              }}
              // loading={resendloading}
              styles={{
                padding: 0,
                fontSize: widthToDp(4),
              }}
              // onPress={() => handleResend()}
            /> */}
          </TouchableOpacity>
        </View>
        <View style={{marginVertical: heightToDp(5)}}>
          <GradientButton
            Title="Verify OTP"
            loading={verifyLoading || phoneLoading || Verifywithmobileloaing}
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            onPress={() => handleOtpVerification()}
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
  touchContainer: {
    position: 'absolute', // Position it at the top left
    left: widthToDp(4), // Space from the left edge
    top: heightToDp(2), // Space from the top
    zIndex: 1, // Ensure it stays above other elements
  },
  backIcon: {
    width: widthToDp(6),
    height: heightToDp(6),
    // marginLeft: widthToDp(2),
  },
  progressContainer: {
    marginTop: heightToDp(7),
    alignItems: 'center',
    width: '100%', // Adjust as needed
    alignSelf: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    position: 'absolute',
    top: -30,
    left: '47%',
    // transform: [{translateX: -50}],
    fontSize: 18,
    fontWeight: 'bold',
    color: 'orange',
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
