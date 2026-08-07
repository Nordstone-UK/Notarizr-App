import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import BookingColors from '../../themes/BookingColors';
import {TextInput} from 'react-native-gesture-handler';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';

export default function LabelTextInput(props) {
  const [isFocused, setIsFocused] = useState(false);
  const handleFocus = () => {
    setIsFocused(true);
  };
  const handleBlur = () => {
    if (isFocused) {
      setIsFocused(false);
    }
  };
  return (
    <View style={[styles.container, props.container]}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.InputFocused,
          props.AdjustWidth,
        ]}>
        {props.leftImageSoucre && (
          <Image source={props.leftImageSoucre} style={styles.iconLeft} />
        )}
        {props.LabelTextInput === 'Review' ? (
          Platform.OS === 'android' ? (
            <TextInput
              onFocus={handleFocus}
              onBlur={handleBlur}
              editable={props.editable !== false}
              style={[styles.input, props.InputStyles]}
              keyboardType={props.keyboardType || 'default'}
              secureTextEntry={props.secureTextEntry || false}
              placeholder={props.placeholder}
              defaultValue={props.defaultValue}
              value={props.value}
              placeholderTextColor={
                props.placeholderTextColor || BookingColors.textMuted
              }
              multiline
              onChangeText={props.onChangeText}
            />
          ) : (
            <BottomSheetTextInput
              onFocus={handleFocus}
              onBlur={handleBlur}
              editable={props.editable !== false}
              style={[styles.input, props.InputStyles]}
              keyboardType={props.keyboardType || 'default'}
              secureTextEntry={props.secureTextEntry || false}
              placeholder={props.placeholder}
              defaultValue={props.defaultValue}
              value={props.value}
              placeholderTextColor={
                props.placeholderTextColor || BookingColors.textMuted
              }
              multiline
              onChangeText={props.onChangeText}
            />
          )
        ) : (
          <TextInput
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={props.editable !== false}
            style={[styles.input, props.InputStyles]}
            keyboardType={props.keyboardType || 'default'}
            secureTextEntry={props.secureTextEntry || false}
            placeholder={props.placeholder}
            defaultValue={props.defaultValue}
            value={props.value}
            placeholderTextColor={
              props.placeholderTextColor || BookingColors.textMuted
            }
            multiline
            onChangeText={props.onChangeText}
          />
        )}
        {/* <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={props.editable !== false}
          style={[styles.input, props.InputStyles]}
          keyboardType={props.keyboardType || 'default'}
          secureTextEntry={secureText || false}
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
          value={props.value}
          placeholderTextColor={
            props.placeholderTextColor || BookingColors.textMuted
          }
          multiline
          onChangeText={props.onChangeText}
        /> */}

        {props.rightImageSoucre && (
          <TouchableOpacity
            onPress={() => {
              if (props.rightImagePress) {
                props.rightImagePress();
              }
            }}
            style={{}}>
            <Image source={props.rightImageSoucre} style={styles.iconLeft} />
          </TouchableOpacity>
        )}
      </View>
      {(isFocused && props.LabelTextInput) || props.Label || false ? (
        <Text
          style={[
            (isFocused && styles.labelFocused) ||
              (props.Label && styles.labelUnFocused) ||
              false,
            props.labelStyle,
          ]}>
          {props.LabelTextInput}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: heightToDp(2),
    marginTop: heightToDp(3),
    alignItems: 'center',
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
    width: widthToDp(90),
    // paddingHorizontal: widthToDp(4),
  },
  icon: {
    width: widthToDp(7),
    height: heightToDp(5),
    tintColor: BookingColors.textMuted,
  },

  labelFocused: {
    position: 'absolute',
    left: widthToDp(10),
    top: widthToDp(-3),
    padding: 2,
    fontSize: 15,
    color: BookingColors.primary,
    zIndex: 3,
    backgroundColor: BookingColors.surface,
  },
  labelUnFocused: {
    position: 'absolute',
    left: widthToDp(10),
    top: widthToDp(-3),
    padding: 2,
    fontSize: 15,
    color: BookingColors.textPrimary,
    zIndex: 3,
    backgroundColor: BookingColors.surface,
  },
  input: {
    padding: widthToDp(4),
    width: widthToDp(80),
    fontSize: 18,
    backgroundColor: 'transparent',
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Regular',
  },
  InputFocused: {
    borderColor: BookingColors.primary,
  },
  iconLeft: {
    width: widthToDp(5),
    height: heightToDp(5),
    marginHorizontal: widthToDp(1),
    tintColor: BookingColors.textMuted,
  },
});
