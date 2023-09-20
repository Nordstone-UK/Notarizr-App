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
import AgentCardPicture from '../AgentCardPicture/AgentCardPicture';
import MainButton from '../MainGradientButton/MainButton';
import {useNavigation} from '@react-navigation/native';
import ClientTimeCard from '../ClientTimeCard/ClientTimeCard';

export default function ClientServiceCard(props) {
  const navigation = useNavigation();
  const address = props?.agentAddress;
  const name = props?.agentName;
  const Work = props?.Work || false;
  const [firstPart, secondPart] = splitStringBefore4thWord(address);
  const [NameFirstPart, NameSecondPart] = separateStringAfterFirstWord(name);
  const Button = props.Button;
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
          <View style={{flex: 1}}>
            <ImageBackground source={props.source} style={styles.cardImage}>
              <ClientTimeCard task={props.task} />
            </ImageBackground>
          </View>
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
              width: widthToDp(60),
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
            {OrangeGradient(props?.OrangeText)}
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
          {props?.Time || false ? (
            <View style={styles.calenderStyles}>
              <Image
                source={require('../../../assets/calenderIcon.png')}
                style={{tintColor: Colors.DullTextColor}}
              />
              <Text style={styles.address}>02/08/1995, 04:30 PM</Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: widthToDp(55),
                marginLeft: heightToDp(1),
              }}>
              <Text style={styles.distanceStyles}>0.5 Miles</Text>
              <Text style={styles.distanceStyles}>30 Minutes</Text>
            </View>
          )}
          <View style={styles.orangeline} />
          <View
            style={{
              flexDirection: 'row',
              width: widthToDp(55),
              justifyContent: 'space-between',
              margin: heightToDp(2),
              marginTop: heightToDp(4),
            }}>
            <Text
              style={[
                styles.totalStyles,
                props.leftSideStyles,
                {fontFamily: 'Poppins-Bold', fontSize: widthToDp(4.5)},
              ]}>
              {props.bottomLeftText}
            </Text>
            {Button && (
              <View>
                {Work ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-evenly',
                    }}>
                    {props?.Canceled || false ? (
                      <Image source={require('../../../assets/pending.png')} />
                    ) : (
                      <Image
                        source={require('../../../assets/greenIcon.png')}
                      />
                    )}
                    <Text
                      style={[
                        styles.distanceStyles,
                        {
                          fontSize: widthToDp(4.5),
                          marginHorizontal: widthToDp(2),
                        },
                      ]}>
                      {props?.WorkStatus || (props?.Canceled && 'Canceled')}
                    </Text>
                  </View>
                ) : (
                  <MainButton
                    Title="Accept"
                    colors={[
                      Colors.OrangeGradientStart,
                      Colors.OrangeGradientEnd,
                    ]}
                    GradiStyles={{
                      borderRadius: 5,
                      paddingHorizontal: widthToDp(1),
                    }}
                    styles={{
                      paddingHorizontal: widthToDp(4),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(4),
                    }}
                    onPress={() => navigation.navigate('CompletionScreen')}
                  />
                )}
              </View>
            )}
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
    marginVertical: widthToDp(2),
    marginHorizontal: heightToDp(5),
  },
  calenderStyles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: heightToDp(1),
    marginLeft: heightToDp(1),
  },
  nameHeading: {
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Poppins-Bold',
  },
  cardImage: {
    flex: 1,
    justifyContent: 'center',
    margin: widthToDp(2),
    width: widthToDp(25),
    borderRadius: 6,
    overflow: 'hidden',
  },
  address: {
    color: Colors.TextColor,
    fontSize: widthToDp(3.5),
    fontFamily: 'Poppins-Regular',
  },
  distanceStyles: {
    color: Colors.TextColor,
    fontSize: widthToDp(3.5),
    fontFamily: 'Manrope-Regular',
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
    width: widthToDp(65),
    right: widthToDp(4),
    zIndex: -1,
    paddingVertical: heightToDp(1),
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
