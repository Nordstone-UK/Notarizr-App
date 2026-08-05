import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const STATUS_STYLES = {
  accepted: {background: '#EAF7EF', color: '#168A52', label: 'Accepted'},
  pending: {background: '#FFF5DC', color: '#A86900', label: 'Pending'},
  completed: {background: '#EAF2FC', color: '#2571B9', label: 'Completed'},
  rejected: {background: '#FCEEEE', color: '#C44242', label: 'Cancelled'},
  cancelled: {background: '#FCEEEE', color: '#C44242', label: 'Cancelled'},
};

const formatService = value =>
  value === 'mobile_notary' ? 'Mobile notary' : 'Remote online notary';

const formatDate = value => {
  if (!value) {
    return 'Date to be confirmed';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function BookingCard({booking, onPress}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const status = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const agent = booking.agent || {};
  const name =
    booking.agentName ||
    [agent.first_name, agent.last_name].filter(Boolean).join(' ') ||
    'Notary assigned soon';
  const avatar =
    booking.avatar ||
    (agent.profile_picture ? {uri: agent.profile_picture} : null);
  const avatarIdentity =
    typeof avatar === 'object' && avatar !== null ? avatar.uri : avatar;
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(value => value[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const date = booking.displayDate || formatDate(booking.date_of_booking);
  const time =
    booking.displayTime || booking.time_of_booking || 'Time to be confirmed';
  const location =
    booking.location ||
    agent.location ||
    (booking.service_type === 'mobile_notary'
      ? 'Address to be confirmed'
      : 'Secure video appointment');

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarIdentity]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.76}
      onPress={onPress}
      style={styles.card}>
      <View style={styles.topRow}>
        <View
          style={[styles.statusBadge, {backgroundColor: status.background}]}>
          <View style={[styles.statusDot, {backgroundColor: status.color}]} />
          <Text style={[styles.statusText, {color: status.color}]}>
            {status.label}
          </Text>
        </View>
        <Text style={styles.reference}>
          #
          {booking.reference ||
            String(booking._id || '')
              .slice(-6)
              .toUpperCase()}
        </Text>
      </View>

      <View style={styles.providerRow}>
        {booking.unassigned ? (
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={21} color="#A86900" />
          </View>
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>{initials || 'N'}</Text>
            {avatar && !avatarFailed ? (
              <Image
                onError={() => setAvatarFailed(true)}
                source={avatar}
                style={styles.avatarImage}
              />
            ) : null}
          </View>
        )}
        <View style={styles.providerCopy}>
          <Text numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          <Text style={styles.service}>
            {formatService(booking.service_type)}
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color="#9AA0AA" />
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Feather name="calendar" size={16} color="#FD6D1F" />
          <View style={styles.detailCopy}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text numberOfLines={1} style={styles.detailValue}>
              {date}
            </Text>
          </View>
        </View>
        <View style={styles.detailItem}>
          <Feather name="clock" size={16} color="#FD6D1F" />
          <View style={styles.detailCopy}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text numberOfLines={1} style={styles.detailValue}>
              {time}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Feather
          name={booking.service_type === 'mobile_notary' ? 'map-pin' : 'video'}
          size={16}
          color="#7A818D"
        />
        <Text numberOfLines={1} style={styles.locationText}>
          {location}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderRadius: 7,
  },
  statusDot: {
    width: 6,
    height: 6,
    marginRight: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  reference: {
    color: '#969CA6',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F2F4',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#FFF5DC',
  },
  providerCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  name: {
    color: '#181E2A',
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  service: {
    marginTop: 2,
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: '#ECEEF1',
  },
  detailsGrid: {
    flexDirection: 'row',
  },
  detailItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },
  detailLabel: {
    color: '#969CA6',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  detailValue: {
    marginTop: 1,
    color: '#303642',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    color: '#666E7A',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
});
