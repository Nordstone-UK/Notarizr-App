import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {saveUserInfo} from '../../features/user/userSlice';
import useFetchUser from '../../hooks/useFetchUser';
import AppColors from '../../themes/AppColors';

const GOOGLE_MAPS_KEY = 'AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA';
const BOOKING_ADDRESS_KEY = 'notarizr_booking_selected_address';
const DEFAULT_COORDINATE = {latitude: 37.7749, longitude: -122.4194};
const DEFAULT_REGION = {
  ...DEFAULT_COORDINATE,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const getStoredCoordinate = address => {
  const coordinates = address?.location_coordinates || [];
  const first = Number(coordinates[0]);
  const second = Number(coordinates[1]);
  if (!Number.isFinite(first) || !Number.isFinite(second)) {
    return null;
  }
  if (Math.abs(first) > 90 && Math.abs(second) <= 90) {
    return {latitude: second, longitude: first};
  }
  return {latitude: first, longitude: second};
};

const reverseGeocode = async coordinate => {
  const response = await axios.get(
    'https://maps.googleapis.com/maps/api/geocode/json',
    {
      params: {
        key: GOOGLE_MAPS_KEY,
        latlng: `${coordinate.latitude},${coordinate.longitude}`,
      },
      timeout: 6000,
    },
  );
  return response.data?.results?.[0]?.formatted_address || '';
};

const forwardGeocode = async address => {
  const response = await axios.get(
    'https://maps.googleapis.com/maps/api/geocode/json',
    {
      params: {address, key: GOOGLE_MAPS_KEY},
      timeout: 6000,
    },
  );
  const result = response.data?.results?.[0];
  if (!result?.geometry?.location) {
    return null;
  }
  return {
    address: result.formatted_address,
    coordinate: {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    },
  };
};

export default function CurrentLocationScreen({navigation, route}) {
  const existingAddress = route.params?.address;
  const returnToBooking = Boolean(route.params?.returnToBooking);
  const directSave = Boolean(route.params?.directSave || returnToBooking);
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const previewMode = Boolean(user?.isHomePreview);
  const {fetchUserInfo, hadleUpdateAddress, handleEditAddress} = useFetchUser();
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const reverseLookupRef = useRef(0);
  const [coordinate, setCoordinate] = useState(
    getStoredCoordinate(existingAddress) || DEFAULT_COORDINATE,
  );
  const [addressText, setAddressText] = useState(
    existingAddress?.location || '',
  );
  const [label, setLabel] = useState(
    existingAddress?.label || existingAddress?.tag || 'Home',
  );
  const [loadingMap, setLoadingMap] = useState(true);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  const moveMap = useCallback(nextCoordinate => {
    setCoordinate(nextCoordinate);
    mapRef.current?.animateToRegion(
      {...nextCoordinate, latitudeDelta: 0.008, longitudeDelta: 0.008},
      350,
    );
  }, []);

  const locateCurrentPosition = useCallback(async () => {
    setLocating(true);
    try {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Location permission was not granted.');
        }
      } else {
        Geolocation.requestAuthorization?.();
      }

      Geolocation.getCurrentPosition(
        async position => {
          const nextCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          moveMap(nextCoordinate);
          try {
            const nextAddress = await reverseGeocode(nextCoordinate);
            if (nextAddress) {
              setAddressText(nextAddress);
            }
          } catch (error) {
            console.warn('Current location could not be named:', error);
          } finally {
            setLocating(false);
          }
        },
        error => {
          setLocating(false);
          Toast.show({
            type: 'error',
            text1: 'Location unavailable',
            text2: error.message || 'Move the map pin manually instead.',
          });
        },
        {enableHighAccuracy: true, maximumAge: 10000, timeout: 8000},
      );
    } catch (error) {
      setLocating(false);
      Toast.show({
        type: 'error',
        text1: 'Location unavailable',
        text2: error.message,
      });
    }
  }, [moveMap]);

  useEffect(() => {
    let active = true;
    const prepareMap = async () => {
      try {
        if (existingAddress?.location) {
          const resolved = await forwardGeocode(existingAddress.location);
          if (active && resolved) {
            moveMap(resolved.coordinate);
            setAddressText(resolved.address);
          }
        } else {
          locateCurrentPosition();
        }
      } catch (error) {
        console.warn('Saved address could not be positioned:', error);
      } finally {
        if (active) {
          setLoadingMap(false);
        }
      }
    };
    prepareMap();
    return () => {
      active = false;
    };
  }, [existingAddress?.location, locateCurrentPosition, moveMap]);

  const updateAddressForCoordinate = async nextCoordinate => {
    const lookupId = Date.now();
    reverseLookupRef.current = lookupId;
    setCoordinate(nextCoordinate);
    try {
      const nextAddress = await reverseGeocode(nextCoordinate);
      if (reverseLookupRef.current === lookupId && nextAddress) {
        setAddressText(nextAddress);
      }
    } catch (error) {
      console.warn('Map location could not be named:', error);
    }
  };

  const locateTypedAddress = async () => {
    if (!addressText.trim()) {
      return;
    }
    setLocating(true);
    try {
      const resolved = await forwardGeocode(addressText.trim());
      if (!resolved) {
        throw new Error('Try a more complete street address.');
      }
      setAddressText(resolved.address);
      moveMap(resolved.coordinate);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Address not found',
        text2: error.message || 'Move the pin to the correct location.',
      });
    } finally {
      setLocating(false);
    }
  };

  const saveDirectly = async () => {
    if (!addressText.trim() || saving) {
      return;
    }

    setSaving(true);
    const nextAddress = {
      ...existingAddress,
      _id: existingAddress?._id || `local-address-${Date.now()}`,
      label: label.trim() || 'Saved location',
      tag: label.trim() || existingAddress?.tag || 'Home',
      location: addressText.trim(),
      location_coordinates: [coordinate.latitude, coordinate.longitude],
    };

    try {
      if (!previewMode) {
        const params = {
          location: nextAddress.location,
          tag: nextAddress.tag,
          lat: String(coordinate.latitude),
          lng: String(coordinate.longitude),
        };
        const result = existingAddress?._id
          ? await handleEditAddress({...params, addressId: existingAddress._id})
          : await hadleUpdateAddress(params);
        if (!result) {
          throw new Error('The address service did not accept the update.');
        }
      }

      const currentAddresses = user?.addresses || [];
      const nextAddresses = existingAddress?._id
        ? currentAddresses.map(item =>
            item._id === existingAddress._id ? nextAddress : item,
          )
        : [...currentAddresses, nextAddress];
      dispatch(saveUserInfo({...user, addresses: nextAddresses}));

      if (!previewMode) {
        await fetchUserInfo().catch(error =>
          console.warn('Saved address refresh failed:', error),
        );
      }
      if (returnToBooking) {
        await AsyncStorage.setItem(
          BOOKING_ADDRESS_KEY,
          JSON.stringify(nextAddress),
        );
      }
      Toast.show({type: 'success', text1: 'Location saved'});
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Address not saved',
        text2: error.message || 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmLocation = () => {
    if (directSave) {
      saveDirectly();
      return;
    }
    navigation.navigate('AddNewAddress', {
      previousScreen: route.params?.previousScreen,
      service: route.params?.service,
      address: existingAddress,
      location: addressText.trim(),
      location_coordinates: [coordinate.latitude, coordinate.longitude],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <MapView
          initialRegion={{...DEFAULT_REGION, ...coordinate}}
          onMapReady={() => setLoadingMap(false)}
          onRegionChangeComplete={region =>
            updateAddressForCoordinate({
              latitude: region.latitude,
              longitude: region.longitude,
            })
          }
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          ref={mapRef}
          showsCompass={false}
          showsMyLocationButton={false}
          showsUserLocation
          style={StyleSheet.absoluteFillObject}
        />

        <View pointerEvents="none" style={styles.centerPinWrap}>
          <View style={styles.centerPin}>
            <Feather name="map-pin" size={27} color={AppColors.white} />
          </View>
          <View style={styles.pinShadow} />
        </View>

        <View style={styles.topArea}>
          <View style={styles.topBar}>
            <TouchableOpacity
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
              style={styles.iconButton}>
              <Feather
                name="arrow-left"
                size={22}
                color={AppColors.textPrimary}
              />
            </TouchableOpacity>
            <View style={styles.titleCopy}>
              <Text style={styles.title}>Choose location</Text>
              <Text style={styles.subtitle}>Move the map to place the pin</Text>
            </View>
            <TouchableOpacity
              accessibilityLabel="Use current location"
              disabled={locating}
              onPress={locateCurrentPosition}
              style={styles.locateButton}>
              {locating ? (
                <ActivityIndicator color={AppColors.primary} size="small" />
              ) : (
                <Feather name="crosshair" size={20} color={AppColors.primary} />
              )}
            </TouchableOpacity>
          </View>

          <GooglePlacesAutocomplete
            debounce={250}
            enablePoweredByContainer={false}
            fetchDetails
            keyboardShouldPersistTaps="handled"
            listViewDisplayed="auto"
            onPress={(_, details) => {
              const place = details?.geometry?.location;
              if (!place) {
                return;
              }
              const nextCoordinate = {
                latitude: place.lat,
                longitude: place.lng,
              };
              setAddressText(details.formatted_address || details.name || '');
              moveMap(nextCoordinate);
              searchRef.current?.setAddressText('');
            }}
            placeholder="Search area, street or landmark"
            query={{key: GOOGLE_MAPS_KEY, language: 'en'}}
            ref={searchRef}
            renderLeftButton={() => (
              <View style={styles.searchIcon}>
                <Feather
                  name="search"
                  size={18}
                  color={AppColors.textSecondary}
                />
              </View>
            )}
            styles={placesStyles}
            textInputProps={{
              placeholderTextColor: AppColors.textMuted,
              returnKeyType: 'search',
            }}
          />
        </View>

        {loadingMap ? (
          <View style={styles.mapLoader}>
            <ActivityIndicator color={AppColors.primary} size="large" />
          </View>
        ) : null}

        <View style={styles.confirmCard}>
          <View style={styles.dragHandle} />
          <Text style={styles.cardEyebrow}>SELECTED LOCATION</Text>
          <View style={styles.addressRow}>
            <View style={styles.addressPin}>
              <Feather name="navigation" size={19} color={AppColors.primary} />
            </View>
            <TextInput
              multiline
              onChangeText={setAddressText}
              placeholder="Enter the full address manually"
              placeholderTextColor={AppColors.textMuted}
              style={styles.addressInput}
              value={addressText}
            />
            <TouchableOpacity
              accessibilityLabel="Find typed address on map"
              onPress={locateTypedAddress}
              style={styles.findButton}>
              <Feather name="search" size={17} color={AppColors.primary} />
            </TouchableOpacity>
          </View>
          {directSave ? (
            <View style={styles.labelRow}>
              {['Home', 'Work', 'Other'].map(item => {
                const selected = label.toLowerCase() === item.toLowerCase();
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setLabel(item)}
                    style={[
                      styles.labelChip,
                      selected && styles.labelChipSelected,
                    ]}>
                    <Text
                      style={[
                        styles.labelChipText,
                        selected && styles.labelChipTextSelected,
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.78}
            disabled={!addressText.trim() || saving}
            onPress={confirmLocation}
            style={[
              styles.confirmButton,
              (!addressText.trim() || saving) && styles.confirmButtonDisabled,
            ]}>
            {saving ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <>
                <Text style={styles.confirmButtonText}>
                  {existingAddress
                    ? 'Update this location'
                    : 'Save this location'}
                </Text>
                <Feather name="arrow-right" size={20} color={AppColors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const placesStyles = {
  container: {
    flex: 0,
    marginHorizontal: 14,
    marginTop: 10,
    zIndex: 20,
  },
  textInputContainer: {
    alignItems: 'center',
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    minHeight: 52,
    shadowColor: '#121826',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  textInput: {
    backgroundColor: 'transparent',
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    height: 50,
    marginBottom: 0,
    marginLeft: 0,
    marginTop: 0,
    paddingLeft: 0,
    paddingRight: 12,
  },
  listView: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  row: {
    minHeight: 48,
    paddingHorizontal: 14,
  },
  description: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
};

const styles = StyleSheet.create({
  addressInput: {
    color: AppColors.textPrimary,
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    lineHeight: 18,
    maxHeight: 66,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  addressPin: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  addressRow: {
    alignItems: 'center',
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 9,
    padding: 7,
  },
  cardEyebrow: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  centerPin: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderColor: AppColors.white,
    borderRadius: 25,
    borderWidth: 3,
    height: 50,
    justifyContent: 'center',
    shadowColor: AppColors.black,
    shadowOffset: {width: 0, height: 7},
    shadowOpacity: 0.2,
    shadowRadius: 9,
    width: 50,
  },
  centerPinWrap: {
    alignItems: 'center',
    left: '50%',
    marginLeft: -25,
    marginTop: -47,
    position: 'absolute',
    top: '48%',
    zIndex: 4,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    marginTop: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: AppColors.borderStrong,
  },
  confirmButtonText: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    marginRight: 9,
  },
  confirmCard: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    bottom: 0,
    left: 0,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    paddingHorizontal: 16,
    paddingTop: 11,
    position: 'absolute',
    right: 0,
    shadowColor: AppColors.black,
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 14,
  },
  container: {
    flex: 1,
  },
  dragHandle: {
    alignSelf: 'center',
    backgroundColor: AppColors.borderStrong,
    borderRadius: 2,
    height: 4,
    marginBottom: 12,
    width: 42,
  },
  findButton: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  labelChip: {
    alignItems: 'center',
    borderColor: AppColors.border,
    borderRadius: 7,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 14,
  },
  labelChipSelected: {
    backgroundColor: AppColors.primarySoft,
    borderColor: AppColors.primary,
  },
  labelChipText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  labelChipTextSelected: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
  },
  labelRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  locateButton: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  mapLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    zIndex: 3,
  },
  pinShadow: {
    backgroundColor: 'rgba(18, 24, 38, 0.2)',
    borderRadius: 8,
    height: 7,
    marginTop: 5,
    width: 18,
  },
  safeArea: {
    backgroundColor: AppColors.white,
    flex: 1,
  },
  searchIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 14,
    paddingRight: 9,
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    marginTop: 2,
  },
  title: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  titleCopy: {
    flex: 1,
    marginHorizontal: 11,
  },
  topArea: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 8,
  },
});
