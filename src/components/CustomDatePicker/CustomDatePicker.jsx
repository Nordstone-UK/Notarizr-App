import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React, {useState, useEffect} from 'react';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function CustomDatePicker(props) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(props.date);

  const isEditable = props.editable !== false; // Default is editable unless explicitly set to false.
  const handleCancel = () => {
    setOpen(false);
  };
  const maxDate = new Date('2021-01-01');
  const minDate = new Date('1930-01-01');
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          if (isEditable) {
            setOpen(true);
          }
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 2,
          paddingVertical: widthToDp(5),
          borderRadius: 15,
          borderColor: '#D3D5DA',
          width: widthToDp(90),
          alignSelf: 'center',
          marginTop: heightToDp(5),
          marginBottom: heightToDp(2),
        }}>
        <Image
          source={require('../../../assets/calenderIcon.png')}
          style={{
            width: widthToDp(5),
            height: heightToDp(5),
            marginHorizontal: widthToDp(1),
            tintColor: Colors.DullTextColor,
          }}
        />
        <Text
          style={[
            {
              fontFamily: 'Manrope-SemiBold',
              fontSize: widthToDp(4),
              alignSelf: 'center',
              marginLeft: widthToDp(5),
              color: Colors.Black,
            },
            props.textStyle,
          ]}>
          {moment(selectedDate).format('DD/MM/YYYY')}
        </Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={open}
        onConfirm={date => {
          props.onConfirm(date);
          setSelectedDate(date);
          setOpen(false);
        }}
        onCancel={handleCancel}
        mode="date"
        maximumDate={new Date()}
        // minimumDate={new Date(1950, 11, 31)}
        date={selectedDate}
      />
      {props.Text && (
        <Text
          style={[
            {
              position: 'absolute',
              left: widthToDp(15),
              top: widthToDp(2),
              padding: 2,
              fontSize: 15,
              color: Colors.InputTextColor,
              zIndex: 3,
              backgroundColor: '#fff',
            },
            props.labelStyle,
          ]}>
          {props.Text}
        </Text>
      )}
    </View>
  );
}
