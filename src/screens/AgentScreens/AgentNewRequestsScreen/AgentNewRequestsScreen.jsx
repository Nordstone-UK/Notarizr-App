import React, {useCallback, useRef, useState} from 'react';
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
          <AgentRequestCard booking={item} onPress={() => openRequest(item)} />
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
