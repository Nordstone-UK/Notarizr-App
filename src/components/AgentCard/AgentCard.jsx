// import {
//   StyleSheet,
//   Text,
//   Image,
//   View,
//   Platform,
//   TouchableOpacity,
// } from 'react-native';
// import React, {useEffect} from 'react';
// import {
//   calculateTotalPrice,
//   capitalizeFirstLetter,
//   height,
//   heightToDp,
//   width,
//   widthToDp,
// } from '../../utils/Responsive';
// import Colors from '../../themes/Colors';
// import LinearGradient from 'react-native-linear-gradient';
// import AgentCardPicture from '../AgentCardPicture/AgentCardPicture';

// export default function AgentCard(props) {
//   const OrangeGradient = string => {
//     return (
//       <LinearGradient
//         style={styles.locationStyle}
//         colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
//         start={{x: 0, y: 0}}
//         end={{x: 1, y: 0}}>
//         <Text style={styles.placestyle}>{string}</Text>
//       </LinearGradient>
//     );
//   };
//   const address = props?.agentAddress;
//   const name = props?.agentName;
//   const [firstPart, secondPart] = splitStringBefore2ndWord(address);
//   function splitStringBefore2ndWord(inputString) {
//     if (inputString) {
//       const words = inputString.split(' ');

//       // Check if there are at least 2 words
//       if (words.length >= 2) {
//         // Join the first two words with space
//         const firstPart = words.slice(0, 2).join(' ');

//         // Join the remaining words with space
//         const secondPart = words.slice(2).join(' ');

//         return [firstPart, secondPart];
//       } else {
//         // If there are fewer than 2 words, return the original string as the first part
//         return [inputString, ''];
//       }
//     } else {
//       return ['', '']; // Return empty strings if the inputString is empty
//     }
//   }
//   function separateStringAfterFirstWord(inputString) {
//     const words = inputString.split(' ');

//     if (words.length > 1) {
//       const firstWord = words[0];
//       const restOfTheString = words.slice(1).join(' ');
//       return [firstWord, restOfTheString];
//     } else {
//       // If there is only one word, return it as the first part and an empty string as the second part.
//       return [inputString, ''];
//     }
//   }
//   const renderImages = count => {
//     const images = [];

//     for (let i = 0; i < count; i++) {
//       images.push(
//         <Image
//           key={i}
//           source={require('../../../assets/star.png')}
//           style={{width: widthToDp(3), height: heightToDp(3)}}
//         />,
//       );
//     }

//     return images;
//   };
//   return (
//     <View style={styles.cardContainer}>
//       <View style={{flexDirection: 'row', margin: heightToDp(1)}}>
//         <AgentCardPicture
//           task={props.task}
//           source={props.source}
//           dateofBooking={props.dateofBooking}
//           timeofBooking={props.timeofBooking}
//           createdAt={props.createdAt}
//         />
//         <View
//           style={{
//             width: widthToDp(50),
//             marginTop: heightToDp(2),
//           }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               width: widthToDp(55),
//             }}>
//             <View>
//               <Text style={styles.nameHeading}>{name}</Text>
//             </View>
//           </View>
//           <View
//             style={{
//               flexDirection: 'row',
//               marginTop: heightToDp(3),
//             }}>
//             <Image
//               source={props.image}
//               style={{width: widthToDp(4), height: heightToDp(4)}}
//             />
//             <View
//               style={{
//                 marginLeft: widthToDp(1),
//               }}>
//               <Text style={styles.address}>
//                 {capitalizeFirstLetter(firstPart)}
//               </Text>
//             </View>
//           </View>
//           {secondPart && (
//             <View>
//               <Text style={[styles.address, {marginLeft: widthToDp(6)}]}>
//                 {secondPart}
//               </Text>
//             </View>
//           )}
//           <View
//             style={{
//               marginTop: widthToDp(3),
//               flexDirection: 'row',
//               alignItems: 'center',
//               columnGap: widthToDp(1),
//               marginLeft: widthToDp(1),
//             }}>
//             <Text style={styles.rating}>Rating: </Text>
//             {renderImages(props?.rating || 5)}
//           </View>
//           <View style={[styles.orangeline]} />
//         </View>
//       </View>
//     </View>
//   );
// }
// //  <View
// //    style={{
// //      flexDirection: 'row',
// //      justifyContent: 'space-between',
// //      paddingTop: heightToDp(2),
// //    }}>
// //    <Text
// //      style={[
// //        styles.totalStyles,
// //        props.leftSideStyles,

// //        {
// //          fontFamily: 'Poppins-Bold',
// //          fontSize: widthToDp(4.5),
// //        },
// //      ]}>
// //      {props.bottomLeftText}
// //    </Text>
// //    {/* <Text
// //               style={[
// //                 styles.paymentStyle,
// //                 props.rightSideStyles,
// //                 {
// //                   fontFamily: 'Poppins-Bold',
// //                   fontSize: widthToDp(4.5),
// //                 },
// //               ]}>
// //               ${TotalPrice}
// //             </Text> */}
// //  </View>;
// const styles = StyleSheet.create({
//   cardContainer: {
//     flex: 1,
//     backgroundColor: Colors.white,
//     elevation: 10,
//     borderRadius: 10,
//     marginHorizontal: heightToDp(8),
//     marginVertical: heightToDp(2),
//   },
//   nameHeading: {
//     fontSize: widthToDp(4),
//     color: Colors.TextColor,
//     fontFamily: 'Poppins-Bold',
//   },
//   address: {
//     color: Colors.TextColor,
//     fontSize: widthToDp(3.5),
//     fontFamily: 'Poppins-Regular',
//   },
//   placestyle: {
//     color: Colors.white,
//     fontSize: widthToDp(3.5),
//     fontFamily: 'Poppins-Regular',
//   },
//   locationStyle: {
//     borderRadius: 20,
//     paddingHorizontal: widthToDp(1.5),
//   },
//   orangeline: {
//     flex: 0.5,
//     marginBottom: heightToDp(5),
//     borderBottomWidth: 1,
//     borderColor: Colors.Orange,
//     width: widthToDp(60),
//     right: widthToDp(6),
//     zIndex: -2,
//   },
//   totalStyles: {
//     color: Colors.TextColor,
//     fontSize: widthToDp(5),
//     fontFamily: 'Poppins-Regular',
//   },
//   paymentStyle: {
//     color: Colors.TextColor,
//   },
//   rating: {
//     color: Colors.TextColor,
//     fontSize: widthToDp(3.5),
//     fontFamily: 'Poppins-Regular',
//     marginTop: heightToDp(0.5),
//   },
// });

import {
  StyleSheet,
  Text,
  Image,
  View,
  Platform,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect} from 'react';
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
import moment from 'moment';

export default function AgentCard(props) {
  let date;
  let time;
  let month;
  date = moment(props.dateofBooking).format('D');
  month = moment(props.dateofBooking).format('MMM');
  time = moment(props?.createdAt).format('h:mm A');
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
  const [firstPart, secondPart] = splitStringBefore2ndWord(address);
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
    <View style={styles.cardContainer}>
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
              {props.task === 'to_be_paid' ? 'To Be Paid' : (props.task === 'pending' ? 'Pending' : (props.task === 'rejected' ? 'Rejected' : props.task))}

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
              <Text style={styles.nameHeading}>{name}</Text>
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
              marginBottom:20,
            }}>
              <Image
              source={props.calendarImage}
              style={{width: widthToDp(4), height: heightToDp(4)}}
            />
            <Text style={[styles.rating, {color: Colors.OrangeGradientEnd}]}>
              {props.datetimesession && (
              <>
              {moment(props.datetimesession).format('Do MMMM YYYY')} at{' '}
                    {moment(props.datetimesession).format('h:mm a')}
                    </>
            )}
            {props.dateofBooking && (
              <>
              {moment(props.dateofBooking).format('Do MMMM YYYY')} at {props.timeofBooking} 
              </>
            )}
              
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
          <Text>{props?.servicetype === 'ron' ? 'RON' : (props?.servicetype === 'mobile_notary' ? 'Mobile Notary' : 'RON')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    backgroundColor: 'white',
    elevation: 10,
    borderRadius: 10,
    marginHorizontal: heightToDp(7),
    marginVertical: heightToDp(2),
  },
  nameHeading: {
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Poppins-Medium',
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
    // borderBottomWidth: 1,
    borderColor: Colors.Orange,
    width: widthToDp(60),
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
  rating: {
    color: Colors.TextColor,
    fontSize: widthToDp(3.5),
    fontFamily: 'Poppins-Regular',
    marginTop: heightToDp(0.5),
  },
});
