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
import {heightToDp, widthToDp} from '../../utils/Responsive';
import {useDispatch, useSelector} from 'react-redux';
import {serviceCheck} from '../../features/service/serviceSlice';
import {useFocusEffect} from '@react-navigation/native';

export default function ModalCheck(props) {
  const [modalVisible, setModalVisible] = useState(props.modalVisible);
  const dispatch = useDispatch();
  const service = useSelector(state => state.service.service);
  useFocusEffect(
    React.useCallback(() => {
      setModalVisible(service);
    }, [service]),
  );
  const closeServiceModal = () => {
    dispatch(serviceCheck());
    setModalVisible(false);
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.container}>
        <Image source={require('../../../assets/question.png')} />
        <Text style={styles.text}>Was the service done?</Text>
        <MainButton
          onPress={() => console.log('Modal Yes')}
          Title="Yes"
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          GradiStyles={{
            marginBottom: heightToDp(2),
            paddingVertical: heightToDp(3),
            borderRadius: 5,
            width: widthToDp(50),
          }}
          styles={{
            paddingHorizontal: widthToDp(0),
            paddingVertical: heightToDp(0),
            fontSize: widthToDp(3.5),
          }}
        />
        <MainButton
          Title="No"
          onPress={() => closeServiceModal()}
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          GradiStyles={{
            paddingHorizontal: widthToDp(0),
            marginBottom: heightToDp(2),
            paddingVertical: heightToDp(3),
            width: widthToDp(50),
            borderRadius: 5,
          }}
          styles={{
            paddingHorizontal: widthToDp(0),
            paddingVertical: heightToDp(0),
            fontSize: widthToDp(3.5),
          }}
        />
        <MainButton
          Title="Client Cancelled"
          onPress={() => console.log('Modal Client')}
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          GradiStyles={{
            paddingHorizontal: widthToDp(0),
            paddingVertical: heightToDp(3),
            marginBottom: heightToDp(2),
            width: widthToDp(50),
            borderRadius: 5,
          }}
          styles={{
            paddingHorizontal: widthToDp(0),
            paddingVertical: heightToDp(0),
            fontSize: widthToDp(3.5),
          }}
        />
        <MainButton
          Title="Other"
          onPress={() => closeServiceModal()}
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          GradiStyles={{
            paddingHorizontal: widthToDp(0),
            paddingVertical: heightToDp(3),
            marginBottom: heightToDp(2),
            borderRadius: 5,
            width: widthToDp(50),
          }}
          styles={{
            paddingHorizontal: widthToDp(0),
            paddingVertical: heightToDp(0),
            fontSize: widthToDp(3.5),
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: widthToDp(15),
    marginTop: heightToDp(5),
    elevation: 30,
    paddingVertical: heightToDp(5),
    borderRadius: 10,
  },
  text: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    marginVertical: heightToDp(2),
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
