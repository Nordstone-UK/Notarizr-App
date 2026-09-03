import React, {useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

export default function AuthOtpInput({value = '', onChange, autoFocus = true}) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const digits = value.split('');
  const activeIndex = Math.min(value.length, 5);

  const handleChange = text => {
    onChange(text.replace(/\D/g, '').slice(0, 6));
  };

  return (
    <Pressable
      accessibilityLabel="Six digit verification code"
      accessibilityRole="none"
      onPress={() => inputRef.current?.focus()}
      style={styles.container}>
      <View pointerEvents="none" style={styles.fields}>
        {[0, 1, 2, 3, 4, 5].map(index => (
          <View
            key={index}
            style={[
              styles.field,
              focused && activeIndex === index && styles.highlightedField,
            ]}>
            <Text style={styles.digit}>{digits[index] || ''}</Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        autoComplete="sms-otp"
        autoFocus={autoFocus}
        caretHidden
        contextMenuHidden={false}
        keyboardType="number-pad"
        maxLength={6}
        onBlur={() => setFocused(false)}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        selectionColor="transparent"
        style={styles.nativeInput}
        textContentType="oneTimeCode"
        value={value}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 76,
  },
  digit: {
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
  },
  field: {
    width: 46,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE0E5',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  fields: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-between',
  },
  highlightedField: {
    borderColor: '#FD6D1F',
    backgroundColor: '#FFFFFF',
  },
  nativeInput: {
    bottom: 0,
    color: 'transparent',
    height: '100%',
    left: 0,
    opacity: 0.02,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
});
