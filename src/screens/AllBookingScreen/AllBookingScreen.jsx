import React, {useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BookingCard from '../../components/Bookings/BookingCard';
import BookingEmptyState from '../../components/Bookings/BookingEmptyState';
import BookingHeader from '../../components/Bookings/BookingHeader';
import BookingActionButton from '../../components/Bookings/BookingActionButton';
import BookingColors from '../../themes/BookingColors';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../features/booking/bookingSlice';
import {PREVIEW_BOOKINGS} from '../../data/previewBookings';
import useFetchBooking from '../../hooks/useFetchBooking';

const getBookingStatus = booking => {
  const status = String(booking?.status || '').toLowerCase();
  const paymentStatus = String(booking?.payment_status || '').toLowerCase();

  if (['cancelled', 'canceled', 'expired', 'rejected'].includes(status)) {
    return 'rejected';
  }
  if (['completed', 'complete'].includes(status)) {
    return 'completed';
  }
  if (['pending', 'to_be_paid', 'unpaid', 'payment_pending'].includes(status)) {
    return 'pending';
  }
  if (['paid', 'succeeded'].includes(paymentStatus)) {
    return 'accepted';
  }
  if (['accepted', 'ongoing', 'payment_confirmed', 'paid'].includes(status)) {
    return 'accepted';
  }
  return status;
};

const BOOKING_STATUSES = ['accepted', 'pending', 'completed', 'rejected'];
const getSeenSignature = item =>
  `${item?._id}:${String(item?.status || '').toLowerCase()}:${
    item?.updatedAt || item?.createdAt || ''
  }`;

export default function AllBookingScreen({navigation, route}) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const {fetchBookingInfo, handleClientSessions} = useFetchBooking();
  const fetchBookingInfoRef = useRef(fetchBookingInfo);
  const handleClientSessionsRef = useRef(handleClientSessions);
  const hasBookingsRef = useRef(false);
  // "New requests → View all" on the notary dashboard wants this list to
  // open straight on the Pending tab; every other entry point keeps the
  // previous default of Accepted.
  const [activeStatus, setActiveStatus] = useState(
    route.params?.initialStatus || 'accepted',
  );
  const [bookings, setBookings] = useState([]);
  const [statusBookings, setStatusBookings] = useState({});
  const [unseenCounts, setUnseenCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  fetchBookingInfoRef.current = fetchBookingInfo;
  handleClientSessionsRef.current = handleClientSessions;
  hasBookingsRef.current = bookings.length > 0;

  const previewMode = Boolean(user?.isHomePreview);
  const previewBookings = PREVIEW_BOOKINGS.filter(
    booking => getBookingStatus(booking) === activeStatus,
  );
  const visibleBookings = (previewMode ? previewBookings : bookings).filter(
    booking => getBookingStatus(booking) === activeStatus,
  );

  const loadBookings = useCallback(
    async (status, refreshingRequest = false) => {
      if (previewMode) {
        return;
      }

      refreshingRequest
        ? setRefreshing(true)
        : !hasBookingsRef.current && setLoading(true);
      setLoadError(false);
      try {
        const results = await Promise.allSettled(
          BOOKING_STATUSES.map(async tabStatus => {
            const [bookingDetails, sessionDetails] = await Promise.all([
              fetchBookingInfoRef.current(tabStatus, refreshingRequest),
              handleClientSessionsRef.current(tabStatus, refreshingRequest),
            ]);
            return [
              ...new Map(
                [...(bookingDetails || []), ...(sessionDetails || [])]
                  .filter(item => getBookingStatus(item) === tabStatus)
                  .map(item => [String(item._id), item]),
              ).values(),
            ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          }),
        );
        const nextStatusBookings = {};
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            nextStatusBookings[BOOKING_STATUSES[index]] = result.value;
          }
        });
        if (!nextStatusBookings[status]) {
          throw results.find(result => result.status === 'rejected')?.reason;
        }
        const activeBookings = nextStatusBookings[status];
        setBookings(activeBookings);
        setStatusBookings(nextStatusBookings);

        const seenKey = `@notarizr/client-booking-seen:${
          user?._id || 'unknown'
        }`;
        const stored = await AsyncStorage.getItem(seenKey);
        const currentSignatures = Object.fromEntries(
          BOOKING_STATUSES.map(tabStatus => [
            tabStatus,
            (nextStatusBookings[tabStatus] || []).map(getSeenSignature),
          ]),
        );
        if (stored === null) {
          await AsyncStorage.setItem(
            seenKey,
            JSON.stringify(currentSignatures),
          );
          setUnseenCounts({});
        } else {
          const seen = JSON.parse(stored);
          setUnseenCounts(
            Object.fromEntries(
              BOOKING_STATUSES.map(tabStatus => [
                tabStatus,
                currentSignatures[tabStatus].filter(
                  signature => !(seen[tabStatus] || []).includes(signature),
                ).length,
              ]),
            ),
          );
        }
      } catch (error) {
        console.error('Failed to load bookings:', error);
        setLoadError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [previewMode, user?._id],
  );

  useFocusEffect(
    useCallback(() => {
      loadBookings(activeStatus);
    }, [activeStatus, loadBookings]),
  );

  const openBooking = booking => {
    // This screen is the CLIENT's own "Bookings" tab (the agent's tab uses
    // a separate AgentAllBookingScreen entirely). A client can never
    // accept/decline their own request — that's the notary's call — so
    // every card here opens the client-facing detail view regardless of
    // status, never the agent's ClientDetailsScreen/Accept-Decline screen.
    dispatch(setBookingInfoState(booking));
    dispatch(
      setCoordinates(booking?.booked_by?.current_location?.coordinates || []),
    );
    dispatch(setUser(booking?.agent || []));
    navigation.navigate('MedicalBookingScreen');
  };

  const changeStatus = async nextStatus => {
    const seenKey = `@notarizr/client-booking-seen:${user?._id || 'unknown'}`;
    try {
      const stored = await AsyncStorage.getItem(seenKey);
      const seen = stored ? JSON.parse(stored) : {};
      seen[nextStatus] = (statusBookings[nextStatus] || []).map(
        getSeenSignature,
      );
      await AsyncStorage.setItem(seenKey, JSON.stringify(seen));
    } catch (error) {
      console.warn('Could not save viewed booking updates:', error);
    }
    setUnseenCounts(current => ({...current, [nextStatus]: 0}));
    setActiveStatus(nextStatus);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={BookingColors.primary} size="small" />
          <Text style={styles.loadingText}>Loading bookings</Text>
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Bookings could not be loaded</Text>
          <Text style={styles.errorMessage}>
            Check your connection and try again.
          </Text>
          <BookingActionButton
            label="Try again"
            onPress={() => loadBookings(activeStatus)}
            style={styles.retryButton}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={visibleBookings}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <BookingCard booking={item} onPress={() => openBooking(item)} />
        )}
        ListEmptyComponent={<BookingEmptyState status={activeStatus} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            enabled={!previewMode}
            onRefresh={() => loadBookings(activeStatus, true)}
            refreshing={refreshing}
            tintColor={BookingColors.primary}
          />
        }
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
      <BookingHeader
        activeStatus={activeStatus}
        count={visibleBookings.length}
        onChangeStatus={changeStatus}
        tabs={[
          {
            label: 'Accepted',
            value: 'accepted',
            unreadCount: unseenCounts.accepted,
          },
          {
            label: 'Pending',
            value: 'pending',
            unreadCount: unseenCounts.pending,
          },
          {
            label: 'Completed',
            value: 'completed',
            unreadCount: unseenCounts.completed,
          },
          {
            label: 'Cancelled',
            value: 'rejected',
            unreadCount: unseenCounts.rejected,
          },
        ]}
      />
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BookingColors.surface,
  },
  content: {
    flex: 1,
    backgroundColor: BookingColors.background,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  errorTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  errorMessage: {
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
  },
});
