import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useMutation, useQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import {UPDATE_ONLINE_STATUS} from '../../../request/mutations/updateOnlineStatus.mutation';
import {GET_NOTIFICATIONS_BY_ID} from '../../../request/queries/getNotificationsbyId.query';
import {saveUserInfo} from '../../features/user/userSlice';

export default function AgentHomeHeader({
  SearchEnabled,
  Switch: showSwitch,
  Title,
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  const [isOnline, setIsOnline] = useState(user?.online_status === 'online');
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateOnlineStatus] = useMutation(UPDATE_ONLINE_STATUS);
  const {data: notificationData} = useQuery(GET_NOTIFICATIONS_BY_ID, {
    variables: {page: 1, limit: 1},
    skip: !user?._id,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    setIsOnline(user?.online_status === 'online');
  }, [user?.online_status]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.profile_picture]);

  const toggleAvailability = async nextValue => {
    if (updating) {
      return;
    }

    const previousValue = isOnline;
    setIsOnline(nextValue);
    setUpdating(true);
    try {
      const {data} = await updateOnlineStatus({
        variables: {onlineStatus: nextValue ? 'online' : 'offline'},
      });
      if (data?.updateOnlineStatusR?.status !== '204') {
        throw new Error('Status update failed');
      }
      dispatch(
        saveUserInfo({
          ...user,
          online_status: nextValue ? 'online' : 'offline',
        }),
      );
      Toast.show({
        type: 'success',
        text1: nextValue ? 'You are available' : 'You are offline',
        text2: nextValue
          ? 'New service requests can now reach you.'
          : 'New requests are paused.',
      });
    } catch (error) {
      setIsOnline(previousValue);
      Toast.show({
        type: 'error',
        text1: 'Availability not updated',
        text2: 'Check your connection and try again.',
      });
    } finally {
      setUpdating(false);
    }
  };

  const unreadCount = notificationData?.getNotificationById?.unreadCount || 0;
  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map(value => value[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.header}>
      <View style={styles.mainRow}>
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarText}>{initials || 'N'}</Text>
          {user?.profile_picture && !avatarFailed ? (
            <Image
              onError={() => setAvatarFailed(true)}
              source={{uri: user.profile_picture}}
              style={styles.avatarImage}
            />
          ) : null}
        </View>
        <View style={styles.identity}>
          <Text style={styles.eyebrow}>NOTARY DASHBOARD</Text>
          <Text numberOfLines={1} style={styles.name}>
            {[user?.first_name, user?.last_name].filter(Boolean).join(' ')}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="Notifications"
          activeOpacity={0.72}
          onPress={() => navigation.navigate('NotificationScreen')}
          style={styles.notificationButton}>
          <Feather name="bell" size={20} color="#202632" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {showSwitch && (
        <View style={styles.availabilityRow}>
          <View style={[styles.statusDot, isOnline && styles.onlineDot]} />
          <View style={styles.availabilityCopy}>
            <Text style={styles.availabilityTitle}>
              {isOnline ? 'Available for requests' : 'Currently offline'}
            </Text>
            <Text style={styles.availabilityText}>
              {isOnline
                ? 'Clients can match with you'
                : 'New matches are paused'}
            </Text>
          </View>
          {updating && <ActivityIndicator color="#169B5B" size="small" />}
          <Switch
            disabled={updating}
            ios_backgroundColor="#D7DBE0"
            onValueChange={toggleAvailability}
            trackColor={{false: '#D7DBE0', true: '#BDE8D1'}}
            thumbColor={isOnline ? '#169B5B' : '#FFFFFF'}
            value={isOnline}
          />
        </View>
      )}

      {Title ? <Text style={styles.pageTitle}>{Title}</Text> : null}
      {SearchEnabled ? (
        <View style={styles.searchBox}>
          <Feather name="search" size={17} color="#858C97" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9BA1AA"
            style={styles.searchInput}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  mainRow: {flexDirection: 'row', alignItems: 'center'},
  avatar: {width: 48, height: 48, borderRadius: 24, backgroundColor: '#EDF0F3'},
  avatarFallback: {alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: '#D65322', fontFamily: 'Manrope-Bold', fontSize: 15},
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  identity: {flex: 1, minWidth: 0, marginLeft: 12},
  eyebrow: {color: '#969CA6', fontFamily: 'Manrope-Bold', fontSize: 8},
  name: {
    marginTop: 2,
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  notificationButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E5E9',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#FD6D1F',
  },
  notificationText: {color: '#FFFFFF', fontFamily: 'Manrope-Bold', fontSize: 7},
  availabilityRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: '#F4F6F7',
  },
  statusDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#A9AFB7'},
  onlineDot: {backgroundColor: '#169B5B'},
  availabilityCopy: {flex: 1, minWidth: 0, marginLeft: 9},
  availabilityTitle: {
    color: '#29303B',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  availabilityText: {
    marginTop: 1,
    color: '#8A9099',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  pageTitle: {
    marginTop: 18,
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
  },
  searchBox: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 9,
    paddingVertical: 0,
    color: '#202632',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
});
