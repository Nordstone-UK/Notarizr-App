import React, {useState, useEffect} from 'react';
import {Alert, SafeAreaView, StyleSheet, View} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {useSelector} from 'react-redux';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import Colors from '../../themes/Colors';
import MapViewDirections from 'react-native-maps-directions';

const GOOGLE_MAPS_APIKEY = 'AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA';

export default function AgentMapArrivalScreen({navigation}) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const clientData = useSelector(state => state.booking.user);
  const coordinates = useSelector(state => state.booking.coordinates);
  const user = useSelector(state => state.user.user.account_type);

  const handleGetLocation = async () => {
    try {
      const currentLocation = await getLocation();
      console.log('currentLocation', currentLocation);
      setLocation(currentLocation);
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
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 10000,
        },
      );
    });
  };

  const showConfirmation = () => {
    Alert.alert('Are you at the location?', '', [
      {
        text: 'No',
        onPress: () => {},
      },
      {
        text: 'Yes',
        onPress: () => {
          navigation.navigate('ClientDetailsScreen');
        },
        style: 'cancel',
      },
    ]);
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
          provider="google"
          showsUserLocation={true}
          style={styles.map}>
          {coordinates && (
            <>
              <Marker
                key={clientData?._id}
                coordinate={{
                  latitude: coordinates[0],
                  longitude: coordinates[1],
                }}
                title={clientData?.first_name + ' ' + clientData?.last_name}
                description={clientData?.location}
              />
              <MapViewDirections
                origin={location}
                destination={{
                  latitude: coordinates[0],
                  longitude: coordinates[1],
                }}
                apikey={GOOGLE_MAPS_APIKEY}
                strokeWidth={3}
                strokeColor="blue"
                mode="DRIVING" // or "BICYCLING" for bike routes
                onReady={result => {
                  console.log(`Distance: ${result.distance} km`);
                  console.log(`Duration: ${result.duration} min.`);
                }}
                onError={errorMessage => {
                  console.log('GOT AN ERROR', errorMessage);
                }}
              />
            </>
          )}
        </MapView>
      )}
      <View style={{marginTop: 20}} />
      <NavigationHeader
        Title={clientData?.first_name + ' ' + clientData?.last_name}
        ProfilePic={{uri: clientData?.profile_picture}}
        midImg={require('../../../assets/supportIcon.png')}
        midImgPress={() => handleCallSupport()}
        lastImg={require('../../../assets/chatIcon.png')}
        lastImgPress={() => navigation.navigate('ChatScreen')}
      />
      {user !== 'client' && (
        <View style={styles.button}>
          <GradientButton
            Title="Arrived"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            loading={loading}
            onPress={() => showConfirmation()}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.PinkBackground,
    flex: 1,
  },
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  button: {
    justifyContent: 'flex-end',
    flex: 1,
    marginBottom: 20,
  },
});
