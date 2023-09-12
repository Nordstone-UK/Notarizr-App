import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import MainButton from '../../components/MainGradientButton/MainButton';
import SkipButton from '../../components/MainGradientButton/SkipButton';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function OnboardingScreen3({navigation}, props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/screen3.png')}
        style={styles.imagestyle}
      />
      <Text style={styles.textHeading}>Browse Notary lawyer near by you.</Text>
      <Text style={styles.textSubheading}>
        Our app can provide you the Mobile and Online services
      </Text>
      <GradientButton
        Title="Get Started"
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        viewStyle={props.viewStyle}
        GradiStyles={props.GradiStyles}
        onPress={() => navigation.navigate('LoginScreen')}
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
    marginHorizontal: heightToDp(5),
    textAlign: 'center',
    fontSize: heightToDp(8),
    fontStyle: 'normal',
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
  textSubheading: {
    color: '#000',
    textAlign: 'center',
    fontSize: heightToDp(5.5),
    fontStyle: 'normal',
    fontWeight: '500',
    fontFamily: 'Manrope',
    marginTop: heightToDp(5),
    marginHorizontal: heightToDp(8),
  },
});
