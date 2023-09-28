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
import {useFocusEffect, useNavigation} from '@react-navigation/native';

export default function ModalCheck(props) {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(props.modalVisible || true);
  const dispatch = useDispatch();
  const service = useSelector(state => state.service.service);
  useFocusEffect(
    React.useCallback(() => {
      setModalVisible(service);
    }, [service]),
  );

  const handleNavigation = () => {
    dispatch(serviceCheck());
    setModalVisible(false);
    navigation.navigate('AgentLocalNotaryEndScreen');
  };
  const closeServiceModal = () => {
    dispatch(serviceCheck());
    setModalVisible(false);
  };
  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <View style={styles.container}>
          <Image source={require('../../../assets/question.png')} />
          <Text style={styles.text}>Was the service done?</Text>
          <MainButton
            onPress={() => handleNavigation()}
            Title="Yes"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            GradiStyles={{
              marginBottom: heightToDp(2),
              paddingVertical: heightToDp(3),
              borderRadius: 5,
              width: widthToDp(50),
            }}
            styles={{
              padding: heightToDp(0),
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
            onPress={() => closeServiceModal()}
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: widthToDp(15),
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
});
