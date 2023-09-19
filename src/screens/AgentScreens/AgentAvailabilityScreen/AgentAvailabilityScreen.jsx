import {Image, StyleSheet, Text, ScrollView, View} from 'react-native';
import React, {useState} from 'react';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import {heightToDp, width, widthToDp} from '../../../utils/Responsive';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import TypesofServiceButton from '../../../components/TypesofServiceButton/TypesofServiceButton';
import Colors from '../../../themes/Colors';
import MainBookingScreen from '../../MainBookingScreen/MainBookingScreen';
import MainButton from '../../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import {Calendar} from 'react-native-calendars';

export default function AgentMainAvailabilityScreen({route, navigation}) {
  const [selected, setSelected] = useState('');

  return (
    <View style={styles.container}>
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
          <Calendar
            onDayPress={day => {
              setSelected(day.dateString);
            }}
            markedDates={{
              [selected]: {
                selected: true,
                disableTouchEvent: true,
                selectedDotColor: 'orange',
              },
            }}
            theme={{
              selectedDayBackgroundColor: Colors.Orange,
              todayTextColor: Colors.Orange,
              textSectionTitleColor: '#000',
            }}
          />
          <View style={styles.buttonFlex}>
            <LabelTextInput
              leftImageSoucre={require('../../../../assets/clockIcon.png')}
              LabelTextInput="Start Time"
              InputStyles={{
                padding: widthToDp(2),
              }}
              Label={true}
              keyboardType={'numeric'}
              AdjustWidth={{
                width: widthToDp(40),
                borderColor: Colors.DisableColor,
              }}
              labelStyle={{
                position: 'absolute',
                left: widthToDp(5),
                top: widthToDp(-3),
                fontSize: widthToDp(3.5),
                color: Colors.TextColor,
              }}
            />
            <LabelTextInput
              leftImageSoucre={require('../../../../assets/clockIcon.png')}
              LabelTextInput="End Time"
              InputStyles={{
                padding: widthToDp(2),
              }}
              Label={true}
              AdjustWidth={{
                width: widthToDp(40),
                borderColor: Colors.DisableColor,
              }}
              labelStyle={{
                position: 'absolute',
                left: widthToDp(5),
                top: widthToDp(-3),
                fontSize: widthToDp(3.5),
                color: Colors.TextColor,
              }}
            />
          </View>
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
  },
  bottomFlex: {
    marginVertical: heightToDp(5),
  },
});
