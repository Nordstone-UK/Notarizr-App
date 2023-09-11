/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import {SafeAreaView, View} from 'react-native';
import OnboardingScreen1 from './src/screens/OnboardingScreens/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/OnboardingScreens/OnboardingScreen2';
import OnboardingScreen3 from './src/screens/OnboardingScreens/OnboardingScreen3';
import SignupAsScreen from './src/screens/SingupAsScreen/SignupAsScreen';
import LoginScreen from './src/screens/LogIn&SignupScreens/LoginScreen';
import SignUpScreen from './src/screens/LogIn&SignupScreens/SignUpScreen';
import SignUpDetailScreen from './src/screens/LogIn&SignupScreens/SignUpDetailScreen';
import ProfilePictureScreen from './src/screens/LogIn&SignupScreens/ProfilePictureScreen';
import CompletionScreen from './src/screens/CompletionScreen/CompletionScreen';
import HomeScreenHeader from './src/components/HomeScreenHeader/HomeScreenHeader';
import HomeScreen from './src/screens/HomeScreen.jsx/HomeScreen';
import LegalDocScreen from './src/screens/LegalDocumentsScren/LegalDocScreen';
import MainBookingScreen from './src/screens/MainBookingScreen/MainBookingScreen';

function App(): JSX.Element {
  return (
    <SafeAreaView>
      <HomeScreen />
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create();

export default App;
