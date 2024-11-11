import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import {TextInput} from 'react-native-gesture-handler';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';

export default function RequestPayment(props) {
  return (
    // <KeyboardAvoidingView
    //   style={styles.container}
    //   behavior={Platform.OS === 'ios' ? 'height' : 'height'}>
    <View style={styles.bottonSheet}>
      <Text style={styles.text}>
        {/* Mention the charges to complete this service */}
        How much do you want to charge the client?
      </Text>
      <View style={styles.input}>
        {/* <Text style={styles.smallText}>$</Text> */}
        {Platform.OS === 'android' ? (
          <TextInput
            value={props.amount !== undefined ? props.amount.toString() : ''}
            keyboardType="numeric"
            style={styles.TextInput}
            onChangeText={props.onChangeText}
            placeholder="Enter amount"
            placeholderTextColor={Colors.InputTextColor}
            placeholderStyle={styles.placeholderText}
          />
        ) : (
          <BottomSheetTextInput
            value={props.amount}
            keyboardType="numeric"
            style={styles.TextInput}
            onChangeText={props.onChangeText}
            placeholder="Enter amount"
            placeholderTextColor={Colors.InputTextColor}
            placeholderStyle={styles.placeholderText}
          />
        )}
      </View>
      <TouchableOpacity onPress={props.onPress}>
        <Text style={[styles.text, {color: Colors.Red}]}>Send Request</Text>
      </TouchableOpacity>
    </View>
    // </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bottonSheet: {
    flex: 1,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginVertical: heightToDp(3),
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-SemiBold',
    alignSelf: 'center',
  },

  smallText: {
    fontSize: widthToDp(5.5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-SemiBold',
  },
  TextInput: {
    width: '100%',
    fontSize: widthToDp(4.5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
    paddingHorizontal: widthToDp(1),
  },
  placeholderText: {
    fontSize: widthToDp(2),
  },
  input: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // alignContent: 'center',
    borderWidth: 2,
    borderColor: Colors.Orange,
    width: widthToDp(60),
    borderRadius: 15,
    paddingHorizontal: widthToDp(3),
  },
});
