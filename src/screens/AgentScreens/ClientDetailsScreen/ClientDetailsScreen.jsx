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
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';

import ModalCheck from '../../../components/ModalComponent/ModalCheck';
import useBookingStatus from '../../../hooks/useBookingStatus';

export default function AgentMobileNotaryStartScreen({route, navigation}) {
  const {clientDetail} = route.params;
  console.log('clientDetail:', clientDetail._id);
  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const {handleUpdateBookingStatus} = useBookingStatus();

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
          </View>

          <ClientServiceCard
            image={require('../../../../assets/agentLocation.png')}
            source={{uri: clientDetail.booked_by.profile_picture}}
            bottomLeftText={clientDetail.document_type.price}
            agentName={
              clientDetail.booked_by.first_name +
              ' ' +
              clientDetail.booked_by.last_name
            }
            agentAddress={clientDetail.booked_by.location}
            task="Mobile"
            OrangeText="At Home"
            onPress={() =>
              navigation.navigate('ClientDetailsScreen', {
                clientDetail: clientDetail,
              })
            }
            status={clientDetail.status}
          />
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
                {clientDetail?.booked_by?.location}
              </Text>
            </View>
            <View style={styles.addressView}>
              <Image
                source={require('../../../../assets/calenderIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                Start Time: {clientDetail?.service?.availability.startTime}
              </Text>
              <Text style={styles.detail}>
                End Time: {clientDetail?.service?.availability.endTime}
              </Text>
            </View>
            <Text style={styles.preference}>WeekDays:</Text>
            <Text style={styles.preference}>
              {clientDetail?.service?.availability.weekdays?.map(
                (day, index) => (
                  <Text key={index} style={styles.dayText}>
                    {capitalizeFirstLetter(day)}{' '}
                  </Text>
                ),
              )}
            </Text>
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
          <MainButton
            Title="Accept"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            onPress={() =>
              handleUpdateBookingStatus('accepted', clientDetail._id)
            }
            GradiStyles={{
              width: widthToDp(40),
              paddingHorizontal: widthToDp(0),
              paddingVertical: heightToDp(3),
            }}
            styles={{
              padding: widthToDp(0),
              fontSize: widthToDp(4),
            }}
          />

          <MainButton
            Title="Reject"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            onPress={() =>
              handleUpdateBookingStatus('rejected', clientDetail._id)
            }
            GradiStyles={{
              width: widthToDp(40),
              paddingHorizontal: widthToDp(0),
              paddingVertical: heightToDp(3),
            }}
            styles={{
              padding: widthToDp(0),
              fontSize: widthToDp(4),
            }}
          />
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
    marginLeft: widthToDp(5),
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
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: heightToDp(5),
  },
});
