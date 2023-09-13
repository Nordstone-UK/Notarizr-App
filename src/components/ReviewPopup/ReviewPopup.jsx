import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import LabelTextInput from '../LabelTextInput/LabelTextInput';
import GradientButton from '../MainGradientButton/GradientButton';

export default function ReviewPopup() {
  return (
    <View style={styles.bottonSheet}>
      <Text style={styles.text}>Please provide us with your feedback</Text>
      <Image
        source={require('../../../assets/orangeStar.png')}
        style={styles.icon}
      />
      <LabelTextInput
        LabelTextInput={'Reveiw'}
        labelStyle={{backgroundColor: Colors.PinkBackground}}
      />
      <View style={styles.btn}>
        <GradientButton
          Title="Submit"
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottonSheet: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.PinkBackground,
  },
  btn: {
    marginVertical: heightToDp(5),
  },
  icon: {
    width: widthToDp(30),
    height: heightToDp(30),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  text: {
    fontSize: widthToDp(6),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    alignSelf: 'center',
  },
});
