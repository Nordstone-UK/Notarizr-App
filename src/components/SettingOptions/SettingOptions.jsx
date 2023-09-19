import {StyleSheet, Image, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function SettingOptions(props) {
  return (
    <TouchableOpacity style={styles.optionContainer} onPress={props.onPress}>
      <View style={styles.iconsetting}>
        <Image source={props.icon} style={styles.icon} />
        <Text style={styles.settingText}>{props.Title}</Text>
      </View>
      <Image
        source={require('../../../assets/arrow.png')}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthToDp(5),
    padding: widthToDp(5),
    borderRadius: 10,
    backgroundColor: Colors.DullWhite,
    marginVertical: heightToDp(2),
  },
  iconsetting: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: widthToDp(4),
    marginLeft: widthToDp(3),
    color: Colors.TextColor,
  },
});
