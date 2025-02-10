import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function SignupButton(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <LinearGradient
        colors={props.colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.gradientstyles}>
        <View style={styles.textContainer}>
          <Text style={[styles.buttonText, props.TextStyle]}>
            {props.Title}
          </Text>
          <View style={styles.TextView} />
        </View>

        <View style={styles.imageContainer}>
          <Image source={props.picture} style={styles.image} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradientstyles: {
    flexDirection: 'row',
    marginTop: widthToDp(5),
    borderRadius: 10,
    width: widthToDp(90),
    alignSelf: 'center',
    alignItems: 'center',
    padding: widthToDp(3),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: widthToDp(2),
  },
  buttonText: {
    flexShrink: 1,
    fontSize: 22,
    textAlign: 'left',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: widthToDp(3),
  },
  image: {
    marginTop: heightToDp(3),
    alignItems: 'flex-end',
    width: widthToDp(15),
    height: heightToDp(15),
    borderRadius: 50,
  },
  TextView: {
    marginTop: widthToDp(1),

    borderBottomWidth: 5,
    borderBottomColor: '#FF7A28',
    width: widthToDp(10),
    borderRadius: 15,
  },
});
