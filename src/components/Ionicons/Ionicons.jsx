import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import LinearGradient from 'react-native-linear-gradient';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function Ionicons(props) {
  let imagePath;

  switch (props.name) {
    case 'Home':
      imagePath = require('../../../assets/homeIcon.png');
      break;
    case 'AllBookingScreen':
      imagePath = require('../../../assets/taskIcon.png');
      break;
    case 'BookScreen':
      imagePath = require('../../../assets/bookIcon.png');
      break;
    case 'ChatContactScreen':
      imagePath = require('../../../assets/chatIcon.png');
      break;
    case 'ProfileInfoScreen':
      imagePath = require('../../../assets/profileTabIcon.png');
      break;
    default:
      break;
  }
  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.locationStyle}
        colors={
          props.focused
            ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
            : [Colors.white, Colors.white]
        }
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <View
          style={{
            alignSelf: 'center',
          }}>
          <Image
            source={imagePath}
            style={[
              props.focused
                ? {tintColor: Colors.white}
                : {tintColor: Colors.DullTextColor},
              styles.Icon,
            ]}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  locationStyle: {
    borderRadius: 30,
    height: heightToDp(12),
    width: widthToDp(12),
    justifyContent: 'center',
    marginHorizontal: widthToDp(5),
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  Icon: {
    height: heightToDp(6),
    width: widthToDp(6),
  },
});
