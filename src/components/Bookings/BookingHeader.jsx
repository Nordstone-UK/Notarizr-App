import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import BookingStatusTabs from './BookingStatusTabs';
import BookingColors from '../../themes/BookingColors';

export default function BookingHeader({
  activeStatus,
  count,
  onChangeStatus,
  subtitle = 'Manage your notary appointments',
  tabs,
  title = 'Bookings',
  showTabs = true,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {count} {count === 1 ? 'booking' : 'bookings'}
          </Text>
        </View>
      </View>
      {showTabs && (
        <View style={styles.tabs}>
          <BookingStatusTabs
            activeStatus={activeStatus}
            onChange={onChangeStatus}
            tabs={tabs}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 26,
  },
  subtitle: {
    marginTop: 2,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  countBadge: {
    marginTop: 2,
    marginLeft: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  countText: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  tabs: {
    marginTop: 18,
  },
});
