import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Colors from '../../themes/Colors';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import {CommonActions, useNavigation} from '@react-navigation/native';

import LabelTextInput from '../LabelTextInput/LabelTextInput';

export default function NavigationHeader(props) {
  const navigation = useNavigation();
  const handleNavigateToTabScreen = () => {
    navigation.dispatch(
      CommonActions.navigate('HomeScreen', {
        screen: 'AllBookingScreen',
      }),
    );
  };
  return (
    <View
      style={[
        {marginTop: heightToDp(10)},
        !props.isVisible && {marginBottom: heightToDp(5)},
      ]}>
      <View style={styles.container}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {props.reset ? (
            <TouchableOpacity
              onPress={() => handleNavigateToTabScreen()}
              style={styles.touchContainer}>
              <Image
                source={require('../../../assets/backIcon.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() =>
                props?.payment
                  ? navigation.navigate('HomeScreen')
                  : navigation.goBack()
              }
              style={styles.touchContainer}>
              <Image
                source={require('../../../assets/backIcon.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
          )}
          {props.ProfilePic && (
            <Image source={props.ProfilePic} style={styles.profilePic} />
          )}
          <Text style={styles.naveheader}>{props?.Title}</Text>
        </View>
        <View style={[styles.Flexcontainer]}>
          <View style={styles.iconContainer}>
            {props.midImg && (
              <TouchableOpacity onPress={props.midImgPress}>
                <Image
                  source={props.midImg}
                  style={[
                    styles.backIcon,
                    props.midImg === require('../../../assets/Search.png') && {
                      width: widthToDp(5),
                      height: heightToDp(5),
                    },
                  ]}
                />
              </TouchableOpacity>
            )}
            {props.lastImg && (
              <TouchableOpacity onPress={props.lastImgPress}>
                <Image source={props.lastImg} style={[styles.backIcon]} />
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
    marginLeft: widthToDp(2),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  touchContainer: {
    flexDirection: 'row',
  },
  Flexcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: widthToDp(1),
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: widthToDp(2),
  },
  naveheader: {
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    marginHorizontal: widthToDp(2),
  },
  profilePic: {
    marginLeft: widthToDp(2),
    width: widthToDp(10),
    height: heightToDp(10),
    borderRadius: 25,
  },
  backIcon: {
    width: widthToDp(6),
    height: heightToDp(6),
    marginLeft: widthToDp(2),
  },
});
