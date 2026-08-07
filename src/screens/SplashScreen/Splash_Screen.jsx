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
import {useDispatch} from 'react-redux';
import useFetchUser from '../../hooks/useFetchUser';
import {saveUserInfo} from '../../features/user/userSlice';
import {getLocalTestAccountById} from '../../data/localTestAccounts';

export default function Splash_Screen({navigation}) {
  const dispatch = useDispatch();
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

        if (__DEV__ && token.startsWith('local-preview:')) {
          const localAccount = getLocalTestAccountById(
            token.replace('local-preview:', ''),
          );
          if (localAccount) {
            dispatch(saveUserInfo(localAccount));
            navigation.reset({index: 0, routes: [{name: 'HomeScreen'}]});
            return;
          }
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
  }, [dispatch, navigation]);

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
