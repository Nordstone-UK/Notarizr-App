import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import BookingStatusTabs from './BookingStatusTabs';

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
    borderBottomColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
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
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 26,
  },
  subtitle: {
    marginTop: 2,
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  countBadge: {
    marginTop: 2,
    marginLeft: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  countText: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  tabs: {
    marginTop: 18,
  },
});
