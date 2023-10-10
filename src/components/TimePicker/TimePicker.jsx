import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function TimePicker(props) {
  // console.log(props.onConfirm);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(props.date);
  const handleCancel = () => {
    setOpen(false);
  };
  // useEffect(() => {
  //   console.log('In component', moment(selectedDate).format('h:mm A'));
  // }, [selectedDate]);
  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(true)}>
        <Text
          style={{
            fontFamily: 'Manrope-Bold',
            fontSize: widthToDp(4),
            color: Colors.TextColor,
          }}>
          {props.Text}
        </Text>
        <Text
          style={{
            color: Colors.Orange,
            fontFamily: 'Manrope-Bold',
            fontSize: widthToDp(5),
            borderWidth: 1,
            borderColor: Colors.Orange,
            paddingHorizontal: widthToDp(2),
            borderRadius: widthToDp(2),
          }}>
          {moment(selectedDate).format('h:mm A')}
        </Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={open}
        date={selectedDate}
        onConfirm={date => {
          props.onConfirm(date);
          setSelectedDate(date);
          setOpen(false);
        }}
        onCancel={handleCancel}
        mode="time"
      />
    </View>
  );
}

const styles = StyleSheet.create({});
