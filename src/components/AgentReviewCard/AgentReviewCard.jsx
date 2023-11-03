import {
  StyleSheet,
  Text,
  Image,
  View,
  Platform,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import React from 'react';
import {
  capitalizeFirstLetter,
  heightToDp,
  widthToDp,
} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LinearGradient from 'react-native-linear-gradient';
import AgentReviewComponent from '../AgentCard/AgentReviewComponent';

export default function AgentReviewCard(props) {
  const address = capitalizeFirstLetter(props?.agentAddress);
  const name = props?.agentName;

  const [firstPart, secondPart] = splitStringBefore2ndWord(address);
  // console.log(props.source);
  function splitStringBefore2ndWord(inputString) {
    if (inputString) {
      const words = inputString.split(' ');

      // Check if there are at least 2 words
      if (words.length >= 2) {
        // Join the first two words with space
        const firstPart = words.slice(0, 2).join(' ');

        // Join the remaining words with space
        const secondPart = words.slice(2).join(' ');

        return [firstPart, secondPart];
      } else {
        // If there are fewer than 2 words, return the original string as the first part
        return [inputString, ''];
      }
    } else {
      return ['', '']; // Return empty strings if the inputString is empty
    }
  }
  function separateStringAfterFirstWord(inputString) {
    const words = inputString.split(' ');

    if (words.length > 1) {
      const firstWord = words[0];
      const restOfTheString = words.slice(1).join(' ');
      return [firstWord, restOfTheString];
    } else {
      return [inputString, ''];
    }
  }
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={props.onPress}>
      <View style={{flexDirection: 'row'}}>
        <View
          style={{
            flex: 1,
            margin: widthToDp(2),
            justifyContent: 'center',
          }}>
          <Image source={props.source} style={styles.cardImage} />
          <AgentReviewComponent task={props.task} />
        </View>
        <View>
          <View
            style={{
              width: widthToDp(50),
              marginTop: heightToDp(2),
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text numberOfLines={1} style={styles.nameHeading}>
                  {name}
                </Text>
              </View>
              {/* <TouchableOpacity>
                <Image source={require('../../../assets/option.png')} />
              </TouchableOpacity> */}
            </View>
            <View
              style={{
                marginTop: heightToDp(2),
                flexDirection: 'row',
              }}>
              <Image
                source={
                  require('../../../assets/locationIcon.png') || props?.image
                }
                style={{width: widthToDp(4), height: heightToDp(4)}}
              />
              <View
                style={{
                  marginLeft: widthToDp(1),
                }}>
                <Text style={styles.address}>{firstPart}</Text>
              </View>
            </View>
            <View>
              <Text style={[styles.address, {marginLeft: widthToDp(5)}]}>
                {secondPart}
              </Text>
            </View>
            <View style={[styles.orangeline, props.orangeLine]} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginRight: widthToDp(3),
                paddingTop: heightToDp(3),
              }}>
              <Text
                style={[
                  styles.totalStyles,
                  props.leftSideStyles,
                  {
                    fontSize: widthToDp(4),
                    fontFamily: 'Manrope-Regular',
                  },
                ]}>
                {props.bottomLeftText || '0.5 Miles'}
              </Text>
              <Text
                style={[
                  styles.paymentStyle,
                  props.rightSideStyles,
                  {
                    fontSize: widthToDp(4),
                    fontFamily: 'Manrope-Regular',
                  },
                ]}>
                {props.bottomRightText || '30 Minutes'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    elevation: 10,
    borderRadius: 10,
    marginHorizontal: heightToDp(5),
    marginVertical: heightToDp(2),
  },
  cardImage: {
    width: widthToDp(23),
    height: heightToDp(17),
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    resizeMode: 'contain',
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
  orangeline: {
    borderBottomWidth: 1,
    borderColor: Colors.Orange,
    width: widthToDp(55),
    right: widthToDp(5),
    zIndex: -2,
    paddingBottom: heightToDp(3),
  },
  totalStyles: {
    color: Colors.TextColor,
  },
  paymentStyle: {
    color: Colors.TextColor,
  },
});
