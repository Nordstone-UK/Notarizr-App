import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {heightToDp} from '../../utils/Responsive';

export default function SignupButton(props) {
  return (
    <View>
      <LinearGradient
        colors={props.colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.gradientstyles}>
        <TouchableOpacity onPress={props.handleFunction}>
          <View style={{paddingVertical: '10%'}}>
            <Text style={[styles.buttonText, props.TextStyle]}>
              {props.Title}
            </Text>
            <View style={styles.TextView}></View>
          </View>
        </TouchableOpacity>
        <Image source={props.picture} style={styles.image} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientstyles: {
    flexDirection: 'row',
    marginTop: '10%',
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  buttonToucableOpacity: {},
  buttonText: {
    paddingHorizontal: '5%',
    fontSize: 25,
    textAlign: 'left',
  },
  image: {
    marginTop: heightToDp(3),
    alignItems: 'flex-end',
  },
  TextView: {
    marginLeft: '5%',
    borderBottomWidth: 5,
    borderBottomColor: '#FF7A28',
    width: '15%',
    borderRadius: 15,
  },
});
