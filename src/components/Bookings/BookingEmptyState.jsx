import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';

const COPY = {
  accepted: {
    title: 'No accepted bookings',
    message: 'Confirmed appointments will appear here.',
  },
  pending: {
    title: 'No pending requests',
    message: 'New booking requests will appear here.',
  },
  completed: {
    title: 'No completed bookings',
    message: 'Finished appointments will appear here.',
  },
  rejected: {
    title: 'No cancelled bookings',
    message: 'Cancelled or rejected requests will appear here.',
  },
};

export default function BookingEmptyState({status}) {
  const copy = COPY[status] || COPY.accepted;

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Feather name="calendar" size={24} color={BookingColors.primary} />
      </View>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.message}>{copy.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 90,
  },
  iconBox: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  title: {
    marginTop: 16,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  message: {
    marginTop: 5,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
});
