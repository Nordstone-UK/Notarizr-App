import React, {useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
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
import AppColors from '../../themes/AppColors';

export default function LegalWebScreen({
  navigation,
  title,
  description,
  icon,
  url,
}) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = () => {
    setFailed(false);
    setLoading(true);
    setReloadKey(current => current + 1);
  };

  const openInBrowser = async () => {
    try {
      await Linking.openURL(url);
    } catch {
      setFailed(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />
      <ScreenHeader
        fallback="SettingScreen"
        navigation={navigation}
        subtitle="Support and legal"
        title={title}
      />

      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <Feather name={icon} size={22} color={AppColors.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroText}>{description}</Text>
        </View>
        <TouchableOpacity
          accessibilityLabel={`Open ${title} in browser`}
          activeOpacity={0.72}
          onPress={openInBrowser}
          style={styles.externalButton}>
          <Feather name="external-link" size={17} color={AppColors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.documentShell}>
        <View style={styles.documentBar}>
          <View style={styles.secureStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Official Notarizr document</Text>
          </View>
          <Text style={styles.webLabel}>WEB</Text>
        </View>

        <View style={styles.webWrap}>
          <WebView
            key={reloadKey}
            onError={() => {
              setFailed(true);
              setLoading(false);
            }}
            onHttpError={({nativeEvent}) => {
              if (nativeEvent.statusCode >= 400) {
                setFailed(true);
                setLoading(false);
              }
            }}
            onLoadEnd={() => setLoading(false)}
            onLoadStart={() => {
              setFailed(false);
              setLoading(true);
            }}
            originWhitelist={['https://*', 'http://*']}
            source={{uri: url}}
            startInLoadingState={false}
            style={styles.webView}
          />

          {loading && !failed && (
            <View style={styles.overlay}>
              <View style={styles.loadingIcon}>
                <ActivityIndicator color={AppColors.primary} size="small" />
              </View>
              <Text style={styles.loadingTitle}>Opening your document</Text>
              <Text style={styles.loadingText}>
                This should only take a moment.
              </Text>
            </View>
          )}

          {failed && (
            <View style={styles.overlay}>
              <View style={styles.errorIcon}>
                <Feather name="wifi-off" size={24} color={AppColors.primary} />
              </View>
              <Text style={styles.errorTitle}>
                Unable to load this document
              </Text>
              <Text style={styles.errorText}>
                The website may be temporarily unavailable. Retry here or open
                the official page in your browser.
              </Text>
              <Pressable
                onPress={retry}
                style={({pressed}) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                ]}>
                <Feather name="refresh-cw" size={15} color={AppColors.white} />
                <Text style={styles.primaryText}>Try again</Text>
              </Pressable>
              <TouchableOpacity
                activeOpacity={0.72}
                onPress={openInBrowser}
                style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>Open in browser</Text>
                <Feather
                  name="arrow-up-right"
                  size={16}
                  color={AppColors.primary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  documentBar: {
    alignItems: 'center',
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  documentShell: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginBottom: 14,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  errorIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  errorText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 290,
    textAlign: 'center',
  },
  errorTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
    marginTop: 16,
  },
  externalButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: AppColors.textPrimary,
    borderRadius: 8,
    flexDirection: 'row',
    margin: 16,
    padding: 16,
  },
  heroCopy: {
    flex: 1,
    marginHorizontal: 12,
  },
  heroText: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  heroTitle: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  loadingIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  loadingText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    marginTop: 5,
  },
  loadingTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    marginTop: 14,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: AppColors.white,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 24,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 46,
    width: 190,
  },
  primaryText: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    marginLeft: 8,
  },
  primaryButtonPressed: {backgroundColor: AppColors.primaryPressed},
  safeArea: {
    backgroundColor: AppColors.background,
    flex: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 15,
    padding: 5,
  },
  secondaryText: {
    color: AppColors.primary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    marginRight: 5,
  },
  secureStatus: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statusDot: {
    backgroundColor: AppColors.success,
    borderRadius: 4,
    height: 7,
    marginRight: 7,
    width: 7,
  },
  statusText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  webLabel: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  webView: {
    backgroundColor: AppColors.white,
    flex: 1,
  },
  webWrap: {
    flex: 1,
  },
});
