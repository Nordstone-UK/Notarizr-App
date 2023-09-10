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

function App(): JSX.Element {
  return (
    <SafeAreaView>
      <SignUpDetailScreen />
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create();

export default App;
