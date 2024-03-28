import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import useUpdate from '../../hooks/useUpdate';
import Toast from 'react-native-toast-message';
import useFetchUser from '../../hooks/useFetchUser';

export default function AddNewAddress({navigation}, props) {
  const {fetchUserInfo} = useFetchUser();

  const {handleProfileUpdate} = useUpdate();
  const {hadleUpdateAddress} = useFetchUser();
  const [building, setBuilding] = useState();
  const [street, setStreet] = useState();
  const [address, setAddress] = useState();
  const [pin, setPin] = useState();
  const [tempLoading, settempLoading] = useState(false);
  const submitRegister = async () => {
    if (building && street && address && pin) {
      settempLoading(true);
      const newLocation = building + '  ' + street + ' ' + address + ' ' + pin;
      const params = {
        location: newLocation,
        tag: 'Home',
      };
      const isUpdated = await hadleUpdateAddress(params);
      if (isUpdated) {
        fetchUserInfo();
        settempLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Address Updated!',
          text2: 'Your address has been updated successfully.',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Problem while updating',
        });
        settempLoading(false);
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please enter all details',
      });
      settempLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Address" />
      <BottomSheetStyle>
        <ScrollView style={{marginTop: heightToDp(5)}}>
          <LabelTextInput
            leftImageSoucre={require('../../../assets/buildingsIcon.png')}
            placeholder={'Enter your building/flat number'}
            LabelTextInput={'Building / Flat'}
            Label={true}
            onChangeText={text => setBuilding(text)}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/roadIcon.png')}
            placeholder={'Enter your street address'}
            LabelTextInput={'Street'}
            onChangeText={text => setStreet(text)}
            Label={true}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/homeAddressIcon.png')}
            placeholder={'Enter your address'}
            LabelTextInput={'Address'}
            onChangeText={text => setAddress(text)}
            Label={true}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/mailbox.png')}
            placeholder={'Enter your POST code'}
            LabelTextInput={'POST Code'}
            onChangeText={text => setPin(text)}
            Label={true}
          />
          <View
            style={{
              marginVertical: heightToDp(10),
            }}>
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Save Address"
              onPress={() => submitRegister()}
              loading={tempLoading}
            />
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
});
