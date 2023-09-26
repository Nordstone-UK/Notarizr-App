import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useDispatch} from 'react-redux';
import {userType} from '../../features/user/userSlice';
import SplashScreen from 'react-native-splash-screen';
import {GET_PHONE_OTP} from '../../../request/queries/getPhoneOTP.query';
import {useLazyQuery} from '@apollo/client';
export default function LoginScreen({navigation}, props) {
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [getPhoneOtp, {loading}] = useLazyQuery(GET_PHONE_OTP);
  const dispatch = useDispatch();
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const handleGetPhoneOtp = () => {
    try {
      getPhoneOtp({
        variables: {email},
      }).then(response => {
        console.log(response?.data?.getPhoneOTP);
        console.log(response?.data?.getPhoneOTP?.phoneNumber);
        setNumber(response.data.getPhoneOTP.phoneNumber);
        if (response?.data?.getPhoneOTP?.status !== '200') {
          Alert.alert('OTP not sent');
        } else {
          Alert.alert('OTP Sent');
          navigation.navigate('PhoneVerification', {
            message: number,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  const resetStack = () => {
    dispatch(userType('client'));
    navigation.reset({
      index: 0,
      routes: [{name: 'HomeScreen'}],
    });
  };
  return (
    <View style={styles.container}>
      <CompanyHeader
        Header="Welcome Back to Notarizr"
        subHeading="Hello there, sign in to continue!"
        HeaderStyle={{alignSelf: 'center'}}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: 17,
          marginVertical: heightToDp(1.5),
          color: '#121826',
        }}
      />

      <BottomSheetStyle>
        <ScrollView style={{marginTop: heightToDp(5)}}>
          <LabelTextInput
            leftImageSoucre={require('../../../assets/emailIcon.png')}
            placeholder={'Enter your email address'}
            LabelTextInput={'Email Address'}
            onChangeText={text => setEmail(text)}
            // Label={true}
            // labelStyle={emailValid && {color: Colors.Red}}
            // AdjustWidth={emailValid && {borderColor: Colors.Red}}
          />
          <View
            style={{
              marginTop: heightToDp(10),
            }}>
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Login"
              viewStyle={props.viewStyle}
              GradiStyles={props.GradiStyles}
              onPress={() => handleGetPhoneOtp()}
              loading={loading}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginVertical: heightToDp(10),
            }}>
            <Text
              style={{
                color: Colors.DullTextColor,
              }}>
              Don’t have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignupAsScreen')}>
              <Text style={{color: Colors.Orange}}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
});
