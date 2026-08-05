import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function BookingChoice({
  icon,
  label,
  onPress,
  selected,
  subtitle,
}) {
  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{checked: selected}}
      activeOpacity={0.72}
      onPress={onPress}
      style={[styles.container, selected && styles.selectedContainer]}>
      <View style={[styles.iconBox, selected && styles.selectedIconBox]}>
        <Feather
          name={icon}
          size={17}
          color={selected ? '#FD6D1F' : '#7E8590'}
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
    </TouchableOpacity>
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
    borderColor: '#E1E4E8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedContainer: {
    borderColor: '#FD6D1F',
    backgroundColor: '#FFF9F5',
  },
  iconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F0F2F4',
  },
  selectedIconBox: {
    backgroundColor: '#FFF0E7',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  label: {
    color: '#2A303C',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
  },
  selectedLabel: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
  },
  subtitle: {
    marginTop: 2,
    color: '#858C97',
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
    borderColor: '#BCC1C8',
    borderRadius: 9,
  },
  selectedRadio: {
    borderColor: '#FD6D1F',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FD6D1F',
  },
});
