import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';
import {getBookingDisplayId} from '../../utils/bookingPresentation';

const STATUS_META = {
  accepted: {
    background: BookingColors.successSoft,
    card: BookingColors.surface,
    border: BookingColors.border,
    color: BookingColors.success,
    label: 'Accepted',
  },
  pending: {
    background: BookingColors.warningSoft,
    card: BookingColors.surface,
    border: BookingColors.border,
    color: BookingColors.warning,
    label: 'Pending',
  },
  completed: {
    background: BookingColors.infoSoft,
    card: BookingColors.surface,
    border: BookingColors.border,
    color: BookingColors.info,
    label: 'Completed',
  },
  rejected: {
    background: BookingColors.errorSoft,
    card: BookingColors.surface,
    border: BookingColors.border,
    color: BookingColors.error,
    label: 'Cancelled',
  },
  cancelled: {
    background: BookingColors.errorSoft,
    card: BookingColors.surface,
    border: BookingColors.border,
    color: BookingColors.error,
    label: 'Cancelled',
  },
};

export default function AgentWorkspaceBookingCard({booking, onPress}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const status = STATUS_META[booking.status] || STATUS_META.pending;
  const isMobile = booking.service_type === 'mobile_notary';
  const initials = String(booking.agentName || 'Client')
    .split(' ')
    .filter(Boolean)
    .map(value => value[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const avatar = booking.avatar;
  const avatarIdentity =
    typeof avatar === 'object' && avatar !== null ? avatar.uri : avatar;
  const reference = getBookingDisplayId(booking);

  useEffect(() => setAvatarFailed(false), [avatarIdentity]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.78}
      onPress={onPress}
      style={[
        styles.bookingCard,
        {backgroundColor: status.card, borderColor: status.border},
      ]}>
      <View
        style={[styles.serviceAccent, !isMobile && styles.remoteServiceAccent]}
      />
      <View style={styles.cardBody}>
        <Feather
          name={isMobile ? 'truck' : 'monitor'}
          size={70}
          color={isMobile ? BookingColors.primary : BookingColors.info}
          style={styles.cardWatermark}
        />

        <View style={styles.cardTopRow}>
          <View style={styles.serviceIdentity}>
            <View
              style={[
                styles.serviceIcon,
                !isMobile && styles.remoteServiceIcon,
              ]}>
              <Feather
                name={isMobile ? 'truck' : 'monitor'}
                size={17}
                color={isMobile ? BookingColors.primary : BookingColors.info}
              />
            </View>
            <View style={styles.serviceCopy}>
              <Text style={styles.serviceLabel}>
                {isMobile ? 'Mobile notary' : 'Remote online notary'}
              </Text>
              <Text numberOfLines={1} style={styles.reference}>
                #{reference}
              </Text>
            </View>
          </View>
          <View
            style={[styles.statusBadge, {backgroundColor: status.background}]}>
            <View style={[styles.statusDot, {backgroundColor: status.color}]} />
            <Text style={[styles.statusText, {color: status.color}]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.clientRow}>
          <View style={[styles.avatar, !isMobile && styles.remoteAvatar]}>
            <Text
              style={[styles.avatarText, !isMobile && styles.remoteAvatarText]}>
              {initials || 'C'}
            </Text>
            {avatar && !avatarFailed ? (
              <Image
                onError={() => setAvatarFailed(true)}
                source={avatar}
                style={styles.avatarImage}
              />
            ) : null}
            <View
              style={[
                styles.avatarBadge,
                !isMobile && styles.remoteAvatarBadge,
              ]}>
              <Feather
                name={isMobile ? 'navigation' : 'wifi'}
                size={8}
                color={BookingColors.white}
              />
            </View>
          </View>
          <View style={styles.clientCopy}>
            <Text numberOfLines={1} style={styles.clientName}>
              {booking.agentName || 'Notarizr client'}
            </Text>
          </View>
          <View style={styles.openButton}>
            <Feather
              name="chevron-right"
              size={18}
              color={BookingColors.white}
            />
          </View>
        </View>

        <View style={styles.schedulePanel}>
          <View style={styles.dateBlock}>
            <View style={styles.scheduleIcon}>
              <Feather
                name="calendar"
                size={14}
                color={BookingColors.primary}
              />
            </View>
            <View style={styles.scheduleCopy}>
              <Text style={styles.scheduleLabel}>Date</Text>
              <Text numberOfLines={1} style={styles.scheduleValue}>
                {booking.displayDate}
              </Text>
            </View>
          </View>
          <View style={styles.scheduleDivider} />
          <View style={styles.timeBlock}>
            <View style={styles.scheduleIcon}>
              <Feather name="watch" size={14} color={BookingColors.primary} />
            </View>
            <View style={styles.scheduleCopy}>
              <Text style={styles.scheduleLabel}>Time</Text>
              <Text numberOfLines={1} style={styles.scheduleValue}>
                {booking.displayTime}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Feather
            name={isMobile ? 'map' : 'radio'}
            size={14}
            color={BookingColors.textSecondary}
          />
          <Text numberOfLines={1} style={styles.locationText}>
            {booking.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: BookingColors.primarySoft,
    borderColor: BookingColors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 46,
  },
  avatarBadge: {
    alignItems: 'center',
    backgroundColor: BookingColors.primary,
    borderColor: BookingColors.white,
    borderRadius: 7,
    borderWidth: 1,
    bottom: 2,
    height: 14,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    width: 14,
  },
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    height: 46,
    width: 46,
  },
  avatarText: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  bookingCard: {
    elevation: 2,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: BookingColors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    padding: 15,
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardWatermark: {
    opacity: 0.045,
    position: 'absolute',
    right: -11,
    top: 42,
  },
  clientCopy: {flex: 1, minWidth: 0, marginLeft: 11},
  clientLabel: {
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    marginTop: 2,
  },
  clientName: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  clientRow: {alignItems: 'center', flexDirection: 'row', marginTop: 16},
  dateBlock: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  locationRow: {alignItems: 'center', flexDirection: 'row', marginTop: 12},
  locationText: {
    color: BookingColors.textSecondary,
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    marginLeft: 7,
  },
  openButton: {
    alignItems: 'center',
    backgroundColor: BookingColors.primary,
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  reference: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
    marginTop: 2,
  },
  remoteAvatar: {
    backgroundColor: BookingColors.infoSoft,
    borderColor: BookingColors.borderStrong,
  },
  remoteAvatarBadge: {backgroundColor: BookingColors.info},
  remoteAvatarText: {color: BookingColors.info},
  remoteServiceAccent: {backgroundColor: BookingColors.info},
  remoteServiceIcon: {backgroundColor: BookingColors.infoSoft},
  scheduleCopy: {flex: 1, minWidth: 0, marginLeft: 7},
  scheduleDivider: {
    backgroundColor: BookingColors.border,
    height: 30,
    marginHorizontal: 12,
    width: 1,
  },
  scheduleIcon: {
    alignItems: 'center',
    backgroundColor: BookingColors.primarySoft,
    borderRadius: 7,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  scheduleLabel: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  schedulePanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(32,38,50,0.07)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 15,
    minHeight: 58,
    paddingHorizontal: 10,
  },
  scheduleValue: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    marginTop: 1,
  },
  serviceAccent: {backgroundColor: BookingColors.primary, width: 4},
  serviceCopy: {flex: 1, minWidth: 0, marginLeft: 10},
  serviceIcon: {
    alignItems: 'center',
    backgroundColor: BookingColors.primarySoft,
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  serviceIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
    paddingRight: 10,
  },
  serviceLabel: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: 7,
    flexDirection: 'row',
    height: 26,
    paddingHorizontal: 8,
  },
  statusDot: {borderRadius: 3, height: 6, marginRight: 5, width: 6},
  statusText: {fontFamily: 'Manrope-Bold', fontSize: 9},
  timeBlock: {
    alignItems: 'center',
    flex: 0.8,
    flexDirection: 'row',
    minWidth: 0,
  },
});
