import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import AgentMetricCard from '../../../components/AgentHome/AgentMetricCard';
import AgentServiceAction from '../../../components/AgentHome/AgentServiceAction';
import useAgentService from '../../../hooks/useAgentService';
import useFetchBooking from '../../../hooks/useFetchBooking';
import useStripeApi from '../../../hooks/useStripeApi';
import {PREVIEW_AGENT_BOOKINGS} from '../../../data/previewBookings';
import {agentPlanLabel} from '../../../utils/agentPlan';
import {
  getAgentCredentialBlockMessage,
  getAgentCredentialStatus,
} from '../../../utils/agentCredentials';

const renderAccountBackdrop = props => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.45}
    pressBehavior="none"
  />
);

const WORKBENCH_ACTIONS = [
  {
    title: 'Scheduled sessions',
    description: 'See accepted sessions, upcoming calls and client details.',
    icon: 'calendar',
    params: {initialStatus: 'pending'},
    route: 'AllBookingScreen',
  },
  {
    title: 'Private sessions',
    description: 'Create a notary-led session, upload docs and invite signers.',
    icon: 'send',
    route: 'AgentSessionInviteScreen',
  },
  {
    title: 'Journal',
    description:
      'Track completed notarizations and audit-ready session records.',
    icon: 'book-open',
    route: 'BookScreen',
  },
];

export default function AgentHomeScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const {dispatchMobile, dispatchRON} = useAgentService();
  const {fetchAgentBookingInfo, handleAgentSessions} = useFetchBooking();
  const {checkUserStipeAccount} = useStripeApi();
  const fetchBookingsRef = useRef(fetchAgentBookingInfo);
  const fetchSessionsRef = useRef(handleAgentSessions);
  const checkStripeRef = useRef(checkUserStipeAccount);
  const bottomSheetRef = useRef(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [payoutConnected, setPayoutConnected] = useState(null);
  const previewMode = Boolean(user?.isHomePreview);
  const previewCompleted = PREVIEW_AGENT_BOOKINGS.filter(
    booking => booking.status === 'completed',
  );
  const visibleCompletedCount = previewMode
    ? previewCompleted.length
    : completedCount;
  const visibleEarnings = previewMode
    ? previewCompleted.reduce(
        (sum, booking) => sum + Number(booking.totalPrice || 0),
        0,
      )
    : earnings;
  const planLabel = agentPlanLabel(user);
  const credentialStatus = useMemo(
    () => getAgentCredentialStatus(user),
    [user],
  );
  const credentialBlockMessage = useMemo(
    () => getAgentCredentialBlockMessage(user),
    [user],
  );
  const isOnline =
    user?.online_status === 'online' ||
    user?.availability_status === 'online' ||
    user?.is_online;

  fetchBookingsRef.current = fetchAgentBookingInfo;
  fetchSessionsRef.current = handleAgentSessions;
  checkStripeRef.current = checkUserStipeAccount;

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (previewMode) {
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      }
      try {
        const [completedBookings, completedSessions, stripeData] =
          await Promise.all([
            fetchBookingsRef.current('completed', isRefresh),
            fetchSessionsRef.current('completed', isRefresh),
            checkStripeRef.current(),
          ]);
        const safeBookings = Array.isArray(completedBookings)
          ? completedBookings
          : [];
        const safeSessions = Array.isArray(completedSessions)
          ? completedSessions
          : [];

        setCompletedCount(safeBookings.length + safeSessions.length);
        const stripeAccount = stripeData?.isUserStripeOnboard;
        setPayoutConnected(
          Boolean(
            stripeAccount?.has_stripe_account &&
              stripeAccount?.has_details_submitted,
          ),
        );
        setEarnings(
          [...safeBookings, ...safeSessions].reduce(
            (sum, item) => sum + Number(item?.totalPrice ?? item?.price ?? 0),
            0,
          ),
        );
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Dashboard could not refresh',
          text2: 'Check your connection and try again.',
        });
      } finally {
        setRefreshing(false);
      }
    },
    [previewMode],
  );

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard, user?._id]),
  );

  const openService = async service => {
    if (!credentialStatus.documentsComplete) {
      Toast.show({
        type: 'info',
        text1: 'Credentials required',
        text2: 'Upload required agent documents before opening bookings.',
      });
      navigation.navigate('AgentManageScreen');
      return;
    }
    setActiveService(service);
    try {
      if (previewMode) {
        service === 'mobile'
          ? dispatchMobile('mobile_notary')
          : dispatchRON('ron');
        return;
      }

      const stripeData = await checkUserStipeAccount();
      const stripeAccount = stripeData?.isUserStripeOnboard;
      const canAcceptPayments =
        stripeAccount?.has_stripe_account &&
        stripeAccount?.has_details_submitted;

      if (!__DEV__ && !canAcceptPayments) {
        Toast.show({
          type: 'info',
          text1: 'Set up payouts first',
          text2: 'Complete Stripe setup before accepting bookings.',
        });
        navigation.navigate('PaymentUpdateScreen');
        return;
      }

      service === 'mobile'
        ? dispatchMobile('mobile_notary')
        : dispatchRON('ron');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Service setup unavailable',
        text2: 'Please try again in a moment.',
      });
    } finally {
      setActiveService(null);
    }
  };

  const openWorkbenchAction = item => {
    navigation.navigate(item.route, item.params);
  };

  const accountMessage = useMemo(() => {
    if (credentialBlockMessage) {
      return {
        icon: user?.isBlocked
          ? 'slash'
          : credentialStatus.documentsComplete
          ? 'clock'
          : 'shield',
        title: credentialBlockMessage.title,
        body: credentialBlockMessage.body,
      };
    }
    return null;
  }, [
    credentialBlockMessage,
    credentialStatus.documentsComplete,
    user?.isBlocked,
  ]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AgentHomeHeader Switch />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={['#D65322']}
            onRefresh={() => loadDashboard(true)}
            refreshing={refreshing}
            tintColor="#D65322"
          />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.title}>Overview</Text>
          <Text style={styles.subtitle}>
            Manage your schedule, sessions, and client work.
          </Text>
        </View>

        <View style={styles.metrics}>
          <AgentMetricCard
            icon="dollar-sign"
            label="Total earnings"
            onPress={() => navigation.navigate('TransactionScreen')}
            value={'$' + visibleEarnings.toFixed(0)}
          />
          <View style={styles.metricGap} />
          <AgentMetricCard
            icon="check-circle"
            label="Completed jobs"
            onPress={() => navigation.navigate('BookScreen')}
            tone="blue"
            value={visibleCompletedCount}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent workbench</Text>
          <Text style={styles.sectionSubtitle}>
            {planLabel} · Start calls, manage private sessions and keep your
            records clean.
          </Text>

          <View style={styles.availabilityPanel}>
            <View
              style={[
                styles.availabilityIcon,
                isOnline && styles.availabilityIconOnline,
              ]}>
              <Feather
                name={isOnline ? 'wifi' : 'wifi-off'}
                size={20}
                color={isOnline ? '#168A52' : '#7B8490'}
              />
            </View>
            <View style={styles.availabilityCopy}>
              <Text style={styles.availabilityTitle}>
                {isOnline ? 'Online for calls' : 'Offline'}
              </Text>
              <Text style={styles.availabilityText}>
                {isOnline
                  ? 'You can receive scheduled session updates.'
                  : 'Go online when you are ready for scheduled sessions.'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isOnline ? styles.statusBadgeOnline : styles.statusBadgeIdle,
              ]}>
              <Text
                style={[
                  styles.statusBadgeText,
                  isOnline
                    ? styles.statusBadgeTextOnline
                    : styles.statusBadgeTextIdle,
                ]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <View style={styles.workbenchGrid}>
            {WORKBENCH_ACTIONS.map(item => (
              <TouchableOpacity
                activeOpacity={0.74}
                key={item.title}
                onPress={() => openWorkbenchAction(item)}
                style={styles.workbenchTile}>
                <View style={styles.workbenchIcon}>
                  <Feather name={item.icon} size={18} color="#D65322" />
                </View>
                <Text style={styles.workbenchTitle}>{item.title}</Text>
                <Text style={styles.workbenchText}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <Text style={styles.sectionSubtitle}>
            Track invoices, payouts, pending balance and adjustments.
          </Text>
          <TouchableOpacity
            activeOpacity={0.74}
            onPress={() => navigation.navigate('TransactionScreen')}
            style={styles.earningsPanel}>
            {payoutConnected === false ? (
              <View style={styles.payoutWarning}>
                <Feather name="alert-circle" size={16} color="#C44242" />
                <Text style={styles.payoutWarningText}>
                  Stripe is not connected. You can track earnings here, but you
                  cannot get paid until payout setup is complete.
                </Text>
              </View>
            ) : null}
            <View style={styles.earningsHeader}>
              <View>
                <Text style={styles.earningsLabel}>Pending payout balance</Text>
                <Text style={styles.earningsValue}>
                  {'$' + visibleEarnings.toFixed(0)}
                </Text>
              </View>
              <View style={styles.earningsIcon}>
                <Feather name="arrow-up-right" size={18} color="#168A52" />
              </View>
            </View>
            <View style={styles.earningsRows}>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsRowLabel}>Invoices</Text>
                <Text style={styles.earningsRowValue}>Review</Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsRowLabel}>Payouts</Text>
                <Text style={styles.earningsRowValue}>History</Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsRowLabel}>Refunds/adjustments</Text>
                <Text style={styles.earningsRowValue}>Tracked</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your services</Text>
          <Text style={styles.sectionSubtitle}>
            Set when and where clients can book you.
          </Text>
          <View style={styles.serviceList}>
            <AgentServiceAction
              description="Manage travel radius, availability and appointment preferences."
              icon="map-pin"
              loading={activeService === 'mobile'}
              onPress={() => openService('mobile')}
              title="Mobile notary"
            />
            <View style={styles.serviceGap} />
            <AgentServiceAction
              description="Configure your remote online notarization schedule."
              icon="video"
              loading={activeService === 'remote'}
              onPress={() => openService('remote')}
              title="Remote online notary"
              tone="remote"
            />
          </View>
        </View>

      </ScrollView>

      {accountMessage && (
        <BottomSheet
          backdropComponent={renderAccountBackdrop}
          enableContentPanningGesture={false}
          enableHandlePanningGesture={false}
          enableOverDrag={false}
          index={0}
          ref={bottomSheetRef}
          snapPoints={['34%']}>
          <View style={styles.accountState}>
            <View style={styles.accountIcon}>
              <Feather name={accountMessage.icon} size={22} color="#D65322" />
            </View>
            <Text style={styles.accountTitle}>{accountMessage.title}</Text>
            <Text style={styles.accountText}>{accountMessage.body}</Text>
          </View>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 34,
    backgroundColor: '#F6F7F9',
  },
  intro: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
  },
  subtitle: {
    marginTop: 4,
    color: '#7D8591',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
  },
  metrics: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  metricGap: {
    width: 10,
  },
  availabilityCopy: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 12,
  },
  availabilityIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#EEF1F4',
  },
  availabilityIconOnline: {
    backgroundColor: '#E8F6EE',
  },
  availabilityPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  availabilityText: {
    marginTop: 3,
    color: '#7D8591',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  availabilityTitle: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earningsIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E8F6EE',
  },
  earningsLabel: {
    color: '#7D8591',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  earningsPanel: {
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDEBE3',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  payoutWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3D1D1',
    borderRadius: 8,
    backgroundColor: '#FFF1F1',
  },
  payoutWarningText: {
    flex: 1,
    marginLeft: 9,
    color: '#C44242',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    lineHeight: 15,
  },
  earningsRows: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F2',
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  earningsRowLabel: {
    color: '#7D8591',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  earningsRowValue: {
    color: '#242B36',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  earningsValue: {
    marginTop: 2,
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#1B2130',
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  sectionSubtitle: {
    marginTop: 3,
    color: '#838A95',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeIdle: {
    backgroundColor: '#EEF1F4',
  },
  statusBadgeOnline: {
    backgroundColor: '#E8F6EE',
  },
  statusBadgeText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  statusBadgeTextIdle: {
    color: '#69717D',
  },
  statusBadgeTextOnline: {
    color: '#168A52',
  },
  workbenchGrid: {
    flexDirection: 'column',
    marginTop: 10,
  },
  workbenchIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  workbenchText: {
    marginTop: 5,
    color: '#7D8591',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    lineHeight: 13,
  },
  workbenchTile: {
    width: '100%',
    minHeight: 124,
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  workbenchTitle: {
    marginTop: 10,
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  serviceList: {
    marginTop: 12,
  },
  serviceGap: {
    height: 10,
  },
  accountState: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 18,
  },
  accountIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  accountTitle: {
    marginTop: 14,
    color: '#1A202C',
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
  },
  accountText: {
    marginTop: 7,
    color: '#7F8792',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
});
