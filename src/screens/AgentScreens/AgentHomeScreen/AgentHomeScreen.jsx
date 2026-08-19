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
