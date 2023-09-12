import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function AgentTimeCard() {
  return (
    <View
      style={{
        marginTop: widthToDp(10),
      }}>
      <Text style={styles.ImageProces}>On Process</Text>
      <LinearGradient
        style={styles.dateContainer}
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text style={styles.dateStyle}>12:30</Text>
        <Text
          style={[
            styles.dateStyle,
            {fontWeight: '800', fontSize: widthToDp(6)},
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
    paddingHorizontal: widthToDp(7.8),
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
  },
  ImageProces: {
    color: '#fff',
    backgroundColor: Colors.CardProcessColor,
    fontWeight: '700',
    fontSize: widthToDp(4),
    paddingHorizontal: widthToDp(2.7),
    paddingVertical: widthToDp(1),
    marginTop: heightToDp(10),
  },

  dateStyle: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: widthToDp(4),
    marginVertical: heightToDp(0.5),
  },
});
