import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function AgentVerfiedScreen({navigation}) {
  return (
    <View style={styles.container}>
      <View style={styles.completeIcon}>
        <Image
          source={require('../../../assets/question.png')}
          style={styles.icon}
        />
        <Text style={styles.text}>
          Please Wait, {'\n'} your application is being reviewed.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  completeIcon: {
    marginTop: heightToDp(25),
  },
  groupimage: {
    flex: 1,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
    width: widthToDp(50),
    height: widthToDp(50),
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: widthToDp(7),
    fontFamily: 'Manrope-Bold',
  },
  complete: {
    alignSelf: 'flex-end',
    width: widthToDp(90),
    resizeMode: 'contain',
    flex: 1,
  },
});
