import React, {useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {WebView} from 'react-native-webview';
import ScreenHeader from '../Navigation/ScreenHeader';

export default function LegalWebScreen({navigation, title, url}) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = () => {
    setFailed(false);
    setLoading(true);
    setReloadKey(current => current + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScreenHeader
        fallback="SettingScreen"
        navigation={navigation}
        subtitle="Notarizr legal information"
        title={title}
      />
      <View style={styles.webWrap}>
        <WebView
          key={reloadKey}
          onError={() => {
            setFailed(true);
            setLoading(false);
          }}
          onLoadEnd={() => setLoading(false)}
          originWhitelist={['*']}
          source={{uri: url}}
          style={styles.webView}
        />
        {loading && !failed && (
          <View style={styles.overlay}>
            <ActivityIndicator color="#FD6D1F" size="small" />
            <Text style={styles.loadingText}>Loading secure document...</Text>
          </View>
        )}
        {failed && (
          <View style={styles.overlay}>
            <View style={styles.errorIcon}>
              <Feather name="wifi-off" size={25} color="#FD6D1F" />
            </View>
            <Text style={styles.errorTitle}>Document unavailable</Text>
            <Text style={styles.errorText}>
              Check your connection and try loading this page again.
            </Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={retry}
              style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  errorText: {
    color: '#8B919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 280,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    marginTop: 15,
  },
  loadingText: {
    color: '#8B919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    marginTop: 12,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  retryButton: {
    backgroundColor: '#FD6D1F',
    borderRadius: 8,
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  webView: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  webWrap: {
    flex: 1,
  },
});
