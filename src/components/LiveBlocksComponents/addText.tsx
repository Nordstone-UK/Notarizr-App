import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import { heightToDp, widthToDp } from '../../utils/Responsive';
import { TextInput } from 'react-native-gesture-handler';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

export default function AddText(props) {
  return (
    // <KeyboardAvoidingView
    //   style={styles.container}
    //   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    //   keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200}
    // >
    <View style={styles.bottonSheet}>
      <View style={styles.input}>

        {Platform.OS === 'android' ? (
          <TextInput
            style={styles.TextInput}
            onChangeText={props.onChangeText}
            placeholder="Type here.."
            placeholderTextColor={Colors.InputTextColor}
            multiline={true}
          />
        ) : (
          <BottomSheetTextInput
            style={styles.TextInput}
            onChangeText={props.onChangeText}
            placeholder="Type here.."
            placeholderTextColor={Colors.InputTextColor}
            multiline={true}
          />
        )}
      </View>

      <TouchableOpacity onPress={props.onPress}>
        <Text style={[styles.text, { color: Colors.Red }]}>Add Text</Text>
      </TouchableOpacity>


    </View >
    // </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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

  TextInput: {
    width: widthToDp(50),
    fontSize: widthToDp(4),
    height: 100,
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
    paddingHorizontal: widthToDp(1),
    textAlignVertical: 'top',
  },

  input: {
    // flex: 1,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: Colors.Orange,
    width: widthToDp(60),
    borderRadius: 15,
    paddingHorizontal: widthToDp(3),
  },
});
