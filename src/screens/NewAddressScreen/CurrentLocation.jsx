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

export default function CurrentLocationScreen({route}) {
  const {previousScreen} = route?.params || {};
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

  const handleGetLocation = async () => {
    try {
      const coordinates = await getLocation();
      setLocation(coordinates);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    handleGetLocation();
  }, []);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          resolve({latitude, longitude});
        },
        error => {
          reject(error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000},
      );
    });
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

    try {
      const address = await getAddressFromCoordinates(latitude, longitude);
      setSelectedAddress(address);
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmLocation = () => {
    if (markerLocation) {
      navigation.navigate('AddNewAddress', {
        previousScreen: previousScreen,
        location: selectedAddress,
        location_coordinates: [
          markerLocation.latitude,
          markerLocation.longitude,
        ],
      });
    }
  };
  console.log('mardkere', latitude, longitude);
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
      <NavigationHeader Title="Select Location" />
      {loading ? ( // Show loading indicator if loading is true
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
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
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
