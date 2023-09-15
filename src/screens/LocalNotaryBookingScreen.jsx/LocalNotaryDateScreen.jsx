import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';
import AgentCard from '../../components/AgentCard/AgentCard';
import MainButton from '../../components/MainGradientButton/MainButton';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import LinearGradient from 'react-native-linear-gradient';

export default function LocalNotaryDateScreen({navigation}) {
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
  const timeSlots = {
    slot1: '08:00-08:30',
    slot2: '08:30-09:00',
    slot3: '09:00-09:30',
    slot4: '09:30-10:00',
    slot5: '10:00-10:30',
    slot6: '10:30-11:00',
    slot7: '11:00-11:30',
    slot8: '11:30-12:00',
  };
  const timeSlots2 = {
    slot1: '03:00-03:30',
    slot2: '03:30-04:00',
    slot3: '04:00-04:30',
    slot4: '04:30-05:00',
    slot5: '05:00-05:30',
    slot6: '05:30-06:00',
    slot7: '06:00-06:30',
    slot8: '06:30-07:00',
    slot9: '07:00-07:30',
    slot10: '07:30-08:00',
    slot11: '08:00-08:30',
  };

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

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.namebar}>
          <View style={styles.flexContainer}>
            <Image
              source={require('../../../assets/agentReview.png')}
              style={styles.imagestyles}
            />
            <Text style={[styles.textHeading]}>Mary Smith</Text>
          </View>
          <View style={styles.flexContainer}>
            <Image
              source={require('../../../assets/Search.png')}
              style={styles.icon}
            />
            <Image
              source={require('../../../assets/bellIcon.png')}
              style={styles.icon}
            />
          </View>
        </View>
        <Text style={styles.heading}>Select date & time</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView scrollEnabled={true}>
          <View style={{marginVertical: heightToDp(5)}}>
            <Text style={styles.heading}>
              Please provide us with your availability
            </Text>
          </View>
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
                  source={require('../../../assets/monthLeft.png')}
                  style={styles.month}
                />
              </TouchableOpacity>
              <Text style={styles.monthHead}>
                {currentMonth} {currentYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth}>
                <Image
                  source={require('../../../assets/monthRight.png')}
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
          <Text style={styles.headingContainer}>Availability</Text>
          <Text style={styles.insideText}>Morning</Text>
          <View style={styles.dateContainer}>
            {Object.entries(timeSlots).map(([slotName, slotTime]) => (
              <TouchableOpacity key={slotName} style={styles.slot}>
                <Text style={styles.timeText}>{slotTime}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.insideText}>Afternoon</Text>
          <View style={styles.dateContainer}>
            {Object.entries(timeSlots2).map(([slotName, slotTime]) => (
              <TouchableOpacity key={slotName} style={styles.slot}>
                <Text style={styles.timeText}>{slotTime}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.buttonFlex}>
            <MainButton
              Title="Back"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                paddingHorizontal: widthToDp(5),
              }}
              styles={{
                paddingHorizontal: widthToDp(10),
                paddingVertical: widthToDp(3),
                fontSize: widthToDp(5),
              }}
              onPress={() => navigation.navigate('LocalNotaryMapScreen')}
            />
            <MainButton
              Title="Book"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                paddingHorizontal: widthToDp(5),
              }}
              styles={{
                paddingHorizontal: widthToDp(10),
                paddingVertical: widthToDp(3),
                fontSize: widthToDp(5),
              }}
              onPress={() => navigation.navigate('AgentBookCompletion')}
            />
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
  dateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(5),
  },
  timeText: {
    color: Colors.TextColor,
  },
  slot: {
    borderWidth: 1,
    borderColor: Colors.DullWhite,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    margin: 5,
    elevation: 15,
  },
  imagestyles: {
    width: widthToDp(15),
    height: heightToDp(15),
  },
  locationStyle: {
    borderRadius: 5,
    // padding: widthToDp(4),
    // alignItems: 'center',
  },
  namebar: {
    flexDirection: 'row',
    alignContent: 'center',
    margin: widthToDp(5),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
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
  icon: {
    marginLeft: widthToDp(5),
  },
  textHeading: {
    alignSelf: 'center',
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-SemiBold',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
  },
  monthHead: {
    alignSelf: 'center',
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-SemiBold',
    color: Colors.TextColor,
  },
  month: {
    tintColor: Colors.TextColor,
    marginHorizontal: widthToDp(7),
  },
  heading: {
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
  },
  headingContainer: {
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(6),
    marginVertical: widthToDp(4),
  },
  insideText: {
    marginHorizontal: widthToDp(6),
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-SemiBold',
  },
  greenIcon: {
    width: widthToDp(5),
    height: heightToDp(5),
  },
  nameContainer: {
    marginVertical: heightToDp(2),
    alignSelf: 'center',
  },
  name: {
    alignSelf: 'center',
    fontSize: widthToDp(7),
    color: Colors.TextColor,
    fontWeight: '600',
  },
  placestyle: {
    fontSize: widthToDp(7),
    fontWeight: '900',
    alignSelf: 'center',
  },

  preference: {
    marginLeft: widthToDp(4),
    marginVertical: widthToDp(1),
    fontSize: widthToDp(4),
    color: Colors.DullTextColor,
  },
  detail: {
    marginLeft: widthToDp(2),
    marginVertical: widthToDp(2),
    fontSize: widthToDp(4),
    color: Colors.DullTextColor,
  },
  star: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  sheetContainer: {},
  locationImage: {
    tintColor: Colors.DullTextColor,
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: widthToDp(4),
  },
  buttonFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: heightToDp(2),
    marginBottom: heightToDp(2),
  },
});
