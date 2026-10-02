import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMutation} from '@apollo/client';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import LogoutConfirmModal from '../../components/Profile/LogoutConfirmModal';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileMenuItem from '../../components/Profile/ProfileMenuItem';
import ProfileSection from '../../components/Profile/ProfileSection';
import {saveUserInfo} from '../../features/user/userSlice';
import useFetchUser from '../../hooks/useFetchUser';
import AppColors from '../../themes/AppColors';
import {socket} from '../../utils/Socket';
import {agentPlanLabel} from '../../utils/agentPlan';
import {DELETE_ACCOUNT} from '../../../request/mutations/deleteAccount.mutation';
import {UPDATE_ACCOUNT_TYPE} from '../../../request/mutations/updateAccountType.mutation';

const SERVICE_SETTINGS_KEY = 'notarizr_client_service_settings';
const DEFAULT_SERVICE_SETTINGS = {
  deviceCheck: true,
  identityReminders: true,
  printByDefault: false,
  savedAddress: true,
};

const getAccountLabel = (accountType: string) =>
  accountType === 'client' ? 'Client' : 'Notary';

const getRegisteredNotaryType = (user: any) => {
  const registeredFor = Array.isArray(user?.registered_for)
    ? user.registered_for
    : [];

  return (
    registeredFor.find((type: string) =>
      ['individual-agent', 'company-agent'].includes(type),
    ) || 'individual-agent'
  );
};

function PreferenceRow({description, icon, last, onChange, title, value}: any) {
  return (
    <View style={[styles.preferenceRow, last && styles.lastPreferenceRow]}>
      <View style={styles.preferenceIcon}>
        <Feather name={icon} size={17} color={AppColors.primary} />
      </View>
      <View style={styles.preferenceCopy}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={`${title} toggle`}
        onValueChange={onChange}
        trackColor={{false: AppColors.borderStrong, true: '#BCE8CF'}}
        thumbColor={value ? AppColors.success : AppColors.white}
        value={value}
        style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}
      />
    </View>
  );
}

export default function ProfileInfoScreen({navigation}: any) {
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();
  const {fetchUserInfo} = useFetchUser();
  const fetchUserInfoRef = useRef(fetchUserInfo);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [accountType, setAccountType] = useState(
    user?.account_type || 'client',
  );
  const [updatingRole, setUpdatingRole] = useState(false);
  const [serviceSettings, setServiceSettings] = useState(
    DEFAULT_SERVICE_SETTINGS,
  );
  const [updateAccountType] = useMutation(UPDATE_ACCOUNT_TYPE);
  const [deleteAccount] = useMutation(DELETE_ACCOUNT);
  const userId = user?._id;
  const previewMode = Boolean(user?.isHomePreview);
  const currentAgentPlan = agentPlanLabel(user);

  fetchUserInfoRef.current = fetchUserInfo;

  useFocusEffect(
    useCallback(() => {
      if (!userId || previewMode) {
        return;
      }

      fetchUserInfoRef.current().catch((error: unknown) => {
        console.error('Profile refresh failed:', error);
      });
    }, [previewMode, userId]),
  );

  useEffect(() => {
    AsyncStorage.getItem(SERVICE_SETTINGS_KEY)
      .then(value => {
        if (value) {
          setServiceSettings(current => ({...current, ...JSON.parse(value)}));
        }
      })
      .catch(error => console.warn('Service settings could not load:', error));
  }, []);

  useEffect(() => {
    if (user?.account_type) {
      setAccountType(user.account_type);
    }
  }, [user?.account_type]);

  const openProfile = (profileEdit = false) => {
    navigation.navigate('ProfileDetailEditScreen', {profileEdit});
  };

  const updateServiceSetting = (key: string, value: boolean) => {
    setServiceSettings(current => {
      const next = {...current, [key]: value};
      AsyncStorage.setItem(SERVICE_SETTINGS_KEY, JSON.stringify(next)).catch(
        error => console.warn('Service settings could not save:', error),
      );
      return next;
    });
  };

  const finishAccountSwitch = (newAccountType: string) => {
    const currentRegisteredFor = Array.isArray(user?.registered_for)
      ? user.registered_for
      : [];
    const registeredFor = Array.from(
      new Set([...currentRegisteredFor, newAccountType]),
    );

    setAccountType(newAccountType);
    dispatch(
      saveUserInfo({
        ...user,
        account_type: newAccountType,
        registered_for: registeredFor,
      }),
    );
  };

  const handleAccountTypeUpdate = async (newAccountType: string) => {
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

  const confirmAccountSwitch = (newAccountType: string) => {
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

  const selectAccountType = (newAccountType: string) => {
    if (updatingRole || accountType === newAccountType) {
      return;
    }

    const registeredFor = Array.isArray(user?.registered_for)
      ? user.registered_for
      : [];

    if (
      newAccountType === 'individual-agent' &&
      !user?.isHomePreview &&
      !registeredFor.includes(newAccountType)
    ) {
      navigation.navigate('AgentVerificationScreen', {
        user,
        onComplete: () => handleAccountTypeUpdate(newAccountType),
      });
      return;
    }

    confirmAccountSwitch(newAccountType);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Token removal failed:', error);
    }

    socket.disconnect();
    dispatch(saveUserInfo(null));
    setLogoutLoading(false);
    setLogoutVisible(false);
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

      await handleLogout();
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

  const isClient = accountType === 'client';
  const notaryAccountType = getRegisteredNotaryType(user);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#202632" />
      <ProfileHeader user={user} onDetails={() => openProfile(false)} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <ProfileSection title="Account">
          <ProfileMenuItem
            icon="navigation"
            title="Saved addresses"
            description="Service and billing locations"
            onPress={() => navigation.navigate('AddressDetails')}
          />
          <ProfileMenuItem
            icon={isClient ? 'credit-card' : 'dollar-sign'}
            title="Payment method"
            description={
              isClient
                ? 'Cards and billing details'
                : 'Payout and payment details'
            }
            tone="green"
            onPress={() =>
              navigation.navigate(
                isClient ? 'AddCardScreen' : 'PaymentUpdateScreen',
              )
            }
          />
        </ProfileSection>

        <ProfileSection title="Account mode">
          <View style={styles.modeSection}>
            <View style={styles.modeHeading}>
              <View style={styles.modeIcon}>
                <Feather name="repeat" size={18} color={AppColors.primary} />
              </View>
              <View style={styles.modeCopy}>
                <Text style={styles.modeTitle}>
                  How are you using Notarizr?
                </Text>
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
                disabled={updatingRole || isClient}
                onPress={() => selectAccountType('client')}
                style={[styles.segment, isClient && styles.activeSegment]}>
                <Feather
                  name="user-check"
                  size={16}
                  color={isClient ? AppColors.primary : AppColors.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentLabel,
                    isClient && styles.activeSegmentLabel,
                  ]}>
                  Client
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.72}
                disabled={updatingRole || !isClient}
                onPress={() => selectAccountType(notaryAccountType)}
                style={[styles.segment, !isClient && styles.activeSegment]}>
                <Feather
                  name="briefcase"
                  size={16}
                  color={
                    !isClient ? AppColors.primary : AppColors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.segmentLabel,
                    !isClient && styles.activeSegmentLabel,
                  ]}>
                  {updatingRole ? 'Switching...' : 'Notary'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ProfileSection>

        {isClient ? (
          <>
            <ProfileSection title="Mobile notary defaults">
              <View style={styles.preferenceCard}>
                <PreferenceRow
                  description="Preselect your primary saved location"
                  icon="map-pin"
                  onChange={(value: boolean) =>
                    updateServiceSetting('savedAddress', value)
                  }
                  title="Use saved address"
                  value={serviceSettings.savedAddress}
                />
                <PreferenceRow
                  description="Ask for one printed copy on new bookings"
                  icon="printer"
                  last
                  onChange={(value: boolean) =>
                    updateServiceSetting('printByDefault', value)
                  }
                  title="Printed copy by default"
                  value={serviceSettings.printByDefault}
                />
              </View>
            </ProfileSection>

            <ProfileSection title="RON readiness">
              <View style={styles.preferenceCard}>
                <PreferenceRow
                  description="Check camera and microphone before joining"
                  icon="video"
                  onChange={(value: boolean) =>
                    updateServiceSetting('deviceCheck', value)
                  }
                  title="Device check"
                  value={serviceSettings.deviceCheck}
                />
                <PreferenceRow
                  description="Remind you to prepare an accepted photo ID"
                  icon="shield"
                  last
                  onChange={(value: boolean) =>
                    updateServiceSetting('identityReminders', value)
                  }
                  title="Identity reminders"
                  value={serviceSettings.identityReminders}
                />
              </View>
            </ProfileSection>
          </>
        ) : (
          <>
            <ProfileSection title="Notary management">
              <ProfileMenuItem
                icon="grid"
                title="Manage"
                description="Digital signature, eSeal, digital certificate, forms and Pro tools"
                tone="blue"
                onPress={() => navigation.navigate('AgentManageScreen')}
              />
            </ProfileSection>

            <ProfileSection title="Pricing and plan">
              <ProfileMenuItem
                icon="star"
                title="Subscription"
                description={`${currentAgentPlan} · Manage agent plan access`}
                onPress={() => navigation.navigate('SubscriptionScreen')}
              />
            </ProfileSection>
          </>
        )}

        {!isClient && (
          <ProfileSection title="Notary profile">
            <ProfileMenuItem
              icon="edit-3"
              title="Stamp and Signature"
              description="Saved signatures and PNG stamps"
              tone="green"
              onPress={() => navigation.navigate('StampAndSignatureScreen')}
            />
            <ProfileMenuItem
              icon="shield"
              title="Credentials and stamp"
              description="Certificate and notary stamp"
              tone="blue"
              onPress={() =>
                navigation.navigate('AgentVerificationScreen', {user})
              }
            />
          </ProfileSection>
        )}

        <ProfileSection title="Support and legal">
          <ProfileMenuItem
            icon="life-buoy"
            title="Help and FAQ"
            description="Answers to common questions"
            tone="blue"
            onPress={() => navigation.navigate('FaqScreen')}
          />
          <ProfileMenuItem
            icon="lock"
            title="Privacy policy"
            description="How your information is protected"
            tone="green"
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}
          />
          <ProfileMenuItem
            icon="book-open"
            title="Terms and conditions"
            description="Terms for using Notarizr"
            last
            tone="gray"
            onPress={() => navigation.navigate('TermsAndCondition')}
          />
        </ProfileSection>

        <ProfileSection title="Account management">
          <ProfileMenuItem
            destructive
            icon="user-x"
            title="Delete account"
            description="Permanently remove your Notarizr account"
            onPress={handleDeleteAccount}
          />
        </ProfileSection>

        <ProfileSection title="Session">
          <ProfileMenuItem
            destructive
            icon="power"
            title="Log out"
            description="Sign out of this device"
            last
            onPress={() => setLogoutVisible(true)}
          />
        </ProfileSection>

        <Text style={styles.version}>NOTARIZR • ACCOUNT CENTER</Text>
      </ScrollView>

      <LogoutConfirmModal
        visible={logoutVisible}
        loading={logoutLoading}
        onCancel={() => setLogoutVisible(false)}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activeSegment: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderWidth: 1,
    elevation: 1,
    shadowColor: AppColors.textPrimary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  activeSegmentLabel: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.textPrimary,
  },
  content: {
    paddingBottom: 30,
    backgroundColor: AppColors.background,
  },
  lastPreferenceRow: {borderBottomWidth: 0},
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
  liveText: {
    color: AppColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 8,
  },
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
    padding: 14,
  },
  modeTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  preferenceCard: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  preferenceCopy: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
    minWidth: 0,
  },
  preferenceDescription: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },
  preferenceIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  preferenceRow: {
    alignItems: 'center',
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  preferenceTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  scrollView: {
    flex: 1,
    backgroundColor: AppColors.background,
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
  version: {
    letterSpacing: 0.7,
    marginTop: 20,
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    textAlign: 'center',
  },
});
