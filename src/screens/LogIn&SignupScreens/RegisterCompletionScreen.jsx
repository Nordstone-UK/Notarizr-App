import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import useLogin from '../../hooks/useLogin';

export default function RegisterCompletionScreen() {
  const {resetStack} = useLogin();

  useEffect(() => {
    const timer = setTimeout(() => resetStack('signup'), 3000);
    return () => clearTimeout(timer);
  }, [resetStack]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LottieView
        source={require('../../../assets/confetti.json')}
        autoPlay
        loop={false}
        resizeMode="cover"
        pointerEvents="none"
        style={styles.confetti}
      />

      <Image
        source={require('../../../assets/notarizrLogo1.png')}
        resizeMode="contain"
        style={styles.logo}
      />

      <View style={styles.content}>
        <View style={styles.successIconWrap}>
          <Image
            source={require('../../../assets/completedIcon.png')}
            resizeMode="contain"
            style={styles.successIcon}
          />
        </View>
        <Text style={styles.eyebrow}>REGISTRATION COMPLETE</Text>
        <Text style={styles.heading}>Your account is ready</Text>
        <Text style={styles.subheading}>
          Welcome to Notarizr. We’re preparing your account now.
        </Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FD6D1F" />
        <Text style={styles.footerText}>Taking you to the app</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  confetti: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  logo: {
    width: 156,
    height: 36,
    alignSelf: 'center',
    marginTop: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
  },
  successIconWrap: {
    width: 154,
    height: 154,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 77,
    backgroundColor: '#FFF3EA',
  },
  successIcon: {
    width: 118,
    height: 118,
  },
  eyebrow: {
    marginTop: 28,
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  heading: {
    marginTop: 8,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 28,
    textAlign: 'center',
  },
  subheading: {
    maxWidth: 300,
    marginTop: 10,
    color: '#6C727F',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  footer: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  footerText: {
    marginLeft: 10,
    color: '#737A86',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
  },
});
