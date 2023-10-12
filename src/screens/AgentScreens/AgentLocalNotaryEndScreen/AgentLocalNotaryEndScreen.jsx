import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import DocumentComponent from '../../../components/DocumentComponent/DocumentComponent';
import MainButton from '../../../components/MainGradientButton/MainButton';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import NavigationPaymentHeader from '../../../components/NavigationPaymentHeader/NavigationPaymentHeader';

export default function AgentLocalNotaryEndScreen({navigation}) {
  const [notes, setNotes] = useState(false);
  return (
    <SafeAreaView style={styles.container}>
      <NavigationPaymentHeader
        Title="Booking"
        midImg={require('../../../../assets/greenIcon.png')}
        Payment={true}
      />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>Medical documents</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={{paddingVertical: heightToDp(5)}}>
          <View style={styles.insideContainer}>
            <Text style={styles.insideHeading}>Client details</Text>
            <View style={[styles.iconContainer, {width: widthToDp(35)}]}>
              <Image
                source={require('../../../../assets/greenIcon.png')}
                style={{resizeMode: 'contain'}}
              />

              <Text style={styles.lightHeading}>Completed</Text>
            </View>
          </View>
          <View style={styles.flexContainer}>
            <Image
              source={require('../../../../assets/clientIcon.png')}
              style={{resizeMode: 'contain'}}
            />
            <Text
              style={[
                styles.Heading,
                {marginHorizontal: widthToDp(5), fontSize: widthToDp(4.5)},
              ]}>
              Bunny Joel
            </Text>
          </View>
          <View style={styles.sheetContainer}>
            <Text
              style={[styles.insideHeading, {marginHorizontal: widthToDp(5)}]}>
              Booking Preferences
            </Text>
            <View style={styles.addressView}>
              <Image
                source={require('../../../../assets/locationIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                Legal building, James street, New York
              </Text>
            </View>
            <View style={styles.addressView}>
              <Image
                source={require('../../../../assets/calenderIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>02/08/1995 , 04:30 PM</Text>
            </View>
            <Text style={styles.preference}>Notes:</Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences
            </Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences
            </Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences
            </Text>
            <DocumentComponent image={require('../../../../assets/Pdf.png')} />
            <DocumentComponent image={require('../../../../assets/doc.png')} />
            <Text
              style={[styles.insideHeading, {marginHorizontal: widthToDp(5)}]}>
              Agent Summary
            </Text>
          </View>
          <DocumentComponent image={require('../../../../assets/Pdf.png')} />
          <DocumentComponent image={require('../../../../assets/doc.png')} />
          <LabelTextInput
            LabelTextInput="Notes"
            placeholder="Enter your notes here"
            Label={true}
            labelStyle={{color: Colors.TextColor}}
            AdjustWidth={{borderColor: Colors.DullTextColor}}
          />
          <View style={{marginVertical: heightToDp(2)}}>
            <GradientButton
              Title="Request Payment"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => navigation.navigate('AgentBookingComplete')}
            />
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
    fontFamily: 'Manrope-SemiBold',
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
    marginVertical: widthToDp(2),
  },
  insideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightToDp(2),
    marginHorizontal: widthToDp(5),
  },
  flexContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightToDp(2),
    marginHorizontal: widthToDp(5),
  },
  iconContainer: {
    alignContent: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  insideText: {
    marginHorizontal: widthToDp(3),
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
  },
  greenIcon: {
    width: widthToDp(5),
    height: heightToDp(5),
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
  sheetContainer: {},
  locationImage: {
    tintColor: Colors.DullTextColor,
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: widthToDp(4),
  },
  buttonBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: heightToDp(5),
  },
  buttonFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: widthToDp(90),
    alignSelf: 'center',
    marginVertical: widthToDp(5),
  },
});
