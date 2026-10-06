import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
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

const PAYOUT_PROVIDERS = {
  stripe: {
    brandTitle: 'Stripe payouts',
    brandText: 'Receive client payments securely to your bank account.',
    button: 'Connect Stripe account',
    icon: 'credit-card',
    incompleteButton: 'Continue Stripe setup',
    manageButton: 'Manage Stripe account',
    name: 'Stripe',
    notice: 'Connect Stripe to get paid for completed sessions.',
    security:
      'Your financial details are entered directly with Stripe and are not stored by Notarizr. After Stripe finishes, return here and refresh your status.',
    statusDescription:
      'You cannot receive payouts until Stripe is connected and verified. Any completed earnings will stay pending.',
    successDescription:
      'Your Stripe account is ready to receive Notarizr payouts.',
    requirements: [
      'Government-issued identification',
      'Bank account details for deposits',
      'Basic business or individual tax information',
    ],
  },
  paypal: {
    brandTitle: 'PayPal payouts',
    brandText: 'Receive client payments through your PayPal business account.',
    button: 'Connect PayPal account',
    icon: 'send',
    incompleteButton: 'Continue PayPal setup',
    manageButton: 'Manage PayPal account',
    name: 'PayPal',
    notice: 'Connect PayPal to get paid for completed sessions.',
    security:
      'Your PayPal details are entered directly with PayPal and are not stored by Notarizr. Use the same business email you want for payouts.',
    statusDescription:
      'You cannot receive payouts until PayPal is connected and verified. Any completed earnings will stay pending.',
    successDescription:
      'Your PayPal account is ready to receive Notarizr payouts.',
    requirements: [
      'PayPal business account',
      'Confirmed PayPal email address',
      'Bank account or debit card for withdrawals',
    ],
  },
};

export default function PaymentUpdateScreen({navigation}) {
  const {handleStripeCreation, handleOnboardingLink, checkUserStipeAccount} =
    useStripeApi();
  const checkStripeRef = useRef(checkUserStipeAccount);
  const returningFromStripeRef = useRef(false);
  const [selectedProvider, setSelectedProvider] = useState('stripe');
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
      setStripeStatus(null);
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

  useFocusEffect(
    useCallback(() => {
      loadStripeStatus();
    }, [loadStripeStatus]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && returningFromStripeRef.current) {
        returningFromStripeRef.current = false;
        loadStripeStatus();
      }
    });

    return () => subscription.remove();
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
      const supported = await Linking.canOpenURL(link);
      if (!supported) {
        throw new Error('Stripe link unsupported');
      }
      returningFromStripeRef.current = true;
      await Linking.openURL(link);
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

  const openPayPal = async () => {
    setActionLoading(true);
    try {
      const link = 'https://www.paypal.com/business';
      const supported = await Linking.canOpenURL(link);
      if (!supported) {
        throw new Error('PayPal link unsupported');
      }
      await Linking.openURL(link);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'PayPal setup could not open',
        text2: 'Please try again in a moment.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openSelectedProvider = () => {
    if (selectedProvider === 'paypal') {
      openPayPal();
      return;
    }
    openStripe();
  };

  const connected =
    selectedProvider === 'stripe' &&
    stripeStatus?.has_stripe_account &&
    stripeStatus?.has_details_submitted;
  const started =
    selectedProvider === 'stripe' &&
    stripeStatus?.has_stripe_account &&
    !connected;
  const provider = PAYOUT_PROVIDERS[selectedProvider];
  const checkingStatus = selectedProvider === 'stripe' && statusLoading;

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
        <View style={styles.providerPicker}>
          {Object.entries(PAYOUT_PROVIDERS).map(([key, item]) => {
            const selected = selectedProvider === key;
            return (
              <TouchableOpacity
                activeOpacity={0.82}
                key={key}
                onPress={() => setSelectedProvider(key)}
                style={[
                  styles.providerOption,
                  key === 'stripe' && styles.providerOptionFirst,
                  selected && styles.providerOptionSelected,
                ]}>
                <View
                  style={[
                    styles.providerOptionIcon,
                    selected && styles.providerOptionIconSelected,
                  ]}>
                  <Feather
                    name={item.icon}
                    size={17}
                    color={selected ? AppColors.primary : AppColors.textMuted}
                  />
                </View>
                <View style={styles.providerOptionCopy}>
                  <Text
                    style={[
                      styles.providerOptionTitle,
                      selected && styles.providerOptionTitleSelected,
                    ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.providerOptionText}>
                    {key === 'stripe' ? 'Bank payouts' : 'PayPal payouts'}
                  </Text>
                </View>
                {selected ? (
                  <Feather
                    name="check-circle"
                    size={18}
                    color={AppColors.primary}
                  />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.stripeBrand}>
          <View style={styles.stripeIcon}>
            <Feather name={provider.icon} size={23} color={AppColors.primary} />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandTitle}>{provider.brandTitle}</Text>
            <Text style={styles.brandText}>{provider.brandText}</Text>
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
              {checkingStatus ? (
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
                {checkingStatus
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
              ? provider.successDescription
              : provider.statusDescription}
          </Text>
          {!connected ? (
            <View style={styles.blockedPayoutNotice}>
              <Feather name="alert-circle" size={16} color="#C44242" />
              <Text style={styles.blockedPayoutText}>{provider.notice}</Text>
            </View>
          ) : null}
          {selectedProvider === 'stripe' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={statusLoading}
              onPress={loadStripeStatus}
              style={styles.refreshButton}>
              <Feather name="refresh-cw" size={14} color={AppColors.primary} />
              <Text style={styles.refreshText}>Refresh Stripe status</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>What you will need</Text>
          {provider.requirements.map(item => (
            <Requirement key={item}>{item}</Requirement>
          ))}
        </View>

        <View style={styles.securityNote}>
          <Feather name="shield" size={18} color={AppColors.info} />
          <Text style={styles.securityText}>{provider.security}</Text>
        </View>

        <AuthPrimaryButton
          icon="arrow-right"
          loading={actionLoading}
          onPress={openSelectedProvider}
          style={styles.primaryButton}
          title={
            connected
              ? provider.manageButton
              : started
              ? provider.incompleteButton
              : provider.button
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
  providerPicker: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  providerOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 74,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.white,
  },
  providerOptionFirst: {marginRight: 10},
  providerOptionSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primarySoft,
  },
  providerOptionIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.background,
  },
  providerOptionIconSelected: {backgroundColor: AppColors.white},
  providerOptionCopy: {flex: 1, minWidth: 0, marginLeft: 9},
  providerOptionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  providerOptionTitleSelected: {color: AppColors.primary},
  providerOptionText: {
    marginTop: 2,
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
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
  blockedPayoutNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3D1D1',
    borderRadius: 8,
    backgroundColor: '#FFF1F1',
  },
  blockedPayoutText: {
    flex: 1,
    marginLeft: 9,
    color: '#C44242',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    lineHeight: 15,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  refreshText: {
    marginLeft: 7,
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
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
});
