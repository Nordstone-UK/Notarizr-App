import React, {useEffect, useRef} from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';
import useFetchUser from '../../hooks/useFetchUser';
import {saveUserInfo} from '../../features/user/userSlice';
import {getLocalTestAccountById} from '../../data/localTestAccounts';
import {ServerURL} from '../../utils/ApiUtils';

const isServerReachable = async () => {
  try {
    const res = await fetch(`${ServerURL}/api/v1/app`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query: '{__typename}'}),
    });
    return res.status < 500;
  } catch {
    return false;
  }
};

export default function Splash_Screen({navigation}) {
  const {fetchUserInfo} = useFetchUser();
  const fetchUserInfoRef = useRef(fetchUserInfo);

  fetchUserInfoRef.current = fetchUserInfo;

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        if (
          Platform.OS === 'android' &&
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        ) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        }
      } catch (error) {
        console.log('Notification permission error:', error);
      }
    };

    const openLogin = () => {
      navigation.reset({index: 0, routes: [{name: 'LoginScreen'}]});
    };

    const bootstrap = async () => {
      await requestNotificationPermission();
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          openLogin();
          return;
        }

        if (token.startsWith('local-preview:')) {
          await AsyncStorage.removeItem('token');
          // local-preview tokens are fake IDs for offline UI dev — they are NOT
          // valid JWTs and the real server will reject them. When we find one:
          //  • If the server is reachable → clear it and go to login so the user
          //    gets a real JWT (useLogin now tries server auth first).
          //  • If the server is down     → keep using the cached local account
          //    for offline UI preview (no API calls will work, but UI renders).

          // TODO: Uncomment this when we have a real server
          // if (__DEV__ && token.startsWith('local-preview:')) {
          //   const localAccount = getLocalTestAccountById(
          //     token.replace('local-preview:', ''),
          //   );
          //   const serverReachable = await isServerReachable();
          //   if (serverReachable) {
          //     // Force the user to log in again and obtain a real JWT
          //     await AsyncStorage.removeItem('token');
          //     openLogin();
          //     return;
          //   }
          //   // Offline preview mode — render UI without real API calls
          //   if (localAccount) {
          //     dispatch(saveUserInfo(localAccount));
          //     navigation.reset({index: 0, routes: [{name: 'HomeScreen'}]});
          //     return;
          //   }
          openLogin();
          return;
        }

        const user = await fetchUserInfoRef.current();
        if (!user) {
          await AsyncStorage.removeItem('token');
          openLogin();
          return;
        }
        if (user.isVerified === false && user.account_type === 'agent') {
          navigation.reset({
            index: 0,
            routes: [{name: 'AgentVerfiedScreen'}],
          });
          return;
        }

        navigation.reset({
          index: 0,
          routes: [{name: 'HomeScreen'}],
        });
      } catch (error) {
        await AsyncStorage.removeItem('token');
        openLogin();
      } finally {
        SplashScreen.hide();
      }
    };

    bootstrap();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../../assets/launch_screen.png')}
        resizeMode="cover"
        style={styles.image}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
