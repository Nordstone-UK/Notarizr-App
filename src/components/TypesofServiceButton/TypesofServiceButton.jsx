import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import MainButton from '../MainGradientButton/MainButton';
import Colors from '../../themes/Colors';
import {width, widthToDp} from '../../utils/Responsive';

export default function TypesofServiceButton(props) {
  return (
    <View style={[styles.container, props?.backgroundColor]}>
      <View style={{flexDirection: 'row'}}>
        <View
          style={{
            width: widthToDp(40),
          }}>
          <Text style={styles.heading}>{props?.Title}</Text>
          <MainButton
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            Title="Continue"
            TextStyle={{color: '#fff'}}
            styles={{padding: widthToDp(2), fontSize: widthToDp(4)}}
          />
        </View>
        <Image source={props.Image} style={styles.Image} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: Colors.Pink,
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(2),
    paddingHorizontal: widthToDp(5),
    paddingVertical: widthToDp(10),
    borderRadius: 10,
  },
  heading: {
    color: Colors.white,
    fontSize: widthToDp(6),
    fontWeight: '700',
  },
  Image: {
    position: 'absolute',
    // alignSelf: 'flex-end',
    right: widthToDp(-5),
    bottom: widthToDp(-10),
    resizeMode: 'contain',
  },
});
