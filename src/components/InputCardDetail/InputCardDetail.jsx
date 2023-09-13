import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import Colors from '../../themes/Colors';

export default function InputCardDetail(props) {
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

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          props.AdjustWidth,
          isFocused && styles.InputFocused,
        ]}>
        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input, props.InputStyles]}
          keyboardType={props.keyboardType || 'default'}
          placeholder={props.placeholder}
          placeholderTextColor={
            Colors.DisableColor || props.placeholderTextColor
          }
        />
        {props.rightImageSource && (
          <TouchableOpacity
            onPress={() => {
              setSecreText(!secureText);
            }}>
            <Image source={props.rightImageSource} style={styles.icon} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.label, styles.labelFocused, props.labelStyle]}>
        {props.LabelTextInput || null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: heightToDp(2),
    marginTop: heightToDp(5),
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: 15,
    borderColor: '#D3D5DA',
    width: widthToDp(90),
    alignSelf: 'center',
  },
  icon: {
    width: widthToDp(7),
    height: heightToDp(5),
    tintColor: '#D3D5DA',
  },

  labelFocused: {
    position: 'absolute',
    left: widthToDp(10),
    top: widthToDp(2),
    // padding: 2,
    fontSize: widthToDp(4),
    color: Colors.DullTextColor,
    zIndex: 3,
    backgroundColor: 'transparent',
    fontFamily: 'Manrope-Regular',
  },
  input: {
    marginHorizontal: widthToDp(4),
    marginVertical: widthToDp(5),
    fontSize: widthToDp(4),
    backgroundColor: 'transparent',
    width: widthToDp(80),
    fontFamily: 'Manrope-Regular',
  },
  InputFocused: {
    borderColor: '#FF7A28',
  },
});
