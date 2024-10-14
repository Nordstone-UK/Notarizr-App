import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
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
        marginVertical: widthToDp(2),
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.bottonSheet}>
        <Text style={styles.text}>
          Please provide us with feedback for your agent
        </Text>
        <StarRating onStarPress={props.handleStarPress} rating={props.rating} />

        <LabelTextInput
          LabelTextInput={'Reveiw'}
          labelStyle={{
            backgroundColor: Colors.PinkBackground,
            color: Colors.TextColor,
          }}
          Label={true}
          onChangeText={text => props.handleReviewSubmit(text)}
        />
        <View style={styles.btn}>
          <GradientButton
            Title="Submit"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            onPress={props.onPress}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottonSheet: {
    flex: 1,
    // justifyContent: 'flex-end',
    backgroundColor: Colors.PinkBackground,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
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
    marginTop: heightToDp(5),
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
