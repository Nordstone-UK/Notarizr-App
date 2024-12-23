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
  SafeAreaView,
  PermissionsAndroid,
  Linking,
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
import SplashScreen from 'react-native-splash-screen';
import {GET_PHONE_OTP} from '../../../request/queries/getPhoneOTP.query';
import {useLazyQuery} from '@apollo/client';
import {phoneSet} from '../../features/register/registerSlice';
import Toast from 'react-native-toast-message';
import CustomToast from '../../components/CustomToast/CustomToast';
import PhoneTextInput from '../../components/countryCode/PhoneTextInput';
import Geolocation from '@react-native-community/geolocation';

export default function LoginScreen({navigation}, props) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [getPhoneOtp, {loading}] = useLazyQuery(GET_PHONE_OTP);
  const dispatch = useDispatch();

  const getCurrentLocation = () => {
    return new Promise(async (resolve, reject) => {
      try {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            resolve({latitude, longitude});
          },
          error => {
            reject(error);
          },
          Platform.OS === 'android'
            ? {}
            : {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000},
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleGetPhoneOtp = () => {
    getCurrentLocation();
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    // if (!emailRegex.test(email)) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Invalid Email!',
    //     text2: 'Please enter a valid email address',
    //   });
    //   return;
    //  } else {
    dispatch(phoneSet(phone));
    console.log('logiig');
    try {
      getPhoneOtp({
        variables: {phone},
      }).then(response => {
        console.log('response', response.error);
        if (response?.data?.getPhoneOTP?.status === '403') {
          Toast.show({
            type: 'error',
            text1: 'We are Sorry!',
            text2: 'This User is Blocked',
          });
        } else if (response?.data?.getPhoneOTP?.status === '401') {
          Toast.show({
            type: 'error',
            text1: 'Email does not exist!',
            text2: 'Please sign up for a new account',
          });
        } else if (response?.data?.getPhoneOTP?.status !== '200') {
          // Alert.alert(
          //   'Location service is disabled!',
          //   'Please enable location to allow Agents to serve you better',
          //   [
          //     {
          //       text: 'Cancel',
          //       style: 'cancel',
          //     },
          //     {
          //       text: 'Settings',
          //       onPress: () => Linking.openSettings(), // Open app settings
          //     },
          //   ],
          //   {cancelable: false},
          // );
          Toast.show({
            type: 'error',
            text1: 'Location service is disabled!',
            text2: 'Please enable location to allow Agents to serve you better',
          });
        } else {
          Toast.show({
            type: 'success',
            text1: `OTP Sent on ${response.data.getPhoneOTP.phoneNumber}`,
            text2: '',
          });
          navigation.navigate('PhoneVerification', {
            message: response.data.getPhoneOTP.phoneNumber,
          });
        }
      });
    } catch (error) {
      console.log('#######', error);
    }
    // }
  };
  useEffect(() => {
    requestPermissions();
  }, []);
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // Request location permission
        const locationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        const locationPermission14 = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        );
        // Request camera permission
        // const cameraPermission = await PermissionsAndroid.request(
        //   PermissionsAndroid.PERMISSIONS.CAMERA,
        // );

        // Request storage permission
        // const storagePermission = await PermissionsAndroid.request(
        //   PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        // );
        // const Android13StoragePermission = await PermissionsAndroid.request(
        //   PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        // );
        // const NotificationPermission = await PermissionsAndroid.request(
        //   PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        // );
        const PhonePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        );
        // Check if permissions are granted
        if (
          locationPermission === PermissionsAndroid.RESULTS.GRANTED &&
          locationPermission14 === PermissionsAndroid.RESULTS.GRANTED &&
          // cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
          // NotificationPermission === PermissionsAndroid.RESULTS.GRANTED &&
          PhonePermission === PermissionsAndroid.RESULTS.GRANTED
          //   (storagePermission === PermissionsAndroid.RESULTS.GRANTED ||
          //     Android13StoragePermission === PermissionsAndroid.RESULTS.GRANTED)
        ) {
          console.log('All permissions granted');
        } else {
          console.log('Some permissionssssss denied');
        }
      } else if (Platform.OS === 'ios') {
        // Request location permission
        // const locationPermissionStatus = await request(
        //   PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        // );
        // const PushNotificationPermission = await request(
        //   PERMISSIONS.IOS.NOTIFICATIONS,
        // );
        // Request camera permission
        // const cameraPermissionStatus = await request(PERMISSIONS.IOS.CAMERA);
        // Request photo library permission
        // const photoLibraryPermissionStatus = await request(
        //   PERMISSIONS.IOS.PHOTO_LIBRARY,
        // );
        // Check if permissions are granted
        // if (
        //   locationPermissionStatus === 'granted'
        //   // cameraPermissionStatus === 'granted' &&
        //   // PushNotificationPermission === 'granted'
        //   // photoLibraryPermissionStatus === 'granted'
        // ) {
        //   console.log('All permissions granted');
        // } else {
        //   console.log('Some permissions denied');
        // }
      }
    } catch (error) {
      console.log('Error requesting permissions:', error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{backgroundColor: Colors.PinkBackground}}>
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
          <View style={{marginTop: heightToDp(5)}}>
            <PhoneTextInput
              onChange={e => {
                setPhone(e);
              }}
              LabelTextInput="Phone Number"
              Label={true}
              placeholder={'XXXXXXXXXXX'}
            />
            {/* <LabelTextInput
              leftImageSoucre={require('../../../assets/EmailIcon.png')}
              placeholder={'Enter your email address'}
              LabelTextInput={'Email Address'}
              onChangeText={text => setEmail(text)}
              keyboardType={'email-address'}
              Label={true}
            /> */}
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
          </View>
        </BottomSheetStyle>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
