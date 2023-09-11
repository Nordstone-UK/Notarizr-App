import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';

export default function NavigationHeader(props) {
  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/backIcon.png')} />
      <View style={styles.Flexcontainer}>
        <Text style={styles.naveheader}>{props.Title}</Text>
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
  Flexcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  naveheader: {
    fontSize: widthToDp(7),
    fontWeight: '700',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
    marginRight: widthToDp(10),
  },
});
