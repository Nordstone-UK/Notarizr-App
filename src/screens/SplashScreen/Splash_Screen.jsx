import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  SafeAreaView,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFetchUser from '../../hooks/useFetchUser';
import OneSignal from 'react-native-onesignal';
import useChatService from '../../hooks/useChatService';
import {useDispatch} from 'react-redux';
import {setAllChats} from '../../features/chats/chatsSlice';
import {socket} from '../../utils/Socket';
import {initializeOneSignal} from '../../utils/oneSignal';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import {EventRegister} from 'react-native-event-listeners';

export default function Splash_Screen({navigation}) {
  const {fetchUserInfo} = useFetchUser();
  const {getClientChats, getAgentChats} = useChatService();
  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await fetchUserInfo()
          .then(async response => {
            if (
              response.isVerified == false &&
              response.account_type == 'agent'
            ) {
              navigation.navigate('AgentVerfiedScreen');
            } else {
              response?.account_type === 'client'
                ? getClientChats()
                : getAgentChats();
              initializeOneSignal();
              navigation.navigate('HomeScreen');
            }
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        checkFirstLaunch();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  };
  const Root = () => {
    const navigation = useNavigation();

    const [stack, setStack] = (useState < 'auth') | ('app' > 'auth');

    useEffect(() => {
      const listener = EventRegister.addEventListener(
        'notfication',
        async data => {
          if (stack === 'app') {
            const {type, user, chatID} = data?.notification?.additionalData;

            if (type === 'chat_notification' && user && chatID) {
              // navigate to chat screen
              navigation.navigate(SCREENS.PERSONAL_CHAT, {
                user: user,
                chatID: chatID,
              });
            }
            if (type === 'general_notification') {
              notificationCacheMethods.reload();
              // navigate to notification screen
              navigation.navigate(SCREENS.NOTIFICATIONS);
            }
          }
        },
      );
      return () => {
        EventRegister.removeAllListeners();
      };
    }, [navigation, stack]);
  };

  const Wrapper = () => {
    return (
      <NavigationContainer>
        <Root />
      </NavigationContainer>
    );
  };
  const isFirstLaunch = async () => {
    try {
      const value = await AsyncStorage.getItem('isFirstLaunch');
      return value === null;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return false;
    }
  };
  const checkFirstLaunch = async () => {
    const isFirst = await isFirstLaunch();
    if (isFirst) {
      // User is launching the app for the first time
      // Navigate to the onboarding screens
      navigation.navigate('OnboardingScreen1');

      // Once the introduction screens are shown, set the flag in AsyncStorage
      try {
        await AsyncStorage.setItem('isFirstLaunch', 'false');
      } catch (error) {
        console.error('Error setting first launch flag:', error);
      }
    } else {
      // User has already seen the introduction screens
      // Navigate to the login screen
      navigation.navigate('LoginScreen');
    }
  };

  useEffect(() => {
    requestPermissions();
    checkAuthentication().then(() => {
      SplashScreen.hide();
    });
  }, []);
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // Request location permission
        const locationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        // Request camera permission
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );

        // Request storage permission
        const storagePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        const Android13StoragePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );
        const NotificationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        const PhonePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        );
        // Check if permissions are granted
        if (
          locationPermission === PermissionsAndroid.RESULTS.GRANTED &&
          cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
          NotificationPermission === PermissionsAndroid.RESULTS.GRANTED &&
          PhonePermission === PermissionsAndroid.RESULTS.GRANTED &&
          (storagePermission === PermissionsAndroid.RESULTS.GRANTED ||
            Android13StoragePermission === PermissionsAndroid.RESULTS.GRANTED)
        ) {
          console.log('All permissions granted');
        } else {
          console.log('Some permissions denied');
        }
      } else if (Platform.OS === 'ios') {
        // Request location permission
        const locationPermissionStatus = await request(
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        );
        const PushNotificationPermission = await request(
          PERMISSIONS.IOS.NOTIFICATIONS,
        );

        // Request camera permission
        const cameraPermissionStatus = await request(PERMISSIONS.IOS.CAMERA);

        // Request photo library permission
        const photoLibraryPermissionStatus = await request(
          PERMISSIONS.IOS.PHOTO_LIBRARY,
        );

        // Check if permissions are granted
        if (
          locationPermissionStatus === 'granted' &&
          cameraPermissionStatus === 'granted' &&
          PushNotificationPermission === 'granted' &&
          photoLibraryPermissionStatus === 'granted'
        ) {
          console.log('All permissions granted');
        } else {
          console.log('Some permissions denied');
        }
      }
    } catch (error) {
      console.log('Error requesting permissions:', error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../../assets/launch_screen.png')}
        style={styles.complete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
