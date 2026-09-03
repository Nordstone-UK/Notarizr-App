import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AuthOtpInput from './AuthOtpInput';
import AuthPrimaryButton from './AuthPrimaryButton';

export default function AuthOtpVerificationView({
  phoneNumber,
  otp,
  onChangeOtp,
  onResend,
  onVerify,
  resendLoading = false,
  verifyLoading = false,
}) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.illustrationBox}>
        <Image
          source={require('../../../assets/otp.png')}
          resizeMode="contain"
          style={styles.illustration}
        />
      </View>

      <Text style={styles.heading}>Verify your phone</Text>
      <Text style={styles.subheading}>
        Enter the verification code sent to{'\n'}
        <Text style={styles.phoneNumber}>{phoneNumber}</Text>
      </Text>

      <View style={styles.otpContainer}>
        <AuthOtpInput value={otp} onChange={onChangeOtp} />
      </View>

      <View style={styles.resendRow}>
        <Text style={styles.resendPrompt}>Didn't receive the code?</Text>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.7}
          disabled={resendLoading}
          onPress={onResend}>
          <Text style={styles.resendLink}>
            {resendLoading ? ' Sending...' : ' Resend'}
          </Text>
        </TouchableOpacity>
      </View>

      <AuthPrimaryButton
        title="Verify and continue"
        icon="arrow-right"
        loading={verifyLoading}
        onPress={onVerify}
        style={styles.verifyButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 36,
  },
  illustrationBox: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: '#FFF4EC',
  },
  illustration: {
    width: 96,
    height: 96,
  },
  heading: {
    marginTop: 28,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 28,
  },
  subheading: {
    marginTop: 10,
    color: '#6C727F',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  phoneNumber: {
    color: '#252B36',
    fontFamily: 'Manrope-Bold',
  },
  otpContainer: {
    width: '100%',
    marginTop: 26,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  resendPrompt: {
    color: '#737A86',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  resendLink: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  verifyButton: {
    width: '100%',
    marginTop: 30,
  },
});
