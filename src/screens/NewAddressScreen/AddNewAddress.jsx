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
  KeyboardAvoidingView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

import Colors from '../../themes/Colors';

import useUpdate from '../../hooks/useUpdate';
import useFetchUser from '../../hooks/useFetchUser';

import {statesData} from '../../data/statesData';

import {heightToDp, widthToDp} from '../../utils/Responsive';

import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import SingleSelectDropDown from '../../components/SingleSelectDropDown/SingleSelectDropDown';

export default function AddNewAddress({navigation, route}, props) {
  const {location_coordinates, previousScreen, location, service} =
    route?.params || {};
  const {fetchUserInfo} = useFetchUser();
  console.log('routere', route.params);
  console.log('padddddddddramss', previousScreen);
  const {handleProfileUpdate} = useUpdate();
  const {hadleUpdateAddress, handleEditAddress} = useFetchUser();
  const [building, setBuilding] = useState();
  const [street, setStreet] = useState();
  const [address, setAddress] = useState();
  const [pin, setPin] = useState();
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [tempLoading, settempLoading] = useState(false);
  const [state, setState] = useState(null);
  const [openStatePicker, setOpenStatePicker] = useState(false);
  const [stateItems, setStateItems] = useState(statesData);

  useEffect(() => {
    if (route.params) {
      // setAddress(location);
      if (location_coordinates) {
        setLat(location_coordinates[0]);
        setLng(location_coordinates[1]);
      }
    }
    if (route.params && route.params?.address) {
      const {location} = route.params.address;
      const [building, street, address, pin] = location.split(' ');
      console.log('buil', route.params?.address._id);
      setBuilding(building);
      setStreet(street);
      setAddress(address);
      setPin(pin);
    }
    if (location) {
      const locationParts = location.split(', ');
      const stateAbbreviation = locationParts[locationParts.length - 2]; // Extract state abbreviation

      const matchedState = statesData.find(
        item => item.value === stateAbbreviation,
      );
      // console.log('stttttttttt', matchedState);
      if (matchedState) {
        setState(matchedState); // Set the state in the dropdown
      }
    }
  }, [route.params?.address, location]);
  console.log('sttttttttttdd', route.params?.service);
  const submitRegister = async () => {
    if (building && street && address && pin && state) {
      settempLoading(true);
      const newLocation =
        building +
        ' ' +
        street +
        ' ' +
        address +
        ' ' +
        state.formattedState +
        ' ' +
        pin;
      const params = {
        location: newLocation,
        tag: route.params?.service === 'others' ? 'Others' : 'Home',
        lat: lat.toString(),
        lng: lng.toString(),
      };
      console.log('dfdfdfdf', params);
      if (route.params?.address) {
        console.log('edit', route.params?.address._id);
        params.addressId = route.params?.address._id;
        console.log('paramss', params);
        const isUpdated = await handleEditAddress(params);
        if (isUpdated) {
          fetchUserInfo();
          settempLoading(false);
          Toast.show({
            type: 'success',
            text1: 'Address Updated!',
            text2: 'Your address has been updated successfully.',
          });

          navigation.navigate(previousScreen);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Problem while editing',
          });
          settempLoading(false);
        }
      } else if (route.params?.service === 'others') {
        const isUpdated = await hadleUpdateAddress(params);
        console.log('isupdateddddd', isUpdated);
        if (isUpdated) {
          fetchUserInfo();
          settempLoading(false);
          Toast.show({
            type: 'success',
            text1: 'Address Updated!',
            text2: 'Your address has been updated successfully.',
          });
          navigation.navigate(previousScreen, {
            serviceType: 'mobile_notary',
            address: params,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Problem while updating',
          });
          settempLoading(false);
        }
      } else {
        console.log('padddddddddramss', previousScreen);
        const isUpdated = await hadleUpdateAddress(params);
        if (isUpdated) {
          fetchUserInfo();
          settempLoading(false);
          Toast.show({
            type: 'success',
            text1: 'Address Updated!',
            text2: 'Your address has been updated successfully.',
          });
          navigation.navigate(previousScreen, {
            serviceType: 'mobile_notary',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Problem while updating',
          });
          settempLoading(false);
        }
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
    // <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView style={styles.container}>
      <NavigationHeader Title="Address" />
      <BottomSheetStyle>
        <ScrollView style={{marginTop: heightToDp(5)}}>
          <LabelTextInput
            leftImageSoucre={require('../../../assets/buildingsIcon.png')}
            placeholder={'Enter your building/flat number'}
            LabelTextInput={'Building / Flat'}
            Label={true}
            onChangeText={text => setBuilding(text)}
            value={building}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/roadIcon.png')}
            placeholder={'Enter your street address'}
            LabelTextInput={'Street'}
            onChangeText={text => setStreet(text)}
            Label={true}
            value={street}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/homeAddressIcon.png')}
            placeholder={'Enter your address'}
            LabelTextInput={'Address'}
            onChangeText={text => setAddress(text)}
            Label={true}
            value={address}
          />
          <SingleSelectDropDown
            data={stateItems}
            setSelected={item => {
              console.log('staterere', item);
              // Remove spaces from the selected state and set it
              const formattedState = item?.replace(/\s+/g, '');
              setState({
                formattedState,
              });
            }}
            label="State"
            placeholder="Choose your state..."
            Label={true}
            LabelTextInput={'State'}
            value={state?.label}
            style={{zIndex: 10, marginBottom: heightToDp(5)}} // Ensures dropdown has proper spacing and layering
            dropDownContainerStyle={{maxHeight: heightToDp(30), zIndex: 10}}
          />

          <LabelTextInput
            leftImageSoucre={require('../../../assets/mailbox.png')}
            placeholder={'Enter your POST code'}
            LabelTextInput={'POST Code'}
            onChangeText={text => setPin(text)}
            Label={true}
            value={pin}
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
    </KeyboardAvoidingView>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
});
