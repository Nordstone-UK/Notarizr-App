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
    <View style={styles.container}>
      <View style={[styles.inputContainer, isFocused && styles.InputFocused]}>
        {props.leftImageSoucre && (
          <Image source={props.leftImageSoucre} style={styles.iconLeft} />
        )}
        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input]}
          placeholder={props.placeholder}
        />
        {props.rightImageSource && (
          <Image source={props.rightImageSource} style={styles.icon} />
        )}
      </View>
      {isFocused ? (
        <Text style={[styles.label, isFocused && styles.labelFocused]}>
          {props.LabelTextInput}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: heightToDp(2),
    marginTop: heightToDp(5),
    alignItems: 'center',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 15,
    borderColor: '#D3D5DA',
    width: widthToDp(90),
    paddingLeft: widthToDp(2),
  },
  icon: {
    width: widthToDp(7),
    height: heightToDp(5),
    tintColor: '#D3D5DA',
  },

  label: {
    fontSize: 16,
  },
  labelFocused: {
    position: 'absolute',
    left: widthToDp(15),
    top: widthToDp(-3),
    padding: 2,
    fontSize: 15,
    color: '#FF7A28',
    zIndex: 3,
    backgroundColor: '#fff',
  },
  input: {
    padding: widthToDp(6),
    width: widthToDp(70),
    fontSize: 18,
    backgroundColor: 'transparent',
  },
  InputFocused: {
    borderColor: '#FF7A28',
  },
});
