import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
const apiKey = 'AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA';

export async function callGeocodingAPI(lat, long) {
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&location_type=ROOFTOP&result_type=street_address&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    throw new Error('Error calling geocoding API: ' + error);
  }
}
export const handleGetLocation = async () => {
  try {
    const coordinates = await getLocation();
    const response = await callGeocodingAPI(
      coordinates.latitude,
      coordinates.longitude,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};
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
    );
  });
};
