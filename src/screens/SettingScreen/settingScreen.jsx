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

const ORANGE = '#FD6D1F';

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={styles.headerToolbar}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            activeOpacity={0.72}
            onPress={goBack}
            style={styles.backButton}>
            <Feather name="arrow-left" size={21} color="#121826" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.modeSection}>
          <Text style={styles.modeTitle}>Account mode</Text>
          <Text style={styles.modeDescription}>
            Choose how you want to use Notarizr.
          </Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              activeOpacity={0.72}
              disabled={updatingRole || isClientMode}
              onPress={toggleAccountType}
              style={[styles.segment, isClientMode && styles.activeSegment]}>
              <Feather
                name="user"
                size={16}
                color={isClientMode ? ORANGE : '#7A818D'}
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
                name="award"
                size={16}
                color={!isClientMode ? ORANGE : '#7A818D'}
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
            icon="file-text"
            title="Terms and conditions"
            description="Rules and terms for using Notarizr"
            last
            tone="gray"
            onPress={() => navigation.navigate('TermsAndCondition')}
          />
        </ProfileSection>

        <ProfileSection title="Help">
          <ProfileMenuItem
            icon="help-circle"
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
            icon="trash-2"
            title="Delete account"
            description="Permanently remove your Notarizr account"
            last
            onPress={handleDeleteAccount}
          />
        </ProfileSection>

        <View style={styles.securityNote}>
          <Feather name="lock" size={14} color="#7A818D" />
          <Text style={styles.securityText}>
            Account changes are protected and may require verification.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  headerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  title: {
    flex: 1,
    marginHorizontal: 10,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  content: {
    flexGrow: 1,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  modeSection: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  modeTitle: {
    color: '#171C26',
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  modeDescription: {
    marginTop: 3,
    color: '#858B96',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  segmentedControl: {
    height: 48,
    flexDirection: 'row',
    marginTop: 14,
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#F1F3F5',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeSegment: {
    borderWidth: 1,
    borderColor: '#E3E5E9',
    backgroundColor: '#FFFFFF',
  },
  segmentLabel: {
    marginLeft: 7,
    color: '#707784',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  activeSegmentLabel: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
  },
  securityText: {
    flex: 1,
    marginLeft: 8,
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
  },
});
