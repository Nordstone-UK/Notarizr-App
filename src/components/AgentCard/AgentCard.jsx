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
  const address = props?.agentAddress;
  const name = props?.agentName;

  const [firstPart, secondPart] = splitStringBefore4thWord(address);
  const [NameFirstPart, NameSecondPart] = separateStringAfterFirstWord(name);

  function splitStringBefore4thWord(inputString) {
    if (inputString) {
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
    } // Split the string by space
  }
  function separateStringAfterFirstWord(inputString) {
    const words = inputString.split(' ');

    if (words.length > 1) {
      const firstWord = words[0];
      const restOfTheString = words.slice(1).join(' ');
      return [firstWord, restOfTheString];
    } else {
      // If there is only one word, return it as the first part and an empty string as the second part.
      return [inputString, ''];
    }
  }
  return (
    <View style={styles.cardContainer}>
      <View style={{flexDirection: 'row'}}>
        <View style={{paddingHorizontal: widthToDp(2)}}>
          <AgentCardPicture Review={props.Review || false} />
        </View>
        <View
          style={{
            paddingVertical: heightToDp(2),
            paddingHorizontal: widthToDp(2),
          }}>
          <View
            style={{
              paddingVertical: heightToDp(2),
            }}>
            <Text style={styles.nameHeading}>{NameFirstPart}</Text>
            <Text style={styles.nameHeading}>{NameSecondPart}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}>
            <Image source={props.image} />
            {props?.OrangeText && OrangeGradient(props?.OrangeText)}
            <View
              style={{
                width: widthToDp(40),
                marginLeft: widthToDp(1),
              }}>
              <Text style={styles.address}>{firstPart}</Text>
            </View>
          </View>
          <View>
            <Text
              style={[
                styles.address,
                props.Review
                  ? {marginLeft: widthToDp(6)}
                  : {marginLeft: widthToDp(7)},
              ]}>
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
            <Text style={[styles.totalStyles, props.leftSideStyles]}>
              {props.bottomLeftText}
            </Text>
            <Text
              style={[
                styles.paymentStyle,
                props.rightSideStyles,
                props.Review
                  ? {
                      fontWeight: '400',
                    }
                  : {fontWeight: '800'},
              ]}>
              {props.bottomRightText}
            </Text>
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
    fontSize: widthToDp(4.5),
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
    marginRight: widthToDp(10),
  },
});