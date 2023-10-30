import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  View,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

export default function MapArrivalScreen({navigation}, props) {
  const [location, setLocation] = useState(null);

  const handleGetLocation = async () => {
    try {
      const coordinates = await getLocation();
      console.log('coordinates', coordinates);
      setLocation(coordinates);
    } catch (error) {
      console.log(error);
    }
  };

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
        Platform.OS === 'android'
          ? {}
          : {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000},
      );
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      {location && (
        <MapView
          zoomEnabled={true}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          style={styles.map}>
          {/* {agents.map(agent => (
          <Marker
            key={agent._id}
            coordinate={{
              latitude: agent.current_location.coordinates[1],
              longitude: agent.current_location.coordinates[0],
            }}
            title={agent.first_name + ' ' + agent.last_name}
            description={agent.location}
          />
        ))} */}
        </MapView>
      )}
      <NavigationHeader
        Title="Brandon Roger"
        ProfilePic={require('../../../assets/profileIcon.png')}
      />
      <View style={styles.button}>
        <GradientButton
          Title="Arriving by 1:30 PM"
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          onPress={() => navigation.navigate('AgentMobileNotaryStartScreen')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.PinkBackground,
    flex: 1,
  },
  bottonSheet: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },

  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  button: {
    justifyContent: 'flex-end',
    flex: 1,
    marginBottom: widthToDp(5),
  },
});
