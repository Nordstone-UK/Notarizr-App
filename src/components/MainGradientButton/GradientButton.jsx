import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {width, widthToDp} from '../../utils/Responsive';

export default function GradientButton({fontSize = widthToDp(6), ...props}) {
  return (
    <TouchableOpacity onPress={props.onPress} disabled={props?.isDisabled}>
      <LinearGradient
        colors={props?.colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[styles.gradientstyles, props?.GradiStyles]}>
        <View style={[styles.buttonToucableOpacity, props?.viewStyle]}>
          {props?.loading || props?.isDisabled || false ? (
            <ActivityIndicator
              style={[styles.buttonText, props.styles]}
              size="large"
              color="#ffff"
            />
          ) : (
            <Text
              style={[props?.styles, styles.buttonText, {fontSize: fontSize}]}>
              {props?.Title}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradientstyles: {
    borderRadius: 10,
    alignSelf: 'center',
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    padding: '5%',
    color: '#fff',
    // fontSize: widthToDp(6),
    textAlign: 'center',
    fontFamily: 'Manrope-Bold',
  },
});
