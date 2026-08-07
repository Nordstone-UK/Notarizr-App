import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import AuthTextField from '../../components/AuthFlow/AuthTextField';
import ProfileScreenHeader from '../../components/Profile/ProfileScreenHeader';
import AppColors from '../../themes/AppColors';

export default function PasswordEditScreen({navigation}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const updatePassword = () => {
    navigation.navigate('ProfileInfoScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Change password"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <View style={styles.heroIcon}>
              <Feather name="key" size={22} color={AppColors.primary} />
            </View>
            <Text style={styles.eyebrow}>ACCOUNT SECURITY</Text>
            <Text style={styles.title}>Create a stronger password</Text>
            <Text style={styles.description}>
              Use a password that is unique to your Notarizr account.
            </Text>
          </View>

          <View style={styles.formHeading}>
            <View style={styles.formHeadingIcon}>
              <Feather name="lock" size={17} color={AppColors.primary} />
            </View>
            <View style={styles.formHeadingCopy}>
              <Text style={styles.formTitle}>Password details</Text>
              <Text style={styles.formSubtitle}>
                Enter your current password before choosing a new one.
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <AuthTextField
              icon="shield"
              label="Current password"
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              secureTextEntry
              value={currentPassword}
            />
            <AuthTextField
              icon="key"
              label="New password"
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
              value={newPassword}
            />
            <View style={styles.requirement}>
              <Feather name="info" size={15} color={AppColors.textSecondary} />
              <Text style={styles.requirementText}>
                Use at least 8 characters with a mix of letters and numbers.
              </Text>
            </View>
            <AuthPrimaryButton
              disabled={!currentPassword || !newPassword}
              icon="arrow-right"
              onPress={updatePassword}
              style={styles.submitButton}
              title="Update password"
            />
          </View>

          <View style={styles.securityNote}>
            <View style={styles.securityIcon}>
              <Feather name="shield" size={16} color={AppColors.success} />
            </View>
            <Text style={styles.securityText}>
              Passwords are encrypted and never displayed in your profile.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: 34,
    backgroundColor: AppColors.background,
  },
  description: {
    marginTop: 6,
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 300,
  },
  eyebrow: {
    marginTop: 18,
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 0.9,
  },
  flex: {flex: 1},
  formCard: {
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  formHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 20,
  },
  formHeadingCopy: {flex: 1, marginLeft: 11},
  formHeadingIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  formSubtitle: {
    marginTop: 2,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  formTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  hero: {
    padding: 20,
    backgroundColor: AppColors.textPrimary,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -70,
    right: -35,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(253,109,31,0.14)',
  },
  heroIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    backgroundColor: AppColors.backgroundSubtle,
  },
  requirementText: {
    flex: 1,
    marginLeft: 8,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  safeArea: {flex: 1, backgroundColor: AppColors.surface},
  securityIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.successSoft,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  securityText: {
    flex: 1,
    marginLeft: 10,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  submitButton: {marginBottom: 14, marginTop: 16},
  title: {
    marginTop: 5,
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
    lineHeight: 29,
  },
});
