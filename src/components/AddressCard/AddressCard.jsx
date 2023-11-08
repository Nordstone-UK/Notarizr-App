import {Image, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {
  heightToDp,
  splitStringBefore2ndWord,
  widthToDp,
} from '../../utils/Responsive';

export default function AddressCard(props) {
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
    <TouchableOpacity style={styles.flexContainer} onPress={props.onPress}>
      <Image source={require('../../../assets/addressPic.png')} />
      <View style={styles.textContainer}>
        {/* {OrangeGradient('Home')} */}
        <Text style={styles.text}>
          {splitStringBefore2ndWord(props.location)}
        </Text>
      </View>
      {props.Show && (
        <Image source={require('../../../assets/checkIcon.png')} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'row',
    margin: widthToDp(5),
    padding: widthToDp(2),
    marginHorizontal: widthToDp(2),
    borderRadius: 10,
    backgroundColor: Colors.white,
    elevation: 10,
    position: 'relative',
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
    width: widthToDp(55),
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(2),
    marginTop: widthToDp(2),
  },
});
