import {Image, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function DocumentComponent(props) {
  return (
    <View style={styles.container}>
      <View style={styles.contain}>
        <Image source={props.image} />
        <Text style={styles.text}>{props.Title || 'Medical Documents'}</Text>
      </View>
      <TouchableOpacity onPress={props.onPress}>
        <Image source={require('../../../assets/trash.png')} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: widthToDp(4),
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(2),
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.PinkBackground,
    borderRadius: 10,
  },
  contain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginHorizontal: widthToDp(3),
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-SemiBold',
  },
});
