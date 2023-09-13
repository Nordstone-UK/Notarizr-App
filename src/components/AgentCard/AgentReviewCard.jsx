import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function AgentReviewCard() {
  return (
    <View
      style={{
        marginTop: widthToDp(30),
      }}>
      <LinearGradient
        style={styles.dateContainer}
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text style={styles.dateStyle}>5.0</Text>
        <Image
          source={require('../../../assets/reviewStars.png')}
          style={{marginVertical: heightToDp(3)}}
        />
        <Text style={styles.dateStyle}>Rating</Text>
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

  dateStyle: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: widthToDp(4),
    marginVertical: heightToDp(0.5),
  },
});
