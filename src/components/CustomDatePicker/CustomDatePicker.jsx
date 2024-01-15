import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React, {useState, useEffect} from 'react';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function CustomDatePicker(props) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(props.date);
  const handleCancel = () => {
    setOpen(false);
  };
  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 2,
          paddingVertical: widthToDp(5),
          borderRadius: 15,
          borderColor: '#D3D5DA',
          width: widthToDp(90),
          alignSelf: 'center',
          marginTop: heightToDp(4),
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
              fontFamily: 'Manrope-Bold',
              fontSize: widthToDp(4.5),
              alignSelf: 'center',
              marginLeft: widthToDp(5),
              color: Colors.Black,
            },
            props.textStyle,
          ]}>
          {moment(selectedDate).format('MM/DD/YYYY')}
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
        mode="date"
      />
      {props.Text && (
        <Text
          style={[
            {
              position: 'absolute',
              left: widthToDp(15),
              top: widthToDp(1),
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
