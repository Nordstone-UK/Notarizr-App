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
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LinearGradient from 'react-native-linear-gradient';
import AgentReviewComponent from '../AgentCard/AgentReviewComponent';

export default function AgentReviewCard(props) {
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
      return [inputString, ''];
    }
  }
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={props.onPress}>
      <View style={{flexDirection: 'row'}}>
        <View>
          <View style={{flex: 1}}>
            <ImageBackground source={props.source} style={styles.cardImage}>
              <AgentReviewComponent />
            </ImageBackground>
          </View>
        </View>
        <View>
          <View
            style={{
              width: widthToDp(50),
              marginLeft: widthToDp(6),
              width: widthToDp(60),
              marginTop: heightToDp(2),
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text style={styles.nameHeading}>{NameFirstPart}</Text>
                <Text style={styles.nameHeading}>{NameSecondPart}</Text>
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
            <View style={[styles.orangeline, props.orangeLine]} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: widthToDp(2),
                paddingTop: heightToDp(5),
              }}>
              <Text
                style={[
                  styles.totalStyles,
                  props.leftSideStyles,
                  {
                    fontSize: widthToDp(4.5),
                    fontFamily: 'Manrope-Regular',
                  },
                ]}>
                {props.bottomLeftText}
              </Text>
              <Text
                style={[
                  styles.paymentStyle,
                  props.rightSideStyles,
                  {
                    fontSize: widthToDp(4.5),
                    fontFamily: 'Manrope-Regular',
                  },
                ]}>
                {props.bottomRightText}
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
    backgroundColor: Colors.white,
    elevation: 30,
    borderRadius: 10,
    paddingBottom: heightToDp(6),
    marginHorizontal: heightToDp(5),
  },
  cardImage: {
    margin: widthToDp(2),
    width: '110%',
    height: '105%',
    borderRadius: 6,
    overflow: 'hidden',
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
    width: widthToDp(65),
    right: widthToDp(5),
    zIndex: -2,
    paddingVertical: heightToDp(2),
  },
  totalStyles: {
    color: Colors.TextColor,
  },
  paymentStyle: {
    color: Colors.TextColor,
  },
});
