import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function AgentReviewComponent(props) {
  return (
    <View style={{}}>
      {props.task && (
        <View
          style={[
            styles.ImageProces,
            props.task && {
              backgroundColor: Colors.CardProcessColor,
            },
            props.task === 'In Process' && {
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
            props.task === 'Pending' && {
              backgroundColor: Colors.Orange,
            },
          ]}>
          <Text style={styles.text}>{props.task}</Text>
        </View>
      )}

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
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    alignItems: 'center',
    padding: widthToDp(1),
  },
  star: {
    width: widthToDp(15),
    height: widthToDp(2),
    resizeMode: 'contain',
  },
  dateStyle: {
    color: Colors.white,
    fontFamily: 'Poppins-Bold',
    fontSize: widthToDp(6),
    marginVertical: heightToDp(-1),
  },
  rating: {
    color: Colors.white,
    fontFamily: 'Poppins-Regular',
    fontSize: widthToDp(3.5),
  },
  ImageProces: {
    paddingVertical: widthToDp(1),
  },
  text: {
    alignSelf: 'center',
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: widthToDp(3),
    marginVertical: heightToDp(-1),
  },
});
