import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';

export default function BookingChoice({
  icon,
  label,
  onPress,
  selected,
  subtitle,
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{checked: selected}}
      onPress={onPress}
      style={({pressed}) => [
        styles.container,
        selected && styles.selectedContainer,
        pressed && styles.pressedContainer,
      ]}>
      <View style={[styles.iconBox, selected && styles.selectedIconBox]}>
        <Feather
          name={icon}
          size={17}
          color={selected ? BookingColors.primary : BookingColors.textSecondary}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, selected && styles.selectedLabel]}>
          {label}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.radio, selected && styles.selectedRadio]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  selectedContainer: {
    borderColor: BookingColors.primary,
    backgroundColor: BookingColors.primarySoft,
  },
  pressedContainer: {borderColor: BookingColors.primaryPressed},
  iconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  selectedIconBox: {
    backgroundColor: BookingColors.primarySoft,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  label: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
  },
  selectedLabel: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
  },
  subtitle: {
    marginTop: 2,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  radio: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: BookingColors.borderStrong,
    borderRadius: 9,
  },
  selectedRadio: {
    borderColor: BookingColors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BookingColors.primary,
  },
});
