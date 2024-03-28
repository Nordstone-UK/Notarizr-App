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

export default function OnboardingScreen3({navigation}, props) {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../../assets/screen3.png')}
        style={styles.imagestyle}
      />
      <Text style={styles.textHeading}>Choose your preferred agent for RON</Text>
      <Text style={styles.textSubheading}>
        Invite your preferred agent and get your documents notarized.
      </Text>
      <GradientButton
        Title="Get Started"
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        viewStyle={props.viewStyle}
        onPress={() => navigation.navigate('LoginScreen')}
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
    marginLeft: widthToDp(5),
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
