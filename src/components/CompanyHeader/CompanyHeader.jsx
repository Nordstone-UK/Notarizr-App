import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';

export default function CompanyHeader(props) {
  return (
    <View>
      <Image
        source={require('../../../assets/notarizrLogo1.png')}
        style={styles.imagestyles}
      />
      <Text style={[styles.textHeading, props.HeaderStyle]}>
        {props.Header}
      </Text>
      <Text style={props.subHeadingStyle}>{props.subHeading || null}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  imagestyles: {
    resizeMode: 'contain',
    alignSelf: 'center',
    width: widthToDp(65),
    height: heightToDp(20),
    marginVertical: widthToDp(8),
  },
  textHeading: {
    color: '#000',
    fontSize: widthToDp(7),
    fontStyle: 'normal',
    fontFamily: 'Manrope-Bold',
  },
});
