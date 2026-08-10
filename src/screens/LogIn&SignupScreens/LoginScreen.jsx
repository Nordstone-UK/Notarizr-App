import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import {useDispatch} from 'react-redux';
import {GET_PHONE_OTP} from '../../../request/queries/getPhoneOTP.query';
import {useLazyQuery} from '@apollo/client';
import {phoneSet} from '../../features/register/registerSlice';
import Toast from 'react-native-toast-message';
import Svg, {Path} from 'react-native-svg';
import AuthPhoneField from '../../components/AuthFlow/AuthPhoneField';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';

const LOGIN_BACKGROUND = Colors.white;
const HERO_ORANGE_END = '#FD6D1F';

export default function LoginScreen({navigation}) {
  const [phone, setPhone] = useState('');
  const [getPhoneOtp, {loading}] = useLazyQuery(GET_PHONE_OTP, {
    fetchPolicy: 'no-cache',
  });
  const dispatch = useDispatch();

  const handleGetPhoneOtp = () => {
    // if (!emailRegex.test(email)) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Invalid Email!',
    //     text2: 'Please enter a valid email address',
    //   });
    //   return;
    //  } else {
    dispatch(phoneSet(phone));

    try {
      getPhoneOtp({
        variables: {phone},
      }).then(response => {
        console.log('responsessss', response);
        if (response?.data?.getPhoneOTP?.status === '403') {
          Toast.show({
            type: 'error',
            text1: 'We are Sorry!',
            text2: 'This User is Blocked',
          });
        } else if (response?.data?.getPhoneOTP?.status === '401') {
          Toast.show({
            type: 'error',
            text1: 'Account does not exist!',
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
            text1: 'error',
            text2: 'Failed to send OTP',
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
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={require('../../../assets/loginBackground.png')}
          style={styles.heroImage}
          resizeMode="stretch">
          <View style={styles.logoLockup}>
            <View style={styles.logoAccent} />
            <Image
              source={require('../../../assets/notarizrLogo1.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.brandBars}>
              <View style={[styles.brandBar, styles.brandBarNavy]} />
              <View style={[styles.brandBar, styles.brandBarOrange]} />
              <View style={[styles.brandBar, styles.brandBarSoft]} />
            </View>
          </View>
          <Svg
            style={styles.waveOverlay}
            viewBox="0 0 400 90"
            preserveAspectRatio="none">
            <Path
              d="M0 42 C58 74 120 8 190 36 C262 66 326 20 400 48 L400 90 L0 90 Z"
              fill={Colors.white}
            />
          </Svg>
        </ImageBackground>

        <View style={styles.formSection}>
          <Text style={styles.headerText}>Login</Text>
          <AuthPhoneField value={phone} onChangeText={setPhone} />

          <AuthPrimaryButton
            title="Login"
            loading={loading}
            onPress={handleGetPhoneOtp}
            style={styles.loginButton}
          />

          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don’t have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignupAsScreen')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGIN_BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: heightToDp(6),
    backgroundColor: LOGIN_BACKGROUND,
  },
  logoLockup: {
    position: 'absolute',
    left: widthToDp(6),
    top: Platform.OS === 'ios' ? heightToDp(16) : heightToDp(8),
    width: widthToDp(51),
    height: heightToDp(16),
    justifyContent: 'center',
    paddingHorizontal: widthToDp(4),
    borderWidth: 1,
    borderColor: 'rgba(18, 24, 38, 0.09)',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    shadowColor: '#121826',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoAccent: {
    position: 'absolute',
    left: 0,
    top: '22%',
    width: 4,
    height: '56%',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: HERO_ORANGE_END,
  },
  logo: {
    width: widthToDp(42),
    height: heightToDp(10.5),
  },
  brandBars: {
    position: 'absolute',
    right: widthToDp(2.5),
    bottom: heightToDp(1.5),
    flexDirection: 'row',
    columnGap: 3,
  },
  brandBar: {
    width: 10,
    height: 3,
    borderRadius: 2,
  },
  brandBarNavy: {
    backgroundColor: '#121826',
  },
  brandBarOrange: {
    backgroundColor: HERO_ORANGE_END,
  },
  brandBarSoft: {
    backgroundColor: '#FFB98D',
  },
  heroImage: {
    width: '100%',
    height: heightToDp(128),
  },
  waveOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    width: '100%',
    height: heightToDp(10),
  },
  formSection: {
    width: '100%',
    paddingHorizontal: widthToDp(7),
    paddingTop: heightToDp(4.5),
  },
  headerText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 30,
    color: Colors.TextColor,
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 22,
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: heightToDp(0.8),
  },
  signupPrompt: {
    color: Colors.DullTextColor,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  signupLink: {
    color: HERO_ORANGE_END,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
});
