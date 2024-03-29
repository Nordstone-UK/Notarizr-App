import {
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import MainButton from '../../components/MainGradientButton/MainButton';
import SkipButton from '../../components/MainGradientButton/SkipButton';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function OnboardingScreen2({navigation}, props) {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../../assets/screen2.png')}
        style={styles.imagestyle}
      />
      <Text style={styles.textHeading}>Explore our RON services</Text>
      <Text style={styles.textSubheading}>
        Our experienced agents can perform RON in minutes at your convenience.
      </Text>
      <GradientButton
        Title="Next"
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        viewStyle={props.viewStyle}
        onPress={() => navigation.navigate('OnboardingScreen3')}
      />
      <SkipButton
        Title="Skip"
        onPress={() => navigation.navigate('OnboardingScreen3')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  imagestyle: {
    alignSelf: 'center',
    width: widthToDp(100),
    height: heightToDp(70),
    resizeMode: 'contain',
  },
  textHeading: {
    color: '#000',
    marginHorizontal: widthToDp(5),
    textAlign: 'center',
    fontSize: widthToDp(8),
    fontFamily: 'Manrope-Bold',
  },
  textSubheading: {
    color: '#000',
    textAlign: 'center',
    fontSize: widthToDp(5.5),
    fontStyle: 'normal',
    fontWeight: '500',
    fontFamily: 'Manrope',
    marginVertical: widthToDp(3),
    marginHorizontal: widthToDp(8),
  },
});
