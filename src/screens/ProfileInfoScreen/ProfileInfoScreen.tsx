import React, {useCallback, useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ChatClient} from 'react-native-agora-chat';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import LogoutConfirmModal from '../../components/Profile/LogoutConfirmModal';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileMenuItem from '../../components/Profile/ProfileMenuItem';
import ProfileSection from '../../components/Profile/ProfileSection';
import {saveUserInfo} from '../../features/user/userSlice';
import useFetchUser from '../../hooks/useFetchUser';
import AppColors from '../../themes/AppColors';

export default function ProfileInfoScreen({navigation}: any) {
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();
  const {fetchUserInfo} = useFetchUser();
  const fetchUserInfoRef = useRef(fetchUserInfo);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const userId = user?._id;
  const previewMode = Boolean(user?.isHomePreview);

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

  const openProfile = (profileEdit = false) => {
    navigation.navigate('ProfileDetailEditScreen', {profileEdit});
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Token removal failed:', error);
    }

    try {
      await ChatClient.getInstance().logout();
    } catch (error) {
      console.warn('Agora chat logout skipped:', error);
    } finally {
      dispatch(saveUserInfo(null));
      setLogoutLoading(false);
      setLogoutVisible(false);
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    }
  };

  if (!user) {
    return null;
  }

  const isClient = user.account_type === 'client';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#202632" />
      <ProfileHeader
        user={user}
        onDetails={() => openProfile(false)}
        onEdit={() => openProfile(true)}
        onSettings={() => navigation.navigate('SettingScreen')}
      />
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
            icon="sliders"
            title="Account settings"
            description="Account type, privacy and security"
            tone="gray"
            onPress={() => navigation.navigate('SettingScreen')}
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

        {!isClient && (
          <ProfileSection title="Notary profile">
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
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.textPrimary,
  },
  content: {
    paddingBottom: 30,
    backgroundColor: AppColors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: AppColors.background,
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
