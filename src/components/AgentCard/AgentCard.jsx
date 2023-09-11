import {StyleSheet, Text, Image, View, Platform} from 'react-native';
import React from 'react';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LinearGradient from 'react-native-linear-gradient';
import AgentCardPicture from '../AgentCardPicture/AgentCardPicture';

export default function AgentCard(props) {
  const OrangeGradient = string => {
    return (
      <LinearGradient
        style={styles.locationStyle}
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text style={styles.placestyle}>{string}</Text>
      </LinearGradient>
    );
  };
  const address = 'Shop 28, jigara Kalanad Road';
  const [firstPart, secondPart] = splitStringBefore4thWord(address);
  function splitStringBefore4thWord(inputString) {
    // Split the string by space
    const words = inputString.split(' ');

    // Check if there are at least 4 words
    if (words.length >= 4) {
      // Join the first three words with space
      const firstPart = words.slice(0, 3).join(' ');

      // Join the remaining words with space
      const secondPart = words.slice(3).join(' ');

      return [firstPart, secondPart];
    } else {
      // If there are fewer than 4 words, return the original string as the first part
      return [inputString, ''];
    }
  }
  return (
    <View style={styles.cardContainer}>
      <View style={{flexDirection: 'row'}}>
        <View style={{paddingHorizontal: widthToDp(2)}}>
          <AgentCardPicture />
        </View>
        <View
          style={{
            paddingVertical: heightToDp(2),
            paddingHorizontal: widthToDp(2),
          }}>
          <Text style={styles.nameHeading}>Advocate Parimal M. Trivedi</Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}>
            <Image source={require('../../../assets/locationIcon.png')} />
            {OrangeGradient('At Office')}
            <View
              style={{
                width: widthToDp(40),
              }}>
              <Text style={styles.address}>{firstPart}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}>
            <Text style={[styles.address, {marginLeft: widthToDp(8)}]}>
              {secondPart}
            </Text>
          </View>
          <View style={styles.orangeline} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: heightToDp(5),
              marginRight: widthToDp(2),
            }}>
            <Text style={styles.totalStyles}>Total</Text>
            <Text style={styles.paymentStyle}>$400</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderColor: '#1212',
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: widthToDp(2),
    paddingTop: heightToDp(2),
    paddingBottom: heightToDp(4),
    marginHorizontal: heightToDp(2),
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  nameHeading: {
    fontSize: widthToDp(5),
    maxWidth: widthToDp(40),
    paddingVertical: heightToDp(2),
    color: Colors.TextColor,
    fontWeight: '700',
  },
  dateContainer: {
    position: 'absolute',
    bottom: heightToDp(-2),
    paddingHorizontal: widthToDp(6.5),
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
    position: 'absolute',
    marginLeft: widthToDp(1.5),
    bottom: heightToDp(19),
  },
  cardImage: {
    margin: widthToDp(1.5),
    width: widthToDp(26),
  },
  dateStyle: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: widthToDp(5),
  },
  address: {
    color: Colors.TextColor,
    fontSize: widthToDp(4),
    // width: widthToDp(40),
  },
  placestyle: {
    color: Colors.white,
    fontSize: widthToDp(4),
  },
  locationStyle: {
    borderRadius: 20,
    paddingHorizontal: widthToDp(2),
    marginHorizontal: widthToDp(0.5),
    height: heightToDp(6),
  },
  orangeline: {
    borderBottomWidth: 1,
    borderColor: Colors.Orange,
    width: widthToDp(70),
    right: widthToDp(10),
    zIndex: -1,
    paddingVertical: heightToDp(2),
  },
  totalStyles: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
  },
  paymentStyle: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontWeight: '800',
    marginRight: widthToDp(10),
  },
});
