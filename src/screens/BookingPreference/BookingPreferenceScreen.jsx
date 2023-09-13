import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import MainButton from '../../components/MainGradientButton/MainButton';
import DocumentComponent from '../../components/DocumentComponent/DocumentComponent';

export default function BookingPreferenceScreen() {
  return (
    <View style={styles.container}>
      <NavigationHeader Title="Booking" />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>Medical documents</Text>
      </View>
      <BottomSheetStyle>
        <Text style={styles.innerHeading}>
          Please provide us with your booking preferences
        </Text>
        <LabelTextInput LabelTextInput="Notes" placeholder="Write notes here" />
        <View
          style={{
            marginVertical: heightToDp(3),
          }}>
          <MainButton
            Title="Upload Documents"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            GradiStyles={{
              paddingHorizontal: widthToDp(5),
              paddingVertical: heightToDp(1),
            }}
            styles={{fontSize: widthToDp(3), padding: widthToDp(2)}}
          />
          <View
            style={{
              marginVertical: heightToDp(3),
            }}>
            <DocumentComponent image={require('../../../assets/Pdf.png')} />
            <DocumentComponent image={require('../../../assets/doc.png')} />
          </View>
        </View>
        <View style={styles.button}>
          <GradientButton
            Title="Upload Documents"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
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
  innerHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginHorizontal: widthToDp(8),
    marginTop: heightToDp(2),
  },
  headingContainer: {
    marginLeft: widthToDp(4),
    marginBottom: heightToDp(2),
  },
  insideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightToDp(2),
  },
  button: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: heightToDp(5),
  },
});
