import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import React, {useEffect} from 'react';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import AddressCard from '../../components/AddressCard/AddressCard';
import useFetchUser from '../../hooks/useFetchUser';
import {useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';

export default function AddressDetails({navigation}) {
  const {fetchUserInfo,handleDeleteAddress} = useFetchUser();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserInfo();
    });
    return unsubscribe;
  }, [navigation]);
  const {addresses =[]} = useSelector(state => state.user.user);
  const handleEditAddress = (address) => {
    navigation.navigate('AddNewAddress', {address: address });
  };
  const deleteAddress = async (addressId) => {
      const isUpdated  = await handleDeleteAddress(addressId);
        if (isUpdated) {
        fetchUserInfo();
        Toast.show({
          type: 'success',
          text1: 'Address Deleted!',
          text2: 'Your address has been deleted successfully.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Problem while editing',
        });
      }
      await fetchUserInfo();
    } 
  const confirmDeleteAddress = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteAddress(addressId),
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Address" />
      <Text style={styles.textheading}>Please find all your addresses</Text>
      <BottomSheetStyle>
        <ScrollView>
          {addresses.map((item, index) => (
            <AddressCard key={index} location={item.location} onEdit={() => handleEditAddress(item)} onDelete={() => confirmDeleteAddress(item._id)} />
          ))}
          <View
            style={{
              marginTop: heightToDp(15),
            }}>
            <GradientButton
              Title="Add Address"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{borderRadius: 15}}
              onPress={() => navigation.navigate('AddNewAddress')}
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
    marginBottom: widthToDp(8),
  },
  picture: {
    alignSelf: 'center',
    marginVertical: heightToDp(25),
  },
  iconContainer: {
    flexDirection: 'row',
    margin: widthToDp(4),
    justifyContent: 'flex-start',
  },
  icon: {
    marginHorizontal: widthToDp(2),
  },
  textheading: {
    fontSize: widthToDp(6),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    width: widthToDp(80),
    marginBottom: heightToDp(3),
    textAlign: 'center',
  },
});
