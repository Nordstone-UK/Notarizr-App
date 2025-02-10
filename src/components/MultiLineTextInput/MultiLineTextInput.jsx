import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import Colors from '../../themes/Colors';
import {withSafeAreaInsets} from 'react-native-safe-area-context';

export default function MultiLineTextInput(props) {
  const [isFocused, setIsFocused] = useState(false);
  const handleFocus = () => {
    setIsFocused(true);
  };
  const [secureText, setSecreText] = useState(props.secureTextEntry);
  const handleBlur = () => {
    if (isFocused) {
      setIsFocused(false);
    }
  };
  const [inputHeight, setInputHeight] = useState(40);

  const handleContentSizeChange = event => {
    setInputHeight(event.nativeEvent.contentSize.height);
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
        <TextInput
          onFocus={handleFocus}
          multiline={true}
          onContentSizeChange={handleContentSizeChange}
          onBlur={handleBlur}
          editable={props.editable !== false}
          style={[styles.input, props.InputStyles, {height: inputHeight}]}
          keyboardType={props.keyboardType || 'default'}
          secureTextEntry={secureText || false}
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
          placeholderTextColor={
            Colors.DisableColor || props.placeholderTextColor
          }
          onChangeText={props.onChangeText}
          value={props.value}
        />
        {props.rightImageSoucre && (
          <TouchableOpacity onPress={props.rightImagePress}>
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
    borderWidth: 2,
    borderRadius: 15,
    borderColor: '#D3D5DA',
    width: widthToDp(90),
    minHeight: Platform.OS == 'ios' ? heightToDp(30) : heightToDp(20),
    paddingLeft: widthToDp(2),
  },
  icon: {
    width: widthToDp(7),
    height: heightToDp(5),
    tintColor: '#D3D5DA',
  },

  labelFocused: {
    position: 'absolute',
    left: widthToDp(10),
    top: widthToDp(-3),
    padding: 2,
    fontSize: 15,
    color: '#FF7A28',
    zIndex: 3,
    backgroundColor: '#fff',
  },
  labelUnFocused: {
    position: 'absolute',
    left: widthToDp(10),
    top: widthToDp(-3),
    padding: 2,
    fontSize: 15,
    color: Colors.InputTextColor,
    zIndex: 3,
    backgroundColor: '#fff',
  },
  input: {
    padding: widthToDp(6),
    width: widthToDp(80),
    fontSize: 18,

    backgroundColor: 'transparent',
    color: Colors.Black,
  },
  InputFocused: {
    borderColor: '#FF7A28',
  },
  iconLeft: {
    width: widthToDp(5),
    height: heightToDp(5),
  },
});
