import {
  StyleSheet,
  Text,
  Image,
  View,
  Platform,
  TouchableOpacity,
} from 'react-native';
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
  // const [NameFirstPart, NameSecondPart] = separateStringAfterFirstWord(name);

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
      <View style={{flexDirection: 'row', margin: heightToDp(1)}}>
        <AgentCardPicture
          task={props.task}
          source={props.source}
          dateofBooking={props.dateofBooking}
          timeofBooking={props.timeofBooking}
          createdAt={props.createdAt}
        />
        <View
          style={{
            width: widthToDp(50),
            marginTop: heightToDp(2),
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: widthToDp(55),
            }}>
            <View>
              <Text style={styles.nameHeading}>{name}</Text>
            </View>
            <TouchableOpacity>
              <Image source={require('../../../assets/option.png')} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Image source={props.image} />
            {props?.dateofBooking
              ? OrangeGradient('At Office')
              : OrangeGradient('At Home')}
            <View
              style={{
                marginLeft: widthToDp(1),
              }}>
              <Text style={styles.address}>{firstPart}</Text>
            </View>
          </View>
          <View>
            <Text style={[styles.address, {marginLeft: widthToDp(6)}]}>
              {secondPart}
            </Text>
          </View>
          <View style={[styles.orangeline]} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: heightToDp(2),
            }}>
            <Text
              style={[
                styles.totalStyles,
                props.leftSideStyles,

                {fontFamily: 'Poppins-Bold', fontSize: widthToDp(4.5)},
              ]}>
              {props.bottomLeftText}
            </Text>
            <Text
              style={[
                styles.paymentStyle,
                props.rightSideStyles,
                {
                  fontFamily: 'Poppins-Bold',
                  fontSize: widthToDp(4.5),
                },
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
    flex: 1,
    backgroundColor: Colors.white,
    elevation: 30,
    borderRadius: 10,
    marginHorizontal: heightToDp(5),
    marginVertical: heightToDp(2),
  },
  nameHeading: {
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Poppins-Bold',
  },
  address: {
    color: Colors.TextColor,
    fontSize: widthToDp(3.5),
    fontFamily: 'Poppins-Regular',
  },
  placestyle: {
    color: Colors.white,
    fontSize: widthToDp(3.5),
    fontFamily: 'Poppins-Regular',
  },
  locationStyle: {
    borderRadius: 20,
    paddingHorizontal: widthToDp(1.5),
  },
  orangeline: {
    flex: 0.5,
    marginBottom: heightToDp(5),
    borderBottomWidth: 1,
    borderColor: Colors.Orange,
    width: widthToDp(60),
    right: widthToDp(5),
    zIndex: -2,
    paddingVertical: heightToDp(2),
  },
  totalStyles: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Poppins-Regular',
  },
  paymentStyle: {
    color: Colors.TextColor,
  },
});
