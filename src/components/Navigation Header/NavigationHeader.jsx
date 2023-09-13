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
      <Image
        source={require('../../../assets/userPic.png')}
        style={styles.profilePic}
      />
      <View style={styles.Flexcontainer}>
        <Text style={styles.naveheader}>{props?.Title}</Text>
        {props.midImg && (
          <Image
            source={props.midImg}
            style={{marginHorizontal: widthToDp(5)}}
          />
        )}
        {props.lastImg && <Image source={props.lastImg} />}
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
    alignItems: 'center',
  },
  naveheader: {
    fontSize: widthToDp(7),
    fontWeight: '700',
    color: Colors.TextColor,
    marginLeft: widthToDp(3),
  },
  profilePic: {
    marginLeft: widthToDp(2),
  },
});
