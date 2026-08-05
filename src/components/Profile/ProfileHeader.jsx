import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ORANGE = '#FD6D1F';

const formatAccountType = accountType =>
  accountType === 'client' ? 'Client account' : 'Notary account';

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

  useEffect(() => {
    setImageFailed(false);
  }, [user?.profile_picture]);

  return (
    <View style={styles.container}>
      <View style={styles.brandBand}>
        <View style={styles.toolbar}>
          <View>
            <Text style={styles.eyebrow}>MY ACCOUNT</Text>
            <Text style={styles.pageTitle}>Profile</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Account settings"
            activeOpacity={0.72}
            onPress={onSettings}
            style={styles.settingsButton}>
            <Feather name="settings" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.identityPanel}>
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
        <Text numberOfLines={1} style={styles.name}>
          {fullName || 'Notarizr member'}
        </Text>
        <Text numberOfLines={1} style={styles.email}>
          {user?.email || user?.phone_number || 'Account profile'}
        </Text>

        <View style={styles.accountType}>
          <Feather name="check-circle" size={13} color="#14804A" />
          <Text style={styles.accountTypeText}>
            {formatAccountType(user?.account_type)}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.78}
            onPress={onEdit}
            style={styles.primaryAction}>
            <Feather name="edit-2" size={16} color="#FFFFFF" />
            <Text style={styles.primaryLabel}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.72}
            onPress={onDetails}
            style={styles.secondaryAction}>
            <Feather name="user" size={16} color="#343A45" />
            <Text style={styles.secondaryLabel}>View details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  brandBand: {
    height: 108,
    paddingHorizontal: 20,
    backgroundColor: ORANGE,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  pageTitle: {
    marginTop: 2,
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 26,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.46)',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  identityPanel: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 22,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 84,
    height: 84,
    marginTop: -40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 42,
    backgroundColor: '#EDEFF2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    color: '#D9531E',
    fontFamily: 'Manrope-Bold',
    fontSize: 25,
  },
  name: {
    maxWidth: '90%',
    marginTop: 11,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 21,
  },
  email: {
    maxWidth: '90%',
    marginTop: 2,
    color: '#777E8A',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
  },
  accountType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EAF8F0',
  },
  accountTypeText: {
    marginLeft: 5,
    color: '#116B3F',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 18,
  },
  primaryAction: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: ORANGE,
  },
  primaryLabel: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  secondaryAction: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8DBE1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  secondaryLabel: {
    marginLeft: 8,
    color: '#343A45',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
});
