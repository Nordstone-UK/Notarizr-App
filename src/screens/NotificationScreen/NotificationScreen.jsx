import React, {useEffect, useMemo, useState} from 'react';
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
import {useMutation, useQuery} from '@apollo/client';
import moment from 'moment';
import Feather from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';
import NotificationHeader from '../../components/Notifications/NotificationHeader';
import NotificationRow from '../../components/Notifications/NotificationRow';
import {
  GET_NOTIFICATIONS_BY_ID,
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
} from '../../../request/queries/getNotificationsbyId.query';

const PREVIEW_NOTIFICATIONS = [
  {
    id: 'notification-1',
    type: 'booking',
    title: 'Appointment confirmed',
    description: 'Maya Chen accepted your mobile notary request for tomorrow.',
    displayTime: '2 minutes ago',
    group: 'Today',
    read: false,
  },
  {
    id: 'notification-2',
    type: 'message',
    title: 'New message from Maya',
    description: 'Please have your photo ID ready when I arrive.',
    displayTime: '18 minutes ago',
    group: 'Today',
    read: false,
  },
  {
    id: 'notification-3',
    type: 'document',
    title: 'Documents received',
    description: 'Your power of attorney file was uploaded successfully.',
    displayTime: '1 hour ago',
    group: 'Today',
    read: true,
  },
  {
    id: 'notification-4',
    type: 'payment',
    title: 'Payment method verified',
    description: 'Your card ending in 2048 is ready for future bookings.',
    displayTime: 'Yesterday',
    group: 'Earlier',
    read: true,
  },
  {
    id: 'notification-5',
    type: 'system',
    title: 'Account protected',
    description: 'Phone verification was completed for your Notarizr account.',
    displayTime: 'Aug 2',
    group: 'Earlier',
    read: true,
  },
];

const normalizeNotification = item => {
  const numericDate = Number(item.createdAt);
  const date = moment(Number.isNaN(numericDate) ? item.createdAt : numericDate);

  return {
    id: item._id || item.id,
    type: item.type || 'system',
    title: item.title || 'Notarizr update',
    description: item.description || item.body || '',
    displayTime: date.isValid() ? date.fromNow() : 'Recently',
    group: date.isValid() && date.isSame(moment(), 'day') ? 'Today' : 'Earlier',
    read: Boolean(item.read || item.isRead),
  };
};

export default function NotificationScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const previewMode = Boolean(user?.isHomePreview);
  const [filter, setFilter] = useState('all');
  const [previewItems, setPreviewItems] = useState(PREVIEW_NOTIFICATIONS);
  const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllNotificationsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const {data, loading, refetch} = useQuery(GET_NOTIFICATIONS_BY_ID, {
    variables: {page: 1, limit: 300},
    skip: previewMode || !user?._id,
    fetchPolicy: 'cache-and-network',
  });

  const fetchedItems = useMemo(
    () =>
      (data?.getNotificationById?.notifications || []).map(
        normalizeNotification,
      ),
    [data],
  );
  const [remoteItems, setRemoteItems] = useState([]);

  useEffect(() => {
    setRemoteItems(fetchedItems);
  }, [fetchedItems]);

  const items = previewMode ? previewItems : remoteItems;
  const setItems = previewMode ? setPreviewItems : setRemoteItems;
  const unreadCount = items.filter(item => !item.read).length;
  const visibleItems = items.filter(item => filter === 'all' || !item.read);
  const sections = ['Today', 'Earlier']
    .map(title => ({
      title,
      data: visibleItems.filter(item => item.group === title),
    }))
    .filter(section => section.data.length > 0);

  const markRead = async id => {
    setItems(current =>
      current.map(item => (item.id === id ? {...item, read: true} : item)),
    );
    if (!previewMode) {
      await markNotificationRead({variables: {notificationId: id}});
    }
  };

  const markAllRead = async () => {
    setItems(current => current.map(item => ({...item, read: true})));
    if (!previewMode) {
      try {
        await markAllNotificationsRead();
      } catch (error) {
        await refetch();
      }
    }
  };

  const openNotification = item => {
    markRead(item.id).catch(() => refetch());
    if (item.type === 'booking' || item.type === 'payment') {
      navigation.navigate('HomeScreen', {screen: 'AllBookingScreen'});
    } else if (item.type === 'message') {
      navigation.navigate('HomeScreen', {screen: 'ChatContactScreen'});
    }
  };

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
            onRefresh={refetch}
            refreshing={!previewMode && loading}
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
              Booking, document, and message updates will appear here.
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
