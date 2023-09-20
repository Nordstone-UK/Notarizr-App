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
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, width, widthToDp} from '../../../utils/Responsive';
import Colors from '../../../themes/Colors';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import MainButton from '../../../components/MainGradientButton/MainButton';

export default function AgentAvailabilitySetupScreen({navigation}) {
  const dateInfo = [];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  for (let date = 1; date <= 31; date++) {
    // Calculate the day of the week using a helper function
    const day = calculateDayOfWeek(2023, 8, date); // August 2023, change as needed

    // Define the object for the current date
    const dateObject = {
      month: 'Aug', // Change to the desired month
      date: date.toString(),
      day: day,
    };

    // Add the object to the array
    dateInfo.push(dateObject);
  }
  function calculateDayOfWeek(year, month, day) {
    const date = new Date(year, month - 1, day);
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  }
  const [isFocused, setIsFocused] = useState('');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const handlePrevMonth = () => {
    // Handle moving to the previous month
    let newIndex = currentMonthIndex - 1;
    let newYear = currentYear;

    if (newIndex < 0) {
      newIndex = 11; // December
      newYear -= 1;
    }

    setCurrentMonthIndex(newIndex);
    setCurrentYear(newYear);
  };
  const handleNextMonth = () => {
    // Handle moving to the next month
    let newIndex = currentMonthIndex + 1;
    let newYear = currentYear;

    if (newIndex > 11) {
      newIndex = 0; // January
      newYear += 1;
    }

    setCurrentMonthIndex(newIndex);
    setCurrentYear(newYear);
  };
  const currentMonth = months[currentMonthIndex];
  const [timeInputs, setTimeInputs] = useState([{start: '', end: ''}]);

  const addMoreTimeInputs = () => {
    setTimeInputs([...timeInputs, {start: '', end: ''}]);
  };

  const handleTimeInputChange = (text, index, field) => {
    const updatedTimeInputs = [...timeInputs];
    updatedTimeInputs[index][field] = text;
    setTimeInputs(updatedTimeInputs);
  };

  return (
    <View style={styles.container}>
      <AgentHomeHeader Switch={true} />
      <View style={styles.headingContainer}>
        <Text style={styles.Heading}>Profile Setup</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.insideHeading}>
            Please provide us with your availability
          </Text>
          <View
            style={{
              backgroundColor: Colors.white,
              elevation: 20,
              borderRadius: 10,
              marginHorizontal: widthToDp(2),
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity onPress={handlePrevMonth}>
                <Image
                  source={require('../../../../assets/monthLeft.png')}
                  style={styles.month}
                />
              </TouchableOpacity>
              <Text style={styles.monthHead}>
                {currentMonth} {currentYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth}>
                <Image
                  source={require('../../../../assets/monthRight.png')}
                  style={styles.month}
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              {dateInfo.map((dateObj, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    marginHorizontal: widthToDp(2),
                    marginVertical: widthToDp(5),
                  }}
                  onPress={() => setIsFocused(dateObj.date)}>
                  <LinearGradient
                    style={styles.locationStyle}
                    colors={
                      isFocused === dateObj.date
                        ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                        : [Colors.white, Colors.white]
                    }
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}>
                    <View
                      style={[
                        {
                          paddingHorizontal: widthToDp(4),
                          paddingVertical: widthToDp(2),
                          alignItems: 'center',
                        },
                      ]}>
                      <Text
                        style={
                          isFocused === dateObj.date
                            ? styles.textWhite
                            : styles.text
                        }>
                        {currentMonth}
                      </Text>
                      <Text
                        style={
                          isFocused === dateObj.date
                            ? styles.dateHeadingWhite
                            : styles.dateHeading
                        }>
                        {dateObj.date}
                      </Text>
                      <Text
                        style={
                          isFocused === dateObj.date
                            ? styles.textWhite
                            : styles.text
                        }>
                        {dateObj.day}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{marginVertical: widthToDp(6)}}>
            {timeInputs.map((timeInput, index) => (
              <View key={index} style={styles.flexInput}>
                <LabelTextInput
                  style={styles.input}
                  leftImageSoucre={require('../../../../assets/clockIcon.png')}
                  LabelTextInput="Start Time"
                  Label={true}
                  labelStyle={{
                    left: widthToDp(3),
                    color: Colors.TextColor,
                  }}
                  value={timeInput.start}
                  AdjustWidth={{
                    width: widthToDp(45),
                    borderColor: Colors.DisableColor,
                  }}
                  onChangeText={text =>
                    handleTimeInputChange(text, index, 'start')
                  }
                />
                <LabelTextInput
                  style={styles.input}
                  Label={true}
                  LabelTextInput="End Time"
                  leftImageSoucre={require('../../../../assets/clockIcon.png')}
                  labelStyle={{
                    left: widthToDp(3),
                    color: Colors.TextColor,
                  }}
                  value={timeInput.end}
                  AdjustWidth={{
                    width: widthToDp(45),
                    borderColor: Colors.DisableColor,
                  }}
                  onChangeText={text =>
                    handleTimeInputChange(text, index, 'end')
                  }
                />
              </View>
            ))}
            <TouchableOpacity
              style={[styles.flexInput, {justifyContent: 'flex-end'}]}
              onPress={addMoreTimeInputs}>
              <Text style={[styles.text, {color: Colors.Orange}]}>
                Add More +
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomButton}>
            <View style={styles.flexInput}>
              <MainButton
                Title="Back"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                GradiStyles={{
                  paddingHorizontal: widthToDp(15),
                  paddingVertical: heightToDp(3),
                  borderRadius: 5,
                }}
                styles={{
                  paddingHorizontal: widthToDp(0),
                  paddingVertical: heightToDp(0),
                  fontSize: widthToDp(4),
                }}
                onPress={() => navigation.goBack()}
              />
              <MainButton
                Title="Next"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                GradiStyles={{
                  paddingHorizontal: widthToDp(15),
                  paddingVertical: heightToDp(3),
                  borderRadius: 5,
                }}
                styles={{
                  paddingHorizontal: widthToDp(0),
                  paddingVertical: heightToDp(0),
                  fontSize: widthToDp(4),
                }}
                onPress={() => navigation.navigate('AgentServicePereference')}
              />
            </View>
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  lightHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-SemiBold',
  },
  locationStyle: {
    borderRadius: 5,
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
    fontSize: widthToDp(8),
    fontFamily: 'Manrope-Bold',
    textAlign: 'center',
  },
  dateHeadingWhite: {
    color: Colors.white,
    fontSize: widthToDp(8),
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
  headingContainer: {
    marginLeft: widthToDp(4),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(3),
    marginHorizontal: widthToDp(5),
  },
  flexInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: widthToDp(4),
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: heightToDp(5),
  },
});
