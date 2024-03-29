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

  const closeModal = () => {
    props.setModalVisible(false);
  };
  const [email, setEmail] = useState('');
  const sendEmail = () => {
    setEmail('');
    props.onAdd(email);
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <View style={styles.container}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginHorizontal: widthToDp(5),
            }}>
            <Text style={styles.text}>Add an Observer:</Text>
            <TouchableOpacity onPress={() => closeModal()}>
              <Image
                style={styles.image}
                source={require('../../../assets/close.png')}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.input}>
            <LabelTextInput
              LabelTextInput="Email Address"
              placeholder="Enter Email Address here"
              Label={true}
              defaultValue={email}
              onChangeText={text => setEmail(text)}
              leftImageSoucre={require('../../../assets/EmailIcon.png')}
              AdjustWidth={{
                width: widthToDp(80),
              }}
              InputStyles={{
                padding: widthToDp(3),
              }}
            />
          </View>
          {/* <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              columnGap: widthToDp(2),
              rowGap: heightToDp(2),
              marginHorizontal: widthToDp(5),
            }}>
            {props.email.map((entry, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => props.removeItem(index)}
                style={{
                  padding: widthToDp(0.5),
                  borderRadius: 5,
                  backgroundColor: Colors.Orange,
                }}>
                <Text style={{color: Colors.white}}>{entry}</Text>
              </TouchableOpacity>
            ))}
          </View> */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginRight: widthToDp(5),
            }}>
            <MainButton
              onPress={() => sendEmail()}
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
    elevation: 10,
    // paddingVertical: heightToDp(5),
    borderRadius: 10,
  },
  text: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    marginVertical: heightToDp(2),
  },
  input: {
    alignItems: 'flex-start',
  },
  image: {
    width: widthToDp(4),
    height: widthToDp(4),
  },
});
