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
  if (booking.status === 'cancelled' || booking.status === 'expired') {
    return 'rejected';
  }
  return booking.status;
};

export default function AllBookingScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const {fetchBookingInfo, handleClientSessions} = useFetchBooking();
  const fetchBookingInfoRef = useRef(fetchBookingInfo);
  const handleClientSessionsRef = useRef(handleClientSessions);
  const hasBookingsRef = useRef(false);
  const [activeStatus, setActiveStatus] = useState('accepted');
  const [bookings, setBookings] = useState([]);
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
  const visibleBookings = previewMode ? previewBookings : bookings;

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
        const [bookingDetails, sessionDetails] = await Promise.all([
          fetchBookingInfoRef.current(status, refreshingRequest),
          handleClientSessionsRef.current(status, refreshingRequest),
        ]);
        const merged = [
          ...(Array.isArray(bookingDetails) ? bookingDetails : []),
          ...(Array.isArray(sessionDetails) ? sessionDetails : []),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(merged);
      } catch (error) {
        console.error('Failed to load bookings:', error);
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
      loadBookings(activeStatus);
    }, [activeStatus, loadBookings]),
  );

  const openBooking = booking => {
    dispatch(setBookingInfoState(booking));
    dispatch(
      setCoordinates(booking?.booked_by?.current_location?.coordinates || []),
    );
    dispatch(setUser(booking?.agent || []));
    navigation.navigate('MedicalBookingScreen');
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
        onChangeStatus={setActiveStatus}
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
