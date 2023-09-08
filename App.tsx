/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import OnboardingScreen1 from './src/screens/OnboardingScreens/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/OnboardingScreens/OnboardingScreen2';
import OnboardingScreen3 from './src/screens/OnboardingScreens/OnboardingScreen3';

function App(): JSX.Element {
  return (
    <SafeAreaView>
      <OnboardingScreen3 />
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create();

export default App;
