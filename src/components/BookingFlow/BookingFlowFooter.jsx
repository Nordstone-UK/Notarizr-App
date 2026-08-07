import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';

export default function BookingFlowFooter({disabled, label, loading, onPress}) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        onPress={onPress}
        style={({pressed}) => [
          styles.button,
          pressed && styles.pressedButton,
          (disabled || loading) && styles.disabledButton,
        ]}>
        {loading ? (
          <ActivityIndicator color={BookingColors.white} size="small" />
        ) : (
          <>
            <Text style={styles.label}>{label}</Text>
            <Feather name="arrow-right" size={17} color={BookingColors.white} />
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  button: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primary,
  },
  pressedButton: {backgroundColor: BookingColors.primaryPressed},
  disabledButton: {
    backgroundColor: BookingColors.borderStrong,
  },
  label: {
    marginRight: 8,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
});
