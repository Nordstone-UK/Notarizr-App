import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
const apiKey = 'AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA';
const MAX_RETRIES = 3;
const TIMEOUT = 5000; // 5 seconds

export async function callGeocodingAPI(lat, long) {
  console.log('Requesting geocoding for:', lat, long);
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&location_type=ROOFTOP&result_type=street_address&key=${apiKey}`;
  console.log('url', apiUrl);
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(apiUrl, {timeout: TIMEOUT});
      console.log('Geocoding API response:', response.data);
      if (response.data.status === 'OK') {
        return response.data;
      } else {
        throw new Error(`Geocoding API error: ${response.data.status}`);
      }
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error('Max retries reached. Unable to fetch geocoding data.');
        throw new Error('Error calling geocoding API: ' + error.message);
      } else {
        console.warn(`Attempt ${attempt} failed. Retrying...`);
      }
    }
  }
}

export const handleGetLocation = async () => {
  try {
    const coordinates = await getLocation();
    console.log('locat', coordinates);
    const response = await callGeocodingAPI(
      coordinates.latitude,
      coordinates.longitude,
    );
    console.log('locat', response);
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const getLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        resolve({latitude, longitude});
      },
      error => {
        reject(error);
      },
    );
  });
};
