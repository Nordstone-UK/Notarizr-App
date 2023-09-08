import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

export default function SignupButton(props) {
  return (
    <View>
      <LinearGradient
        colors={props.colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.gradientstyles}>
        <TouchableOpacity>
          <View style={{paddingVertical: '10%'}}>
            <Text style={[styles.buttonText, props.TextStyle]}>
              {props.Title}
            </Text>
            <View style={styles.TextView}></View>
          </View>
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
    paddingHorizontal: '5%',
    fontSize: 25,
    textAlign: 'left',
  },

  TextView: {
    marginLeft: '5%',
    borderBottomWidth: 5,
    borderBottomColor: '#FF7A28',
    width: '20%',
    borderRadius: 15,
  },
});
