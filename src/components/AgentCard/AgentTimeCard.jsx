import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React, {useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import SplashScreen from 'react-native-splash-screen';
export default function AgentTimeCard(props) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <View
      style={{
        marginTop: widthToDp(10),
      }}>
      <View
        style={[
          styles.ImageProces,
          props.task === 'On Process' && {
            backgroundColor: Colors.CardProcessColor,
          },
          props.task === 'Online' && {
            backgroundColor: Colors.DarkPink,
          },
          props.task === 'Completed' && {
            backgroundColor: Colors.Green,
          },
          props.task === 'Rejected' && {
            backgroundColor: Colors.Red,
          },
        ]}>
        <Text style={styles.text}>{props.task}</Text>
      </View>
      <LinearGradient
        style={styles.dateContainer}
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text style={styles.dateStyle}>12:30</Text>
        <Text
          style={[
            styles.dateStyle,
            {fontFamily: 'Poppins-Bold', fontSize: widthToDp(6)},
          ]}>
          22
        </Text>
        <Text style={styles.dateStyle}>Sep</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  dateContainer: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    alignItems: 'center',
  },
  ImageProces: {
    paddingHorizontal: widthToDp(2.7),
    paddingVertical: widthToDp(1),
    marginTop: heightToDp(10),
  },
  text: {
    alignSelf: 'center',
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: widthToDp(3.5),
  },

  dateStyle: {
    color: Colors.white,
    fontSize: widthToDp(4),
    fontFamily: 'Poppins-SemiBold',
  },
});
