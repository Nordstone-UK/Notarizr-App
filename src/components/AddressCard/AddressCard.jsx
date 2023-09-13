import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function AddressCard() {
  const OrangeGradient = string => {
    return (
      <LinearGradient
        style={styles.locationStyle}
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text style={styles.placestyle}>{string}</Text>
      </LinearGradient>
    );
  };
  return (
    <View style={styles.flexContainer}>
      <Image source={require('../../../assets/addressPic.png')} />
      <View style={styles.textContainer}>
        {OrangeGradient('Home')}
        <Text style={styles.text}>
          Flat no.101, James Street, New York, 123456
        </Text>
      </View>
      <Image source={require('../../../assets/option.png')} />
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'row',
    padding: widthToDp(5),
    marginHorizontal: widthToDp(2),
    borderColor: Colors.DullWhite,
    borderWidth: 2,
    borderRadius: 10,
  },
  placestyle: {
    color: Colors.white,
    fontSize: widthToDp(4),
  },
  locationStyle: {
    borderRadius: 20,
    paddingHorizontal: widthToDp(2),
    marginHorizontal: widthToDp(0.5),
    height: heightToDp(6),
    width: widthToDp(15),
    marginTop: widthToDp(2),
  },
  textContainer: {
    marginHorizontal: widthToDp(3),
  },
  text: {
    width: widthToDp(45),
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    marginLeft: widthToDp(2),
    marginTop: widthToDp(2),
  },
});
