import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import MainButton from '../MainGradientButton/MainButton';
import Colors from '../../themes/Colors';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';

export default function TypesofServiceButton(props) {
  return (
    <View style={[styles.container, props?.backgroundColor]}>
      <View style={{flexDirection: 'row'}}>
        <View
          style={{
            minWidth: widthToDp(20),
            flex: 1,
          }}>
          <Text style={styles.heading}>{props?.Title}</Text>

          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: heightToDp(2),
            }}>
            <MainButton
              colors={
                props.colors || [
                  Colors.OrangeGradientStart,
                  Colors.OrangeGradientEnd,
                ]
              }
              Title={props.buttonTitle || 'Continue'}
              TextStyle={{color: '#fff'}}
              styles={{
                padding: widthToDp(2),
                fontSize: widthToDp(4),
                minWidth: widthToDp(25),
              }}
              onPress={props.onPress}
              isDisabled={props.isDisabled}
            />
          </View>
        </View>
        <Image source={props.Image} style={styles.Image} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: widthToDp(90),
    height: heightToDp(40),
    alignSelf: 'center',
    marginVertical: widthToDp(2),
    padding: widthToDp(5),
    borderRadius: 10,
  },
  heading: {
    color: Colors.white,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
  },
  Image: {
    width: widthToDp(10),
    height: heightToDp(30),
    resizeMode: 'contain',
    flex: 1,
  },
});
