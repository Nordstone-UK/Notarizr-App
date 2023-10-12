import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';

import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import MainButton from '../../../components/MainGradientButton/MainButton';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import Colors from '../../../themes/Colors';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import DocumentComponent from '../../../components/DocumentComponent/DocumentComponent';

export default function ClientBookingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AgentHomeHeader Switch={true} />
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
            source={require('../../../../assets/maleAgentPic.png')}
            bottomLeftText="$400"
            agentName={'Bunny Joel'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            task="Mobile"
            OrangeText="At Home"
            Work={true}
            WorkStatus="Completed"
          />
          <View style={styles.sheetContainer}>
            <Text style={styles.insideHeading}>Booking Preferences</Text>
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
          </View>
          <DocumentComponent image={require('../../../../assets/Pdf.png')} />
          <DocumentComponent image={require('../../../../assets/doc.png')} />
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
            }}>
            <View style={styles.buttonFlex}>
              <MainButton
                Title="Accept"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                GradiStyles={{
                  paddingHorizontal: widthToDp(8),
                }}
                styles={{
                  paddingHorizontal: widthToDp(8),
                  paddingVertical: widthToDp(3),
                  fontSize: widthToDp(4),
                }}
              />
              <MainButton
                Title="Reject"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                GradiStyles={{
                  paddingHorizontal: widthToDp(8),
                }}
                styles={{
                  paddingHorizontal: widthToDp(8),
                  paddingVertical: widthToDp(3),

                  fontSize: widthToDp(4),
                }}
              />
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: heightToDp(2),
    marginBottom: heightToDp(2),
  },
});
