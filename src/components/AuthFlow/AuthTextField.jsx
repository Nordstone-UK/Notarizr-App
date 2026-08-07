import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AppColors from '../../themes/AppColors';

const ORANGE = AppColors.primary;

export default function AuthTextField({
  label,
  icon,
  error,
  optional,
  multiline = false,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional && <Text style={styles.optional}>Optional</Text>}
      </View>
      <View
        style={[
          styles.inputShell,
          multiline && styles.multilineShell,
          focused && styles.focusedShell,
          error && styles.errorShell,
        ]}>
        {icon && (
          <Feather
            name={icon}
            size={19}
            color={focused ? ORANGE : AppColors.textSecondary}
            style={multiline ? styles.multilineIcon : styles.icon}
          />
        )}
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          multiline={multiline}
          placeholderTextColor={AppColors.textMuted}
          onBlur={event => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          onFocus={event => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          style={[styles.input, multiline && styles.multilineInput]}
          textAlignVertical={multiline ? 'top' : 'center'}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  optional: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  inputShell: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.backgroundSubtle,
  },
  multilineShell: {
    minHeight: 116,
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  focusedShell: {
    borderColor: ORANGE,
    backgroundColor: AppColors.white,
  },
  errorShell: {
    borderColor: AppColors.error,
  },
  icon: {
    marginRight: 12,
  },
  multilineIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  input: {
    flex: 1,
    minHeight: 54,
    paddingVertical: 0,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Regular',
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 88,
    paddingTop: 0,
  },
  errorText: {
    marginTop: 6,
    color: AppColors.error,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
});
