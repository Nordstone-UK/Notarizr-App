import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

export default function MainButton(props) {
  return (
    <View>
      <LinearGradient
        colors={props.colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[styles.gradientstyles]}>
        <TouchableOpacity
          style={[styles.buttonToucableOpacity, props.viewStyle]}>
          <Text style={[styles.buttonText, props.styles]}>{props.Title}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientstyles: {
    marginTop: '10%',
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
  },
  buttonToucableOpacity: {},
  buttonText: {
    padding: '5%',
    color: '#fff',
    fontSize: 25,
    textAlign: 'center',
  },
});
