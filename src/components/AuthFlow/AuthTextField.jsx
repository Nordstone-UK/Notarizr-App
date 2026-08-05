import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ORANGE = '#FD6D1F';

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
            color={focused ? ORANGE : '#7A818D'}
            style={multiline ? styles.multilineIcon : styles.icon}
          />
        )}
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          multiline={multiline}
          placeholderTextColor="#A7ADB7"
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
    color: '#252B36',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  optional: {
    color: '#8A909B',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  inputShell: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
  },
  multilineShell: {
    minHeight: 116,
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  focusedShell: {
    borderColor: ORANGE,
    backgroundColor: '#FFFFFF',
  },
  errorShell: {
    borderColor: '#E5484D',
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
    color: '#121826',
    fontFamily: 'Manrope-Regular',
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 88,
    paddingTop: 0,
  },
  errorText: {
    marginTop: 6,
    color: '#D92D20',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
});
