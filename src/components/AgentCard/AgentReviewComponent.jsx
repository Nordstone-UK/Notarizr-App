import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function AgentReviewComponent() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-end',
      }}>
      <LinearGradient
        style={styles.dateContainer}
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text style={styles.dateStyle}>5.0</Text>
        <Image
          source={require('../../../assets/reviewStars.png')}
          style={styles.star}
        />
        <Text style={styles.rating}>Rating</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  dateContainer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
  },
  star: {
    width: widthToDp(20),
  },
  dateStyle: {
    color: Colors.white,
    fontFamily: 'Poppins-Bold',
    fontSize: widthToDp(7),
  },
  rating: {
    color: Colors.white,
    fontFamily: 'Poppins-Light',
    fontSize: widthToDp(3.5),
  },
});