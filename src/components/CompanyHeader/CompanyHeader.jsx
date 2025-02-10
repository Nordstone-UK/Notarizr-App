import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import {useNavigation} from '@react-navigation/native';

export default function CompanyHeader(props) {
  const navigation = useNavigation(); // Initialize navigation

  const handleNavigateToBackScreen = () => {
    // Navigate back to the previous screen
    navigation.goBack();
  };
  return (
    <View>
      {props.reset && (
        <TouchableOpacity
          onPress={() => handleNavigateToBackScreen()}
          style={styles.touchContainer}>
          <Image
            source={require('../../../assets/backIcon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      )}
      <Image
        source={require('../../../assets/notarizrLogo1.png')}
        style={styles.imagestyles}
      />
      <Text style={[styles.textHeading, props.HeaderStyle]}>
        {props.Header}
      </Text>
      {props.subHeading && (
        <Text style={props.subHeadingStyle}>{props.subHeading || null}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imagestyles: {
    resizeMode: 'contain',
    alignSelf: 'center',
    width: widthToDp(65),
    height: heightToDp(20),
    marginVertical: widthToDp(8),
  },
  textHeading: {
    color: '#000',
    fontSize: widthToDp(7),
    fontStyle: 'normal',
    fontFamily: 'Manrope-Bold',
  },
  touchContainer: {
    position: 'absolute', // Position it at the top left
    left: widthToDp(4), // Space from the left edge
    top: heightToDp(2), // Space from the top
    zIndex: 1, // Ensure it stays above other elements
  },
  backIcon: {
    width: widthToDp(6),
    height: heightToDp(6),
    // marginLeft: widthToDp(2),
  },
});
