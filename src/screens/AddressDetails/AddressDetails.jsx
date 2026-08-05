import React, {useEffect, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import ScreenHeader from '../../components/Navigation/ScreenHeader';
import SavedAddressRow from '../../components/Profile/SavedAddressRow';
import {saveUserInfo} from '../../features/user/userSlice';
import useFetchUser from '../../hooks/useFetchUser';

export default function AddressDetails({navigation}) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const {fetchUserInfo, handleDeleteAddress} = useFetchUser();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const previewMode = Boolean(user?.isHomePreview);

  useEffect(() => {
    setAddresses(user?.addresses || []);
  }, [user?.addresses]);

  useEffect(() => {
    if (previewMode) {
      return undefined;
    }
    return navigation.addListener('focus', fetchUserInfo);
  }, [fetchUserInfo, navigation, previewMode]);

  const openAddress = address => {
    navigation.navigate('AddressFormScreen', {address});
  };

  const addAddress = () => {
    navigation.navigate('AddressFormScreen');
  };

  const deleteAddress = async address => {
    if (previewMode) {
      const next = addresses.filter(item => item._id !== address._id);
      setAddresses(next);
      dispatch(saveUserInfo({...user, addresses: next}));
      Toast.show({type: 'success', text1: 'Address removed'});
      return;
    }

    const updated = await handleDeleteAddress(address._id);
    if (updated?.deleteUserAddressR?.status === '200') {
      await fetchUserInfo();
      Toast.show({type: 'success', text1: 'Address removed'});
    } else {
      Toast.show({type: 'error', text1: 'Unable to remove address'});
    }
  };

  const confirmDelete = address => {
    Alert.alert(
      'Remove saved address?',
      `Delete ${address.label || 'this address'} from your account?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteAddress(address),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScreenHeader
        fallback="HomeScreen"
        fallbackParams={{screen: 'ProfileInfoScreen'}}
        navigation={navigation}
        subtitle={`${addresses.length} saved location${
          addresses.length === 1 ? '' : 's'
        }`}
        title="Saved addresses"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Service locations</Text>
          <Text style={styles.introText}>
            Choose from these addresses when booking a mobile notary.
          </Text>
        </View>
        {addresses.length ? (
          <View style={styles.list}>
            {addresses.map((address, index) => (
              <SavedAddressRow
                address={{
                  ...address,
                  label:
                    address.label ||
                    `${address.tag || 'Saved address'}`.replace(/^./, value =>
                      value.toUpperCase(),
                    ),
                  primary: address.primary ?? index === 0,
                }}
                key={address._id || index}
                last={index === addresses.length - 1}
                onDelete={() => confirmDelete(address)}
                onEdit={() => openAddress(address)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="map-pin" size={26} color="#FD6D1F" />
            </View>
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyText}>
              Add a home or work address to book mobile services faster.
            </Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.76}
          onPress={addAddress}
          style={styles.addButton}>
          <Feather name="plus" size={19} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add new address</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: '#FD6D1F',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 9,
    height: 54,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 42,
    paddingTop: 90,
  },
  emptyText: {
    color: '#8B919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    marginTop: 15,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  intro: {
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  introText: {
    color: '#7D8490',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  introTitle: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  list: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#ECEEF1',
    borderBottomWidth: 1,
    borderTopColor: '#ECEEF1',
    borderTopWidth: 1,
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
});
