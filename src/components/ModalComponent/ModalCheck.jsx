import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import GradientButton from '../MainGradientButton/GradientButton';
import Colors from '../../themes/Colors';
import MainButton from '../MainGradientButton/MainButton';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import LabelTextInput from '../LabelTextInput/LabelTextInput';

export default function ModalCheck(props) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const handleclose = () => {
    props.setModalVisible(false);
    // console.log('hldldld', props.setModalVisible(false));
  };
  const handleFeedbackChange = text => {
    setFeedback(text);
    props.onChangeText(text); // Pass the input back to the parent if needed
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props?.modalVisible}>
      <KeyboardAvoidingView
        style={{flex: 1, justifyContent: 'center'}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVisible ? 100 : 0}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => handleclose()}>
            <Image
              source={require('../../../assets/close.png')} // Replace with your close icon asset
              style={styles.closeIcon}
            />
          </TouchableOpacity>
          <Image
            source={require('../../../assets/question.png')}
            style={{
              width: widthToDp(25),
              height: widthToDp(25),
              resizeMode: 'contain',
            }}
          />
          <Text style={styles.text}>Your experience with our Agent</Text>
          <Text style={styles.text}>1. Were they courteous?</Text>
          <Text style={styles.text}>2. Were they on time?</Text>
          <Text style={styles.text}>3. How was the overall experience?</Text>
          <Text style={styles.text}>Please let us know:</Text>
          <LabelTextInput
            placeholder={'Enter your feedback'}
            Label={true}
            defaultValue={props.defaultValue}
            LabelTextInput={'Feedback'}
            onChangeText={handleFeedbackChange}
            AdjustWidth={{width: widthToDp(80)}}
            InputStyles={{padding: widthToDp(4)}}
          />
          <MainButton
            onPress={feedback.trim() ? props.onSubmit : null}
            Title="Submit Feedback"
            colors={
              feedback.trim()
                ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                : [Colors.DullTextColor, Colors.DisableColor]
            }
            GradiStyles={{
              marginBottom: heightToDp(2),
              paddingVertical: heightToDp(3),
              borderRadius: 5,
              width: widthToDp(50),
            }}
            disabled={!feedback.trim()}
            styles={{
              padding: heightToDp(0),
              fontSize: widthToDp(3.5),
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: widthToDp(5),
    elevation: 10,
    paddingVertical: heightToDp(5),
    paddingHorizontal: widthToDp(5),
    borderRadius: 10,
  },
  text: {
    color: Colors.TextColor,
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    marginTop: heightToDp(2),
    alignSelf: 'flex-start',
  },
  closeButton: {
    position: 'absolute',
    top: heightToDp(2),
    right: widthToDp(2),
    zIndex: 1,
  },
  closeIcon: {
    width: widthToDp(5),
    height: widthToDp(5),
    resizeMode: 'contain',
  },
});
