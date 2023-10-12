import {SafeAreaView, StyleSheet, Text, ScrollView, View} from 'react-native';
import React, {useState} from 'react';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import {heightToDp, width, widthToDp} from '../../../utils/Responsive';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import TypesofServiceButton from '../../../components/TypesofServiceButton/TypesofServiceButton';
import Colors from '../../../themes/Colors';
import MainBookingScreen from '../../MainBookingScreen/MainBookingScreen';
import MainButton from '../../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import GradientButton from '../../../components/MainGradientButton/GradientButton';

export default function AgentLocationScreen({navigation}) {
  const [Location, setLocation] = useState('Florida');
  return (
    <SafeAreaView style={styles.container}>
      <AgentHomeHeader />
      <View style={styles.headingContainer}>
        <Text style={styles.Heading}>Profile Setup</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.insideHeading}>
            Please select your preferred locations
          </Text>
          <View style={styles.buttonFlex}>
            <MainButton
              Title="Florida"
              colors={
                Location === 'Florida'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={{
                padding: heightToDp(1),
                fontSize: widthToDp(4),
              }}
              GradiStyles={{
                paddingHorizontal: widthToDp(10),
                width: widthToDp(40),
                paddingVertical: heightToDp(1.5),
                borderRadius: 5,
              }}
              onPress={() => setLocation('Florida')}
            />
            <MainButton
              Title="Ohio"
              colors={
                Location === 'Ohio'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={{
                padding: heightToDp(1),
                fontSize: widthToDp(4),
              }}
              GradiStyles={{
                width: widthToDp(40),
                paddingHorizontal: widthToDp(10),
                paddingVertical: heightToDp(1.5),
                borderRadius: 5,
              }}
              onPress={() => setLocation('Ohio')}
            />
            <MainButton
              Title="New York"
              colors={
                Location === 'New York'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={{
                padding: heightToDp(1),
                fontSize: widthToDp(4),
              }}
              GradiStyles={{
                paddingHorizontal: widthToDp(10),
                width: widthToDp(40),
                paddingVertical: heightToDp(1.5),
                borderRadius: 5,
              }}
              onPress={() => setLocation('New York')}
            />
            <MainButton
              onPress={() => setLocation('Hawaii')}
              Title="Hawaii"
              colors={
                Location === 'Hawaii'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={{
                padding: heightToDp(1),
                fontSize: widthToDp(4),
              }}
              GradiStyles={{
                width: widthToDp(40),
                paddingHorizontal: widthToDp(10),
                paddingVertical: heightToDp(1.5),
                borderRadius: 5,
              }}
            />
          </View>
        </ScrollView>
        <View style={styles.bottomFlex}>
          <GradientButton
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            Title="Complete"
            onPress={() => navigation.navigate('AllBookingScreen')}
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
  buttonFlex: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: heightToDp(2),
    flexWrap: 'wrap',
    rowGap: widthToDp(2),
  },
  bottomFlex: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: heightToDp(5),
  },
});
