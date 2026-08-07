import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';

const VARIANTS = {
  primary: {
    background: BookingColors.primary,
    border: BookingColors.primary,
    foreground: BookingColors.white,
    pressed: BookingColors.primaryPressed,
  },
  secondary: {
    background: BookingColors.surface,
    border: BookingColors.borderStrong,
    foreground: BookingColors.textPrimary,
    pressed: BookingColors.backgroundSubtle,
  },
  danger: {
    background: BookingColors.surface,
    border: BookingColors.errorSoft,
    foreground: BookingColors.error,
    pressed: BookingColors.errorSoft,
  },
};

export default function BookingActionButton({
  disabled = false,
  icon,
  label,
  loading = false,
  onPress,
  style,
  variant = 'primary',
}) {
  const palette = VARIANTS[variant] || VARIANTS.primary;
  const unavailable = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={unavailable}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        {
          backgroundColor: pressed ? palette.pressed : palette.background,
          borderColor: palette.border,
        },
        unavailable && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.foreground} size="small" />
      ) : (
        <>
          <Text
            style={[
              styles.label,
              {color: palette.foreground},
              icon && styles.labelWithIcon,
            ]}>
            {label}
          </Text>
          {icon ? (
            <Feather name={icon} size={17} color={palette.foreground} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  disabled: {opacity: 0.58},
  label: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  labelWithIcon: {marginRight: 8},
});
