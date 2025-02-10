import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  TextInput,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import AgentReviewCard from '../../components/AgentReviewCard/AgentReviewCard';
import Geolocation from '@react-native-community/geolocation';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import axios from 'axios';
import Colors from '../../themes/Colors';
import {useNavigation} from '@react-navigation/native';
import {getLocation, handleGetLocation} from '../../utils/Geocode';
const MAX_RETRIES = 3;
const TIMEOUT = 5000; // 5 seconds

const getAddressFromCoordinates = async (latitude, longitude) => {
  const apiKey = 'AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA';
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(apiUrl, {timeout: TIMEOUT});
      if (response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      } else {
        return 'Address not found';
      }
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        throw new Error('Error fetching address: ' + error);
      } else {
        console.warn(`Attempt ${attempt} failed. Retrying...`);
      }
    }
  }
};
export default function CurrentLocationScreen({route}) {
  const {previousScreen, address, service} = route?.params || {};
  console.log('routessss', route?.params);
  const navigation = useNavigation();

  console.log('navigation', navigation.navigate);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [markerLocation, setMarkerLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [agents, setAgents] = useState([]); // Add this if you have agents data
  const [searchText, setSearchText] = useState('');
  const googlePlacesRef = useRef();

  // const handleGetLocation = async () => {
  //   try {
  //     console.log('cccccccccdddddccc');
  //     const coordinates = await getLocation();
  //     console.log('cccccccccccc', coor);
  //     setLocation(coordinates);
  //     setLoading(false);
  //   } catch (error) {
  //     console.log(error);
  //     setLoading(false);
  //   }
  // };

  const requestLocationPermission = async () => {
    try {
      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      const backgroundLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message: 'This app needs access to your location in the background.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (
        fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED &&
        backgroundLocationGranted === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Location permissions granted');
        setLoading(false);
      } else {
        console.log('Location permission denied');
        Alert.alert(
          'Permission Denied',
          'Location permission is required for this app to work. Please grant the permission from settings.',
        );
        setLoading(false);
      }
    } catch (err) {
      console.warn(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);
  useEffect(() => {
    getState();
  }, []);
  const getState = async query => {
    // setLoading(true);

    const locationResponse = await handleGetLocation();
    const currentlocation = await getLocation();
    setLocation(currentlocation);
    const {latitude, longitude} = currentlocation;
  };

  const handlePlaceSelected = (data, details) => {
    const {lat, lng} = details.geometry.location;
    const newLocation = {latitude: lat, longitude: lng};
    setMarkerLocation(newLocation);
    setLocation(newLocation);
    setSelectedAddress(details.formatted_address);
    setLatitude(lat);
    setLongitude(lng);
    setSearchText(''); // Clear the search text
  };

  const handleMapPress = async event => {
    const {latitude, longitude} = event.nativeEvent.coordinate;
    setMarkerLocation({latitude, longitude});
    setLatitude(latitude);
    setLongitude(longitude);
    console.log('latidid and longitusd', event.nativeEvent);
    try {
      const address = await getAddressFromCoordinates(latitude, longitude);
      setSelectedAddress(address);
      const {results} = address;
      console.log('adddress', address);
      if (results.length > 0) {
        const addressComponents = results[0].address_components;
        let country = null;
        let state = null;

        // Loop through address components to find country and state
        addressComponents.forEach(component => {
          if (component.types.includes('country')) {
            country = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
        });

        console.log('Country:', country);
        console.log('State:', state);
      } else {
        console.log('Address not found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmLocation = () => {
    if (markerLocation) {
      console.log('selectred address', selectedAddress);
      navigation.navigate('AddNewAddress', {
        previousScreen: previousScreen,
        service: service,
        address: address,
        location: selectedAddress,
        location_coordinates: [
          markerLocation.latitude,
          markerLocation.longitude,
        ],
      });
    }
  };
  // const MAX_RETRIES = 3;
  // const TIMEOUT = 5000; // 5 seconds

  // console.log('mardkere', latitude, longitude);
  const getAddressFromCoordinates = async (latitude, longitude) => {
    const apiKey = 'AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA';
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await axios.get(apiUrl);
      if (response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      } else {
        return 'Address not found';
      }
    } catch (error) {
      throw new Error('Error fetching address: ' + error);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    googlePlacesRef.current?.setAddressText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{zIndex: 999}}>
        {navigation && <NavigationHeader Title="Select Location" />}
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.Primary}
          style={styles.loader}
        />
      ) : (
        <>
          {location && (
            <>
              <GooglePlacesAutocomplete
                ref={googlePlacesRef}
                placeholder="Search for a place"
                onPress={handlePlaceSelected}
                query={{
                  key: 'AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA', // Replace with your actual API key
                  language: 'en',
                }}
                fetchDetails={true}
                textInputProps={{
                  value: searchText,
                  onChangeText: text => setSearchText(text),
                  placeholderTextColor: Colors.DisableColor || '#A9A9A9',
                }}
                renderRightButton={() =>
                  searchText.length > 0 && (
                    <TouchableOpacity
                      onPress={clearSearch}
                      style={styles.clearButton}>
                      <Text style={styles.clearButtonText}>X</Text>
                    </TouchableOpacity>
                  )
                }
                styles={{
                  container: styles.searchContainer,
                  textInput: styles.searchInput,
                }}
              />
              <MapView
                zoomEnabled={true}
                region={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
                showsUserLocation={true}
                provider={PROVIDER_GOOGLE}
                style={styles.map}>
                {markerLocation && (
                  <Marker
                    coordinate={markerLocation}
                    draggable
                    onDragEnd={handleMapPress}
                  />
                )}
                {agents.map(agent => (
                  <Marker
                    key={agent._id}
                    coordinate={{
                      latitude: agent.current_location.coordinates[1],
                      longitude: agent.current_location.coordinates[0],
                    }}
                    title={agent.first_name + ' ' + agent.last_name}
                    description={agent.location}
                  />
                ))}
              </MapView>
            </>
          )}
        </>
      )}
      <View style={styles.footer}>
        {latitude && longitude && (
          <Text style={styles.coordinatesText}>
            Latitude: {latitude.toFixed(6)}, Longitude: {longitude.toFixed(6)}
          </Text>
        )}
        <Text style={styles.addressText}>{selectedAddress}</Text>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmLocation}>
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  searchContainer: {
    // position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#FFF',
    height: 50,
    borderRadius: 5,
    paddingHorizontal: 10,
    margin: 10,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 15,
    padding: 5,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#FF6347',
  },
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFF',
    padding: 10,
    alignItems: 'center',
  },
  coordinatesText: {
    fontSize: 16,
    marginBottom: 5,
    color: Colors.Black,
  },
  addressText: {
    fontSize: 16,
    marginBottom: 10,
    color: Colors.Black,
  },
  confirmButton: {
    backgroundColor: '#FF6347',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 18,
  },
  loader: {
    // Add loader style
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
