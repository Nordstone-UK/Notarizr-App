import {Image, StyleSheet, Text, ScrollView, View} from 'react-native';
import React, {useState} from 'react';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import TypesofServiceButton from '../../../components/TypesofServiceButton/TypesofServiceButton';
import Colors from '../../../themes/Colors';

export default function AgentMainBookingScreen({route, navigation}) {
  return (
    <View style={styles.container}>
      <AgentHomeHeader />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>
          {route?.params?.name || 'Medical Documents'}
        </Text>
      </View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.insideHeading}>
            Please choose the mode of service you wish to avail
          </Text>
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.Pink}}
            Title="Mobile Notary"
            Image={require('../../../../assets/service1Pic.png')}
            onPress={() => navigation.navigate('AgentMainAvailabilityScreen')}
          />
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.LightBlue}}
            Title="Remote Online Notary"
            Image={require('../../../../assets/service2Pic.png')}
            onPress={() => navigation.navigate('AgentRemoteOnlineNotaryScreen')}
          />
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.DarkBlue}}
            Title="Local Notary"
            Image={require('../../../../assets/service3Pic.png')}
            onPress={() => navigation.navigate('AgentAvailabilitySetupScreen')}
          />
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
});
