import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import {useNavigation} from '@react-navigation/native';

export default function NavigationHeader(props) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.touchContainer}>
        <Image source={require('../../../assets/backIcon.png')} />
      </TouchableOpacity>
      {props.ProfilePic && (
        <Image source={props.ProfilePic} style={styles.profilePic} />
      )}
      <View
        style={[
          styles.Flexcontainer,
          props.ProfilePic && {
            marginLeft: widthToDp(1.5),
            justifyContent: 'space-around',
          },
        ]}>
        <Text style={styles.naveheader}>{props?.Title}</Text>
        <View style={styles.iconContainer}>
          {props.midImg && (
            <Image
              source={props.midImg}
              style={{marginRight: widthToDp(8), marginLeft: widthToDp(5)}}
            />
          )}
          {props.lastImg && (
            <Image
              source={props.lastImg}
              style={{tintColor: Colors.TextColor}}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(4),
    marginVertical: heightToDp(10),
    alignItems: 'center',
  },
  touchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Flexcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '85%',
    marginLeft: widthToDp(5),
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  naveheader: {
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  profilePic: {
    marginLeft: widthToDp(2),
    width: widthToDp(10),
    height: heightToDp(10),
  },
});
