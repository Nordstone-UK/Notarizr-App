import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';

import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
export default function AgentCardPicture() {
  return (
    <View
      style={
        {
          // padding: widthToDp(2),
        }
      }>
      <Image
        source={require('../../../assets/agentCardPic.png')}
        style={styles.cardImage}
      />
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
  cardContainer: {
    borderColor: '#1212',
    borderWidth: 2,
    borderRadius: 10,
    margin: widthToDp(5),
    paddingVertical: heightToDp(5),
    marginHorizontal: heightToDp(2),
  },
  nameHeading: {
    fontSize: widthToDp(5),
    width: widthToDp(60),
    color: Colors.TextColor,
    fontWeight: '700',
  },
  dateContainer: {
    position: 'absolute',
    bottom: heightToDp(-2),
    paddingHorizontal: widthToDp(7.8),
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginLeft: widthToDp(1.5),
    alignItems: 'center',
  },
  ImageProces: {
    color: '#fff',
    backgroundColor: Colors.CardProcessColor,
    fontWeight: '700',
    fontSize: widthToDp(4),
    paddingHorizontal: widthToDp(2.7),
    paddingVertical: widthToDp(1),
    position: 'absolute',
    marginLeft: widthToDp(1.5),
    bottom: heightToDp(18),
  },
  cardImage: {
    margin: widthToDp(1.5),
    width: widthToDp(26),
    borderRadius: 10,
  },
  dateStyle: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: widthToDp(4),
    marginVertical: heightToDp(0.5),
  },
  address: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    width: widthToDp(50),
  },
  placestyle: {
    color: Colors.white,
    fontSize: widthToDp(5),
  },
  locationStyle: {
    borderRadius: 10,
    paddingHorizontal: widthToDp(2),
  },
  orangeline: {
    borderBottomWidth: 2,
    borderColor: Colors.Orange,
    width: widthToDp(70),
    right: widthToDp(4),
    zIndex: -1,
    paddingVertical: heightToDp(2),
  },
  totalStyles: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontWeight: '600',
  },
  paymentStyle: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontWeight: '800',
    marginRight: widthToDp(15),
  },
});
