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
import NavigationHeader from '../../../components/Navigation Header/NavigationHeader';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import {useSelector} from 'react-redux';

export default function AgentMobileNotaryStartScreen() {
  const booking = useSelector(state => state.booking.booking);
  // console.log(booking);
  const {booked_by} = booking;
  const [notary, setNotary] = useState(true);
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Booking" />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>Medical documents</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView scrollEnabled={true}>
          <View style={styles.insideContainer}>
            <Text style={styles.insideHeading}>Client details</Text>
            <View
              style={[
                styles.iconContainer,
                notary ? {width: widthToDp(30)} : {width: widthToDp(35)},
              ]}>
              <Image
                source={require('../../../../assets/greenIcon.png')}
                style={{resizeMode: 'contain'}}
              />
              {notary ? (
                <Text style={styles.lightHeading}>Progress</Text>
              ) : (
                <Text style={styles.lightHeading}>Completed</Text>
              )}
            </View>
          </View>
          <View style={styles.flexContainer}>
            <Image
              source={{uri: booked_by?.profile_picture}}
              style={styles.iconProfile}
            />
            <Text
              style={[
                styles.Heading,
                {marginHorizontal: widthToDp(5), fontSize: widthToDp(4.5)},
              ]}>
              {booked_by?.first_name} {booked_by?.last_name}
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
              <Text style={styles.detail}>{booked_by?.location}</Text>
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
          </View>
        </ScrollView>
        <View style={styles.buttonBottom}>
          {notary ? (
            <GradientButton
              Title="Start Notary"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => setNotary(false)}
            />
          ) : (
            <GradientButton
              Title="Complete Notary"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              // onPress={() => setNotary(false)} <-- Navigate to next page
            />
          )}
        </View>
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
  iconProfile: {
    width: widthToDp(15),
    height: heightToDp(15),
    marginRight: widthToDp(5),
    borderRadius: 50,
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
});
