import React, {useEffect, useState} from 'react';
import {useQuery} from '@apollo/client';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {EventRegister} from 'react-native-event-listeners';
import Feather from 'react-native-vector-icons/Feather';
import {GET_NOTIFICATIONS_BY_ID} from '../../../request/queries/getNotificationsbyId.query';

export default function HomeHeader({navigation, user}) {
  const [notificationCount, setNotificationCount] = useState(
    user?.isHomePreview ? 2 : 0,
  );
  const {data, refetch} = useQuery(GET_NOTIFICATIONS_BY_ID, {
    variables: {page: 1, limit: 1},
    skip: Boolean(user?.isHomePreview || !user?._id),
    fetchPolicy: 'no-cache',
  });
  const avatar = user?.profile_picture
    ? {uri: user.profile_picture}
    : require('../../../assets/userPic.png');

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      'notification',
      notification => setNotificationCount(notification?.count || 0),
    );
    return () => EventRegister.removeEventListener(listener);
  }, []);

  useEffect(() => {
    if (!user?.isHomePreview) {
      setNotificationCount(data?.getNotificationById?.unreadCount || 0);
    }
  }, [data, user?.isHomePreview]);

  useEffect(() => {
    if (user?.isHomePreview) {
      return undefined;
    }
    return navigation.addListener('focus', () => refetch());
  }, [navigation, refetch, user?.isHomePreview]);

  return (
    <View style={styles.container}>
      <Image source={avatar} style={styles.avatar} />
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>WELCOME BACK</Text>
        <Text numberOfLines={1} style={styles.greeting}>
          Hi, {user?.first_name || 'there'}
        </Text>
      </View>
      <TouchableOpacity
        accessibilityLabel="Notifications"
        activeOpacity={0.7}
        onPress={() => navigation.navigate('NotificationScreen')}
        style={styles.notificationButton}>
        <Feather name="bell" size={20} color="#202632" />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF0F3',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  eyebrow: {
    color: '#9399A3',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  greeting: {
    marginTop: 1,
    color: '#151B27',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  notificationButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 5,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: '#F7F8FA',
    borderRadius: 7,
    backgroundColor: '#FD6D1F',
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 7,
  },
});
