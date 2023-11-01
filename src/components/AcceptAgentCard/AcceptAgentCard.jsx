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
import MainButton from '../MainGradientButton/MainButton';
import {useNavigation} from '@react-navigation/native';

export default function AcceptAgentCard(props) {
  const navigation = useNavigation();
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
    <TouchableOpacity style={styles.cardContainer} onPress={props.onPress}>
      <View style={{flexDirection: 'row', marginVertical: heightToDp(2)}}>
        <View>
          <AgentCardPicture task={props.task} source={props.source} />
        </View>
        <View
          style={{
            width: widthToDp(50),
            marginTop: heightToDp(2),
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: heightToDp(2),
              width: '110%',
            }}>
            <View>
              <Text style={styles.nameHeading}>{props?.agentName}</Text>
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
            <Text style={[styles.address, {marginLeft: widthToDp(7)}]}>
              {secondPart}
            </Text>
          </View>
          <View style={styles.orangeline} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: heightToDp(5),
            }}>
            <Text
              style={[
                styles.totalStyles,
                props.leftSideStyles,
                {fontFamily: 'Poppins-Bold', fontSize: widthToDp(4.5)},
              ]}>
              {props.bottomRightText}
            </Text>
            {props.Button ? (
              <MainButton
                Title="Accept"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                styles={{
                  paddingHorizontal: widthToDp(4),
                  paddingVertical: widthToDp(2),
                }}
                onPress={() => navigation.navigate('CompletionScreen')}
              />
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    // elevation: 30,
    borderWidth: 1,
    borderColor: Colors.DullTextColor,
    borderRadius: 10,
    marginVertical: widthToDp(2),
    paddingBottom: heightToDp(6),
    marginHorizontal: heightToDp(5),
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
    paddingHorizontal: widthToDp(2),
    marginHorizontal: widthToDp(0.5),
    height: heightToDp(6),
  },
  orangeline: {
    borderBottomWidth: 1,
    borderColor: Colors.Orange,
    width: '130%',
    right: widthToDp(9),
    zIndex: -1,
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
