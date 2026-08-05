import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import AuthTextField from '../../components/AuthFlow/AuthTextField';
import ScreenHeader from '../../components/Navigation/ScreenHeader';
import {saveUserInfo} from '../../features/user/userSlice';
import useFetchUser from '../../hooks/useFetchUser';

export default function AddressFormScreen({navigation, route}) {
  const existing = route.params?.address;
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const previewMode = Boolean(user?.isHomePreview);
  const {fetchUserInfo, hadleUpdateAddress, handleEditAddress} = useFetchUser();
  const [label, setLabel] = useState(
    existing?.label || existing?.tag || (previewMode ? 'Home' : ''),
  );
  const [street, setStreet] = useState(
    existing?.street ||
      existing?.location ||
      (previewMode ? '120 Market Street' : ''),
  );
  const [unit, setUnit] = useState(existing?.unit || '');
  const [city, setCity] = useState(
    existing?.city || (previewMode ? 'San Francisco' : ''),
  );
  const [state, setState] = useState(
    existing?.state || (previewMode ? 'CA' : ''),
  );
  const [zip, setZip] = useState(existing?.zip || (previewMode ? '94105' : ''));
  const [saving, setSaving] = useState(false);

  const saveAddress = async () => {
    const missingNewAddressDetails = !existing && (!city.trim() || !zip.trim());
    if (!label.trim() || !street.trim() || missingNewAddressDetails) {
      Toast.show({
        type: 'error',
        text1: 'Missing address information',
        text2: 'Complete the required fields before saving.',
      });
      return;
    }

    const address = {
      _id: existing?._id || `preview-address-${Date.now()}`,
      label: label.trim(),
      street: street.trim(),
      unit: unit.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      primary: existing?.primary || false,
      location: [
        street.trim(),
        unit.trim(),
        city.trim(),
        [state.trim(), zip.trim()].filter(Boolean).join(' '),
      ]
        .filter(Boolean)
        .join(', '),
    };
    if (previewMode) {
      const addresses = user?.addresses || [];
      const next = existing
        ? addresses.map(item => (item._id === existing._id ? address : item))
        : [...addresses, address];

      dispatch(saveUserInfo({...user, addresses: next}));
      Toast.show({type: 'success', text1: 'Address saved'});
      navigation.goBack();
      return;
    }

    setSaving(true);
    try {
      const coordinates = existing?.location_coordinates || [];
      const params = {
        location: address.location,
        tag: address.label.toLowerCase(),
        lat: coordinates[0] != null ? String(coordinates[0]) : null,
        lng: coordinates[1] != null ? String(coordinates[1]) : null,
      };
      const result = existing
        ? await handleEditAddress({...params, addressId: existing._id})
        : await hadleUpdateAddress(params);
      const response = existing
        ? result?.updateUserAddressR
        : result?.updateUserAddresses;

      if (response?.status !== '200') {
        throw new Error(response?.message || 'Address update failed');
      }

      await fetchUserInfo();
      Toast.show({type: 'success', text1: 'Address saved'});
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to save address',
        text2: 'Please check the details and try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScreenHeader
        fallback="AddressDetails"
        navigation={navigation}
        subtitle="Used for mobile appointments"
        title={existing ? 'Edit address' : 'New address'}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.mapPreview}>
            <View style={styles.pin}>
              <Feather name="map-pin" size={23} color="#FD6D1F" />
            </View>
            <Text style={styles.mapTitle}>Address details</Text>
            <Text style={styles.mapText}>
              Enter the location where a notary can meet you.
            </Text>
          </View>
          <View style={styles.form}>
            <AuthTextField
              icon="bookmark"
              label="Label"
              onChangeText={setLabel}
              placeholder="Home or work"
              value={label}
            />
            <AuthTextField
              icon="map-pin"
              label="Street address"
              onChangeText={setStreet}
              placeholder="Street address"
              value={street}
            />
            <AuthTextField
              icon="home"
              label="Apartment, suite, or unit"
              onChangeText={setUnit}
              placeholder="Optional"
              value={unit}
            />
            <AuthTextField
              icon="navigation"
              label="City"
              onChangeText={setCity}
              placeholder="City"
              value={city}
            />
            <View style={styles.row}>
              <View style={styles.stateField}>
                <AuthTextField
                  label="State"
                  onChangeText={setState}
                  placeholder="State"
                  value={state}
                />
              </View>
              <View style={styles.zipField}>
                <AuthTextField
                  keyboardType="number-pad"
                  label="ZIP code"
                  onChangeText={setZip}
                  placeholder="ZIP"
                  value={zip}
                />
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.76}
            disabled={saving}
            onPress={saveAddress}
            style={styles.saveButton}>
            <Text style={styles.saveText}>
              {saving ? 'Saving...' : 'Save address'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  flex: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  mapPreview: {
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    paddingHorizontal: 30,
    paddingVertical: 28,
  },
  mapText: {
    color: '#7D8490',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    textAlign: 'center',
  },
  mapTitle: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
    marginTop: 12,
  },
  pin: {
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#FD6D1F',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  stateField: {
    flex: 1,
  },
  zipField: {
    flex: 1.2,
  },
});
