import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import MainButton from '../../components/MainGradientButton/MainButton';
import SkipButton from '../../components/MainGradientButton/SkipButton';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';

export default function OnboardingScreen2({navigation}, props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/screen2.png')}
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
        onPress={() => navigation.navigate('OnboardingScreen3')}
      />
      <SkipButton
        Title="Skip"
        onPress={() => navigation.navigate('OnboardingScreen3')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imagestyle: {
    width: '80%',
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: '5%',
  },
  textHeading: {
    color: '#000',
    marginTop: 30,
    marginHorizontal: 15,
    textAlign: 'center',
    fontSize: 30,
    fontStyle: 'normal',
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
  textSubheading: {
    color: '#000',
    textAlign: 'center',
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '500',
    fontFamily: 'Manrope',
    marginTop: 30,
    marginHorizontal: 40,
  },
});
