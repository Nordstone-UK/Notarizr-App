import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AppColors from '../../themes/AppColors';

export default function AuthPrimaryButton({
  title,
  loading,
  disabled,
  icon,
  onPress,
  style,
}) {
  const inactive = loading || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        pressed && styles.pressedButton,
        inactive && styles.disabledButton,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={AppColors.white} />
      ) : (
        <>
          <Text style={[styles.title, icon && styles.titleWithIcon]}>
            {title}
          </Text>
          {icon && <Feather name={icon} size={20} color={AppColors.white} />}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    borderRadius: 8,
    backgroundColor: AppColors.primary,
  },
  pressedButton: {backgroundColor: AppColors.primaryPressed},
  disabledButton: {
    opacity: 0.7,
  },
  title: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  titleWithIcon: {
    marginRight: 10,
  },
});
