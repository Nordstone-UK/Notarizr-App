import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import Colors from '../../themes/Colors';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import ReviewPopup from '../../components/ReviewPopup/ReviewPopup';
import DocumentComponent from '../../components/DocumentComponent/DocumentComponent';
import {useSelector} from 'react-redux';

export default function FinalBookingScreen({navigation}) {
  const booking = useSelector(state => state.booking.booking);
  // console.log(booking);
  const {booked_by} = booking;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <NavigationHeader Title="Booking" />
        <View style={styles.headingContainer}>
          <Text style={styles.lightHeading}>Selected Service</Text>
          <Text style={styles.Heading}>Medical documents</Text>
        </View>
        <BottomSheetStyle>
          <View style={styles.topFlexContainer}>
            <Text style={styles.agent}>Client details</Text>
            <View style={styles.iconFlex}>
              <Image
                source={require('../../../assets/greenIcon.png')}
                style={styles.icon}
              />
              <Text style={styles.icontext}>Processed</Text>
            </View>
          </View>
          <View style={styles.nameContainer}>
            <Image
              source={{uri: booked_by?.profile_picture}}
              style={styles.iconProfile}
            />
            <Text style={styles.agentName}>
              {booked_by?.first_name} {booked_by?.last_name}
            </Text>
          </View>
          <View style={styles.sheetContainer}>
            <Text style={styles.insideHeading}>Booking Preferences</Text>
            <View style={styles.addressView}>
              <Image
                source={require('../../../assets/locationIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>{booked_by?.location}</Text>
            </View>
            <View style={styles.addressView}>
              <Image
                source={require('../../../assets/calenderIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>02/08/1995 , 04:30 PM</Text>
            </View>
            <Text style={styles.preference}>Notes:</Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences.
            </Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences.
            </Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences.
            </Text>
          </View>
          <DocumentComponent image={require('../../../assets/Pdf.png')} />
          <DocumentComponent image={require('../../../assets/doc.png')} />
          <View style={styles.btnView}>
            <GradientButton
              Title="Make Payment"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => navigation.navigate('PaymentScreen')}
            />
          </View>
        </BottomSheetStyle>
      </ScrollView>
    </SafeAreaView>
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
  nameContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(3),
    alignItems: 'center',
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
  agentName: {
    fontSize: widthToDp(4.5),
    fontFamily: 'Manrope-SemiBold',
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
    width: widthToDp(15),
    height: heightToDp(15),
    marginRight: widthToDp(5),
    borderRadius: 50,
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontWeight: '700',
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(5),
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: widthToDp(4),
  },
  locationImage: {
    tintColor: Colors.DullTextColor,
  },
  detail: {
    marginLeft: widthToDp(2),
    marginVertical: widthToDp(2),
    fontSize: widthToDp(4),
    color: Colors.DullTextColor,
  },
  preference: {
    marginLeft: widthToDp(4),
    marginVertical: widthToDp(1),
    fontSize: widthToDp(4),
    color: Colors.DullTextColor,
  },
  btnView: {
    marginVertical: widthToDp(5),
  },
});
