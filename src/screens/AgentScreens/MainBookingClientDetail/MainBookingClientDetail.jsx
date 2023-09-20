import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  useColorScheme,
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

export default function AgentBookingClientDetail({navigation}) {
  const [notary, setNotary] = useState(true);
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
            <Text style={styles.insideHeading}>Client details</Text>
          </View>
          <ClientServiceCard
            image={require('../../../../assets/agentLocation.png')}
            source={require('../../../../assets/maleAgentPic.png')}
            bottomLeftText="$400"
            agentName={'Bunny Joel'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            task="Online"
            OrangeText="At Home"
            Work={true}
            Time={true}
            Button={true}
            Canceled={true}
            WorkStatus="Pending"
          />
          <View style={styles.sheetContainer}>
            <Text style={[styles.insideHeading]}>Booking Preferences</Text>
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
          <View style={styles.buttonBottom}>
            <MainButton
              Title="Accept"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() =>
                navigation.navigate('BookingAcceptedScreen', {
                  service: 'local notary',
                })
              }
              GradiStyles={{
                width: widthToDp(40),
                paddingVertical: widthToDp(3),
              }}
              styles={{
                padding: widthToDp(0),
                fontSize: widthToDp(4),
              }}
            />

            <MainButton
              Title="Reject"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => navigation.goBack()}
              GradiStyles={{
                width: widthToDp(40),
                paddingVertical: widthToDp(3),
              }}
              styles={{
                padding: widthToDp(0),
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
  sheetContainer: {
    marginHorizontal: widthToDp(5),
  },
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
