import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import LabelTextInput from '../LabelTextInput/LabelTextInput';
import GradientButton from '../MainGradientButton/GradientButton';
import {TextInput} from 'react-native-gesture-handler';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';

const StarRating = ({rating, onStarPress}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignSelf: 'center',
        marginVertical: widthToDp(5),
      }}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          onPress={() => onStarPress(star)}
          style={{marginRight: 5}}>
          {star <= rating ? (
            <Image
              source={require('../../../assets/star.png')}
              style={styles.icon}
            />
          ) : (
            <Image
              source={require('../../../assets/blankStar.png')}
              style={styles.icon}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};
export default function ReviewPopup(props) {
  return (
    <KeyboardAvoidingView style={styles.bottonSheet}>
      <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
        <Image
          source={require('../../../assets/close.png')} // Replace with your close icon asset
          style={styles.closeIcon}
        />
      </TouchableOpacity>
      <Text style={styles.text}>
        Please provide us with feedback for your agent
      </Text>
      <StarRating onStarPress={props.handleStarPress} rating={props.rating} />
      {Platform.OS === 'android' ? (
        <TextInput
          LabelTextInput={'Reveiw'}
          style={{
            backgroundColor: Colors.PinkBackground,
            color: Colors.TextColor,
            borderWidth: 1,
            borderRadius: 20,
            marginHorizontal: 25,
            padding: 5,
          }}
          Label={true}
          onChangeText={text => props.handleReviewSubmit(text)}
        />
      ) : (
        <BottomSheetTextInput
          LabelTextInput={'Reveiw'}
          style={{
            backgroundColor: Colors.PinkBackground,
            color: Colors.TextColor,
            borderWidth: 1,
            borderRadius: 20,
            marginHorizontal: 25,
            padding: 5,
          }}
          Label={true}
          onChangeText={text => props.handleReviewSubmit(text)}
        />
      )}
      <View style={styles.btn}>
        <GradientButton
          Title="Submit"
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          onPress={props.onPress}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bottonSheet: {
    flex: 1,
    // justifyContent: 'flex-end',
    backgroundColor: Colors.PinkBackground,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: heightToDp(2),
    right: widthToDp(5),
    zIndex: 1,
  },
  closeIcon: {
    height: heightToDp(4),
    width: widthToDp(4),
  },
  btn: {
    marginVertical: heightToDp(5),
  },
  icon: {
    height: heightToDp(8),
    width: widthToDp(8),
    // alignSelf: 'center',
    // resizeMode: 'contain',
    // marginVertical: heightToDp(5),
  },
  text: {
    marginTop: heightToDp(6),
    fontSize: widthToDp(6),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    alignSelf: 'center',
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  coloredStar: {
    fontSize: 30,
    marginRight: 10,
    color: 'yellow',
  },
  transparentStar: {
    fontSize: 30,
    marginRight: 10,
    color: 'transparent',
  },
});
