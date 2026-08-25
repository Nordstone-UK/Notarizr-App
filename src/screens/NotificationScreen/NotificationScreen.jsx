import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  RefreshControl,
  SafeAreaView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMutation, useQuery} from '@apollo/client';
import Feather from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import NotificationHeader from '../../components/Notifications/NotificationHeader';
import NotificationRow from '../../components/Notifications/NotificationRow';
import {setBookingInfoState} from '../../features/booking/bookingSlice';
import useFetchBooking from '../../hooks/useFetchBooking';
import {
  buildBookingNotifications,
  mergeNotifications,
  normalizeApiNotification,
  normalizeChatInviteNotification,
  normalizePushNotification,
} from '../../utils/notificationCenter';
import {GET_ALL_CHATS} from '../../../request/queries/getAllChats.query';
import {
  GET_NOTIFICATIONS_BY_ID,
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
} from '../../../request/queries/getNotificationsbyId.query';

const PREVIEW_NOTIFICATIONS = [
  {
    id: 'notification-1',
    type: 'observer',
    title: 'Observer invitation',
    description: 'You were invited to join a secure online notary session.',
    displayTime: '2 minutes ago',
    group: 'Today',
    read: false,
  },
  {
    id: 'notification-2',
    type: 'booking',
    title: 'Appointment confirmed',
    description: 'Maya Chen accepted your mobile notary request for tomorrow.',
    displayTime: '18 minutes ago',
    group: 'Today',
    read: false,
  },
  {
    id: 'notification-3',
    type: 'message',
    title: 'New message from Maya',
    description: 'Please have your photo ID ready when I arrive.',
    displayTime: '1 hour ago',
    group: 'Today',
    read: true,
  },
  {
    id: 'notification-4',
    type: 'payment',
    title: 'Payment confirmed',
    description: 'Your appointment payment was completed successfully.',
    displayTime: 'Yesterday',
    group: 'Earlier',
    read: true,
  },
];

const BOOKING_STATUSES = [
  'pending',
  'accepted',
  'paid',
  'completed',
  'rejected',
  'cancelled',
];

const bookingIdFromNotification = item =>
  String(
    item?.booking?._id ||
      item?.metadata?.bookingId ||
      item?.metadata?.booking_id ||
      item?.metadata?.value ||
      '',
  );

export default function NotificationScreen({navigation}) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  const pushNotifications = useSelector(state => state.user.notifications);
  const previewMode = Boolean(user?.isHomePreview);
  const isAgent = String(user?.account_type || '').includes('agent');
  const readStorageKey = `notification-read:${user?._id || 'preview'}`;
  const bookingApi = useFetchBooking();
  const bookingApiRef = useRef(bookingApi);
  bookingApiRef.current = bookingApi;

  const [filter, setFilter] = useState('all');
  const [previewItems, setPreviewItems] = useState(PREVIEW_NOTIFICATIONS);
  const [bookingItems, setBookingItems] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [readIds, setReadIds] = useState([]);
  const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllNotificationsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const {data, loading, refetch} = useQuery(GET_NOTIFICATIONS_BY_ID, {
    variables: {page: 1, limit: 300},
    skip: previewMode || !user?._id,
    fetchPolicy: 'cache-and-network',
  });
  const {
    data: chatData,
    loading: chatsLoading,
    refetch: refetchChats,
  } = useQuery(GET_ALL_CHATS, {
    skip: previewMode || !user?._id,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(readStorageKey)
      .then(value => {
        if (!active) {
          return;
        }
        const parsed = value ? JSON.parse(value) : [];
        setReadIds(Array.isArray(parsed) ? parsed : []);
      })
      .catch(() => active && setReadIds([]));
    return () => {
      active = false;
    };
  }, [readStorageKey]);

  const loadBookingNotifications = useCallback(
    async (forceRefresh = false) => {
      if (previewMode || !user?._id) {
        setBookingItems([]);
        return;
      }

      setBookingLoading(true);
      const api = bookingApiRef.current;
      const loaders = isAgent
        ? [api.fetchAgentBookingInfo, api.handleAgentSessions]
        : [api.fetchBookingInfo, api.handleClientSessions];

      try {
        const results = await Promise.allSettled(
          loaders.flatMap(loader =>
            BOOKING_STATUSES.map(status => loader(status, forceRefresh)),
          ),
        );
        const bookings = results.flatMap(result =>
          result.status === 'fulfilled' && Array.isArray(result.value)
            ? result.value
            : [],
        );
        setBookingItems(buildBookingNotifications(bookings, {isAgent}));
      } finally {
        setBookingLoading(false);
      }
    },
    [isAgent, previewMode, user?._id],
  );

  useEffect(() => {
    loadBookingNotifications();
  }, [loadBookingNotifications]);

  const fetchedItems = useMemo(
    () =>
      (data?.getNotificationById?.notifications || []).map(
        normalizeApiNotification,
      ),
    [data],
  );
  const liveItems = useMemo(
    () =>
      (Array.isArray(pushNotifications) ? pushNotifications : []).map(
        normalizePushNotification,
      ),
    [pushNotifications],
  );
  const chatInviteItems = useMemo(
    () =>
      (chatData?.getAllChat || [])
        .map(chat => normalizeChatInviteNotification(chat, user?._id))
        .filter(Boolean),
    [chatData?.getAllChat, user?._id],
  );
  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const remoteItems = useMemo(
    () =>
      mergeNotifications(
        fetchedItems,
        liveItems,
        chatInviteItems,
        bookingItems,
      ).map(item => ({
        ...item,
        read: item.read || readSet.has(item.id),
      })),
    [bookingItems, chatInviteItems, fetchedItems, liveItems, readSet],
  );

  const items = previewMode ? previewItems : remoteItems;
  const unreadCount = items.filter(item => !item.read).length;
  const visibleItems = items.filter(item => filter === 'all' || !item.read);
  const sections = ['Today', 'Earlier']
    .map(title => ({
      title,
      data: visibleItems.filter(item => item.group === title),
    }))
    .filter(section => section.data.length > 0);

  const persistReadIds = async nextIds => {
    const uniqueIds = [...new Set(nextIds)];
    setReadIds(uniqueIds);
    await AsyncStorage.setItem(readStorageKey, JSON.stringify(uniqueIds));
  };

  const markRead = async item => {
    if (previewMode) {
      setPreviewItems(current =>
        current.map(value =>
          value.id === item.id ? {...value, read: true} : value,
        ),
      );
      return;
    }

    await persistReadIds([...readIds, item.id]);
    if (item.source === 'api') {
      await markNotificationRead({variables: {notificationId: item.id}});
    }
  };

  const markAllRead = async () => {
    if (previewMode) {
      setPreviewItems(current => current.map(item => ({...item, read: true})));
      return;
    }

    await persistReadIds(items.map(item => item.id));
    try {
      await markAllNotificationsRead();
    } catch (_) {
      await refetch();
    }
  };

  const routeToMessages = () =>
    navigation.navigate('HomeScreen', {screen: 'ChatContactScreen'});
  const routeToBookings = () =>
    navigation.navigate('HomeScreen', {screen: 'AllBookingScreen'});

  const openNotification = async item => {
    markRead(item).catch(() => {});

    if (item.source === 'chat' && item.metadata?.chatId) {
      navigation.navigate('ChatScreen', {
        conversation: item.metadata.conversation,
        chatId: item.metadata.chatId,
        sender: user,
        receiver: item.metadata.participant,
      });
      return;
    }

    if (item.type === 'message' || item.type === 'observer') {
      routeToMessages();
      return;
    }

    if (item.type === 'session') {
      let booking = item.booking;
      const bookingId = bookingIdFromNotification(item);
      if (!booking && bookingId) {
        const response = await bookingApiRef.current.fetchBookingByID(
          bookingId,
        );
        booking = response?.getBookingById?.booking;
      }

      if (booking) {
        dispatch(setBookingInfoState(booking));
        navigation.navigate('WaitingRoomScreen', {
          uid: booking._id,
          channel: booking.agora_channel_name,
          token: booking.agora_channel_token,
          date: booking.date_of_booking,
          time: booking.time_of_booking,
        });
        return;
      }
    }

    if (['booking', 'payment', 'document', 'session'].includes(item.type)) {
      routeToBookings();
    }
  };

  const refreshNotifications = useCallback(async () => {
    if (previewMode) {
      return;
    }
    await Promise.allSettled([
      refetch(),
      refetchChats(),
      loadBookingNotifications(true),
    ]);
  }, [loadBookingNotifications, previewMode, refetch, refetchChats]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NotificationHeader
        navigation={navigation}
        onMarkAllRead={markAllRead}
        unreadCount={unreadCount}
      />
      <View style={styles.filters}>
        {[
          {id: 'all', label: 'All'},
          {
            id: 'unread',
            label: `Unread${unreadCount ? ` ${unreadCount}` : ''}`,
          },
        ].map(option => (
          <TouchableOpacity
            activeOpacity={0.7}
            key={option.id}
            onPress={() => setFilter(option.id)}
            style={[
              styles.filterButton,
              filter === option.id && styles.filterButtonActive,
            ]}>
            <Text
              style={[
                styles.filterText,
                filter === option.id && styles.filterTextActive,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <SectionList
        contentContainerStyle={
          sections.length ? styles.listContent : styles.emptyContent
        }
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            enabled={!previewMode}
            onRefresh={refreshNotifications}
            refreshing={
              !previewMode && (loading || chatsLoading || bookingLoading)
            }
            tintColor="#FD6D1F"
          />
        }
        renderItem={({item, index, section}) => (
          <NotificationRow
            item={item}
            last={index === section.data.length - 1}
            onPress={() => openNotification(item)}
          />
        )}
        renderSectionHeader={({section}) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        sections={sections}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="bell-off" size={28} color="#FD6D1F" />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'unread'
                ? 'No unread notifications'
                : 'No notifications yet'}
            </Text>
            <Text style={styles.emptyText}>
              Observer invitations, booking updates, session reminders,
              documents, payments, and messages will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyContent: {
    flexGrow: 1,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 44,
  },
  emptyText: {
    color: '#8B919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    marginTop: 16,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 7,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 18,
  },
  filterButtonActive: {
    backgroundColor: '#FFF0E8',
  },
  filterText: {
    color: '#7D8490',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#E95E16',
  },
  filters: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listContent: {
    paddingBottom: 28,
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  sectionTitle: {
    backgroundColor: '#F5F6F8',
    color: '#8B919C',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    paddingHorizontal: 20,
    paddingVertical: 11,
    textTransform: 'uppercase',
  },
});
