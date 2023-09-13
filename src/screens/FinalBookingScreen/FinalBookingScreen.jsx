import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import Colors from '../../themes/Colors';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';

export default function FinalBookingScreen() {
  return (
    <View style={styles.container}>
      <NavigationHeader Title="Booking" />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>Medical documents</Text>
      </View>
      <BottomSheetStyle>
        <View style={styles.topFlexContainer}>
          <Text style={styles.agent}>Selected Agent</Text>
          <View style={styles.iconFlex}>
            <Image
              source={require('../../../assets/greenIcon.png')}
              style={styles.icon}
            />
            <Text style={styles.icontext}>Processed</Text>
          </View>
        </View>
        <View style={styles.topFlexContainer}>
          <Image
            source={require('../../../assets/agentReview.png')}
            style={styles.iconProfile}
          />
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
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  headingContainer: {
    marginLeft: widthToDp(4),
    marginBottom: heightToDp(2),
    fontFamily: 'Manrope-Regular',
  },
  topFlexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(3),
  },
  iconFlex: {
    flexDirection: 'row',
  },
  lightHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-SemiBold',
  },
  agent: {
    fontSize: widthToDp(4.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
  },
  icontext: {
    fontFamily: 'Manrope-SemiBold',
    color: Colors.TextColor,
    marginHorizontal: widthToDp(2),
    fontSize: widthToDp(4),
  },
  icon: {
    width: widthToDp(4),
    height: heightToDp(4),
    marginTop: heightToDp(1),
  },
  iconProfile: {
    width: widthToDp(2),
    height: heightToDp(2),
  },
});
