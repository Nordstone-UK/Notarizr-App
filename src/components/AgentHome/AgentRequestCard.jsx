import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  formatBookingDate,
  formatBookingTime,
  getBookingDisplayId,
  getBookingLocation,
} from '../../utils/bookingPresentation';

export default function AgentRequestCard({booking, onPress}) {
  const client = booking?.booked_by || {};
  const avatarSource = client.profile_picture
    ? {uri: client.profile_picture}
    : require('../../../assets/userPic.png');

  return (
    <TouchableOpacity
      activeOpacity={0.74}
      onPress={onPress}
      style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.serviceBadge}>
          <Feather
            name={booking?.service_type === 'ron' ? 'video' : 'map-pin'}
            size={12}
            color="#D65322"
          />
          <Text style={styles.serviceText}>
            {booking?.service_type === 'ron'
              ? 'Remote online'
              : 'Mobile notary'}
          </Text>
        </View>
        <Text style={styles.requestId}>#{getBookingDisplayId(booking)}</Text>
      </View>

      <View style={styles.clientRow}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.clientCopy}>
          <Text numberOfLines={1} style={styles.clientName}>
            {[client.first_name, client.last_name].filter(Boolean).join(' ') ||
              'Notarizr client'}
          </Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.price}>
            {'$' + Number(booking?.totalPrice || 0).toFixed(0)}
          </Text>
          <Text style={styles.estimate}>estimate</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={14} color="#717986" />
          <Text numberOfLines={1} style={styles.detailText}>
            {formatBookingDate(booking)} at {formatBookingTime(booking)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="map-pin" size={14} color="#717986" />
          <Text numberOfLines={1} style={styles.detailText}>
            {getBookingLocation(booking)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.statusDot} />
        <Text style={styles.status}>Awaiting your response</Text>
        <Text style={styles.review}>Review</Text>
        <Feather name="chevron-right" size={16} color="#D65322" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
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
  serviceBadge: {
    height: 27,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderRadius: 6,
    backgroundColor: '#FFF0E7',
  },
  serviceText: {
    marginLeft: 5,
    color: '#C94D1C',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  requestId: {color: '#A0A5AE', fontFamily: 'Manrope-SemiBold', fontSize: 9},
  clientRow: {flexDirection: 'row', alignItems: 'center', marginTop: 14},
  avatar: {width: 46, height: 46, borderRadius: 23, backgroundColor: '#EEF0F3'},
  clientCopy: {flex: 1, minWidth: 0, marginLeft: 11},
  clientName: {color: '#171D29', fontFamily: 'Manrope-Bold', fontSize: 14},
  document: {
    marginTop: 2,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  priceBlock: {alignItems: 'flex-end', marginLeft: 10},
  price: {color: '#171D29', fontFamily: 'Manrope-Bold', fontSize: 16},
  estimate: {color: '#9A9FA8', fontFamily: 'Manrope-Regular', fontSize: 8},
  details: {
    marginTop: 14,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F2',
  },
  detailRow: {flexDirection: 'row', alignItems: 'center', marginTop: 7},
  detailText: {
    flex: 1,
    marginLeft: 8,
    color: '#69717D',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F2',
  },
  statusDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: '#F4A11A'},
  status: {
    flex: 1,
    marginLeft: 7,
    color: '#8A6A24',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
  },
  review: {
    marginRight: 3,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
});
