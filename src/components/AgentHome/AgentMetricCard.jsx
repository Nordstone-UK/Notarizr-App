import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const TONES = {
  orange: {background: '#FFF0E7', foreground: '#D65322'},
  blue: {background: '#EAF4FB', foreground: '#2679AC'},
};

export default function AgentMetricCard({
  icon,
  label,
  onPress,
  tone = 'orange',
  value,
}) {
  const colors = TONES[tone] || TONES.orange;
  return (
    <TouchableOpacity
      activeOpacity={0.74}
      onPress={onPress}
      style={styles.card}>
      <View style={[styles.iconBox, {backgroundColor: colors.background}]}>
        <Feather name={icon} size={18} color={colors.foreground} />
      </View>
      <Text numberOfLines={1} style={styles.value}>
        {value}
      </Text>
      <View style={styles.labelRow}>
        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>
        <Feather name="chevron-right" size={15} color="#9AA0AA" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E8EC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  iconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  value: {
    marginTop: 14,
    color: '#151B27',
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
  },
  labelRow: {flexDirection: 'row', alignItems: 'center', marginTop: 3},
  label: {
    flex: 1,
    color: '#7C838E',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
});
