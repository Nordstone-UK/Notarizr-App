import {Image, StyleSheet, Text, ScrollView, View} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';

export default function MainBookingScreen({navigation}) {
  return (
    <View style={styles.container}>
      <NavigationHeader Title="Booking" />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>Medical documents</Text>
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
            Image={require('../../../assets/service1Pic.png')}
            onPress={() => navigation.navigate('MapScreen')}
          />
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.LightBlue}}
            Title="Remote Online Notary"
            Image={require('../../../assets/service2Pic.png')}
            onPress={() => navigation.navigate('OnlineNotaryScreen')}
          />
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.DarkBlue}}
            Title="Local Notary"
            Image={require('../../../assets/service3Pic.png')}
            onPress={() => navigation.navigate('LocalNotaryMapScreen')}
          />
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
    marginVertical: widthToDp(3),
    marginHorizontal: widthToDp(5),
  },
});
