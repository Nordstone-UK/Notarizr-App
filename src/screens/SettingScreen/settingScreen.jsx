import React, {useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMutation} from '@apollo/client';
import {ChatClient} from 'react-native-agora-chat';
import Feather from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import ProfileMenuItem from '../../components/Profile/ProfileMenuItem';
import ProfileSection from '../../components/Profile/ProfileSection';
import {saveUserInfo} from '../../features/user/userSlice';
import {goBackOrNavigate} from '../../utils/navigationHelpers';
import {DELETE_ACCOUNT} from '../../../request/mutations/deleteAccount.mutation';
import {UPDATE_ACCOUNT_TYPE} from '../../../request/mutations/updateAccountType.mutation';
import AppColors from '../../themes/AppColors';

const ORANGE = AppColors.primary;

const getAccountLabel = accountType =>
  accountType === 'client' ? 'Client' : 'Notary';

export default function SettingScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const [accountType, setAccountType] = useState(
    user?.account_type || 'client',
  );
  const [updatingRole, setUpdatingRole] = useState(false);
  const [updateAccountType] = useMutation(UPDATE_ACCOUNT_TYPE);
  const [deleteAccount] = useMutation(DELETE_ACCOUNT);

  const goBack = () =>
    goBackOrNavigate(navigation, 'HomeScreen', {
      screen: 'ProfileInfoScreen',
    });

  const finishAccountSwitch = newAccountType => {
    setAccountType(newAccountType);
    dispatch(saveUserInfo({...user, account_type: newAccountType}));
  };

  const handleAccountTypeUpdate = async newAccountType => {
    if (user?.isHomePreview) {
      finishAccountSwitch(newAccountType);
      return;
    }

    setUpdatingRole(true);
    try {
      const {data} = await updateAccountType({
        variables: {account_type: newAccountType},
      });

      if (data?.updateAccountType?.status !== '200') {
        throw new Error(data?.updateAccountType?.message);
      }

      finishAccountSwitch(newAccountType);
    } catch (error) {
      Alert.alert('Unable to switch account', 'Please try again in a moment.');
    } finally {
      setUpdatingRole(false);
    }
  };

  const confirmAccountSwitch = newAccountType => {
    const targetLabel = getAccountLabel(newAccountType);
    Alert.alert(
      `Switch to ${targetLabel}`,
      `Use Notarizr with your ${targetLabel.toLowerCase()} profile?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Switch',
          onPress: () => handleAccountTypeUpdate(newAccountType),
        },
      ],
    );
  };

  const toggleAccountType = () => {
    const newAccountType =
      accountType === 'client' ? 'individual-agent' : 'client';
    const registeredFor = Array.isArray(user?.registered_for)
      ? user.registered_for
      : [];

    if (
      newAccountType === 'individual-agent' &&
      !user?.isHomePreview &&
      !registeredFor.includes(newAccountType)
    ) {
      navigation.navigate('AgentVerificationScreen', {
        onComplete: () => handleAccountTypeUpdate(newAccountType),
      });
      return;
    }

    confirmAccountSwitch(newAccountType);
  };

  const clearAccountSession = async () => {
    await AsyncStorage.removeItem('token');
    dispatch(saveUserInfo(null));

    try {
      const chatClient = ChatClient.getInstance();
      if (chatClient?.isInitialized) {
        await chatClient.logout();
      }
    } catch (error) {
      console.error('Chat logout failed after account deletion:', error);
    }

    navigation.reset({
      index: 0,
      routes: [{name: 'LoginScreen'}],
    });
  };

  const deleteUserAccount = async () => {
    try {
      if (!user?.isHomePreview) {
        const {data} = await deleteAccount({
          variables: {userId: user?._id},
        });

        if (data?.deleteUserR?.status !== '200') {
          throw new Error('Delete account failed');
        }
      }

      await clearAccountSession();
    } catch (error) {
      Alert.alert(
        'Unable to delete account',
        'Your account was not deleted. Please try again later.',
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently removes your profile, bookings, and saved information. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: deleteUserAccount,
        },
      ],
    );
  };

  if (!user) {
    return null;
  }

  const isClientMode = accountType === 'client';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={AppColors.textPrimary}
      />

      <View style={styles.header}>
        <View style={styles.headerGlow} />
        <View style={styles.headerToolbar}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            activeOpacity={0.72}
            onPress={goBack}
            style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={AppColors.white} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>ACCOUNT CENTER</Text>
            <Text style={styles.title}>Settings</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.modeSection}>
          <View style={styles.modeHeading}>
            <View style={styles.modeIcon}>
              <Feather name="repeat" size={18} color={AppColors.primary} />
            </View>
            <View style={styles.modeCopy}>
              <Text style={styles.modeTitle}>How are you using Notarizr?</Text>
              <Text style={styles.modeDescription}>
                Switch experiences whenever you need.
              </Text>
            </View>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Active</Text>
            </View>
          </View>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              activeOpacity={0.72}
              disabled={updatingRole || isClientMode}
              onPress={toggleAccountType}
              style={[styles.segment, isClientMode && styles.activeSegment]}>
              <Feather
                name="user-check"
                size={16}
                color={isClientMode ? ORANGE : AppColors.textSecondary}
              />
              <Text
                style={[
                  styles.segmentLabel,
                  isClientMode && styles.activeSegmentLabel,
                ]}>
                Client
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.72}
              disabled={updatingRole || !isClientMode}
              onPress={toggleAccountType}
              style={[styles.segment, !isClientMode && styles.activeSegment]}>
              <Feather
                name="briefcase"
                size={16}
                color={!isClientMode ? ORANGE : AppColors.textSecondary}
              />
              <Text
                style={[
                  styles.segmentLabel,
                  !isClientMode && styles.activeSegmentLabel,
                ]}>
                {updatingRole ? 'Switching...' : 'Notary'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ProfileSection title="Privacy and legal">
          <ProfileMenuItem
            icon="shield"
            title="Privacy policy"
            description="How we collect and protect your information"
            tone="green"
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}
          />
          <ProfileMenuItem
            icon="book-open"
            title="Terms and conditions"
            description="Rules and terms for using Notarizr"
            last
            tone="gray"
            onPress={() => navigation.navigate('TermsAndCondition')}
          />
        </ProfileSection>

        <ProfileSection title="Help">
          <ProfileMenuItem
            icon="life-buoy"
            title="Help and FAQ"
            description="Find answers to common questions"
            last
            tone="blue"
            onPress={() => navigation.navigate('FaqScreen')}
          />
        </ProfileSection>

        <ProfileSection title="Account management">
          <ProfileMenuItem
            destructive
            icon="user-x"
            title="Delete account"
            description="Permanently remove your Notarizr account"
            last
            onPress={handleDeleteAccount}
          />
        </ProfileSection>

        <View style={styles.securityNote}>
          <View style={styles.securityIcon}>
            <Feather name="lock" size={16} color={AppColors.success} />
          </View>
          <View style={styles.securityCopy}>
            <Text style={styles.securityTitle}>Protected account</Text>
            <Text style={styles.securityText}>
              Sensitive changes may require additional verification.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activeSegment: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderWidth: 1,
    shadowColor: AppColors.textPrimary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  activeSegmentLabel: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  content: {
    backgroundColor: AppColors.background,
    flexGrow: 1,
    paddingBottom: 30,
  },
  eyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 1,
  },
  header: {
    backgroundColor: AppColors.textPrimary,
    overflow: 'hidden',
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerCopy: {alignItems: 'center', flex: 1, marginHorizontal: 10},
  headerGlow: {
    backgroundColor: 'rgba(253,109,31,0.15)',
    borderRadius: 70,
    height: 140,
    position: 'absolute',
    right: -35,
    top: -75,
    width: 140,
  },
  headerSpacer: {height: 40, width: 40},
  headerToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  liveDot: {
    backgroundColor: AppColors.success,
    borderRadius: 4,
    height: 7,
    marginRight: 5,
    width: 7,
  },
  livePill: {
    alignItems: 'center',
    backgroundColor: AppColors.successSoft,
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  liveText: {color: AppColors.success, fontFamily: 'Manrope-Bold', fontSize: 8},
  modeCopy: {flex: 1, marginHorizontal: 11},
  modeDescription: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    marginTop: 3,
  },
  modeHeading: {alignItems: 'center', flexDirection: 'row'},
  modeIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  modeSection: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
  },
  modeTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  safeArea: {backgroundColor: AppColors.textPrimary, flex: 1},
  securityCopy: {flex: 1, marginLeft: 11},
  securityIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.successSoft,
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  securityNote: {
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 13,
  },
  securityText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  securityTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  segmentedControl: {
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 8,
    flexDirection: 'row',
    height: 50,
    marginTop: 15,
    padding: 4,
  },
  segmentLabel: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    marginLeft: 7,
  },
  title: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    marginTop: 1,
  },
});
