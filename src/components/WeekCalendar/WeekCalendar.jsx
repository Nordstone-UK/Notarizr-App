import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Button,
} from 'react-native';
import React, {useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {widthToDp} from '../../utils/Responsive';

export default function WeekCalendar() {
  const weekdays = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];

  const [selectedDays, setSelectedDays] = useState(['']);
  const handleChange = day => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  return (
    <View style={{margin: widthToDp(2)}}>
      <Text style={styles.monthHead}>WeekDays</Text>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={{marginVertical: widthToDp(5)}}>
        {weekdays.map(day => (
          <TouchableOpacity
            key={day}
            onPress={() => handleChange(day)}
            style={{}}>
            <LinearGradient
              style={styles.locationStyle}
              colors={
                selectedDays.includes(day)
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.white, Colors.white]
              }
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <View style={{marginHorizontal: widthToDp(2)}}>
                <Text
                  style={
                    selectedDays.includes(day)
                      ? styles.dateHeadingWhite
                      : styles.dateHeading
                  }>
                  {day}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  locationStyle: {
    borderRadius: 5,
    marginHorizontal: widthToDp(2),
    width: widthToDp(25),
  },
  monthHead: {
    alignSelf: 'center',
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-SemiBold',
    color: Colors.TextColor,
  },
  text: {
    color: Colors.TextColor,
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-SemiBold',
  },
  dateHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    textAlign: 'center',
  },
  dateHeadingWhite: {
    color: Colors.white,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    textAlign: 'center',
  },
  textWhite: {
    color: Colors.white,
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
  },
  Heading: {
    tintColor: Colors.TextColor,
    marginHorizontal: widthToDp(7),
  },
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
});
