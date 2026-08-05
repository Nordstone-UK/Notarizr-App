import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {useFocusEffect} from '@react-navigation/native';
import OneSignal from 'react-native-onesignal';
import {useDispatch, useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import BookingCard from '../../components/Bookings/BookingCard';
import LoginBottomSheet from '../../components/CustomBottomSheet/LoginBottomSheet';
import HomeHeader from '../../components/Home/HomeHeader';
import HomeSectionHeader from '../../components/Home/HomeSectionHeader';
import HomeServiceCard from '../../components/Home/HomeServiceCard';
import {PREVIEW_BOOKINGS} from '../../data/previewBookings';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../features/booking/bookingSlice';
import useFetchBooking from '../../hooks/useFetchBooking';

const renderBlockedBackdrop = props => (
  <BottomSheetBackdrop
    {...props}
    enableTouchThrough
    opacity={0.9}
    pressBehavior="none"
  />
);

export default function HomeScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const {fetchBookingInfo} = useFetchBooking();
  const fetchBookingInfoRef = useRef(fetchBookingInfo);
  const blockedSheetRef = useRef(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoginVisible, setLoginVisible] = useState(false);

  fetchBookingInfoRef.current = fetchBookingInfo;

  const previewMode = Boolean(user?.isHomePreview);
  const isBlocked = Boolean(user?.isBlocked);
  const visibleBookings = previewMode
    ? PREVIEW_BOOKINGS.filter(booking => booking.status === 'accepted').slice(
        0,
        1,
      )
    : activeBookings;

  const loadActiveBookings = useCallback(
    async (refreshingRequest = false) => {
      if (previewMode || !user) {
        return;
      }

      refreshingRequest ? setRefreshing(true) : setLoading(true);
      try {
        const [accepted, pending] = await Promise.all([
          fetchBookingInfoRef.current('accepted'),
          fetchBookingInfoRef.current('pending'),
        ]);
        const merged = [
          ...(Array.isArray(accepted) ? accepted : []),
          ...(Array.isArray(pending) ? pending : []),
        ].sort(
          (a, b) => new Date(a.date_of_booking) - new Date(b.date_of_booking),
        );
        setActiveBookings(merged);
      } catch (error) {
        console.error('Failed to load active bookings:', error);
        setActiveBookings([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [previewMode, user],
  );

  useEffect(() => {
    if (!previewMode && user?._id) {
      OneSignal.setExternalUserId(user._id);
    }
  }, [previewMode, user]);

  useFocusEffect(
    useCallback(() => {
      loadActiveBookings();
    }, [loadActiveBookings]),
  );

  const openService = serviceType => {
    if (!user) {
      setLoginVisible(true);
      return;
    }
    navigation.navigate('BookingFlowScreen', {serviceType});
  };

  const openBooking = booking => {
    dispatch(setBookingInfoState(booking));
    dispatch(
      setCoordinates(booking?.booked_by?.current_location?.coordinates || []),
    );
    dispatch(setUser(booking?.agent || []));
    navigation.navigate('MedicalBookingScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <HomeHeader navigation={navigation} user={user} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            enabled={!previewMode}
            onRefresh={() => loadActiveBookings(true)}
            refreshing={refreshing}
            tintColor="#FD6D1F"
          />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>What can we notarize today?</Text>
          <Text style={styles.introSubtitle}>
            Choose the service that works best for your document.
          </Text>
        </View>

        <HomeServiceCard
          accentColor="#D65322"
          backgroundColor="#FFF4EE"
          description="A verified notary meets you at your preferred address."
          icon="map-pin"
          image={require('../../../assets/service1Pic.png')}
          onPress={() => openService('mobile_notary')}
          tag="AT YOUR LOCATION"
          title="Mobile notary"
        />
        <HomeServiceCard
          accentColor="#2878A9"
          backgroundColor="#EEF7FC"
          description="Meet a notary securely by video from wherever you are."
          icon="video"
          image={require('../../../assets/service2Pic.png')}
          onPress={() => openService('remote_online_notary')}
          tag="ONLINE SESSION"
          title="Remote online"
        />

        <View style={styles.bookingsSection}>
          <HomeSectionHeader
            actionLabel="View all"
            onAction={() => navigation.navigate('AllBookingScreen')}
            subtitle="Your next confirmed appointment"
            title="Active booking"
          />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FD6D1F" size="small" />
              <Text style={styles.loadingText}>Loading your appointments</Text>
            </View>
          ) : visibleBookings.length > 0 ? (
            visibleBookings
              .slice(0, 1)
              .map(booking => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onPress={() => openBooking(booking)}
                />
              ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather name="calendar" size={21} color="#FD6D1F" />
              </View>
              <View style={styles.emptyCopy}>
                <Text style={styles.emptyTitle}>No active bookings</Text>
                <Text style={styles.emptyMessage}>
                  Your next appointment will appear here.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {isBlocked && (
        <BottomSheet
          ref={blockedSheetRef}
          backdropComponent={renderBlockedBackdrop}
          enableContentPanningGesture={false}
          enableHandlePanningGesture={false}
          enableOverDrag={false}
          index={1}
          snapPoints={['45%', '45%']}>
          <View style={styles.blockedContent}>
            <Text style={styles.blockedTitle}>Account unavailable</Text>
            <Text style={styles.blockedMessage}>
              Your account has been blocked. Contact support for assistance.
            </Text>
          </View>
        </BottomSheet>
      )}

      <LoginBottomSheet
        Title="Please log in to use this service"
        isVisible={isLoginVisible}
        onCloseModal={() => setLoginVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 28,
    backgroundColor: '#F7F8FA',
  },
  intro: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 4,
  },
  introTitle: {
    color: '#141A27',
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
    lineHeight: 31,
  },
  introSubtitle: {
    marginTop: 4,
    color: '#7F8691',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
  },
  bookingsSection: {
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E4E7EB',
  },
  loadingContainer: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 9,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 14,
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
    backgroundColor: '#FFF0E7',
  },
  emptyCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  emptyTitle: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  emptyMessage: {
    marginTop: 2,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  blockedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  blockedTitle: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  blockedMessage: {
    marginTop: 8,
    color: '#737B87',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
