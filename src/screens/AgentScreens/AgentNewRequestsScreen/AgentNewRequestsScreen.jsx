import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import AgentRequestCard from '../../../components/AgentHome/AgentRequestCard';
import BookingColors from '../../../themes/BookingColors';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../../features/booking/bookingSlice';
import useFetchBooking from '../../../hooks/useFetchBooking';
import {PREVIEW_AGENT_BOOKINGS} from '../../../data/previewBookings';

const ACCEPT_WINDOW_SECONDS = 90;

const getCreatedAt = booking => {
  const rawDate =
    booking?.open_call_started_at ||
    booking?.createdAt ||
    booking?.created_at ||
    booking?.updatedAt;
  const timestamp = rawDate ? new Date(rawDate).getTime() : NaN;
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getCountdownLabel = (booking, now) => {
  const createdAt = getCreatedAt(booking);
  if (!createdAt) {
    return 'Accept window open';
  }

  const elapsed = Math.max(0, Math.floor((now - createdAt) / 1000));
  const remaining = ACCEPT_WINDOW_SECONDS - elapsed;

  if (remaining <= 0) {
    return 'Accept before another notary locks it';
  }

  return `${remaining}s accept window`;
};

// A dedicated "new requests" list — every pending request awaiting this
// notary's Accept/Decline, and nothing else. Deliberately its own screen
// rather than a filtered view of the general Bookings list, since a request
// still needing a decision isn't the same thing as a booking on the books.
export default function AgentNewRequestsScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const {fetchAgentBookingInfo} = useFetchBooking();
  const fetchRef = useRef(fetchAgentBookingInfo);
  const hasRequestsRef = useRef(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [now, setNow] = useState(Date.now());

  fetchRef.current = fetchAgentBookingInfo;

  const previewMode = Boolean(user?.isHomePreview);
  const previewRequests = PREVIEW_AGENT_BOOKINGS.filter(
    booking => booking.status === 'pending',
  );
  const visibleRequests = previewMode ? previewRequests : requests;

  const loadRequests = useCallback(
    async (isRefresh = false) => {
      if (previewMode) {
        return;
      }
      isRefresh
        ? setRefreshing(true)
        : !hasRequestsRef.current && setLoading(true);
      setLoadError(false);
      try {
        const pending = await fetchRef.current('pending', isRefresh);
        const safePending = Array.isArray(pending) ? pending : [];
        hasRequestsRef.current = safePending.length > 0;
        setRequests(safePending);
      } catch (error) {
        console.error('Failed to load new requests:', error);
        setLoadError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [previewMode],
  );

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests]),
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openRequest = request => {
    dispatch(setBookingInfoState(request));
    dispatch(setUser(request?.booked_by));
    dispatch(
      setCoordinates(request?.booked_by?.current_location?.coordinates || []),
    );
    navigation.navigate('ClientDetailsScreen', {clientDetail: request});
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator color={BookingColors.primary} size="small" />
          <Text style={styles.stateText}>Loading requests</Text>
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Requests could not be loaded</Text>
          <Text style={styles.stateText}>
            Check your connection and try again.
          </Text>
          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() => loadRequests()}
            style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        contentContainerStyle={styles.listContent}
        data={visibleRequests}
        keyExtractor={item => item._id}
        ListHeaderComponent={
          <View style={styles.alertPanel}>
            <View style={styles.alertIcon}>
              <Feather name="radio" size={18} color={BookingColors.primary} />
            </View>
            <View style={styles.alertCopy}>
              <Text style={styles.alertTitle}>Open call flow</Text>
              <Text style={styles.alertText}>
                Eligible notaries receive alerts together. Review quickly; the
                first notary to accept locks the booking.
              </Text>
              <View style={styles.alertSteps}>
                <View style={styles.alertStep}>
                  <Feather
                    name="bell"
                    size={12}
                    color={BookingColors.primary}
                  />
                  <Text style={styles.alertStepText}>Alert</Text>
                </View>
                <View style={styles.alertStep}>
                  <Feather
                    name="clock"
                    size={12}
                    color={BookingColors.primary}
                  />
                  <Text style={styles.alertStepText}>Countdown</Text>
                </View>
                <View style={styles.alertStep}>
                  <Feather
                    name="lock"
                    size={12}
                    color={BookingColors.primary}
                  />
                  <Text style={styles.alertStepText}>First accept locks</Text>
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.stateContainer}>
            <Feather name="inbox" size={26} color={BookingColors.textMuted} />
            <Text style={styles.stateTitle}>No new requests</Text>
            <Text style={styles.stateText}>
              You're all caught up — new requests will show up here.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            enabled={!previewMode}
            onRefresh={() => loadRequests(true)}
            refreshing={refreshing}
            tintColor={BookingColors.primary}
          />
        }
        renderItem={({item}) => (
          <AgentRequestCard
            booking={item}
            countdownLabel={getCountdownLabel(item, now)}
            lockLabel="First eligible notary to accept gets this booking"
            onPress={() => openRequest(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Feather
            name="arrow-left"
            size={20}
            color={BookingColors.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>New requests</Text>
          <Text style={styles.subtitle}>
            {visibleRequests.length} awaiting your response
          </Text>
        </View>
      </View>
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
  },
  headerCopy: {flex: 1, minWidth: 0, marginLeft: 12},
  title: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
  },
  subtitle: {
    marginTop: 2,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  content: {flex: 1, backgroundColor: BookingColors.background},
  alertCopy: {flex: 1, minWidth: 0, marginLeft: 12},
  alertIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  alertPanel: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  alertSteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  alertStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFF7F0',
  },
  alertStepText: {
    marginLeft: 5,
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  alertText: {
    marginTop: 4,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
  },
  alertTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 28,
  },
  stateTitle: {
    marginTop: 10,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    textAlign: 'center',
  },
  stateText: {
    marginTop: 5,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  retryButton: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: BookingColors.primary,
  },
  retryText: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
});
