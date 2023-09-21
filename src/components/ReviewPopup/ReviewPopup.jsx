import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import LabelTextInput from '../LabelTextInput/LabelTextInput';
import GradientButton from '../MainGradientButton/GradientButton';

export default function ReviewPopup(props) {
  return (
    <View style={styles.bottonSheet}>
      <Text style={styles.text}>Please provide us with your feedback</Text>
      <Image
        source={require('../../../assets/orangeStart1.png')}
        style={styles.icon}
      />
      <LabelTextInput
        LabelTextInput={'Reveiw'}
        labelStyle={{
          backgroundColor: Colors.PinkBackground,
          color: Colors.TextColor,
        }}
        Label={true}
      />
      <View style={styles.btn}>
        <GradientButton
          Title="Submit"
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          onPress={props.onPress}
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
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  btn: {
    marginVertical: heightToDp(5),
  },
  icon: {
    height: heightToDp(8),
    alignSelf: 'center',
    resizeMode: 'contain',
    marginVertical: heightToDp(5),
  },
  text: {
    marginTop: heightToDp(5),
    fontSize: widthToDp(6),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    alignSelf: 'center',
  },
});
