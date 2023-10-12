import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LabelTextInput from '../LabelTextInput/LabelTextInput';
import {useSelector} from 'react-redux';
export default function HomeScreenHeader(props) {
  const {first_name, profile_picture} = useSelector(state => state.user.user);
  console.log('profile_picture', profile_picture);
  return (
    <View>
      <View style={styles.namebar}>
        <Image
          source={{
            uri: 'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
          }}
          style={styles.imagestyles}
          onError={error => console.error('Image load error:', error)}
        />
        <Text style={[styles.textHeading, props.HeaderStyle]}>
          {first_name}
        </Text>
      </View>
      <Text style={styles.heading}>{props.Title}</Text>
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
  imagestyles: {
    width: widthToDp(15),
    height: heightToDp(15),
    borderRadius: 10,
  },
});
