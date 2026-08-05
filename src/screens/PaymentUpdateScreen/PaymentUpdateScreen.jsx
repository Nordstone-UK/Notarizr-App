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

const Requirement = ({children}) => (
  <View style={styles.requirement}>
    <View style={styles.checkIcon}>
      <Feather name="check" size={12} color="#168A52" />
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
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
              <ActivityIndicator color="#635BFF" />
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Payout setup"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.stripeBrand}>
          <View style={styles.stripeIcon}>
            <Feather name="credit-card" size={23} color="#635BFF" />
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
                <ActivityIndicator color="#7A818D" size="small" />
              ) : (
                <Feather
                  name={connected ? 'check-circle' : started ? 'clock' : 'link'}
                  size={20}
                  color={
                    connected ? '#168A52' : started ? '#A86900' : '#D65322'
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
          <Feather name="shield" size={18} color="#2878A9" />
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
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  content: {padding: 20, paddingBottom: 34, backgroundColor: '#F7F8FA'},
  stripeBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E5E9',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  stripeIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#EFEEFF',
  },
  brandCopy: {flex: 1, minWidth: 0, marginLeft: 12},
  brandTitle: {color: '#232936', fontFamily: 'Manrope-Bold', fontSize: 14},
  brandText: {
    marginTop: 3,
    color: '#7D8490',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  statusCard: {
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E5E9',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  statusHeader: {flexDirection: 'row', alignItems: 'center'},
  statusIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  connectedIcon: {backgroundColor: '#E8F6EE'},
  startedIcon: {backgroundColor: '#FFF5DC'},
  statusCopy: {flex: 1, marginLeft: 11},
  statusLabel: {color: '#9096A0', fontFamily: 'Manrope-Regular', fontSize: 9},
  statusTitle: {
    marginTop: 2,
    color: '#242B36',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  statusDescription: {
    marginTop: 13,
    color: '#757D89',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 16,
  },
  requirementsSection: {marginTop: 24},
  sectionTitle: {
    marginBottom: 11,
    color: '#2A303B',
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
    backgroundColor: '#E8F6EE',
  },
  requirementText: {
    flex: 1,
    marginLeft: 10,
    color: '#59616D',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 26,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#EAF4FB',
  },
  securityText: {
    flex: 1,
    marginLeft: 10,
    color: '#4C6678',
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
    backgroundColor: '#FFFFFF',
  },
  webLoadingText: {
    marginTop: 9,
    color: '#7D8490',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
});
