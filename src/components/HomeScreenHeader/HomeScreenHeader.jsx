import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LabelTextInput from '../LabelTextInput/LabelTextInput';
import {useSelector} from 'react-redux';
import MainButton from '../MainGradientButton/MainButton';
import {useNavigation} from '@react-navigation/native';
export default function HomeScreenHeader(props) {
  const userInfo = useSelector(state => state.user.user);
  const navigation = useNavigation();
  return (
    <View>
      {userInfo !== null ? (
        <View style={styles.namebar}>
          <Image
            source={{
              uri: userInfo?.profile_picture,
            }}
            style={styles.imagestyles}
            onError={error => console.error('Image load error:', error)}
          />
          <Text
            style={[
              styles.textHeading,
              props.HeaderStyle,
              {marginLeft: widthToDp(5)},
            ]}>
            {userInfo?.first_name}
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.namebar,
            {justifyContent: 'space-between', alignItems: 'center'},
          ]}>
          <Text style={[styles.textHeading, props.HeaderStyle]}>Hi There,</Text>
          <MainButton
            colors={[Colors.OrangeGradientEnd, Colors.OrangeGradientEnd]}
            Title="Log In"
            TextStyle={{color: '#fff'}}
            styles={{
              padding: widthToDp(1),
              fontSize: widthToDp(3.7),
              minWidth: widthToDp(20),
            }}
            GradiStyles={{borderRadius: 5}}
            onPress={() => navigation.navigate('LoginScreen')}
          />
        </View>
      )}
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
    fontSize: widthToDp(5),
    fontWeight: '700',
    color: Colors.TextColor,
  },
  heading: {
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
    marginBottom: height * 0.02,
  },
  imagestyles: {
    width: widthToDp(15),
    height: heightToDp(15),
    borderRadius: 10,
  },
});
