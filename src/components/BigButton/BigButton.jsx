import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function BigButton(props) {
  const LastNumber = props?.number;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: Colors.PinkBackground,
        borderRadius: 15,
        padding: widthToDp(4),
        width: widthToDp(80),
        flexDirection: 'row',
        marginBottom: widthToDp(2),
        height: heightToDp(25),
        alignItems: 'center',
      }}
      onPress={props.onPress}>
      <View>
        <Text
          style={{
            color: Colors.TextColor,
            fontFamily: 'Manrope-Bold',
            marginLeft: widthToDp(2),
            fontSize: widthToDp(5),
          }}>
          {props?.Heading}
        </Text>
        {props?.number ? (
          <Text
            style={{
              color: Colors.TextColor,
              fontFamily: 'Manrope-Bold',
              fontSize: widthToDp(6),
              marginLeft: widthToDp(3),
            }}>
            {props?.number} {props.unitOfMeasurment}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          marginLeft: 'auto',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={require('../../../assets/arrow.png')}
          style={{width: 15, height: 15, resizeMode: 'contain'}}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});
