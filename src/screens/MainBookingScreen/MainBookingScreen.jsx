import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';
import useGetService from '../../hooks/useGetService';
import useCreateBooking from '../../hooks/useCreateBooking';

export default function MainBookingScreen({route, navigation}) {
  const {fetchGetServiceAPI} = useGetService();
  const {documentType} = route.params;
  console.log(documentType);

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Booking" />
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
            Image={require('../../../assets/service1Pic.png')}
            onPress={
              // () => consoleData()
              () => fetchGetServiceAPI('mobile_notary', documentType)
            }
          />
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.LightBlue}}
            Title="Remote Online Notary"
            Image={require('../../../assets/service2Pic.png')}
            onPress={
              () => navigation.navigate('OnlineNotaryScreen', documentType)
              // () => fetchGetServiceAPI('ron', documentType)
            }
          />
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.DarkBlue}}
            Title="Local Notary"
            Image={require('../../../assets/service3Pic.png')}
            onPress={() => fetchGetServiceAPI('local', documentType)}
          />
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
