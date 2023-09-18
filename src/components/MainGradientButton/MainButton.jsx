import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {widthToDp} from '../../utils/Responsive';

export default function MainButton(props) {
  return (
    <View>
      <LinearGradient
        colors={props.colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[styles.gradientstyles, props.GradiStyles]}>
        <TouchableOpacity
          style={[styles.buttonToucableOpacity, props.viewStyle]}
          onPress={props.onPress}>
          <Text style={[styles.buttonText, props.styles]}>{props.Title}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientstyles: {
    borderRadius: 10,
    alignSelf: 'center',
  },
  buttonToucableOpacity: {},
  buttonText: {
    padding: '5%',
    color: '#fff',
    fontSize: widthToDp(3),
    textAlign: 'center',
    fontFamily: 'Manrope-Bold',
  },
});
