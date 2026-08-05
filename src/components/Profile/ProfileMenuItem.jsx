import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ORANGE = '#FD6D1F';
const TONES = {
  orange: {icon: ORANGE, background: '#FFF0E7'},
  blue: {icon: '#2970B8', background: '#EAF3FC'},
  green: {icon: '#14804A', background: '#EAF8F0'},
  gray: {icon: '#626A77', background: '#EEF0F3'},
};

export default function ProfileMenuItem({
  icon,
  title,
  description,
  onPress,
  last = false,
  destructive = false,
  tone = 'orange',
}) {
  const palette = TONES[tone] || TONES.orange;
  const iconColor = destructive ? '#D64545' : palette.icon;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.68}
      onPress={onPress}
      style={[styles.row, !last && styles.divider]}>
      <View
        style={[
          styles.iconBox,
          {backgroundColor: palette.background},
          destructive && styles.destructiveIconBox,
        ]}>
        <Feather name={icon} size={19} color={iconColor} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, destructive && styles.destructiveTitle]}>
          {title}
        </Text>
        {description ? (
          <Text numberOfLines={1} style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
      <Feather
        name="chevron-right"
        size={20}
        color={destructive ? '#D64545' : '#A0A5AE'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    paddingRight: 20,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },
  iconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  destructiveIconBox: {
    backgroundColor: '#FFF0F0',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 13,
  },
  title: {
    color: '#202632',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
  },
  destructiveTitle: {
    color: '#C83C3C',
  },
  description: {
    marginTop: 2,
    color: '#848A95',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
});
