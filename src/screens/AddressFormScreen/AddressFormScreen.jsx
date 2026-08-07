import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import AuthTextField from '../../components/AuthFlow/AuthTextField';
import ScreenHeader from '../../components/Navigation/ScreenHeader';
import {saveUserInfo} from '../../features/user/userSlice';
import useFetchUser from '../../hooks/useFetchUser';
import AppColors from '../../themes/AppColors';

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
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />
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
            <View style={styles.mapGlow} />
            <View style={styles.routeLineOne} />
            <View style={styles.routeLineTwo} />
            <View style={styles.pin}>
              <Feather name="navigation" size={22} color={AppColors.white} />
            </View>
            <View style={styles.mapCopy}>
              <Text style={styles.mapEyebrow}>SERVICE DESTINATION</Text>
              <Text style={styles.mapTitle}>
                Where should the notary meet you?
              </Text>
              <Text style={styles.mapText}>
                Add a clear, complete location to make arrival effortless.
              </Text>
            </View>
          </View>
          <View style={styles.formHeading}>
            <View style={styles.formIcon}>
              <Feather name="edit-3" size={17} color={AppColors.primary} />
            </View>
            <View>
              <Text style={styles.formTitle}>
                {existing ? 'Update location' : 'Location details'}
              </Text>
              <Text style={styles.formSubtitle}>
                Fields with an address are used for booking.
              </Text>
            </View>
          </View>
          <View style={styles.form}>
            <AuthTextField
              icon="tag"
              label="Label"
              onChangeText={setLabel}
              placeholder="Home or work"
              value={label}
            />
            <AuthTextField
              icon="map"
              label="Street address"
              onChangeText={setStreet}
              placeholder="Street address"
              value={street}
            />
            <AuthTextField
              icon="layers"
              label="Apartment, suite, or unit"
              onChangeText={setUnit}
              placeholder="Optional"
              value={unit}
            />
            <AuthTextField
              icon="compass"
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
          <AuthPrimaryButton
            icon="arrow-right"
            loading={saving}
            onPress={saveAddress}
            style={styles.saveButton}
            title="Save address"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: AppColors.background,
    paddingBottom: 24,
  },
  flex: {
    flex: 1,
  },
  footer: {
    backgroundColor: AppColors.white,
    borderTopColor: AppColors.border,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  form: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  formHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 20,
  },
  formIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    marginRight: 11,
    width: 38,
  },
  formSubtitle: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    marginTop: 2,
  },
  formTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  mapCopy: {flex: 1, marginLeft: 14},
  mapEyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 8,
    letterSpacing: 0.8,
  },
  mapGlow: {
    backgroundColor: 'rgba(253,109,31,0.14)',
    borderRadius: 70,
    height: 140,
    position: 'absolute',
    right: -30,
    top: -70,
    width: 140,
  },
  mapPreview: {
    alignItems: 'center',
    backgroundColor: AppColors.textPrimary,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 23,
  },
  mapText: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  mapTitle: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
  },
  pin: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  routeLineOne: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    height: 1,
    left: -20,
    position: 'absolute',
    top: 26,
    transform: [{rotate: '-12deg'}],
    width: 170,
  },
  routeLineTwo: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 20,
    height: 1,
    position: 'absolute',
    right: -15,
    transform: [{rotate: '15deg'}],
    width: 140,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  safeArea: {
    backgroundColor: AppColors.white,
    flex: 1,
  },
  saveButton: {
    height: 54,
    marginTop: 0,
  },
  stateField: {
    flex: 1,
  },
  zipField: {
    flex: 1.2,
  },
});
