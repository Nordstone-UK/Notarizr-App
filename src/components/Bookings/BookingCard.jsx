import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';
import {
  formatBookingDate,
  formatBookingTime,
  getBookingDisplayId,
  getBookingLocation,
  getBookingServiceType,
} from '../../utils/bookingPresentation';

const STATUS_STYLES = {
  accepted: {
    background: BookingColors.successSoft,
    color: BookingColors.success,
    label: 'Accepted',
  },
  pending: {
    background: BookingColors.warningSoft,
    color: BookingColors.warning,
    label: 'Pending',
  },
  completed: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    label: 'Completed',
  },
  rejected: {
    background: BookingColors.errorSoft,
    color: BookingColors.error,
    label: 'Cancelled',
  },
  cancelled: {
    background: BookingColors.errorSoft,
    color: BookingColors.error,
    label: 'Cancelled',
  },
};

const formatService = value =>
  value === 'mobile_notary' ? 'Mobile notary' : 'Remote online notary';

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
  const serviceType = getBookingServiceType(booking);
  const date = formatBookingDate(booking);
  const time = formatBookingTime(booking);
  const location = getBookingLocation(booking);

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
        <Text numberOfLines={1} style={styles.reference}>
          #{getBookingDisplayId(booking)}
        </Text>
      </View>

      <View style={styles.providerRow}>
        {booking.unassigned ? (
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={21} color={BookingColors.warning} />
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
          <Text style={styles.service}>{formatService(serviceType)}</Text>
        </View>
        <Feather
          name="chevron-right"
          size={20}
          color={BookingColors.textMuted}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Feather name="calendar" size={16} color={BookingColors.primary} />
          <View style={styles.detailCopy}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text numberOfLines={1} style={styles.detailValue}>
              {date}
            </Text>
          </View>
        </View>
        <View style={styles.detailItem}>
          <Feather name="clock" size={16} color={BookingColors.primary} />
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
          name={serviceType === 'mobile_notary' ? 'map-pin' : 'video'}
          size={16}
          color={BookingColors.textMuted}
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
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
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
    color: BookingColors.textMuted,
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
    backgroundColor: BookingColors.backgroundSubtle,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: BookingColors.primary,
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
    backgroundColor: BookingColors.warningSoft,
  },
  providerCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  name: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  service: {
    marginTop: 2,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: BookingColors.border,
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
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  detailValue: {
    marginTop: 1,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
});
