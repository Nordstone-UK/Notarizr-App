import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {width, widthToDp} from '../../utils/Responsive';

export default function CompanyHeader(props) {
  return (
    <View>
      <Image
        source={require('../../../assets/notarizrLogo.png')}
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
    marginTop: '15%',
    marginBottom: '10%',
  },
  textHeading: {
    color: '#000',
    fontSize: 27,
    fontStyle: 'normal',
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
});
