import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview'; // Import WebView component
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';

export default function PrivacyPolicyScreen() {
  const privacyPolicyLink = 'https://notarizr.co/privacypolicy/';

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Privacy Policy" />
      <WebView
        source={{uri: privacyPolicyLink}} // Display the URL in the WebView
        style={{flex: 1}} // Make the WebView take up the full screen
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
