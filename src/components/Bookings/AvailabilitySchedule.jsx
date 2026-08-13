import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';

const DAY_ORDER = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'];
const DAY_LABELS = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thur: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export default function AvailabilitySchedule({schedule}) {
  const availableDays = useMemo(() => {
    const entries = Array.isArray(schedule) ? schedule : [];

    return entries
      .filter(entry => DAY_LABELS[entry?.day] && entry?.slots?.length)
      .sort(
        (first, second) =>
          DAY_ORDER.indexOf(first.day) - DAY_ORDER.indexOf(second.day),
      );
  }, [schedule]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notary availability</Text>
      <View style={styles.card}>
        {availableDays.length ? (
          availableDays.map((entry, dayIndex) => (
            <View
              key={entry.day}
              style={[
                styles.dayRow,
                dayIndex === availableDays.length - 1 && styles.lastDayRow,
              ]}>
              <View style={styles.dayHeading}>
                <View style={styles.calendarIcon}>
                  <Feather
                    name="calendar"
                    size={15}
                    color={BookingColors.primary}
                  />
                </View>
                <Text style={styles.dayLabel}>{DAY_LABELS[entry.day]}</Text>
              </View>
              <View style={styles.slots}>
                {entry.slots.map((slot, slotIndex) => (
                  <View
                    key={`${entry.day}-${slot.startTime}-${slot.endTime}-${slotIndex}`}
                    style={styles.slot}>
                    <Feather
                      name="clock"
                      size={12}
                      color={BookingColors.textMuted}
                    />
                    <Text style={styles.slotText}>
                      {slot.startTime} – {slot.endTime}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather
              name="calendar"
              size={17}
              color={BookingColors.textMuted}
            />
            <Text style={styles.emptyText}>No availability is listed.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {marginHorizontal: 16, marginTop: 16},
  sectionTitle: {
    marginBottom: 8,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  lastDayRow: {borderBottomWidth: 0},
  dayHeading: {width: 112, flexDirection: 'row', alignItems: 'center'},
  calendarIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: BookingColors.primarySoft,
  },
  dayLabel: {
    marginLeft: 8,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  slots: {flex: 1, alignItems: 'flex-start'},
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  slotText: {
    marginLeft: 6,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  emptyText: {
    marginLeft: 8,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
});
