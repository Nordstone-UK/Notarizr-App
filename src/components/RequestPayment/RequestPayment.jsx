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

export default function RequestPayment(props) {
  return (
    <View style={styles.bottonSheet}>
      <Text style={styles.text}>
        Mention the charges to complete this service
      </Text>
      <View style={styles.input}>
        <Text style={styles.smallText}>$</Text>
        <TextInput
          keyboardType="numeric"
          style={styles.TextInput}
          onChangeText={props.onChangeText}
        />
      </View>

      <TouchableOpacity onPress={props.CancelPress}>
        <Text style={[styles.text, {color: Colors.Red}]}>Send Request</Text>
      </TouchableOpacity>
    </View>
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
  smallText: {
    fontSize: widthToDp(5.5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-SemiBold',
  },
  TextInput: {
    fontSize: widthToDp(6),
  },
  transparentStar: {
    fontSize: 30,
    marginRight: 10,
    color: 'transparent',
  },
  input: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    borderWidth: 2,
    borderColor: Colors.Orange,
    width: widthToDp(60),
    borderRadius: 15,
  },
});
