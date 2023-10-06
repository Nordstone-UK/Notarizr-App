import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Colors from '../../themes/Colors';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import {useNavigation} from '@react-navigation/native';
import LabelTextInput from '../LabelTextInput/LabelTextInput';

export default function NavigationHeader(props) {
  const navigation = useNavigation();
  return (
    <View
      style={[
        {marginTop: heightToDp(10)},
        !props.isVisible && {marginBottom: heightToDp(5)},
      ]}>
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
              <TouchableOpacity onPress={props.midImgPress}>
                <Image source={props.midImg} />
              </TouchableOpacity>
            )}
            {props.lastImg && (
              <TouchableOpacity onPress={props.lastImgPress}>
                <Image
                  source={props.lastImg}
                  style={{tintColor: Colors.TextColor}}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {(false || props?.isVisible) && (
        <LabelTextInput
          leftImageSoucre={require('../../../assets/Search.png')}
          placeholder={'Search'}
          InputStyles={{
            padding: widthToDp(2),
          }}
          defaultValue={props.searchQuery}
          onChangeText={props.onChangeText}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginRight: widthToDp(2),
    marginLeft: widthToDp(4),

    alignItems: 'center',
  },
  touchContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
  },
  Flexcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginLeft: widthToDp(3),
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    width: widthToDp(15),
    justifyContent: 'space-between',
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
