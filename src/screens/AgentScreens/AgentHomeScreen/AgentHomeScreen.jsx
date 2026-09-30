import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
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
import {useDispatch, useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import OneSignal from 'react-native-onesignal';
import Toast from 'react-native-toast-message';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import AgentMetricCard from '../../../components/AgentHome/AgentMetricCard';
import AgentRequestCard from '../../../components/AgentHome/AgentRequestCard';
import AgentServiceAction from '../../../components/AgentHome/AgentServiceAction';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../../features/booking/bookingSlice';
import useAgentService from '../../../hooks/useAgentService';
import useFetchBooking from '../../../hooks/useFetchBooking';
import useStripeApi from '../../../hooks/useStripeApi';
import {PREVIEW_AGENT_BOOKINGS} from '../../../data/previewBookings';

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
    title: 'Open calls',
    description:
      'Review live client requests and accept before the window closes.',
    icon: 'radio',
    route: 'AgentNewRequestsScreen',
  },
  {
    title: 'Scheduled sessions',
    description: 'See accepted sessions, upcoming calls and client details.',
    icon: 'calendar',
    route: 'BookScreen',
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

const LIVE_TOOLS = [
  {label: 'Secure video', icon: 'video'},
  {label: 'Recording consent', icon: 'shield'},
  {label: 'Participants', icon: 'users'},
  {label: 'Document viewer', icon: 'file-text'},
  {label: 'Session chat', icon: 'message-circle'},
  {label: 'Signing fields', icon: 'edit-3'},
];

const COMPLETION_STEPS = [
  'Certificate wording',
  'Notary signature',
  'eSeal',
  'Digital certificate',
  'Journal entry',
  'Final sealed PDF',
];

export default function AgentHomeScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const {dispatchMobile, dispatchRON} = useAgentService();
  const {fetchAgentBookingInfo, handleAgentSessions} = useFetchBooking();
  const {checkUserStipeAccount} = useStripeApi();
  const fetchBookingsRef = useRef(fetchAgentBookingInfo);
  const fetchSessionsRef = useRef(handleAgentSessions);
  const hasRequestsRef = useRef(false);
  const bottomSheetRef = useRef(null);
  const [requests, setRequests] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(!user?.isHomePreview);
  const [refreshing, setRefreshing] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const previewMode = Boolean(user?.isHomePreview);
  const previewRequests = PREVIEW_AGENT_BOOKINGS.filter(
    booking => booking.status === 'pending',
  );
  const previewCompleted = PREVIEW_AGENT_BOOKINGS.filter(
    booking => booking.status === 'completed',
  );
  const visibleRequests = previewMode ? previewRequests : requests;
  const visibleCompletedCount = previewMode
    ? previewCompleted.length
    : completedCount;
  const visibleEarnings = previewMode
    ? previewCompleted.reduce(
        (sum, booking) => sum + Number(booking.totalPrice || 0),
        0,
      )
    : earnings;
  const isOnline =
    user?.online_status === 'online' ||
    user?.availability_status === 'online' ||
    user?.is_online;

  fetchBookingsRef.current = fetchAgentBookingInfo;
  fetchSessionsRef.current = handleAgentSessions;
  hasRequestsRef.current = requests.length > 0;

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (previewMode) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      isRefresh
        ? setRefreshing(true)
        : !hasRequestsRef.current && setLoading(true);
      try {
        const [pending, completedBookings, completedSessions] =
          await Promise.all([
            fetchBookingsRef.current('pending', isRefresh),
            fetchBookingsRef.current('completed', isRefresh),
            fetchSessionsRef.current('completed', isRefresh),
          ]);
        const safePending = Array.isArray(pending) ? pending : [];
        const safeBookings = Array.isArray(completedBookings)
          ? completedBookings
          : [];
        const safeSessions = Array.isArray(completedSessions)
          ? completedSessions
          : [];

        setRequests(safePending);
        setCompletedCount(safeBookings.length + safeSessions.length);
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
        setLoading(false);
        setRefreshing(false);
      }
    },
    [previewMode],
  );

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
      if (user?._id) {
        OneSignal.setExternalUserId(user._id);
      }
    }, [loadDashboard, user?._id]),
  );

  const openRequest = request => {
    navigation.navigate('ClientDetailsScreen', {clientDetail: request});
    dispatch(setBookingInfoState(request));
    dispatch(setUser(request?.booked_by));
    dispatch(
      setCoordinates(request?.booked_by?.current_location?.coordinates || []),
    );
  };

  const openService = async service => {
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

  const accountMessage = useMemo(() => {
    if (user?.isBlocked) {
      return {
        icon: 'slash',
        title: 'Account access paused',
        body: 'Please contact Notarizr support for help with your account.',
      };
    }
    if (!user?.isVerified) {
      return {
        icon: 'clock',
        title: 'Profile under review',
        body: 'We will notify you as soon as your notary profile is approved.',
      };
    }
    return null;
  }, [user?.isBlocked, user?.isVerified]);

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
            Track your work and respond to new notary requests.
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
            Start calls, manage private sessions and keep your records clean.
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
                  ? 'You can receive open-call alerts and scheduled session updates.'
                  : 'Go online when you are ready to receive eligible call alerts.'}
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
                onPress={() => navigation.navigate(item.route)}
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
          <Text style={styles.sectionTitle}>Live session tools</Text>
          <Text style={styles.sectionSubtitle}>
            The call room should expose the tools a notary needs while signing.
          </Text>
          <View style={styles.toolPanel}>
            {LIVE_TOOLS.map(item => (
              <View key={item.label} style={styles.toolRow}>
                <View style={styles.toolIcon}>
                  <Feather name={item.icon} size={15} color="#D65322" />
                </View>
                <Text style={styles.toolLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completion checklist</Text>
          <Text style={styles.sectionSubtitle}>
            Finish the session with certificate wording, notary assets and a
            sealed record.
          </Text>
          <View style={styles.completionPanel}>
            {COMPLETION_STEPS.map((label, index) => (
              <View
                key={label}
                style={[
                  styles.completionRow,
                  index === COMPLETION_STEPS.length - 1 &&
                    styles.completionRowLast,
                ]}>
                <Feather name="check-circle" size={16} color="#168A52" />
                <Text style={styles.completionText}>{label}</Text>
              </View>
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

        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionHeadingCopy}>
              <View style={styles.requestTitleRow}>
                <Text style={styles.sectionTitle}>New requests</Text>
                {visibleRequests.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {visibleRequests.length}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.sectionSubtitle}>
                Review requests before they expire.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AgentNewRequestsScreen')}
              style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View all</Text>
              <Feather name="arrow-right" size={14} color="#D65322" />
            </TouchableOpacity>
          </View>

          {loading && !previewMode ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#D65322" />
              <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
          ) : visibleRequests.length > 0 ? (
            visibleRequests
              .slice(0, 2)
              .map(request => (
                <AgentRequestCard
                  booking={request}
                  key={request._id}
                  onPress={() => openRequest(request)}
                />
              ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather name="inbox" size={22} color="#7B8490" />
              </View>
              <View style={styles.emptyCopy}>
                <Text style={styles.emptyTitle}>No new requests</Text>
                <Text style={styles.emptyText}>
                  New client requests will appear here.
                </Text>
              </View>
            </View>
          )}
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
  completionPanel: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F2',
  },
  completionRowLast: {
    borderBottomWidth: 0,
  },
  completionText: {
    marginLeft: 9,
    color: '#242B36',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
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
  toolIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  toolLabel: {
    flex: 1,
    marginLeft: 9,
    color: '#242B36',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  toolPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  toolRow: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  workbenchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    width: '48.5%',
    minHeight: 132,
    marginTop: 10,
    padding: 12,
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
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionHeadingCopy: {
    flex: 1,
    minWidth: 0,
  },
  requestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    minWidth: 22,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#FFE4D5',
  },
  countText: {
    color: '#C94D1C',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  viewAllButton: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 8,
  },
  viewAllText: {
    marginRight: 4,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  loadingState: {
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 8,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  emptyState: {
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  emptyIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#EEF1F4',
  },
  emptyCopy: {
    flex: 1,
    marginLeft: 12,
  },
  emptyTitle: {
    color: '#242B36',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  emptyText: {
    marginTop: 3,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
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
