import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import {getObserverPhone} from '../../utils/observerPhone';
import RegisteredObserverPicker from '../Observers/RegisteredObserverPicker';

export default function ObserversModal(props) {
  //   const dispatch = useDispatch();
  //   const service = useSelector(state => state.service.service);

  const closeModal = () => {
    props.setModalVisible(false);
  };
  const addObserver = user => {
    props.onAdd(getObserverPhone(user));
    closeModal();
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
            <RegisteredObserverPicker
              excludedPhones={props.email || props.observers || []}
              onSelect={addObserver}
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
          <View style={styles.bottomSpace} />
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
    marginHorizontal: widthToDp(5),
  },
  bottomSpace: {height: heightToDp(3)},
  image: {
    width: widthToDp(4),
    height: widthToDp(4),
  },
});
