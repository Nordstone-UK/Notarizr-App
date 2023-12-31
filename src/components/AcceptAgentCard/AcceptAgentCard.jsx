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

  const [firstPart, secondPart] = splitStringBefore2ndWord(address);
  const [NameFirstPart, NameSecondPart] = separateStringAfterFirstWord(name);

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
      // If there is only one word, return it as the first part and an empty string as the second part.
      return [inputString, ''];
    }
  }
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={props.onPress}>
      <View style={{flexDirection: 'row', marginVertical: heightToDp(1)}}>
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
              width: widthToDp(55),
            }}>
            <View>
              <Text style={styles.nameHeading}>{props?.agentName}</Text>
            </View>
            {/* <TouchableOpacity>
              <Image source={require('../../../assets/option.png')} />
            </TouchableOpacity> */}
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: heightToDp(3),
            }}>
            <Image
              source={props.image}
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
            <Text style={[styles.address, {marginLeft: widthToDp(7)}]}>
              {secondPart}
            </Text>
          </View>
          <View style={styles.orangeline} />
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
    flex: 1,
    backgroundColor: Colors.white,
    elevation: 10,
    borderRadius: 10,
    marginHorizontal: heightToDp(8),
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
    paddingHorizontal: widthToDp(2),
    marginHorizontal: widthToDp(0.5),
    height: heightToDp(6),
  },
  orangeline: {
    flex: 0.5,
    marginBottom: heightToDp(5),
    borderBottomWidth: 1,
    borderColor: Colors.Orange,
    width: widthToDp(61),
    right: widthToDp(6),
    zIndex: -2,
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
