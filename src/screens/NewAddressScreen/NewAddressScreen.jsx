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
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {useSelector} from 'react-redux';
import useUpdate from '../../hooks/useUpdate';
import Toast from 'react-native-toast-message';

export default function NewAddressScreen({navigation}, props) {
  const {
    gender,
    first_name,
    location,
    profile_picture,
    last_name,
    email,
    phone_number,
    description,
  } = useSelector(state => state.user.user);
  const {handleProfileUpdate} = useUpdate();

  const [building, setBuilding] = useState();
  const [street, setStreet] = useState();
  const [city, setCity] = useState();
  const [pin, setPin] = useState();
  const [Landmark, setLandmark] = useState();
  const [tempLoading, settempLoading] = useState(false);
  const submitRegister = async () => {
    settempLoading(true);
    const newLocation =
      building +
      '  ' +
      street +
      ' ' +
      city +
      ' ' +
      pin +
      ' ' +
      '(' +
      Landmark +
      ')';
    const params = {
      firstName: first_name,
      lastName: last_name,
      email: email,
      phoneNumber: phone_number,
      location: newLocation,
      profilePicture: profile_picture,
      gender: gender,
      description: description,
    };
    const isUpdated = await handleProfileUpdate(params);
    if (isUpdated) {
      settempLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Adress Updated!',
        text2: 'Your address has been updated successfully.',
      });
      navigation.navigate('AddressDetails');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Problem while updating',
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
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your building/flat number'}
            LabelTextInput={'Building / Flat'}
            Label={true}
            onChangeText={text => setBuilding(text)}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your street address'}
            LabelTextInput={'Street'}
            onChangeText={text => setStreet(text)}
            Label={true}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your city'}
            LabelTextInput={'City'}
            onChangeText={text => setCity(text)}
            Label={true}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your PIN code'}
            LabelTextInput={'PIN Code'}
            onChangeText={text => setPin(text)}
            Label={true}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter a landmark near your address'}
            LabelTextInput={'Landmark'}
            onChangeText={text => setLandmark(text)}
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
