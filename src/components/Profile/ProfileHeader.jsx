import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AppColors from '../../themes/AppColors';

const formatAccountType = accountType =>
  accountType === 'client' ? 'Client account' : 'Notary professional';

export default function ProfileHeader({user, onDetails, onEdit, onSettings}) {
  const [imageFailed, setImageFailed] = useState(false);
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(' ');
  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map(value => value.trim().charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const showImage = Boolean(user?.profile_picture) && !imageFailed;

  useEffect(() => setImageFailed(false), [user?.profile_picture]);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.glowLarge} />
        <View style={styles.glowSmall} />
        <View style={styles.toolbar}>
          <View>
            <Text style={styles.eyebrow}>MY NOTARIZR</Text>
            <Text style={styles.pageTitle}>Account</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Account settings"
            activeOpacity={0.75}
            onPress={onSettings}
            style={styles.settingsButton}>
            <Feather name="sliders" size={19} color={AppColors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.identityRow}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              {showImage ? (
                <Image
                  onError={() => setImageFailed(true)}
                  source={{uri: user.profile_picture}}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarInitials}>{initials || 'N'}</Text>
              )}
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.identityCopy}>
            <Text numberOfLines={1} style={styles.name}>
              {fullName || 'Notarizr member'}
            </Text>
            <Text numberOfLines={1} style={styles.email}>
              {user?.email || user?.phone_number || 'Account profile'}
            </Text>
            <View style={styles.accountType}>
              <Feather name="check" size={11} color={AppColors.white} />
              <Text style={styles.accountTypeText}>
                {formatAccountType(user?.account_type)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionCard}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.76}
          onPress={onEdit}
          style={styles.action}>
          <View style={styles.primaryIcon}>
            <Feather name="edit-3" size={17} color={AppColors.white} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>Edit profile</Text>
            <Text style={styles.actionText}>Update your information</Text>
          </View>
          <Feather
            name="arrow-up-right"
            size={17}
            color={AppColors.textMuted}
          />
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.76}
          onPress={onDetails}
          style={styles.action}>
          <View style={styles.secondaryIcon}>
            <Feather
              name="user-check"
              size={17}
              color={AppColors.textPrimary}
            />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>Personal details</Text>
            <Text style={styles.actionText}>View account information</Text>
          </View>
          <Feather name="chevron-right" size={18} color={AppColors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  accountType: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  accountTypeText: {
    color: AppColors.white,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    marginLeft: 5,
  },
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: 14,
  },
  actionCard: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: -20,
    shadowColor: AppColors.black,
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  actionCopy: {flex: 1, marginHorizontal: 12},
  actionDivider: {backgroundColor: AppColors.border, height: 1, marginLeft: 58},
  actionText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    marginTop: 2,
  },
  actionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 37,
    height: 74,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 74,
  },
  avatarImage: {height: '100%', width: '100%'},
  avatarInitials: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
  },
  avatarRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 43,
    height: 86,
    justifyContent: 'center',
    width: 86,
  },
  container: {backgroundColor: AppColors.background, paddingBottom: 2},
  email: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 3,
    maxWidth: '96%',
  },
  eyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 1.2,
  },
  glowLarge: {
    backgroundColor: 'rgba(253,109,31,0.13)',
    borderRadius: 100,
    height: 200,
    position: 'absolute',
    right: -70,
    top: -80,
    width: 200,
  },
  glowSmall: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 55,
    bottom: -42,
    height: 110,
    left: -35,
    position: 'absolute',
    width: 110,
  },
  hero: {
    backgroundColor: AppColors.textPrimary,
    overflow: 'hidden',
    paddingBottom: 46,
    paddingHorizontal: 20,
  },
  identityCopy: {flex: 1, marginLeft: 15},
  identityRow: {alignItems: 'center', flexDirection: 'row', marginTop: 22},
  name: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
    maxWidth: '96%',
  },
  onlineDot: {
    backgroundColor: AppColors.success,
    borderColor: AppColors.textPrimary,
    borderRadius: 7,
    borderWidth: 2,
    bottom: 4,
    height: 14,
    position: 'absolute',
    right: 3,
    width: 14,
  },
  pageTitle: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 25,
    marginTop: 1,
  },
  primaryIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  secondaryIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
  },
});
