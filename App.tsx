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

function App(): JSX.Element {
  return (
    <SafeAreaView>
      <SignupAsScreen />
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create();

export default App;
