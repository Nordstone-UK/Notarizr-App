import React, {useMemo, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import AuthProgressHeader from '../../components/AuthFlow/AuthProgressHeader';
import Colors from '../../themes/Colors';

const PLANS = {
  monthly: {
    label: 'Monthly',
    price: '$9.99',
    cadence: '/ month',
    billing: 'Billed monthly at $9.99',
  },
  yearly: {
    label: 'Yearly',
    price: '$8.99',
    cadence: '/ month',
    billing: '$107.89 billed yearly',
  },
};

const BENEFITS = [
  'Receive mobile notary and RON bookings',
  'Set your availability and service area',
  'Manage appointments in one place',
  'Secure document and session tools',
  'Dedicated agent support',
];

export default function AgentSubscriptionScreen({navigation}) {
  const [billingPeriod, setBillingPeriod] = useState('yearly');
  const plan = useMemo(() => PLANS[billingPeriod], [billingPeriod]);

  const openCheckout = () => {
    Alert.alert(
      'Checkout is not connected yet',
      'The plan selection is ready. Add the RevenueCat product identifiers and entitlement before enabling payment.',
    );
  };

  const restorePurchases = () => {
    Alert.alert(
      'Restore purchases',
      'RevenueCat restore will be connected with the subscription products.',
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <AuthProgressHeader
        title="Choose your plan"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>NOTARIZR FOR AGENTS</Text>
          <Text style={styles.heading}>Start growing your notary business</Text>
        </View>

        <View
          accessibilityRole="tablist"
          accessibilityLabel="Billing period"
          style={styles.toggle}>
          {Object.keys(PLANS).map(period => {
            const selected = billingPeriod === period;
            return (
              <TouchableOpacity
                key={period}
                accessibilityRole="tab"
                accessibilityState={{selected}}
                activeOpacity={0.82}
                onPress={() => setBillingPeriod(period)}
                style={[
                  styles.toggleOption,
                  selected && styles.toggleSelected,
                ]}>
                <Text
                  style={[
                    styles.toggleText,
                    selected && styles.toggleTextSelected,
                  ]}>
                  {PLANS[period].label}
                </Text>
                {period === 'yearly' && (
                  <View
                    style={[
                      styles.savePill,
                      selected && styles.savePillSelected,
                    ]}>
                    <Text
                      style={[
                        styles.saveText,
                        selected && styles.saveTextSelected,
                      ]}>
                      SAVE 10%
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.planCard}>
          <View style={styles.cardAccent} />
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>Notarizr Agent</Text>
            </View>
            {billingPeriod === 'yearly' && (
              <View style={styles.bestValuePill}>
                <Feather name="star" size={12} color={Colors.Orange} />
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{plan.price}</Text>
            <Text style={styles.cadence}>{plan.cadence}</Text>
          </View>
          <Text style={styles.billingText}>{plan.billing}</Text>

          <View style={styles.divider} />
          <Text style={styles.includedTitle}>
            Everything you need to succeed
          </Text>
          <View style={styles.benefitList}>
            {BENEFITS.map(benefit => (
              <View key={benefit} style={styles.benefitRow}>
                <View style={styles.checkCircle}>
                  <Feather name="check" size={13} color={Colors.white} />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        <AuthPrimaryButton
          title={`Continue with ${plan.label}`}
          icon="arrow-right"
          onPress={openCheckout}
          style={styles.subscribeButton}
        />

        <Text style={styles.renewalText}>
          Subscription renews automatically unless cancelled at least 24 hours
          before the end of the billing period.
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.7}
          onPress={restorePurchases}
          style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore purchases</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.white},
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: Colors.DisableButtonColor,
  },
  hero: {paddingHorizontal: 4, paddingTop: 2, paddingBottom: 12},
  eyebrow: {
    color: Colors.Orange,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  heading: {
    maxWidth: 340,
    marginTop: 4,
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
    lineHeight: 30,
  },
  toggle: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.DisableColor,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  toggleOption: {
    minHeight: 44,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  toggleSelected: {backgroundColor: Colors.TextColor},
  toggleText: {
    color: Colors.DullTextColor,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  toggleTextSelected: {color: Colors.white},
  savePill: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.PinkBackground,
  },
  savePillSelected: {backgroundColor: 'rgba(255,122,40,0.18)'},
  saveText: {
    color: Colors.Orange,
    fontFamily: 'Manrope-Bold',
    fontSize: 8,
  },
  saveTextSelected: {color: '#FFB27F'},
  planCard: {
    flex: 1,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#E3E6EA',
    borderRadius: 14,
    backgroundColor: Colors.white,
    shadowColor: Colors.Black,
    shadowOffset: {width: 0, height: 7},
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.Orange,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  planName: {
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  bestValuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.PinkBackground,
  },
  bestValueText: {
    marginLeft: 4,
    color: Colors.Orange,
    fontFamily: 'Manrope-Bold',
    fontSize: 8,
  },
  priceRow: {flexDirection: 'row', alignItems: 'flex-end', marginTop: 15},
  price: {
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    fontSize: 38,
    lineHeight: 43,
  },
  cadence: {
    marginLeft: 7,
    marginBottom: 7,
    color: Colors.DullTextColor,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  billingText: {
    marginTop: 3,
    color: Colors.Orange,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  divider: {height: 1, marginVertical: 13, backgroundColor: '#ECEEF1'},
  includedTitle: {
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  benefitList: {marginTop: 10},
  benefitRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  checkCircle: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    borderRadius: 11,
    backgroundColor: Colors.Orange,
  },
  benefitText: {
    flex: 1,
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  subscribeButton: {height: 52, marginTop: 12},
  renewalText: {
    marginTop: 7,
    paddingHorizontal: 8,
    color: Colors.DullTextColor,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  restoreButton: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  restoreText: {
    color: Colors.Orange,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
});
