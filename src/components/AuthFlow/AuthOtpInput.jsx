import React, {useState} from 'react';
import {StyleSheet, TextInput} from 'react-native';
import AppColors from '../../themes/AppColors';

export default function AuthOtpInput({value = '', onChange, autoFocus = true}) {
  const [focused, setFocused] = useState(false);

  const handleChange = text => {
    onChange(text.replace(/\D/g, '').slice(0, 6));
  };

  return (
    <TextInput
      accessibilityLabel="Six digit verification code"
      autoComplete="sms-otp"
      autoFocus={autoFocus}
      keyboardType="number-pad"
      maxLength={6}
      onBlur={() => setFocused(false)}
      onChangeText={handleChange}
      onFocus={() => setFocused(true)}
      placeholder="Enter 6-digit code"
      placeholderTextColor={AppColors.textMuted}
      style={[styles.input, focused && styles.inputFocused]}
      textAlign="center"
      textContentType="oneTimeCode"
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.backgroundSubtle,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
    height: 58,
    letterSpacing: 6,
    width: '100%',
  },
  inputFocused: {
    borderColor: '#FD6D1F',
    backgroundColor: AppColors.white,
  },
});
