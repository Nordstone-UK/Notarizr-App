import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
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
import {useSelector} from 'react-redux';
import AppColors from '../../themes/AppColors';
import {agentPlanId, agentPlanLabel} from '../../utils/agentPlan';
import {
  findRevenueCatPackageForPlan,
  getActiveRevenueCatEntitlement,
  getRevenueCatCustomerInfo,
  getRevenueCatOfferings,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
} from '../../utils/revenueCat';

const PLANS = [
  {
    id: 'free',
    name: 'Free Agent',
    price: '$0',
    priceSuffix: '',
    purpose: 'Invited sessions at standard prices',
    features: [
      'Accept invited sessions at standard Notarizr pricing',
      'Platform collects from the client and pays you after completion',
      'Basic profile and booking tools',
      'Standard email support',
    ],
    current: true,
  },
  {
    id: 'pro_monthly',
    name: 'Agent Pro',
    price: '$19.99',
    priceSuffix: '/month',
    priceHint: '$19.99/mo',
    purpose: 'Open Calls, custom pricing, templates, branding and invoicing',
    features: [
      'Open Call bookings when your profile is approved and online',
      'Custom/private pricing for agent-invited sessions',
      'Branded invites, invoices and receipts',
      'Reusable session templates',
      'Priority support',
    ],
    badge: 'MOST POPULAR',
    cta: 'Upgrade to Pro',
  },
  {
    id: 'pro_annual',
    name: 'Agent Pro Annual',
    price: '$199.99',
    priceSuffix: '/year',
    priceHint: '$199.99/yr',
    purpose: 'Annual billing with savings versus monthly',
    features: [
      'Everything in Agent Pro',
      'Save $39.89 compared with monthly billing',
      'One upfront payment, locked-in rate for the year',
    ],
    badge: 'BEST VALUE',
    cta: 'Switch to annual',
  },
];

function FeatureRow({last, text}) {
  return (
    <View style={[styles.featureRow, last && styles.lastFeatureRow]}>
      <View style={styles.featureCheck}>
        <Feather name="check" size={11} color={AppColors.success} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function PlanCard({loadingPlanId, onSelect, plan}) {
  const isCurrent = Boolean(plan.current);
  const isDisabled = isCurrent || Boolean(plan.disabled);
  const isLoading = loadingPlanId === plan.id;

  return (
    <View style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
      {plan.badge ? (
        <View
          style={[
            styles.badge,
            plan.badge === 'BEST VALUE' && styles.badgeAlt,
          ]}>
          <Text style={styles.badgeText}>{plan.badge}</Text>
        </View>
      ) : null}

      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        {isCurrent ? (
          <View style={styles.currentPill}>
            <View style={styles.currentDot} />
            <Text style={styles.currentPillText}>Current plan</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceValue}>{plan.price}</Text>
        {plan.priceSuffix ? (
          <Text style={styles.priceSuffix}>{plan.priceSuffix}</Text>
        ) : null}
      </View>
      {plan.priceHint ? (
        <Text style={styles.priceHint}>
          {plan.priceHint} · billed to card on file
        </Text>
      ) : null}

      <Text style={styles.planPurpose}>{plan.purpose}</Text>

      <View style={styles.featureList}>
        {plan.features.map((feature, index) => (
          <FeatureRow
            key={feature}
            last={index === plan.features.length - 1}
            text={feature}
          />
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={isDisabled ? 1 : 0.78}
        disabled={isDisabled || isLoading}
        onPress={() => onSelect(plan)}
        style={[
          styles.planButton,
          isDisabled && styles.planButtonDisabled,
          plan.badge === 'BEST VALUE' && styles.planButtonOutline,
        ]}>
        {isLoading ? (
          <ActivityIndicator
            color={
              plan.badge === 'BEST VALUE' ? AppColors.success : AppColors.white
            }
          />
        ) : (
          <Text
            style={[
              styles.planButtonText,
              isDisabled && styles.planButtonTextDisabled,
              plan.badge === 'BEST VALUE' && styles.planButtonOutlineText,
            ]}>
            {isCurrent ? 'Your current plan' : plan.cta}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function SubscriptionScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const currentPlanId = agentPlanId(user);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [offering, setOffering] = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);

  const revenueCatUserId = user?._id || user?.id || user?.email;

  useEffect(() => {
    let mounted = true;

    const loadRevenueCatPlans = async () => {
      setPlansLoading(true);
      try {
        const [offerings, info] = await Promise.all([
          getRevenueCatOfferings(revenueCatUserId),
          getRevenueCatCustomerInfo(revenueCatUserId),
        ]);
        if (!mounted) {
          return;
        }
        setOffering(offerings?.current || null);
        setCustomerInfo(info);
      } catch (error) {
        if (!mounted) {
          return;
        }
        Toast.show({
          type: 'error',
          text1: 'Plans could not load',
          text2: 'Please check the store setup and try again.',
        });
      } finally {
        if (mounted) {
          setPlansLoading(false);
        }
      }
    };

    loadRevenueCatPlans();

    return () => {
      mounted = false;
    };
  }, [revenueCatUserId]);

  const plans = useMemo(() => {
    const activeEntitlement = getActiveRevenueCatEntitlement(customerInfo);

    return PLANS.map(plan => {
      const purchasesPackage = findRevenueCatPackageForPlan(offering, plan.id);
      const product = purchasesPackage?.product;
      const isRevenueCatCurrent =
        plan.id !== 'free' &&
        Boolean(activeEntitlement?.isActive) &&
        (!activeEntitlement?.productIdentifier ||
          activeEntitlement.productIdentifier === product?.identifier);

      return {
        ...plan,
        current:
          plan.id === currentPlanId ||
          (plan.id !== 'free' && isRevenueCatCurrent),
        disabled: plan.id !== 'free' && plansLoading,
        price: product?.priceString || plan.price,
        priceSuffix: product?.subscriptionPeriod
          ? plan.priceSuffix
          : plan.priceSuffix,
        priceHint:
          product?.description ||
          product?.title ||
          plan.priceHint ||
          'Billed through your app store account',
        purchasesPackage,
      };
    });
  }, [customerInfo, currentPlanId, offering, plansLoading]);

  const selectPlan = async plan => {
    if (plan.id === 'free') {
      return;
    }

    if (!plan.purchasesPackage) {
      Toast.show({
        type: 'error',
        text1: 'Plan is not available',
        text2: 'Add this product to the RevenueCat default offering first.',
      });
      return;
    }

    setLoadingPlanId(plan.id);
    try {
      const result = await purchaseRevenueCatPackage(
        plan.purchasesPackage,
        revenueCatUserId,
      );
      setCustomerInfo(result?.customerInfo || null);
      Toast.show({
        type: 'success',
        text1: 'Subscription active',
        text2: `${plan.name} is ready on this account.`,
      });
    } catch (error) {
      if (!error?.userCancelled) {
        Toast.show({
          type: 'error',
          text1: 'Purchase could not complete',
          text2: error?.message || 'Please try again.',
        });
      }
    } finally {
      setLoadingPlanId(null);
    }
  };

  const restorePurchases = async () => {
    setLoadingPlanId('restore');
    try {
      const info = await restoreRevenueCatPurchases(revenueCatUserId);
      setCustomerInfo(info);
      Toast.show({
        type: 'success',
        text1: 'Purchases restored',
        text2: 'Your subscription status has been refreshed.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Restore failed',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

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
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={AppColors.white} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>AGENT PLANS</Text>
            <Text style={styles.title}>Subscription</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          {agentPlanLabel(user)} is active. Manage your agent access, billing
          cycle and plan features from here.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            loadingPlanId={loadingPlanId}
            onSelect={selectPlan}
            plan={plan}
          />
        ))}

        <View style={styles.disclaimer}>
          <Feather name="info" size={14} color={AppColors.textMuted} />
          <Text style={styles.disclaimerText}>
            Prices shown are starting figures and may vary by state, document
            and promotion. Taxes may apply.
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={loadingPlanId === 'restore'}
          onPress={restorePurchases}
          style={styles.restoreButton}>
          {loadingPlanId === 'restore' ? (
            <ActivityIndicator color={AppColors.primary} />
          ) : (
            <Text style={styles.restoreButtonText}>Restore purchases</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  badge: {
    position: 'absolute',
    right: 16,
    top: -11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
  },
  badgeAlt: {backgroundColor: AppColors.success},
  badgeText: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 0.6,
  },
  content: {
    backgroundColor: AppColors.background,
    flexGrow: 1,
    padding: 16,
    paddingBottom: 30,
  },
  currentDot: {
    backgroundColor: AppColors.success,
    borderRadius: 3,
    height: 6,
    marginRight: 5,
    width: 6,
  },
  currentPill: {
    alignItems: 'center',
    backgroundColor: AppColors.successSoft,
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currentPillText: {
    color: AppColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  disclaimer: {
    flexDirection: 'row',
    marginTop: 6,
    paddingHorizontal: 6,
  },
  disclaimerText: {
    color: AppColors.textMuted,
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    lineHeight: 14,
    marginLeft: 8,
  },
  eyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 1,
  },
  featureCheck: {
    alignItems: 'center',
    backgroundColor: AppColors.successSoft,
    borderRadius: 6,
    height: 18,
    justifyContent: 'center',
    marginRight: 9,
    marginTop: 1,
    width: 18,
  },
  featureList: {marginTop: 14},
  featureRow: {
    flexDirection: 'row',
    marginBottom: 9,
  },
  featureText: {
    color: AppColors.textPrimary,
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
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
  headerSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 14,
    textAlign: 'center',
  },
  headerToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lastFeatureRow: {marginBottom: 0},
  planButton: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    marginTop: 16,
  },
  planButtonDisabled: {
    backgroundColor: AppColors.backgroundSubtle,
    borderColor: AppColors.border,
    borderWidth: 1,
  },
  planButtonOutline: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.success,
    borderWidth: 1.5,
  },
  planButtonOutlineText: {color: AppColors.success},
  planButtonText: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  planButtonTextDisabled: {color: AppColors.textSecondary},
  planCard: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    marginTop: 12,
    padding: 18,
  },
  planCardCurrent: {borderColor: AppColors.borderStrong},
  planHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planName: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  planPurpose: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  priceHint: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    marginTop: 3,
  },
  priceRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: 12,
  },
  priceSuffix: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    marginBottom: 3,
    marginLeft: 4,
  },
  priceValue: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 28,
  },
  restoreButton: {
    alignItems: 'center',
    alignSelf: 'center',
    minHeight: 36,
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 14,
  },
  restoreButtonText: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  safeArea: {backgroundColor: AppColors.textPrimary, flex: 1},
  sectionEyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    marginTop: 1,
  },
});
