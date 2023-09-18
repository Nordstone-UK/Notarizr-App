import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import {useNavigation} from '@react-navigation/native';

export default function NavigationPaymentHeader(props) {
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
          {props.Payment || false ? (
            <Image
              source={require('../../../assets/greenIcon.png')}
              style={{marginRight: widthToDp(3)}}
            />
          ) : (
            <Image
              source={require('../../../assets/pending.png')}
              style={{marginRight: widthToDp(3)}}
            />
          )}

          {props.Payment || false ? (
            <Text style={styles.naveheader}>Payment Done</Text>
          ) : (
            <Text style={styles.naveheader}>Payment Pending</Text>
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
  },
});
