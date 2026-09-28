import React, {useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';
import useFetchUser from '../../hooks/useFetchUser';
import {saveUserInfo} from '../../features/user/userSlice';
import {useDispatch} from 'react-redux';
import AppColors from '../../themes/AppColors';
import {
  getPendingSessionInvite,
  normalizeSessionInviteParams,
  savePendingSessionInvite,
} from '../../utils/sessionInvitation';
import {getLocalTestAccountById} from '../../data/localTestAccounts';

export default function Splash_Screen({navigation}) {
  const {fetchUserInfo} = useFetchUser();
  const dispatch = useDispatch();
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

    const openLogin = pendingInvite => {
      dispatch(saveUserInfo(null));
      navigation.reset({
        index: 0,
        routes: [
          pendingInvite
            ? {name: 'SessionInvitationScreen', params: pendingInvite}
            : {name: 'LoginScreen'},
        ],
      });
    };

    const bootstrap = async () => {
      await requestNotificationPermission();
      try {
        const initialUrl = await Linking.getInitialURL();
        const incomingInvite = normalizeSessionInviteParams(initialUrl || '');
        const pendingInvite = incomingInvite
          ? await savePendingSessionInvite(incomingInvite)
          : await getPendingSessionInvite();
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          openLogin(pendingInvite);
          return;
        }

        if (token.startsWith('local-preview:')) {
          if (__DEV__) {
            const localAccount = getLocalTestAccountById(
              token.replace('local-preview:', ''),
            );
            if (localAccount) {
              dispatch(saveUserInfo(localAccount));
              navigation.reset({index: 0, routes: [{name: 'HomeScreen'}]});
              return;
            }
          }
          await AsyncStorage.removeItem('token');
          openLogin(pendingInvite);
          return;
        }

        const user = await fetchUserInfoRef.current();
        if (!user) {
          await AsyncStorage.removeItem('token');
          openLogin(pendingInvite);
          return;
        }
        if (pendingInvite) {
          navigation.reset({
            index: 0,
            routes: [{name: 'SessionInvitationScreen', params: pendingInvite}],
          });
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
        const pendingInvite = await getPendingSessionInvite();
        openLogin(pendingInvite);
      } finally {
        SplashScreen.hide();
      }
    };

    bootstrap();
  }, [dispatch, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.white} />
      <View style={styles.topAccent} />
      <View style={styles.content}>
        <Image
          source={require('../../../assets/mainLogo.png')}
          resizeMode="contain"
          style={styles.mark}
        />
        <Image
          source={require('../../../assets/notarizrLogo1.png')}
          resizeMode="contain"
          style={styles.wordmark}
        />
        <View style={styles.brandRule} />
        <Text style={styles.caption}>
          Notary services, made straightforward.
        </Text>
      </View>
      <View style={styles.footer}>
        <ActivityIndicator color={AppColors.primary} size="small" />
        <Text style={styles.loadingText}>Preparing your workspace</Text>
        <Text style={styles.trustText}>SECURE • SIMPLE • PROFESSIONAL</Text>
        <View style={styles.footerRule} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  caption: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    marginTop: 16,
  },
  brandRule: {
    backgroundColor: AppColors.primary,
    height: 3,
    marginTop: 20,
    width: 40,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 30,
  },
  footer: {
    alignItems: 'center',
    bottom: 28,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  loadingText: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    marginTop: 9,
  },
  mark: {
    height: 120,
    marginBottom: 26,
    width: 120,
  },
  topAccent: {
    backgroundColor: AppColors.primary,
    height: 8,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  wordmark: {
    height: 70,
    width: 280,
  },
  trustText: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    marginTop: 25,
  },
  footerRule: {
    backgroundColor: AppColors.primary,
    height: 3,
    marginTop: 14,
    width: 40,
  },
});
