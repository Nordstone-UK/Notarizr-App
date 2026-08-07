import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import WebView from 'react-native-webview';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import ProfileScreenHeader from '../../components/Profile/ProfileScreenHeader';
import useStripeApi from '../../hooks/useStripeApi';
import AppColors from '../../themes/AppColors';

const Requirement = ({children}) => (
  <View style={styles.requirement}>
    <View style={styles.checkIcon}>
      <Feather name="check" size={12} color={AppColors.success} />
    </View>
    <Text style={styles.requirementText}>{children}</Text>
  </View>
);

export default function PaymentUpdateScreen({navigation}) {
  const {handleStripeCreation, handleOnboardingLink, checkUserStipeAccount} =
    useStripeApi();
  const checkStripeRef = useRef(checkUserStipeAccount);
  const [onboardingLink, setOnboardingLink] = useState(null);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  checkStripeRef.current = checkUserStipeAccount;

  const loadStripeStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const response = await checkStripeRef.current();
      setStripeStatus(response?.isUserStripeOnboard || null);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Payout status unavailable',
        text2: 'Check your connection and try again.',
      });
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStripeStatus();
  }, [loadStripeStatus]);

  const openStripe = async () => {
    setActionLoading(true);
    try {
      const link = stripeStatus?.has_stripe_account
        ? await handleOnboardingLink()
        : await handleStripeCreation();
      if (!link) {
        throw new Error('Stripe link unavailable');
      }
      setOnboardingLink(link);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Stripe setup could not open',
        text2: 'Please try again in a moment.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const connected =
    stripeStatus?.has_stripe_account && stripeStatus?.has_details_submitted;
  const started = stripeStatus?.has_stripe_account && !connected;

  if (onboardingLink) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={AppColors.surface}
        />
        <ProfileScreenHeader
          actionLabel="Close"
          onAction={() => {
            setOnboardingLink(null);
            loadStripeStatus();
          }}
          onBack={() => setOnboardingLink(null)}
          title="Stripe setup"
        />
        <WebView
          renderLoading={() => (
            <View style={styles.webLoading}>
              <ActivityIndicator color={AppColors.info} />
              <Text style={styles.webLoadingText}>Opening Stripe...</Text>
            </View>
          )}
          source={{uri: onboardingLink}}
          startInLoadingState
          style={styles.webView}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Payout setup"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.stripeBrand}>
          <View style={styles.stripeIcon}>
            <Feather name="credit-card" size={23} color={AppColors.primary} />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandTitle}>Stripe payouts</Text>
            <Text style={styles.brandText}>
              Receive client payments securely to your bank account.
            </Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIcon,
                connected && styles.connectedIcon,
                started && styles.startedIcon,
              ]}>
              {statusLoading ? (
                <ActivityIndicator
                  color={AppColors.textSecondary}
                  size="small"
                />
              ) : (
                <Feather
                  name={connected ? 'check-circle' : started ? 'clock' : 'link'}
                  size={20}
                  color={
                    connected
                      ? AppColors.success
                      : started
                      ? AppColors.warning
                      : AppColors.primary
                  }
                />
              )}
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusLabel}>Account status</Text>
              <Text style={styles.statusTitle}>
                {statusLoading
                  ? 'Checking your account'
                  : connected
                  ? 'Payouts connected'
                  : started
                  ? 'Setup incomplete'
                  : 'Not connected'}
              </Text>
            </View>
          </View>
          <Text style={styles.statusDescription}>
            {connected
              ? 'Your Stripe account is ready to receive Notarizr payouts.'
              : 'Complete Stripe verification before accepting paid bookings.'}
          </Text>
        </View>

        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>What you will need</Text>
          <Requirement>Government-issued identification</Requirement>
          <Requirement>Bank account details for deposits</Requirement>
          <Requirement>
            Basic business or individual tax information
          </Requirement>
        </View>

        <View style={styles.securityNote}>
          <Feather name="shield" size={18} color={AppColors.info} />
          <Text style={styles.securityText}>
            Your financial details are entered directly with Stripe and are not
            stored by Notarizr.
          </Text>
        </View>

        <AuthPrimaryButton
          icon="arrow-right"
          loading={actionLoading}
          onPress={openStripe}
          style={styles.primaryButton}
          title={
            connected
              ? 'Manage Stripe account'
              : started
              ? 'Continue Stripe setup'
              : 'Set up payouts with Stripe'
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: AppColors.white},
  content: {
    padding: 20,
    paddingBottom: 34,
    backgroundColor: AppColors.background,
  },
  stripeBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.textPrimary,
    borderRadius: 8,
    backgroundColor: AppColors.textPrimary,
    overflow: 'hidden',
  },
  stripeIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  brandCopy: {flex: 1, minWidth: 0, marginLeft: 12},
  brandTitle: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  brandText: {
    marginTop: 3,
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  statusCard: {
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.white,
  },
  statusHeader: {flexDirection: 'row', alignItems: 'center'},
  statusIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  connectedIcon: {backgroundColor: AppColors.successSoft},
  startedIcon: {backgroundColor: AppColors.warningSoft},
  statusCopy: {flex: 1, marginLeft: 11},
  statusLabel: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  statusTitle: {
    marginTop: 2,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  statusDescription: {
    marginTop: 13,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 16,
  },
  requirementsSection: {marginTop: 24},
  sectionTitle: {
    marginBottom: 11,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  requirement: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  checkIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: AppColors.successSoft,
  },
  requirementText: {
    flex: 1,
    marginLeft: 10,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 26,
    padding: 14,
    borderRadius: 8,
    backgroundColor: AppColors.infoSoft,
  },
  securityText: {
    flex: 1,
    marginLeft: 10,
    color: AppColors.info,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  primaryButton: {marginTop: 24, borderRadius: 8},
  webView: {flex: 1},
  webLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.white,
  },
  webLoadingText: {
    marginTop: 9,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
});
