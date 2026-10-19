import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import AppColors from '../../themes/AppColors';
import Feather from 'react-native-vector-icons/Feather';
import {removeCountryCode} from '../../utils/CountryCode';

export default function AuthPhoneField({
  value = '',
  onChangeText,
  label = 'Phone number',
  error,
  editable = true,
}) {
  const [focused, setFocused] = useState(false);
  const [clearKey, setClearKey] = useState(0);
  const [initialPhone] = useState(() => {
    const parsed = removeCountryCode(value || '');
    return {
      countryCode: value.startsWith('+1') ? 'US' : parsed.countryCode || 'US',
      nationalNumber: parsed.phoneNumberWithoutCode.replace(/[^\d]/g, ''),
    };
  });
  const hasValue = value?.replace(/[^\d]/g, '').length > 0;

  const handleClear = () => {
    onChangeText?.('');
    setClearKey(key => key + 1);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputShell,
          focused && styles.focusedShell,
          error && styles.errorShell,
          !editable && styles.disabledShell,
        ]}>
        <PhoneInput
          key={`${initialPhone.countryCode}-${clearKey}`}
          defaultCode={initialPhone.countryCode}
          defaultValue={initialPhone.nationalNumber}
          disabled={!editable}
          layout="second"
          onChangeFormattedText={onChangeText}
          containerStyle={styles.phoneContainer}
          textContainerStyle={styles.textContainer}
          countryPickerButtonStyle={styles.countryButton}
          flagButtonStyle={styles.flagButton}
          codeTextStyle={styles.countryCode}
          textInputStyle={styles.input}
          renderDropdownImage={
            <Feather
              name="chevron-down"
              size={15}
              color={AppColors.textSecondary}
            />
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
            placeholderTextColor: AppColors.textMuted,
            textContentType: 'telephoneNumber',
          }}
          placeholder="Phone number"
        />
        {hasValue && editable ? (
          <TouchableOpacity
            accessibilityLabel="Clear phone number"
            activeOpacity={0.75}
            onPress={handleClear}
            style={styles.clearButton}>
            <Feather name="x" size={14} color={AppColors.white} />
          </TouchableOpacity>
        ) : null}
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
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  inputShell: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  focusedShell: {
    borderColor: 'transparent',
  },
  errorShell: {
    borderColor: 'transparent',
  },
  disabledShell: {
    opacity: 0.72,
  },
  phoneContainer: {
    flex: 1,
    height: 58,
    columnGap: 10,
    backgroundColor: 'transparent',
  },
  countryButton: {
    width: 108,
    height: 58,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: '#F4EDF4',
  },
  flagButton: {
    width: 108,
  },
  textContainer: {
    flex: 1,
    height: 58,
    paddingLeft: 20,
    paddingRight: 44,
    paddingVertical: 0,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: '#F4EDF4',
  },
  countryCode: {
    marginLeft: 6,
    marginRight: 8,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  input: {
    flex: 1,
    height: 56,
    margin: 0,
    padding: 0,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Regular',
    fontSize: 15,
  },
  clearButton: {
    position: 'absolute',
    right: 17,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B9B2BD',
  },
  errorText: {
    marginTop: 6,
    color: AppColors.error,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
});
