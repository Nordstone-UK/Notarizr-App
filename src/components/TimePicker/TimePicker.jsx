import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';

export default function TimePicker({
  Text: label,
  containerStyle,
  date = new Date(),
  labelStyle,
  mode = 'time',
  onConfirm,
  textStyle,
}) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.72}
        onPress={() => setOpen(true)}
        style={styles.control}>
        <Feather name="clock" size={17} color="#D65322" />
        <Text style={[styles.value, textStyle]}>
          {moment(selectedDate).format('h:mm A')}
        </Text>
        <Feather name="chevron-down" size={16} color="#9298A2" />
      </TouchableOpacity>
      <DatePicker
        date={selectedDate}
        modal
        mode={mode}
        onCancel={() => setOpen(false)}
        onConfirm={nextDate => {
          setSelectedDate(nextDate);
          setOpen(false);
          onConfirm?.(nextDate);
        }}
        open={open}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, minWidth: 0},
  label: {
    marginBottom: 7,
    color: '#59616D',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  control: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  value: {
    flex: 1,
    marginLeft: 8,
    color: '#252C37',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
});
