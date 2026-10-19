import React, {useMemo, useState} from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useMutation} from '@apollo/client';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {
  CREATE_CLIENT_IDENTITY_VERIFICATION_SESSION,
  REFRESH_CLIENT_IDENTITY_VERIFICATION,
} from '../../../request/mutations/clientVerification.mutation';
import {saveUserInfo} from '../../features/user/userSlice';
import AppColors from '../../themes/AppColors';
import {goBackOrNavigate} from '../../utils/navigationHelpers';

const statusCopy = verification => {
  if (verification?.status === 'verified') {
    return {
      icon: 'check-circle',
      color: AppColors.success,
      title: 'Verification completed',
      description: 'You can now book a notary.',
      action: 'Refresh status',
      tone: 'green',
    };
  }
  if (
    verification?.status === 'processing' ||
    verification?.status === 'submitted'
  ) {
    return {
      icon: 'clock',
      color: AppColors.warning,
      title: 'Verification pending',
      description:
        'Finish the secure identity check, then refresh your status here before booking.',
      action: 'Continue verification',
      tone: 'orange',
    };
  }
  if (verification?.status === 'failed') {
    return {
      icon: 'alert-circle',
      color: AppColors.error,
      title: 'Verification needs attention',
      description:
        verification?.failureReason ||
        'Restart the secure check with a clear ID and live selfie.',
      action: 'Restart verification',
      tone: 'red',
    };
  }
  return {
    icon: 'shield',
    color: AppColors.primary,
    title: 'Verification pending',
    description: 'Complete this once before booking a notary.',
    action: 'Start verification',
    tone: 'orange',
  };
};

const providerStatusLabel = verification => {
  if (!verification?.providerStatus) {
    return 'Not started';
  }
  return String(verification.providerStatus).replace(/_/g, ' ');
};

export default function ClientVerificationScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const [starting, setStarting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createVerificationSession] = useMutation(
    CREATE_CLIENT_IDENTITY_VERIFICATION_SESSION,
  );
  const [refreshVerification] = useMutation(
    REFRESH_CLIENT_IDENTITY_VERIFICATION,
  );
  const currentStatus = useMemo(
    () => statusCopy(user?.clientVerification),
    [user?.clientVerification],
  );
  const verification = user?.clientVerification;
  const hasSession = Boolean(verification?.providerReference);

  const saveVerificationUser = responseUser => {
    if (!responseUser) {
      return;
    }
    dispatch(
      saveUserInfo({
        ...user,
        clientVerification: responseUser.clientVerification,
      }),
    );
  };

  const openVerificationUrl = async url => {
    if (!url) {
      throw new Error('Verification link was not returned.');
    }
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      throw new Error('Verification link could not be opened.');
    }
    await Linking.openURL(url);
  };

  const startVerification = async () => {
    if (starting) {
      return;
    }

    setStarting(true);
    try {
      const {data} = await createVerificationSession();
      const response = data?.createClientIdentityVerificationSession;
      if (response?.status !== '200') {
        throw new Error(response?.message || 'Verification could not start.');
      }
      saveVerificationUser(response.user);
      await openVerificationUrl(response.verificationUrl);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification could not open',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setStarting(false);
    }
  };

  const refreshStatus = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    try {
      const {data} = await refreshVerification();
      const response = data?.refreshClientIdentityVerification;
      if (response?.status !== '200') {
        throw new Error(
          response?.message || 'Verification status unavailable.',
        );
      }
      saveVerificationUser(response.user);
      Toast.show({
        type:
          response.user?.clientVerification?.status === 'verified'
            ? 'success'
            : 'info',
        text1:
          response.user?.clientVerification?.status === 'verified'
            ? 'Verification completed'
            : 'Status refreshed',
        text2:
          response.user?.clientVerification?.status === 'verified'
            ? 'You can now book a notary.'
            : 'Complete the secure check if it is still pending.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Could not refresh status',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const primaryAction =
    hasSession && verification?.status !== 'failed'
      ? refreshStatus
      : startVerification;
  const primaryLabel =
    hasSession && verification?.status !== 'failed'
      ? refreshing
        ? 'Refreshing...'
        : currentStatus.action
      : starting
      ? 'Opening...'
      : currentStatus.action;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          activeOpacity={0.72}
          onPress={() => goBackOrNavigate(navigation, 'ProfileInfoScreen')}
          style={styles.headerButton}>
          <Feather name="arrow-left" size={22} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity verification</Text>
        <View style={styles.headerButtonPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View
            style={[styles.heroIcon, {backgroundColor: currentStatus.color}]}>
            <Feather
              name={currentStatus.icon}
              size={26}
              color={AppColors.white}
            />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>SECURE CHECK</Text>
            <Text style={styles.heroTitle}>{currentStatus.title}</Text>
            <Text style={styles.heroDescription}>
              {currentStatus.description}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.scanPreview}>
            <View style={styles.scanRing}>
              <View
                style={[
                  styles.scanCore,
                  currentStatus.tone === 'green' && styles.scanCoreVerified,
                ]}>
                <Feather
                  name={currentStatus.tone === 'green' ? 'check' : 'user-check'}
                  size={44}
                  color={
                    currentStatus.tone === 'green'
                      ? AppColors.success
                      : AppColors.primary
                  }
                />
              </View>
            </View>
          </View>
          <Text style={styles.sectionTitle}>ID and live selfie</Text>
          <Text style={styles.sectionDescription}>
            You will complete the document and live face check with our secure
            verification provider. Notarizr only saves the verification status.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Provider</Text>
            <Text style={styles.statusValue}>
              {verification?.provider === 'stripe_identity'
                ? 'Secure identity check'
                : 'Not started'}
            </Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.statusValue}>
              {providerStatusLabel(verification)}
            </Text>
          </View>
          {verification?.failureReason ? (
            <>
              <View style={styles.statusDivider} />
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Issue</Text>
                <Text style={[styles.statusValue, styles.statusError]}>
                  {verification.failureReason}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.note}>
          <Feather name="lock" size={17} color={AppColors.info} />
          <Text style={styles.noteText}>
            Your sensitive identity documents are handled by the verification
            provider. We use the verified status for future booking requests.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.76}
          disabled={starting || refreshing}
          onPress={primaryAction}
          style={[
            styles.submitButton,
            (starting || refreshing) && styles.submitButtonDisabled,
          ]}>
          <Text style={styles.submitText}>{primaryLabel}</Text>
          <Feather
            name={
              hasSession && verification?.status !== 'failed'
                ? 'refresh-cw'
                : 'arrow-right'
            }
            size={19}
            color={AppColors.white}
          />
        </TouchableOpacity>
        {hasSession && verification?.status !== 'failed' ? (
          <TouchableOpacity
            activeOpacity={0.76}
            disabled={starting}
            onPress={startVerification}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Open verification again</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: AppColors.background},
  header: {
    height: 72,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: AppColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.backgroundSubtle,
  },
  headerButtonPlaceholder: {width: 42, height: 42},
  headerTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  content: {padding: 16, paddingBottom: 150},
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#121826',
  },
  heroIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  heroCopy: {flex: 1, marginLeft: 14},
  heroEyebrow: {
    color: '#FFB184',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  heroTitle: {
    marginTop: 3,
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 21,
  },
  heroDescription: {
    marginTop: 4,
    color: '#B7BECA',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    alignItems: 'center',
    marginTop: 14,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
  },
  scanPreview: {
    width: 210,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  scanRing: {
    width: 196,
    height: 196,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 98,
    borderWidth: 8,
    borderColor: '#D7DEE8',
    backgroundColor: '#F8FAFC',
  },
  scanCore: {
    width: 148,
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 74,
    backgroundColor: AppColors.primarySoft,
  },
  scanCoreVerified: {
    backgroundColor: AppColors.successSoft,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  sectionDescription: {
    marginTop: 8,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  statusCard: {
    marginTop: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
    overflow: 'hidden',
  },
  statusRow: {
    minHeight: 66,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusLabel: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  statusValue: {
    marginTop: 4,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  statusError: {
    color: AppColors.error,
    textTransform: 'none',
  },
  statusDivider: {
    height: 1,
    backgroundColor: AppColors.border,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 14,
    borderRadius: 8,
    backgroundColor: AppColors.infoSoft,
  },
  noteText: {
    flex: 1,
    marginLeft: 10,
    color: AppColors.info,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    backgroundColor: AppColors.surface,
  },
  submitButton: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: '#FDB28A',
  },
  submitText: {
    marginRight: 9,
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  secondaryButton: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryText: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
});
