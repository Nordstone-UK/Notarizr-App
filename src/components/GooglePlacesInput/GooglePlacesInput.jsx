import React from 'react';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {widthToDp} from '../../utils/Responsive';

const GooglePlacesInput = () => {
  const handlePlaceSelect = (data, details) => {
    // Handle selected place
    // console.log(data, details);
  };
  return (
    <GooglePlacesAutocomplete
      placeholder="Search"
      onPress={handlePlaceSelect}
      fetchDetails={true}
      getCurrentLocation={true}
      enablePoweredByContainer={false}
      query={{
        key: '',
        language: 'en',
      }}
      onFail={error => console.error(error)}
      currentLocation={true}
      currentLocationLabel="Current location"
      styles={{
        textInputContainer: {
          borderWidth: 1,
          width: widthToDp(90),
          alignSelf: 'center',
        },
        textInput: {
          fontSize: 16,
        },
        predefinedPlacesDescription: {
          color: '#1faadb',
        },
      }}
    />
  );
};

export default GooglePlacesInput;
