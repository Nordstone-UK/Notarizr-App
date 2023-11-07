// import Geolocation from '@react-native-community/geolocation';
// import {useState} from 'react';
// import Geocoder from 'react-native-geocoding';

// const [location, setLocation] = useState();

// Geocoder.init('AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA', {language: 'en'}); // use a valid API key

// export const ReverseGeoCode = coords => {
//   Geocoder.from(coords.lat, coords.long)
//     .then(json => {
//       var addressComponent = json.results[0].address_components[0];
//       console.log('====================================');
//       console.log(addressComponent);
//       console.log('====================================');
//     })
//     .catch(error => console.warn(error));
// };

// export const handleGetLocation = async () => {
//   try {
//     const coordinates = await getLocation();
//     console.log('coordinates', coordinates);
//     setLocation(coordinates);
//   } catch (error) {
//     console.log(error);
//   }
// };
// export const getLocation = () => {
//   return new Promise((resolve, reject) => {
//     Geolocation.getCurrentPosition(
//       position => {
//         const {latitude, longitude} = position.coords;
//         resolve({latitude, longitude});
//       },
//       error => {
//         reject(error);
//       },
//       Platform.OS === 'android'
//         ? {}
//         : {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000},
//     );
//   });
// };

// // Geocoder.from('Colosseum')
// //   .then(json => {
// //     var location = json.results[0].geometry.location;
// //     console.log(location);
// //   })
// //   .catch(error => console.warn(error));

// // // Search by address, with a biased geo-bounds
// // Geocoder.from('Pyramid', {
// //   southwest: {lat: 36.05, lng: -115.25},
// //   northeast: {lat: 36.16, lng: -115.1},
// // })
// //   .then(json => {
// //     var location = json.results[0].geometry.location;
// //     console.log(location);
// //   })
// //   .catch(error => console.warn(error));

// // // Search by geo-location (reverse geo-code)
import Geocode from 'react-geocode';
import axios from 'axios';
const apiKey = 'AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA';

export async function callGeocodingAPI(lat, long) {
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&location_type=ROOFTOP&result_type=street_address&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);

    console.log(
      'Response address_components: ',
      response.data.results[0].address_components[4].long_name,
    );
    console.log('====================================');
    return response.data.results[0].address_components[4].long_name;
  } catch (error) {
    throw new Error('Error calling geocoding API: ' + error);
  }
}
