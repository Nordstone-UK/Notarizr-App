import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

export default function SkipButton(props) {
  return (
    <View>
      <TouchableOpacity style={styles.buttonToucableOpacity}>
        <Text style={styles.buttonText}>{props.Title}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonToucableOpacity: {
    marginTop: '2%',
    alignSelf: 'center',
  },
  buttonText: {
    padding: '5%',
    color: '#FF7A28',
    fontSize: 20,
    textAlign: 'center',
  },
});
