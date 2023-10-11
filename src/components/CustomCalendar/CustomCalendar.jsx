import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {Calendar} from 'react-native-calendars';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function CustomCalendar() {
  const [selected, setSelected] = useState('');

  return (
    <Calendar
      onDayPress={day => {
        console.log(day.dateString);
        setSelected(day.dateString);
      }}
      style={{
        color: Colors.Orange,
        borderColor: 'gray',
        elevation: 20,
        borderRadius: 10,
        width: widthToDp(95),
        alignSelf: 'center',
      }}
      theme={{
        backgroundColor: '#ffffff',
        calendarBackground: '#ffffff',
        textSectionTitleColor: '#b6c1cd',
        selectedDayBackgroundColor: Colors.Orange,
        selectedDayTextColor: '#ffffff',
        todayTextColor: Colors.Orange,
        dayTextColor: '#2d4150',
        textDisabledColor: '#d9e1e8',
        arrowColor: Colors.Orange,
      }}
      markedDates={{
        [selected]: {
          selected: true,
          disableTouchEvent: true,
          selectedDotColor: 'orange',
        },
      }}
    />
  );
}

const styles = StyleSheet.create({});
