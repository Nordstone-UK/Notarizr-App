import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import AppColors from '../../themes/AppColors';
import {useDispatch} from 'react-redux';
import {GET_PHONE_OTP} from '../../../request/queries/getPhoneOTP.query';
import {useLazyQuery} from '@apollo/client';
import {phoneSet} from '../../features/register/registerSlice';
import Toast from 'react-native-toast-message';
import AuthPhoneField from '../../components/AuthFlow/AuthPhoneField';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import {normalizePhoneNumber} from '../../utils/CountryCode';
import {GET_EMAIL_OTP} from '../../../request/queries/getEmailOTP.query';

const LOGIN_BACKGROUND = '#F8F1F8';

export default function LoginScreen({navigation}) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [agentLogin, setAgentLogin] = useState(false);
  const [loginMethod, setLoginMethod] = useState('phone');
  const [getPhoneOtp, {loading}] = useLazyQuery(GET_PHONE_OTP, {
    fetchPolicy: 'no-cache',
  });
  const [getEmailOtp, {loading: emailLoading}] = useLazyQuery(GET_EMAIL_OTP, {
    fetchPolicy: 'no-cache',
  });
  const dispatch = useDispatch();

  const handleGetPhoneOtp = async () => {
    // if (!emailRegex.test(email)) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Invalid Email!',
    //     text2: 'Please enter a valid email address',
    //   });
    //   return;
    //  } else {
    const normalizedPhone = normalizePhoneNumber(phone);
    dispatch(phoneSet(normalizedPhone));

    try {
      const response = await getPhoneOtp({
        variables: {phone: normalizedPhone},
      });
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
          isAgentLogin: agentLogin,
        });
      }
    } catch (error) {
      console.log('#######', error);
      Toast.show({
        type: 'error',
        text1: 'Could not send OTP',
        text2: 'Please try again.',
      });
    }
    // }
  };

  const handleGetEmailOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      Toast.show({type: 'error', text1: 'Enter a valid email address'});
      return;
    }
    try {
      const response = await getEmailOtp({
        variables: {email: normalizedEmail, newUser: false},
      });
      const result = response?.data?.getEmailOTP;
      if (result?.status !== '200') {
        Toast.show({
          type: 'error',
          text1: 'Could not send OTP',
          text2: result?.message || 'Check the email and try again.',
        });
        return;
      }
      navigation.navigate('EmailVerification', {
        email: normalizedEmail,
        isAgentLogin: agentLogin,
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Could not send OTP',
        text2: 'Please try again.',
      });
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // Request location permission.
        // Only request "while in use" here; requesting background location at
        // login can trigger Android to redirect users to system settings.
        const fineLocationAlreadyGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        const locationPermission = fineLocationAlreadyGranted
          ? PermissionsAndroid.RESULTS.GRANTED
          : await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
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
        const phonePermissionAlreadyGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        );
        const PhonePermission = phonePermissionAlreadyGranted
          ? PermissionsAndroid.RESULTS.GRANTED
          : await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.CALL_PHONE,
            );
        // Check if permissions are granted
        if (
          locationPermission === PermissionsAndroid.RESULTS.GRANTED &&
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
      <StatusBar barStyle="dark-content" backgroundColor={LOGIN_BACKGROUND} />
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={26}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <View style={styles.hero}>
            <Image
              source={require('../../../assets/loginLockTransparent.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>
              {agentLogin ? 'Agent sign in' : 'Verify Phone Number'}
            </Text>
            <Text style={styles.subtitle}>
              {agentLogin
                ? 'Sign in with your registered phone number or email.'
                : 'Enter your phone number and we’ll send a secure one-time code.'}
            </Text>

            {agentLogin && (
              <View style={styles.methodSwitch}>
                {['phone', 'email'].map(method => (
                  <TouchableOpacity
                    key={method}
                    onPress={() => setLoginMethod(method)}
                    style={[
                      styles.methodButton,
                      loginMethod === method && styles.methodButtonSelected,
                    ]}>
                    <Text
                      style={[
                        styles.methodText,
                        loginMethod === method && styles.methodTextSelected,
                      ]}>
                      {method === 'phone' ? 'Phone' : 'Email'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {agentLogin && loginMethod === 'email' ? (
              <View style={styles.emailInputShell}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor={AppColors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  style={styles.emailInput}
                />
              </View>
            ) : (
              <AuthPhoneField
                label={null}
                value={phone}
                onChangeText={setPhone}
              />
            )}

            <AuthPrimaryButton
              title="Send OTP"
              icon="arrow-right"
              loading={loading || emailLoading}
              onPress={
                agentLogin && loginMethod === 'email'
                  ? handleGetEmailOtp
                  : handleGetPhoneOtp
              }
              style={styles.loginButton}
            />

            <Text style={styles.helperText}>
              We’ll text you a code. Standard message rates may apply.
            </Text>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don’t have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('SignupAsScreen')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.agentLoginButton}
            activeOpacity={0.75}
            onPress={() => {
              setAgentLogin(value => !value);
              setLoginMethod('phone');
            }}>
            <Text style={styles.agentLoginText}>
              {agentLogin ? 'Sign in as a client' : 'Login as agent'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGIN_BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: LOGIN_BACKGROUND,
  },
  page: {
    flex: 1,
    minHeight: heightToDp(100),
    paddingHorizontal: widthToDp(5),
    paddingTop: heightToDp(1),
    paddingBottom: heightToDp(4),
    backgroundColor: LOGIN_BACKGROUND,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.45,
    paddingTop: heightToDp(1),
  },
  heroImage: {
    width: widthToDp(164),
    height: heightToDp(66),
  },
  content: {
    flex: 0.78,
    justifyContent: 'flex-end',
    paddingBottom: heightToDp(4),
  },
  title: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 29,
    lineHeight: 37,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: heightToDp(4),
    paddingHorizontal: widthToDp(4),
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 18,
    borderRadius: 999,
  },
  helperText: {
    marginTop: 16,
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    minHeight: 28,
  },
  signupPrompt: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  signupLink: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  methodSwitch: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: '#F4EDF4',
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 11,
  },
  methodButtonSelected: {backgroundColor: AppColors.white},
  methodText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  methodTextSelected: {color: AppColors.primary},
  emailInputShell: {
    height: 58,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: '#F4EDF4',
  },
  emailInput: {
    padding: 0,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Regular',
    fontSize: 16,
  },
  agentLoginButton: {alignSelf: 'center', marginTop: 12, padding: 8},
  agentLoginText: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
});
