import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';
import AgentCard from '../../components/AgentCard/AgentCard';
import MainButton from '../../components/MainGradientButton/MainButton';
import AcceptAgentCard from '../../components/AcceptAgentCard/AcceptAgentCard';
import DocumentComponent from '../../components/DocumentComponent/DocumentComponent';

export default function OnlineSessionDetail({navigation}) {
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        midImg={require('../../../assets/chatNavIcon.png')}
        lastImg={require('../../../assets/videoCallIcon.png')}
      />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>Medical documents</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false}>
          <View style={styles.insideContainer}>
            <Text style={styles.insideHeading}>Selected agent</Text>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/pending.png')}
                style={styles.greenIcon}
              />
              <Text style={styles.insideText}>Pending</Text>
            </View>
          </View>
          <AcceptAgentCard
            image={require('../../../assets/agentLocation.png')}
            source={require('../../../assets/maleAgentPic.png')}
            bottomRightText="$400"
            bottomLeftText="Tota"
            agentName={'Bunny Joel'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            task="Online"
          />

          <Text style={styles.insideHeading}>Booking Preferences</Text>
          <View style={styles.sheetContainer}>
            <Text style={styles.preferenceHeading}>Notes:</Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences
            </Text>
          </View>

          <DocumentComponent image={require('../../../assets/Pdf.png')} />
          <DocumentComponent image={require('../../../assets/doc.png')} />
          <View style={styles.buttonFlex}>
            <MainButton
              Title="Accept"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                paddingHorizontal: widthToDp(2),
              }}
              styles={{
                paddingHorizontal: widthToDp(10),
                paddingVertical: widthToDp(2.5),
                fontSize: widthToDp(5),
              }}
              onPress={() => navigation.navigate('CompletionScreen')}
            />
            <MainButton
              Title="Reject"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                paddingHorizontal: widthToDp(2),
              }}
              styles={{
                paddingHorizontal: widthToDp(10),
                paddingVertical: widthToDp(2.5),
                fontSize: widthToDp(5),
              }}
              onPress={() => navigation.navigate('SessionScreen')}
            />
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
    fontFamily: 'Manrope-SemiBold',
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
  preferenceHeading: {
    marginLeft: widthToDp(5),
    marginVertical: widthToDp(1),
    fontSize: widthToDp(4.5),
    color: Colors.DullTextColor,
  },
  preference: {
    marginLeft: widthToDp(5),
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
  sheetContainer: {
    marginVertical: heightToDp(2),
  },
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
    marginBottom: heightToDp(2),
  },
});
