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
  console.log('props.shoe', props.Show);
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
        <Text style={styles.text}>
          {splitStringBefore2ndWord(props.location)}
        </Text>
        {/* <Image
          style={[styles.icon, {tintColor: Colors.Red, marginTop: 20}]}
          source={require('../../../assets/locationIcon.png')}
        /> */}
      </View>
      {props.Show && (
        <Image source={require('../../../assets/checkIcon.png')} />
      )}
      {!props.booking && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={props.onEdit}>
            <Image
              source={require('../../../assets/editIcon.png')}
              style={[styles.icon, {tintColor: Colors.Orange}]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={props.onDelete}>
            <Image
              source={require('../../../assets/deleteIcon.png')}
              style={[styles.icon, {tintColor: Colors.Orange}]}
            />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'row',
    marginTop: widthToDp(7),
    padding: widthToDp(4),
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
    marginVertical: heightToDp(1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    width: widthToDp(55),
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(2),
    marginTop: widthToDp(2),
  },
  icon: {
    marginHorizontal: widthToDp(2),
    width: widthToDp(5),
    height: heightToDp(5),
  },
  buttonContainer: {
    position: 'absolute',
    top: 7,
    right: 5,
    flexDirection: 'row',
    // padding:20,
  },
  button: {
    marginLeft: 5,
  },
});
