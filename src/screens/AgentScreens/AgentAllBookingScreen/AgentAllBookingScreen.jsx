import React, {useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import BookingEmptyState from '../../../components/Bookings/BookingEmptyState';
import BookingStatusTabs from '../../../components/Bookings/BookingStatusTabs';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../../features/booking/bookingSlice';
import useFetchBooking from '../../../hooks/useFetchBooking';
import BookingColors from '../../../themes/BookingColors';
import {
  getBookingClient,
  getBookingServiceType,
  normalizeAgentBooking,
} from '../../../utils/agentBookingPresentation';

const AGENT_TABS = [
  {icon: 'check-circle', label: 'Accepted', value: 'accepted'},
  {icon: 'inbox', label: 'Pending', value: 'pending'},
  {icon: 'x-circle', label: 'Cancelled', value: 'rejected'},
];

const STATUS_META = {
  accepted: {
    background: BookingColors.successSoft,
    card: BookingColors.surface,
    border: BookingColors.border,
    color: BookingColors.success,
    label: 'Accepted',
  },
  pending: {
    background: BookingColors.warningSoft,
    card: BookingColors.surface,
    border: BookingColors.border,
    color: BookingColors.warning,
    label: 'Pending',
  },
  rejected: {
    background: BookingColors.errorSoft,
    card: BookingColors.surface,
    border: BookingColors.border,
    color: BookingColors.error,
    label: 'Cancelled',
  },
};

function AgentBookingCard({booking, onPress}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const status = STATUS_META[booking.status] || STATUS_META.pending;
  const isMobile = booking.service_type === 'mobile_notary';
  const initials = String(booking.agentName || 'Client')
    .split(' ')
    .filter(Boolean)
    .map(value => value[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const avatar = booking.avatar;
  const reference =
    booking.reference ||
    String(booking._id || '')
      .slice(-6)
      .toUpperCase();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.78}
      onPress={onPress}
      style={[
        styles.bookingCard,
        {backgroundColor: status.card, borderColor: status.border},
      ]}>
      <View
        style={[styles.serviceAccent, !isMobile && styles.remoteServiceAccent]}
      />
      <View style={styles.cardBody}>
        <Feather
          name={isMobile ? 'truck' : 'monitor'}
          size={70}
          color={isMobile ? BookingColors.primary : BookingColors.info}
          style={styles.cardWatermark}
        />
        <View style={styles.cardTopRow}>
          <View style={styles.serviceIdentity}>
            <View
              style={[
                styles.serviceIcon,
                !isMobile && styles.remoteServiceIcon,
              ]}>
              <Feather
                name={isMobile ? 'truck' : 'monitor'}
                size={17}
                color={isMobile ? BookingColors.primary : BookingColors.info}
              />
            </View>
            <View style={styles.serviceCopy}>
              <Text style={styles.serviceLabel}>
                {isMobile ? 'Mobile notary' : 'Remote online notary'}
              </Text>
              <Text style={styles.reference}>#{reference}</Text>
            </View>
          </View>
          <View
            style={[styles.statusBadge, {backgroundColor: status.background}]}>
            <View style={[styles.statusDot, {backgroundColor: status.color}]} />
            <Text style={[styles.statusText, {color: status.color}]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.clientRow}>
          <View style={[styles.avatar, !isMobile && styles.remoteAvatar]}>
            <Text
              style={[styles.avatarText, !isMobile && styles.remoteAvatarText]}>
              {initials || 'C'}
            </Text>
            {avatar && !avatarFailed ? (
              <Image
                onError={() => setAvatarFailed(true)}
                source={avatar}
                style={styles.avatarImage}
              />
            ) : null}
            <View
              style={[
                styles.avatarBadge,
                !isMobile && styles.remoteAvatarBadge,
              ]}>
              <Feather
                name={isMobile ? 'navigation' : 'wifi'}
                size={8}
                color={BookingColors.white}
              />
            </View>
          </View>
          <View style={styles.clientCopy}>
            <Text numberOfLines={1} style={styles.clientName}>
              {booking.agentName || 'Notarizr client'}
            </Text>
            <Text style={styles.clientLabel}>Client appointment</Text>
          </View>
          <View style={styles.openButton}>
            <Feather
              name="chevron-right"
              size={18}
              color={BookingColors.white}
            />
          </View>
        </View>

        <View style={styles.schedulePanel}>
          <View style={styles.dateBlock}>
            <View style={styles.scheduleIcon}>
              <Feather
                name="calendar"
                size={14}
                color={BookingColors.primary}
              />
            </View>
            <View style={styles.scheduleCopy}>
              <Text style={styles.scheduleLabel}>Date</Text>
              <Text numberOfLines={1} style={styles.scheduleValue}>
                {booking.displayDate}
              </Text>
            </View>
          </View>
          <View style={styles.scheduleDivider} />
          <View style={styles.timeBlock}>
            <View style={styles.scheduleIcon}>
              <Feather name="watch" size={14} color={BookingColors.primary} />
            </View>
            <View style={styles.scheduleCopy}>
              <Text style={styles.scheduleLabel}>Time</Text>
              <Text numberOfLines={1} style={styles.scheduleValue}>
                {booking.displayTime}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Feather
            name={isMobile ? 'map' : 'radio'}
            size={14}
            color={BookingColors.textSecondary}
          />
          <Text numberOfLines={1} style={styles.locationText}>
            {booking.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AgentAllBookingScreen({navigation}) {
  const {fetchAdminAllocations, fetchAgentBookingInfo, handleAgentSessions} =
    useFetchBooking();
  const fetchAllocationsRef = useRef(fetchAdminAllocations);
  const fetchBookingsRef = useRef(fetchAgentBookingInfo);
  const fetchSessionsRef = useRef(handleAgentSessions);
  const activeStatusRef = useRef('accepted');
  const dispatch = useDispatch();
  const [activeStatus, setActiveStatus] = useState('accepted');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  fetchAllocationsRef.current = fetchAdminAllocations;
  fetchBookingsRef.current = fetchAgentBookingInfo;
  fetchSessionsRef.current = handleAgentSessions;

  const loadBookings = useCallback(async (status, isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [bookingData, sessionData, allocationData] = await Promise.all([
        fetchBookingsRef.current(status),
        fetchSessionsRef.current(status),
        status === 'pending' ? fetchAllocationsRef.current(status) : [],
      ]);
      const merged = [
        ...(Array.isArray(bookingData) ? bookingData : []),
        ...(Array.isArray(sessionData) ? sessionData : []),
        ...(Array.isArray(allocationData) ? allocationData : []),
      ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(normalizeAgentBooking);

      setBookings(merged);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Bookings could not refresh',
        text2: 'Check your connection and try again.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings(activeStatusRef.current);
    }, [loadBookings]),
  );

  const changeStatus = status => {
    activeStatusRef.current = status;
    setActiveStatus(status);
    setBookings([]);
    loadBookings(status);
  };

  const openBooking = booking => {
    const item = booking.raw;
    const client = getBookingClient(item);
    dispatch(setBookingInfoState(item));
    dispatch(setUser(client));
    dispatch(setCoordinates(client?.current_location?.coordinates || []));

    if (
      item?.status === 'accepted' &&
      getBookingServiceType(item) === 'mobile_notary'
    ) {
      navigation.navigate('MapArrivalScreen');
      return;
    }

    navigation.navigate('ClientDetailsScreen', {clientDetail: item});
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <AgentHomeHeader Switch />
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          !loading && bookings.length === 0 && styles.emptyListContent,
        ]}
        data={bookings}
        keyExtractor={item => item._id}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={BookingColors.primary} size="small" />
              <Text style={styles.loadingText}>Loading bookings...</Text>
            </View>
          ) : (
            <BookingEmptyState status={activeStatus} />
          )
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.workspaceHero}>
              <View style={styles.heroGlow} />
              <View style={styles.titleRow}>
                <View style={styles.titleCopy}>
                  <Text style={styles.eyebrow}>APPOINTMENT CENTER</Text>
                  <Text style={styles.title}>Bookings</Text>
                  <Text style={styles.subtitle}>
                    Review requests and manage upcoming appointments
                  </Text>
                </View>
                <View style={styles.countCard}>
                  <Feather
                    name="briefcase"
                    size={15}
                    color={BookingColors.white}
                  />
                  <Text style={styles.countValue}>{bookings.length}</Text>
                  <Text style={styles.countLabel}>
                    {bookings.length === 1 ? 'booking' : 'bookings'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tabsPanel}>
              <BookingStatusTabs
                activeStatus={activeStatus}
                onChange={changeStatus}
                tabs={AGENT_TABS}
              />
            </View>

            <View style={styles.resultsRow}>
              <Text style={styles.resultsTitle}>
                {AGENT_TABS.find(tab => tab.value === activeStatus)?.label}
              </Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Up to date</Text>
              </View>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl
            colors={[BookingColors.primary]}
            onRefresh={() => loadBookings(activeStatus, true)}
            refreshing={refreshing}
            tintColor={BookingColors.primary}
          />
        }
        renderItem={({item}) => (
          <AgentBookingCard booking={item} onPress={() => openBooking(item)} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BookingColors.surface,
  },
  listContent: {
    paddingBottom: 28,
    backgroundColor: BookingColors.background,
  },
  listHeader: {
    paddingTop: 14,
    paddingHorizontal: 16,
  },
  workspaceHero: {
    backgroundColor: BookingColors.textPrimary,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 17,
  },
  heroGlow: {
    backgroundColor: 'rgba(253,109,31,0.15)',
    borderRadius: 75,
    height: 150,
    position: 'absolute',
    right: -45,
    top: -75,
    width: 150,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 14,
  },
  eyebrow: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 3,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 26,
  },
  subtitle: {
    marginTop: 3,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  countCard: {
    minWidth: 66,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  countValue: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
    marginTop: 2,
  },
  countLabel: {
    marginTop: 1,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  tabsPanel: {
    marginTop: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 19,
    marginBottom: 2,
  },
  resultsTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    marginRight: 6,
    borderRadius: 3,
    backgroundColor: BookingColors.success,
  },
  liveText: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  bookingCard: {
    position: 'relative',
    flexDirection: 'row',
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    elevation: 2,
    shadowColor: BookingColors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  serviceAccent: {
    width: 4,
    backgroundColor: BookingColors.primary,
  },
  remoteServiceAccent: {
    backgroundColor: BookingColors.info,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    padding: 15,
  },
  cardWatermark: {
    opacity: 0.045,
    position: 'absolute',
    right: -11,
    top: 42,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  serviceIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  remoteServiceIcon: {
    backgroundColor: BookingColors.infoSoft,
  },
  serviceCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  serviceLabel: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  reference: {
    marginTop: 2,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
  },
  statusBadge: {
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: 7,
  },
  statusDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: BookingColors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: BookingColors.primarySoft,
  },
  remoteAvatar: {
    backgroundColor: BookingColors.infoSoft,
    borderColor: BookingColors.borderStrong,
  },
  avatarBadge: {
    alignItems: 'center',
    backgroundColor: BookingColors.primary,
    borderColor: BookingColors.white,
    borderRadius: 7,
    borderWidth: 1,
    bottom: 2,
    height: 14,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    width: 14,
  },
  remoteAvatarBadge: {
    backgroundColor: BookingColors.info,
  },
  avatarText: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  remoteAvatarText: {
    color: BookingColors.info,
  },
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
    width: 46,
    height: 46,
    borderRadius: 8,
  },
  clientCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  clientName: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  clientLabel: {
    marginTop: 2,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  openButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primary,
  },
  schedulePanel: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
    borderColor: 'rgba(32,38,50,0.07)',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  scheduleIcon: {
    alignItems: 'center',
    backgroundColor: BookingColors.primarySoft,
    borderRadius: 7,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  dateBlock: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBlock: {
    flex: 0.8,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 12,
    backgroundColor: BookingColors.border,
  },
  scheduleCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 7,
  },
  scheduleLabel: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  scheduleValue: {
    marginTop: 1,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  locationText: {
    flex: 1,
    marginLeft: 7,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  loadingState: {
    alignItems: 'center',
    paddingTop: 86,
  },
  loadingText: {
    marginTop: 9,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
});
