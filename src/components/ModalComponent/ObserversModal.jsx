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

export default function ObserversModal(props) {
  //   const dispatch = useDispatch();
  //   const service = useSelector(state => state.service.service);
  const [email, setEmail] = useState('');
  const AddObserver = () => {
    props.setModalVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <View style={styles.container}>
          <Text style={styles.text}>Add an Observer:</Text>
          <View style={styles.input}>
            <LabelTextInput
              LabelTextInput="Email Address"
              placeholder="Enter Email Address here"
              Label={true}
              defaultValue={email}
              leftImageSoucre={require('../../../assets/emailIcon.png')}
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
              justifyContent: 'flex-end',
              marginRight: widthToDp(5),
            }}>
            <MainButton
              onPress={() => AddObserver()}
              Title="Add"
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
    elevation: 30,
    paddingVertical: heightToDp(5),
    borderRadius: 10,
  },
  text: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    marginVertical: heightToDp(2),
    marginLeft: widthToDp(6),
  },
  input: {
    alignItems: 'flex-start',
  },
});
