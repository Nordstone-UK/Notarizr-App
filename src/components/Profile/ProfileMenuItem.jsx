import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AppColors from '../../themes/AppColors';

const TONES = {
  orange: {icon: AppColors.primary, background: AppColors.primarySoft},
  blue: {icon: AppColors.info, background: AppColors.infoSoft},
  green: {icon: AppColors.success, background: AppColors.successSoft},
  gray: {icon: AppColors.textPrimary, background: AppColors.backgroundSubtle},
};

export default function ProfileMenuItem({
  icon,
  title,
  description,
  onPress,
  destructive = false,
  tone = 'orange',
}) {
  const palette = TONES[tone] || TONES.orange;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.72}
      onPress={onPress}
      style={styles.card}>
      <View
        style={[
          styles.iconBox,
          {backgroundColor: palette.background},
          destructive && styles.destructiveIconBox,
        ]}>
        <Feather
          name={icon}
          size={18}
          color={destructive ? AppColors.error : palette.icon}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, destructive && styles.destructiveTitle]}>
          {title}
        </Text>
        {description ? (
          <Text numberOfLines={2} style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.arrow, destructive && styles.destructiveArrow]}>
        <Feather
          name={destructive ? 'arrow-up-right' : 'chevron-right'}
          size={16}
          color={destructive ? AppColors.error : AppColors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  arrow: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  card: {
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 9,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  copy: {flex: 1, marginHorizontal: 12},
  description: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  destructiveArrow: {backgroundColor: AppColors.errorSoft},
  destructiveIconBox: {backgroundColor: AppColors.errorSoft},
  destructiveTitle: {color: AppColors.error},
  iconBox: {
    alignItems: 'center',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  title: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
});
