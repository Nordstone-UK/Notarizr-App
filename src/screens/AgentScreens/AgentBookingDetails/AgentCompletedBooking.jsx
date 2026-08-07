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
import Feather from 'react-native-vector-icons/Feather';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import BookingCard from '../../../components/Bookings/BookingCard';
import BookingEmptyState from '../../../components/Bookings/BookingEmptyState';
import {setBookingInfoState} from '../../../features/booking/bookingSlice';
import useFetchBooking from '../../../hooks/useFetchBooking';
import BookingColors from '../../../themes/BookingColors';
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
              <Text style={styles.loadingText}>Loading completed jobs...</Text>
            </View>
          ) : (
            <BookingEmptyState status="completed" />
          )
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.workspaceHero}>
              <View style={styles.heroGlow} />
              <View style={styles.titleCopy}>
                <Text style={styles.eyebrow}>SERVICE HISTORY</Text>
                <Text style={styles.title}>Completed</Text>
                <Text style={styles.subtitle}>
                  Your completed mobile and remote appointments
                </Text>
              </View>
              <View style={styles.countCard}>
                <Feather
                  name="check-circle"
                  size={15}
                  color={BookingColors.white}
                />
                <Text style={styles.countValue}>{bookings.length}</Text>
                <Text style={styles.countLabel}>
                  {bookings.length === 1 ? 'booking' : 'bookings'}
                </Text>
              </View>
            </View>
            <View style={styles.resultsRow}>
              <Text style={styles.resultsTitle}>Completed appointments</Text>
              <View style={styles.completeBadge}>
                <Feather name="archive" size={12} color={BookingColors.info} />
                <Text style={styles.completeText}>History</Text>
              </View>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl
            colors={[BookingColors.primary]}
            onRefresh={() => loadCompleted(true)}
            refreshing={refreshing}
            tintColor={BookingColors.primary}
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
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  listContent: {paddingBottom: 28, backgroundColor: BookingColors.background},
  listHeader: {paddingHorizontal: 16, paddingTop: 14},
  workspaceHero: {
    alignItems: 'center',
    backgroundColor: BookingColors.textPrimary,
    borderRadius: 8,
    flexDirection: 'row',
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
  titleCopy: {flex: 1, minWidth: 0, paddingRight: 14},
  eyebrow: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  title: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 26,
    marginTop: 3,
  },
  subtitle: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  countCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 66,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  countValue: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
    marginTop: 2,
  },
  countLabel: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    marginTop: 1,
  },
  resultsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    marginTop: 19,
  },
  resultsTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  completeBadge: {
    alignItems: 'center',
    backgroundColor: BookingColors.infoSoft,
    borderRadius: 7,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  completeText: {
    color: BookingColors.info,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    marginLeft: 5,
  },
  emptyListContent: {flexGrow: 1},
  loadingState: {alignItems: 'center', paddingTop: 86},
  loadingText: {
    marginTop: 9,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
});
