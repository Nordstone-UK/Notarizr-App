import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AppColors from '../../themes/AppColors';

const getIcon = label => {
  const value = String(label || '').toLowerCase();
  if (value.includes('work') || value.includes('office')) {
    return 'briefcase';
  }
  if (value.includes('home')) {
    return 'home';
  }
  return 'navigation';
};

export default function SavedAddressRow({address, onDelete, onEdit}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardAccent} />
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Feather
            name={getIcon(address.label)}
            size={19}
            color={AppColors.primary}
          />
        </View>
        <View style={styles.content}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{address.label || 'Saved address'}</Text>
            {address.primary && (
              <View style={styles.primaryPill}>
                <Feather name="check" size={9} color={AppColors.success} />
                <Text style={styles.primary}>Primary</Text>
              </View>
            )}
          </View>
          <Text numberOfLines={2} style={styles.location}>
            {address.location}
          </Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.72}
          onPress={onEdit}
          style={styles.action}>
          <Feather name="edit-3" size={14} color={AppColors.textPrimary} />
          <Text style={styles.actionText}>Edit details</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity
          activeOpacity={0.72}
          onPress={onDelete}
          style={styles.action}>
          <Feather name="trash" size={14} color={AppColors.error} />
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 42,
  },
  actionDivider: {backgroundColor: AppColors.border, height: 22, width: 1},
  actionText: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    marginLeft: 6,
  },
  actions: {flexDirection: 'row'},
  card: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardAccent: {backgroundColor: AppColors.primary, height: 3},
  content: {flex: 1, marginLeft: 13},
  deleteText: {
    color: AppColors.error,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    marginLeft: 6,
  },
  divider: {backgroundColor: AppColors.border, height: 1, marginHorizontal: 14},
  iconWrap: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  label: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  labelRow: {alignItems: 'center', flexDirection: 'row'},
  location: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  primary: {
    color: AppColors.success,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 8,
    marginLeft: 3,
  },
  primaryPill: {
    alignItems: 'center',
    backgroundColor: AppColors.successSoft,
    borderRadius: 5,
    flexDirection: 'row',
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  topRow: {alignItems: 'center', flexDirection: 'row', padding: 15},
});
