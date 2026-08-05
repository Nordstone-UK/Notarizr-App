import React, {useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import Toast from 'react-native-toast-message';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import BookingCard from '../../../components/Bookings/BookingCard';
import BookingEmptyState from '../../../components/Bookings/BookingEmptyState';
import BookingHeader from '../../../components/Bookings/BookingHeader';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../../features/booking/bookingSlice';
import useFetchBooking from '../../../hooks/useFetchBooking';
import {
  getBookingClient,
  getBookingServiceType,
  normalizeAgentBooking,
} from '../../../utils/agentBookingPresentation';

const AGENT_TABS = [
  {label: 'Accepted', value: 'accepted'},
  {label: 'Pending', value: 'pending'},
  {label: 'Cancelled', value: 'rejected'},
];

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
              <ActivityIndicator color="#D65322" size="small" />
              <Text style={styles.loadingText}>Loading bookings...</Text>
            </View>
          ) : (
            <BookingEmptyState status={activeStatus} />
          )
        }
        ListHeaderComponent={
          <BookingHeader
            activeStatus={activeStatus}
            count={bookings.length}
            onChangeStatus={changeStatus}
            subtitle="Review requests and manage upcoming appointments"
            tabs={AGENT_TABS}
          />
        }
        refreshControl={
          <RefreshControl
            colors={['#D65322']}
            onRefresh={() => loadBookings(activeStatus, true)}
            refreshing={refreshing}
            tintColor="#D65322"
          />
        }
        renderItem={({item}) => (
          <BookingCard booking={item} onPress={() => openBooking(item)} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 28,
    backgroundColor: '#F6F7F9',
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
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
});
