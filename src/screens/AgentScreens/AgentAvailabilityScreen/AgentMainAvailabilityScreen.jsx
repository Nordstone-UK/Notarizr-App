import {
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Button,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import {heightToDp, width, widthToDp} from '../../../utils/Responsive';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import TypesofServiceButton from '../../../components/TypesofServiceButton/TypesofServiceButton';
import Colors from '../../../themes/Colors';
import MainBookingScreen from '../../MainBookingScreen/MainBookingScreen';
import MainButton from '../../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import {Calendar} from 'react-native-calendars';
import WeekCalendar from '../../../components/WeekCalendar/WeekCalendar';
import useAgentService from '../../../hooks/useAgentService';
import TimePicker from '../../../components/TimePicker/TimePicker';
import moment from 'moment';
import CheckBox from '@react-native-community/checkbox';

export default function AgentMainAvailabilityScreen({navigation}, props) {
  const [availability, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [canPrint, setCanPrint] = useState(false);
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
  const {dispatchAvailability} = useAgentService();
  useEffect(() => {
    console.log(
      'Start Time in Main screen',
      moment(startTime).format('h:mm A'),
      moment(endTime).format('h:mm A'),
    );
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <AgentHomeHeader />
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
            <WeekCalendar
              selectedDays={availability}
              weekdays={weekdays}
              setSelectedDays={setSelectedDays}
            />
          </View>
          <View style={styles.buttonFlex}>
            <TimePicker
              onConfirm={date => setStartTime(date)}
              Text="Start Time"
              date={startTime}
            />
            <TimePicker
              onConfirm={date => setEndTime(date)}
              Text="End Time"
              date={endTime}
            />
          </View>
          {props?.service === 'mobile_notary' && (
            <View
              style={{
                alignSelf: 'center',
                width: widthToDp(85),
                marginVertical: widthToDp(5),
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: widthToDp(4),
                  color: Colors.TextColor,
                  fontFamily: 'Manrope-Bold',
                  width: widthToDp(60),
                }}>
                Are you able to print document for the client:
              </Text>
              <CheckBox
                disabled={false}
                value={canPrint}
                onValueChange={newValue => setCanPrint(newValue)}
              />
            </View>
          )}
          <View style={styles.bottomFlex}>
            <View style={styles.buttonFlex}>
              <MainButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Back"
                styles={{
                  padding: heightToDp(1),
                  fontSize: widthToDp(4),
                }}
                GradiStyles={{
                  paddingHorizontal: widthToDp(12),
                  paddingVertical: heightToDp(1.5),
                  borderRadius: 5,
                }}
                onPress={() => navigation.goBack()}
              />
              <MainButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Next"
                styles={{
                  padding: heightToDp(1),
                  fontSize: widthToDp(4),
                }}
                GradiStyles={{
                  paddingHorizontal: widthToDp(12),
                  paddingVertical: heightToDp(1.5),
                  borderRadius: 5,
                }}
                onPress={() =>
                  dispatchAvailability(
                    availability,
                    moment(startTime).format('h:mm A'),
                    moment(endTime).format('h:mm A'),
                    canPrint,
                  )
                }
              />
            </View>
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </SafeAreaView>
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
    fontFamily: 'Manrope-Regular',
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
  buttonFlex: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: heightToDp(5),
  },
  bottomFlex: {
    marginVertical: heightToDp(5),
  },
});
