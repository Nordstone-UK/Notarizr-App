import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LabelTextInput from '../LabelTextInput/LabelTextInput';

export default function HomeScreenHeader(props) {
  return (
    <View>
      <View style={styles.namebar}>
        <Image
          source={require('../../../assets/clientPic.png')}
          style={styles.imagestyles}
        />
        <Text style={[styles.textHeading, props.HeaderStyle]}>Lamthao</Text>
      </View>
      <Text style={styles.heading}>{props.Title}</Text>
      <LabelTextInput
        leftImageSoucre={require('../../../assets/Search.png')}
        placeholder={'Search'}
        InputStyles={{
          padding: widthToDp(2),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  namebar: {
    flexDirection: 'row',
    alignContent: 'center',
    margin: widthToDp(5),
  },
  textHeading: {
    alignSelf: 'center',
    fontSize: widthToDp(6),
    fontWeight: '700',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
  },
  heading: {
    fontSize: widthToDp(7),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
  },
});
