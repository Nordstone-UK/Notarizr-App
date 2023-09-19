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
import AgentReviewCard from '../../components/AgentReviewCard/AgentReviewCard';
import GradientButton from '../../components/MainGradientButton/GradientButton';

export default function CancelledBookingScreen({route, navigation}, props) {
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
                source={require('../../../assets/pending.png')}
                style={styles.greenIcon}
              />
              <Text style={styles.insideText}>
                {route.params.Status || 'Canceled'}
              </Text>
            </View>
          </View>
          <AgentReviewCard
            image={require('../../../assets/agentLocation.png')}
            source={require('../../../assets/agentCardPic.png')}
            bottomRightText="30 minutes"
            bottomLeftText="0.5 Miles"
            agentName={'Advocate Parimal M. Trivedi'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
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
            <GradientButton
              Title={route.params.buttonText}
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => {
                route.params.buttonText === 'Cancel Booking'
                  ? navigation.navigate('RejectedByAgentScreen')
                  : navigation.navigate('AllBookingScreen');
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
    flex: 1,
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
    fontFamily: 'Manrope-Regular',
  },
  greenIcon: {
    width: widthToDp(5),
    height: heightToDp(5),
  },
  nameContainer: {
    marginVertical: heightToDp(2),
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
    marginVertical: heightToDp(2),
  },
});
