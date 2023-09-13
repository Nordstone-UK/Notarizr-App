import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function ChatContacts(props) {
  return (
    <View style={styles.container}>
      <Image source={props.image} style={styles.image} />
      <Text style={styles.text}>{props.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    margin: widthToDp(4),
    alignItems: 'center',
    marginVertical: heightToDp(4),
  },
  image: {
    width: widthToDp(15),
    height: heightToDp(15),
  },
  text: {
    fontSize: widthToDp(4.5),
    marginLeft: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-SemiBold',
  },
});
