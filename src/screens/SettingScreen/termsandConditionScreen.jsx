import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview'; // Import WebView component
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';

export default function TermsAndConditionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Terms & Conditions" />

      <WebView
        originWhitelist={['*']} // Allow all origins
        source={{uri: 'https://notarizr.co/terms-policies/'}} // Load the URL for Terms & Conditions
        style={{flex: 1}} // Make WebView take up the full screen
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
});
