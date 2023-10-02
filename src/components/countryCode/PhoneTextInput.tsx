import React, {useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  TouchableHighlight,
  Text,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
// import styles from './Styles/index';

export interface Props {
  navigation: any;
  inputStyle?: string;
  value?: number;
  onChange?: Function;
}

const PhoneTextInput = ({
  value,
  inputStyle,
  onChange,
  LabelTextInput,
  Label,
  labelStyle,
  placeholder,
}: any) => {
  const phoneInput = useRef<PhoneInput>(null);
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
    <View
      style={[styles.container, isFocused && styles.InputFocused]}
      onFocus={handleFocus}
      onBlur={handleBlur}>
      <PhoneInput
        containerStyle={[styles.PhoneInputStyle, inputStyle]}
        textContainerStyle={[styles.PhoneTextContainerStyle, inputStyle]}
        ref={phoneInput}
        defaultValue={value}
        placeholder={placeholder}
        defaultCode="US"
        layout="first"
        onChangeFormattedText={text => {
          onChange(text);
        }}
      />
      <Text
        style={[
          (isFocused && styles.labelFocused) ||
            (Label && styles.labelUnFocused) ||
            false,
          labelStyle,
        ]}>
        {LabelTextInput}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  PhoneTextContainerStyle: {},
  PhoneInputStyle: {
    borderRadius: 50,
    color: Colors.TextColor,
  },
  container: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 15,
    marginHorizontal: widthToDp(5),
    borderColor: '#D3D5DA',
    color: Colors.TextColor,
    marginTop: heightToDp(2),
  },
  labelFocused: {
    position: 'absolute',
    left: widthToDp(8),
    top: widthToDp(-3),
    padding: 2,
    fontSize: 15,
    color: '#FF7A28',
    zIndex: 3,
    backgroundColor: '#fff',
  },
  labelUnFocused: {
    position: 'absolute',
    left: widthToDp(8),
    top: widthToDp(-3),
    padding: 2,
    fontSize: 15,
    color: Colors.InputTextColor,
    zIndex: 3,
    backgroundColor: '#fff',
  },
  InputFocused: {
    borderColor: '#FF7A28',
  },
});
export default PhoneTextInput;
