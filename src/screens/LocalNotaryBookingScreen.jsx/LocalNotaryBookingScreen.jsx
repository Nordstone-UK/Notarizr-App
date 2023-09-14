import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  useColorScheme,
} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';
import AgentCard from '../../components/AgentCard/AgentCard';
import MainButton from '../../components/MainGradientButton/MainButton';

export default function LocalNotaryBookingScreen() {
  return (
    <View style={styles.container}>
      <NavigationHeader Title="Booking" />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>Medical documents</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView scrollEnabled={true}>
          <View style={styles.insideContainer}>
            <Text style={styles.insideHeading}>Selected agent</Text>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/greenIcon.png')}
                style={styles.greenIcon}
              />
              <Text style={styles.insideText}>Avaialable</Text>
            </View>
          </View>
          <AgentCard
            image={require('../../../assets/agentLocation.png')}
            source={require('../../../assets/agentCardPic.png')}
            bottomRightText="30 minutes"
            bottomLeftText="0.5 Miles"
            agentName={'Advocate Parimal M. Trivedi'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            Review={true}
          />
          <View style={styles.sheetContainer}>
            <Text style={styles.insideHeading}>Booking Preferences</Text>
            <View style={styles.addressView}>
              <Image
                source={require('../../../assets/locationIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                Legal building, James street, New York
              </Text>
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
              Please provide us with your booking preferences
            </Text>
          </View>
          <View style={styles.buttonFlex}>
            <MainButton
              Title="Cancel Booking"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={
                {
                  // paddingHorizontal: widthToDp(2),
                }
              }
              styles={{
                paddingHorizontal: widthToDp(5),
                paddingVertical: widthToDp(4),
                fontSize: widthToDp(4),
              }}
            />
            <MainButton
              Title="Reschedule Booking"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={
                {
                  // paddingHorizontal: widthToDp(2),
                }
              }
              styles={{
                paddingHorizontal: widthToDp(5),
                paddingVertical: widthToDp(4),

                fontSize: widthToDp(4),
              }}
            />
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: Colors.PinkBackground,
  },
  lightHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontWeight: '500',
  },
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontWeight: '700',
  },
  headingContainer: {
    marginLeft: widthToDp(4),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontWeight: '700',
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(5),
  },
  insideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightToDp(2),
  },
  iconContainer: {
    alignContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  insideText: {
    marginHorizontal: widthToDp(3),
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontWeight: '400',
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
  heading: {
    fontSize: widthToDp(6),
    color: Colors.TextColor,
    marginLeft: widthToDp(3),
    marginBottom: heightToDp(2),
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
