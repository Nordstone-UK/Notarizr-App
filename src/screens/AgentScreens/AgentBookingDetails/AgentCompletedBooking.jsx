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
import {setBookingInfoState} from '../../../features/booking/bookingSlice';
import useFetchBooking from '../../../hooks/useFetchBooking';
import {normalizeAgentBooking} from '../../../utils/agentBookingPresentation';

export default function AgentCompletedBooking({navigation}) {
  const {fetchAgentBookingInfo, handleAgentSessions} = useFetchBooking();
  const fetchBookingsRef = useRef(fetchAgentBookingInfo);
  const fetchSessionsRef = useRef(handleAgentSessions);
  const dispatch = useDispatch();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  fetchBookingsRef.current = fetchAgentBookingInfo;
  fetchSessionsRef.current = handleAgentSessions;

  const loadCompleted = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [bookingData, sessionData] = await Promise.all([
        fetchBookingsRef.current('completed'),
        fetchSessionsRef.current('completed'),
      ]);
      const merged = [
        ...(Array.isArray(bookingData) ? bookingData : []),
        ...(Array.isArray(sessionData) ? sessionData : []),
      ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(normalizeAgentBooking);
      setBookings(merged);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Completed jobs could not refresh',
        text2: 'Check your connection and try again.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCompleted();
    }, [loadCompleted]),
  );

  const openBooking = booking => {
    dispatch(setBookingInfoState(booking.raw));
    navigation.navigate('ClientDetailsScreen', {
      clientDetail: booking.raw,
    });
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
              <ActivityIndicator color="#2878A9" size="small" />
              <Text style={styles.loadingText}>Loading completed jobs...</Text>
            </View>
          ) : (
            <BookingEmptyState status="completed" />
          )
        }
        ListHeaderComponent={
          <BookingHeader
            count={bookings.length}
            showTabs={false}
            subtitle="Your completed mobile and remote appointments"
            title="Completed"
          />
        }
        refreshControl={
          <RefreshControl
            colors={['#2878A9']}
            onRefresh={() => loadCompleted(true)}
            refreshing={refreshing}
            tintColor="#2878A9"
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
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  listContent: {paddingBottom: 28, backgroundColor: '#F6F7F9'},
  emptyListContent: {flexGrow: 1},
  loadingState: {alignItems: 'center', paddingTop: 86},
  loadingText: {
    marginTop: 9,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
});
