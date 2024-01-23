import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import GradientButton from '../MainGradientButton/GradientButton';
import Colors from '../../themes/Colors';
import MainButton from '../MainGradientButton/MainButton';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import {useDispatch, useSelector} from 'react-redux';
import {serviceCheck} from '../../features/service/serviceSlice';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import LabelTextInput from '../LabelTextInput/LabelTextInput';
import Toast from 'react-native-toast-message';

export default function AuthenticateModal(props) {
  const closeModal = () => {
    props?.setModalVisible(false);
    props?.handleConsent(false);
  };
  const [Name, setName] = useState('');
  const sendEmail = () => {
    if (Name === '') {
      Toast.show({
        type: 'error',
        text1: 'Please enter your full name',
      });
    } else if (Name === props?.name) {
      Toast.show({
        type: 'success',
        text1: 'Your have successfully consented',
      });
      props?.setModalVisible(false);
      props?.handleConsent(true);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Your name is wrong',
      });
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => closeModal()}>
            <Image
              style={styles.image}
              source={require('../../../assets/close.png')}
            />
          </TouchableOpacity>
          <View
            style={{
              marginHorizontal: widthToDp(4),
            }}>
            <Text style={styles.text}>
              Do you consent sharing your sharing information with
              Authenticate.com for verification purposes
            </Text>
          </View>
          <View style={styles.input}>
            <LabelTextInput
              LabelTextInput="Full Name"
              placeholder="Enter your full Name"
              Label={true}
              defaultValue={Name}
              onChangeText={text => setName(text)}
              AdjustWidth={{
                width: widthToDp(80),
              }}
              InputStyles={{
                padding: widthToDp(3),
              }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <MainButton
              onPress={() => closeModal()}
              Title="I, Don't Consent"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                marginVertical: heightToDp(2),
                paddingVertical: heightToDp(3),
                borderRadius: 5,
                width: widthToDp(30),
              }}
              styles={{
                padding: heightToDp(0),
                fontSize: widthToDp(3.5),
              }}
            />
            <MainButton
              onPress={() => sendEmail()}
              Title="I, Consent"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                marginVertical: heightToDp(2),
                paddingVertical: heightToDp(3),
                borderRadius: 5,
                width: widthToDp(30),
              }}
              styles={{
                padding: heightToDp(0),
                fontSize: widthToDp(3.5),
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginHorizontal: widthToDp(5),
    elevation: 10,
    borderRadius: 10,
  },
  text: {
    color: Colors.TextColor,
    fontSize: widthToDp(4.5),
    fontFamily: 'Manrope-Bold',
    marginVertical: heightToDp(2),
    textAlign: 'auto',
  },
  input: {
    alignItems: 'flex-start',
  },
  image: {
    width: widthToDp(4),
    height: widthToDp(4),
    alignSelf: 'flex-end',
    margin: widthToDp(2),
  },
});
