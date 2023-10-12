import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';
import AgentCard from '../../components/AgentCard/AgentCard';
import MainButton from '../../components/MainGradientButton/MainButton';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import LinearGradient from 'react-native-linear-gradient';
import CustomCalendar from '../../components/CustomCalendar/CustomCalendar';
import moment from 'moment';
import useCreateBooking from '../../hooks/useCreateBooking';

export default function LocalNotaryDateScreen({route, navigation}) {
  const {description, documentType} = route.params;
  const {agent} = description;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const {
    setLocalBookingData,
    handleLocalNotaryBookingCreation,
    LocalBookingData,
  } = useCreateBooking();
  console.log(documentType);
  function generateTimeSlots(openTime, closeTime) {
    let startTime = moment(openTime, 'hh:mm A');
    let endTime = moment(closeTime, 'hh:mm A');

    const timeSlots = [];

    while (startTime.isSameOrBefore(endTime)) {
      const formattedStartTime = startTime.format('hh:mm A');
      const formattedEndTime = startTime.add(30, 'minutes').format('hh:mm A');
      timeSlots.push({
        start: formattedStartTime,
        end: formattedEndTime,
      });
    }

    return timeSlots;
  }
  useEffect(() => {
    setLocalBookingData({
      ...LocalBookingData,
      serviceType: description.service_type,
      service: description._id,
      agent: description.agent._id,
      documentType: documentType,
    });
  }, []);
  const handleLocalBooking = async () => {
    const data = await handleLocalNotaryBookingCreation(
      selectedDate,
      selectedTime,
    );
  };
  const TimeAvailable = generateTimeSlots(
    description.availability.startTime,
    description.availability.endTime,
  );

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.namebar}>
          <View style={styles.flexContainer}>
            <Image
              source={{uri: agent.profile_picture}}
              style={styles.imagestyles}
            />
            <Text style={[styles.textHeading]}>
              {agent.first_name} {agent.last_name}
            </Text>
          </View>
          <View style={styles.flexContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationScreen')}>
              <Image
                source={require('../../../assets/bellIcon.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
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
          <CustomCalendar
            selected={selectedDate}
            onDayPress={day => setSelectedDate(day)}
          />
          <Text style={styles.headingContainer}>Availability</Text>
          <View style={styles.dateContainer}>
            {TimeAvailable.map((slot, index) => (
              <TouchableOpacity
                key={index}
                // style={styles.slot}
                onPress={() => setSelectedTime(slot.start + ' - ' + slot.end)}>
                <LinearGradient
                  style={styles.slot}
                  colors={
                    selectedTime === slot.start + ' - ' + slot.end
                      ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                      : [Colors.white, Colors.white]
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}>
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === slot.start + ' - ' + slot.end && {
                        color: Colors.white,
                      },
                    ]}>
                    {slot.start} - {slot.end}
                  </Text>
                </LinearGradient>
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
              onPress={
                () => handleLocalBooking()
                // () => navigation.navigate('AgentBookCompletion')
              }
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
  },
  timeText: {
    color: Colors.TextColor,
  },
  slot: {
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

{
  /* <View
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
  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
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
                isFocused === dateObj.date ? styles.textWhite : styles.text
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
                isFocused === dateObj.date ? styles.textWhite : styles.text
              }>
              {dateObj.day}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>; */
}
