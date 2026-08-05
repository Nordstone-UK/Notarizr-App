import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const LABELS = {
  mon: 'M',
  tue: 'T',
  wed: 'W',
  thur: 'T',
  fri: 'F',
  sat: 'S',
  sun: 'S',
};

export default function WeekCalendar({
  selectedDays = [],
  setSelectedDays = () => {},
  weekdays = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'],
}) {
  const toggleDay = day => {
    setSelectedDays(
      selectedDays.includes(day)
        ? selectedDays.filter(selected => selected !== day)
        : [...selectedDays, day],
    );
  };

  return (
    <View style={styles.container}>
      {weekdays.map(day => {
        const selected = selectedDays.includes(day);
        return (
          <TouchableOpacity
            accessibilityLabel={day}
            accessibilityState={{selected}}
            activeOpacity={0.72}
            key={day}
            onPress={() => toggleDay(day)}
            style={[styles.day, selected && styles.selectedDay]}>
            <Text style={[styles.dayLabel, selected && styles.selectedLabel]}>
              {LABELS[day] || day.slice(0, 1).toUpperCase()}
            </Text>
            <Text style={[styles.dayName, selected && styles.selectedName]}>
              {day === 'thur'
                ? 'Thu'
                : day.slice(0, 1).toUpperCase() + day.slice(1, 3)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flexDirection: 'row', justifyContent: 'space-between'},
  day: {
    width: 40,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E5E9',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedDay: {borderColor: '#FD6D1F', backgroundColor: '#FD6D1F'},
  dayLabel: {color: '#3A414D', fontFamily: 'Manrope-Bold', fontSize: 13},
  selectedLabel: {color: '#FFFFFF'},
  dayName: {
    marginTop: 2,
    color: '#9096A0',
    fontFamily: 'Manrope-Regular',
    fontSize: 7,
  },
  selectedName: {color: '#FFE2D3'},
});
