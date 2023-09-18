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

export default function AgentMainAvailabilityScreen({route, navigation}) {
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
          <View style={styles.buttonFlex}>
            <LabelTextInput
              leftImageSoucre={require('../../../../assets/clockIcon.png')}
              LabelTextInput="Start Time"
              InputStyles={{
                padding: widthToDp(2),
              }}
              keyboardType={'numeric'}
              AdjustWidth={{width: widthToDp(40)}}
              labelStyle={{
                position: 'absolute',
                left: widthToDp(5),
                top: widthToDp(-3),
                fontSize: widthToDp(3.5),
              }}
            />
            <LabelTextInput
              leftImageSoucre={require('../../../../assets/clockIcon.png')}
              LabelTextInput="End Time"
              InputStyles={{
                padding: widthToDp(2),
              }}
              AdjustWidth={{width: widthToDp(40)}}
              labelStyle={{
                position: 'absolute',
                left: widthToDp(5),
                top: widthToDp(-3),
                fontSize: widthToDp(3.5),
              }}
            />
          </View>
        </ScrollView>
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
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: heightToDp(5),
  },
});
