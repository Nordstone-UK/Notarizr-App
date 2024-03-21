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
  calculateTotalPrice,
  capitalizeFirstLetter,
  height,
  heightToDp,
  width,
  widthToDp,
} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LinearGradient from 'react-native-linear-gradient';
import AgentCardPicture from '../AgentCardPicture/AgentCardPicture';
import MainButton from '../MainGradientButton/MainButton';
import {useNavigation} from '@react-navigation/native';
import ClientTimeCard from '../ClientTimeCard/ClientTimeCard';
import {useSelector} from 'react-redux';
import moment from 'moment';

export default function ClientServiceCard(props) {
  const navigation = useNavigation();
  const address = props?.agentAddress;
  const [firstPart, secondPart] = splitStringBefore2ndWord(address);
  const Button = props?.Button || false;
  const clientDetail = useSelector(state => state.booking.booking);
  const client = clientDetail?.booked_by || clientDetail?.client;
  // const Price = calculateTotalPrice(props.bottomRightText);
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
  const renderImages = count => {
    const images = [];

    for (let i = 0; i < count; i++) {
      images.push(
        <Image
          key={i}
          source={require('../../../assets/star.png')}
          style={{width: widthToDp(3), height: heightToDp(3)}}
        />,
      );
    }

    return images;
  };

  return (
    <TouchableOpacity onPress={props.onPress} style={styles.cardContainer}>
      <View style={{flexDirection: 'row', margin: widthToDp(2)}}>
        <View>
          <Image
            source={props.source}
            style={{
              width: widthToDp(25),
              height: widthToDp(22),
              borderRadius: 5,
            }}
          />
          <View
            style={{
              width: widthToDp(25),
              backgroundColor: Colors.OrangeGradientEnd,
              marginTop: 5,
              borderRadius: 5,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                // fontFamily: 'Poppins-Regular',
                color: 'white',
                textAlign: 'center',
                fontSize: 14,
              }}>
              {props.task == 'to_be_paid' ? 'To Be Paid' : props.task}
            </Text>
          </View>
        </View>

        <View
          style={{
            width: widthToDp(50),
            marginLeft: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: widthToDp(55),
            }}>
            <View>
              <Text style={styles.nameHeading}>{props.agentName}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Image
              source={props.image}
              style={{width: widthToDp(4), height: heightToDp(4)}}
            />

            <View
              style={{
                marginLeft: widthToDp(1),
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={styles.address}>
                {capitalizeFirstLetter(firstPart)}
              </Text>
              {secondPart && (
                <Text style={[styles.address]}> | {secondPart}</Text>
              )}
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: widthToDp(1),
              marginLeft: widthToDp(1),
            }}>
            <Text style={[styles.rating, {color: Colors.OrangeGradientEnd}]}>
              {moment(props.date).format('do MMM yyyy')}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          width: widthToDp(30),

          backgroundColor: Colors.OrangeGradientEnd,
          padding: 2,
          position: 'absolute',
          bottom: 0,
          right: 0,
          zIndex: 100,
          borderBottomRightRadius: 10,
          borderTopLeftRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>{props.task == 'to_be_paid' ? 'To Be Paid' : props.task}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={props.onPress}>
      <View style={{flexDirection: 'row', marginVertical: heightToDp(1)}}>
        <View>
          <View
            style={{
              marginHorizontal: widthToDp(2),
              marginVertical: widthToDp(2),
            }}>
            <Image source={props.source} style={styles.cardImage} />
            <ClientTimeCard
              task={props.task}
              dateofBooking={props.dateofBooking}
              timeofBooking={props.timeofBooking}
              createdAt={props.createdAt}
            />
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
              width: widthToDp(55),
            }}>
            <View>
              <Text style={styles.nameHeading}>
                {capitalizeFirstLetter(props?.agentName)}
              </Text>
            </View>
          </View>
          {clientDetail?.service_type !== 'ron' && (
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Image source={props.image} />
              <View
                style={{
                  marginLeft: widthToDp(1),
                }}>
                <Text style={styles.address}>{address}</Text>
              </View>
            </View>
          )}
          <View
            style={{
              marginLeft: widthToDp(1),
            }}>
            <Text style={styles.address}>
              Gender: {capitalizeFirstLetter(client?.gender)}
            </Text>
            <Text style={styles.address}>Age: 20</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: widthToDp(1),
              }}>
              <Text style={styles.rating}>Rating: </Text>
              {renderImages(props?.rating || 5)}
            </View>
          </View>
          {clientDetail?.service_type === 'mobile_notary' ? (
            props?.Time || false ? (
              <View style={styles.calenderStyles}>
                <Image
                  source={require('../../../assets/calenderIcon.png')}
                  style={{
                    tintColor: Colors.DullTextColor,
                    width: widthToDp(5),
                    height: heightToDp(5),
                  }}
                />
                <Text style={styles.address}>02/08/1995, 04:30 PM</Text>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginLeft: heightToDp(1),
                }}>
                <Text style={styles.distanceStyles}>0.5 Miles</Text>
                <Text style={styles.distanceStyles}>30 Minutes</Text>
              </View>
            )
          ) : null}
          <View style={styles.orangeline} />

          {clientDetail?.service_type === 'mobile_notary' && (
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
              {/* <Text
              style={[
                styles.paymentStyle,
                props.rightSideStyles,
                {
                  fontFamily: 'Poppins-Bold',
                  fontSize: widthToDp(4.5),
                },
              ]}>
              ${Price}
            </Text> */}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    elevation: 10,

    borderRadius: 10,
    marginVertical: widthToDp(2),
    marginHorizontal: heightToDp(8),
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
    width: widthToDp(25),
    height: heightToDp(17),
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    resizeMode: 'contain',
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
    flex: 0.5,
    marginBottom: heightToDp(5),
    borderBottomWidth: 1,
    borderColor: Colors.Orange,
    width: widthToDp(60),
    right: widthToDp(5),
    zIndex: -2,
    // paddingVertical: heightToDp(2),
  },
  totalStyles: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Poppins-Regular',
  },
  paymentStyle: {
    color: Colors.TextColor,
  },
  rating: {
    color: Colors.TextColor,
    fontSize: widthToDp(3.5),
    fontFamily: 'Poppins-Regular',
    marginTop: heightToDp(0.5),
  },
});
