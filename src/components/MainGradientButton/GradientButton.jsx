import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {widthToDp} from '../../utils/Responsive';

export default function GradientButton(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <LinearGradient
        colors={props.colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[styles.gradientstyles, props.GradiStyles]}>
        <View style={[styles.buttonToucableOpacity, props.viewStyle]}>
          {props.loading || false ? (
            <ActivityIndicator
              style={[styles.buttonText, props.styles]}
              size="large"
              color="#ffff"
            />
          ) : (
            <Text style={[styles.buttonText, props.styles]}>{props.Title}</Text>
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
  },

  buttonText: {
    padding: '5%',
    color: '#fff',
    fontSize: widthToDp(6),
    textAlign: 'center',
    fontFamily: 'Manrope-Bold',
  },
});
