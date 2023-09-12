import {Image, StyleSheet, Text, View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import React from 'react';
import MainButton from '../../components/MainGradientButton/MainButton';
import SkipButton from '../../components/MainGradientButton/SkipButton';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function OnboardingScreen1({navigation}, props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/screen1.png')}
        style={styles.imagestyle}
      />
      <Text style={styles.textHeading}>Browse Notary lawyer near by you.</Text>
      <Text style={styles.textSubheading}>
        Our app can provide you the Mobile and Online services
      </Text>
      <GradientButton
        Title="Next"
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        viewStyle={props.viewStyle}
        GradiStyles={props.GradiStyles}
        onPress={() => navigation.navigate('OnboardingScreen2')}
      />
      <SkipButton
        Title="Skip"
        onPress={() => navigation.navigate('OnboardingScreen3')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imagestyle: {
    width: widthToDp(80),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: heightToDp(15),
  },
  textHeading: {
    color: '#000',
    marginTop: heightToDp(5),
    marginHorizontal: widthToDp(5),
    textAlign: 'center',
    fontSize: widthToDp(8),
    fontStyle: 'normal',
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
  textSubheading: {
    color: '#000',
    textAlign: 'center',
    fontSize: widthToDp(5.5),
    fontStyle: 'normal',
    fontWeight: '500',
    fontFamily: 'Manrope',
    marginTop: widthToDp(5),
    marginHorizontal: widthToDp(8),
  },
});
