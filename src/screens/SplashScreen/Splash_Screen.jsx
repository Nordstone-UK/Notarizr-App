import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFetchUser from '../../hooks/useFetchUser';

export default function Splash_Screen({navigation}) {
  const {fetchUserInfo} = useFetchUser();
  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await fetchUserInfo()
          .then(response => {
            console.log('Data after', response);
            if (
              response.isVerified == false &&
              response.account_type == 'agent'
            ) {
              navigation.navigate('AgentVerfiedScreen');
            } else {
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
    checkAuthentication();
    SplashScreen.hide();
  }, []);
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/launch_screen.png')}
        style={styles.complete}
      />
    </View>
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
