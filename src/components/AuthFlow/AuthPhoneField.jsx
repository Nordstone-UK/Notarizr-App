import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import Feather from 'react-native-vector-icons/Feather';
import {removeCountryCode} from '../../utils/CountryCode';

const ORANGE = '#FD6D1F';

export default function AuthPhoneField({
  value = '',
  onChangeText,
  label = 'Phone number',
  error,
  editable = true,
}) {
  const [focused, setFocused] = useState(false);
  const [initialPhone] = useState(() => {
    const parsed = removeCountryCode(value || '');
    return {
      countryCode: value.startsWith('+1') ? 'US' : parsed.countryCode || 'US',
      nationalNumber: parsed.phoneNumberWithoutCode.replace(/[^\d]/g, ''),
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          focused && styles.focusedShell,
          error && styles.errorShell,
          !editable && styles.disabledShell,
        ]}>
        <PhoneInput
          defaultCode={initialPhone.countryCode}
          defaultValue={initialPhone.nationalNumber}
          disabled={!editable}
          layout="first"
          onChangeFormattedText={onChangeText}
          containerStyle={styles.phoneContainer}
          textContainerStyle={styles.textContainer}
          countryPickerButtonStyle={styles.countryButton}
          flagButtonStyle={styles.flagButton}
          codeTextStyle={styles.countryCode}
          textInputStyle={styles.input}
          renderDropdownImage={
            <Feather name="chevron-down" size={15} color="#747B87" />
          }
          countryPickerProps={{
            withAlphaFilter: true,
            withCallingCode: true,
            withFilter: true,
          }}
          textInputProps={{
            accessibilityLabel: label,
            editable,
            keyboardType: 'phone-pad',
            onBlur: () => setFocused(false),
            onFocus: () => setFocused(true),
            placeholderTextColor: '#A7ADB7',
            textContentType: 'telephoneNumber',
          }}
          placeholder="Phone number"
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: '#252B36',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  inputShell: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
  },
  focusedShell: {
    borderColor: ORANGE,
    backgroundColor: '#FFFFFF',
  },
  errorShell: {
    borderColor: '#E5484D',
  },
  disabledShell: {
    opacity: 0.72,
  },
  phoneContainer: {
    flex: 1,
    height: 56,
    backgroundColor: 'transparent',
  },
  countryButton: {
    width: 52,
    height: 56,
    marginLeft: 4,
  },
  flagButton: {
    width: 52,
  },
  textContainer: {
    height: 56,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  countryCode: {
    marginRight: 9,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  input: {
    flex: 1,
    height: 56,
    margin: 0,
    padding: 0,
    color: '#121826',
    fontFamily: 'Manrope-Regular',
    fontSize: 15,
  },
  errorText: {
    marginTop: 6,
    color: '#D92D20',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
});
