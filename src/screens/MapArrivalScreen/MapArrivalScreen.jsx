import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  View,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {useSelector} from 'react-redux';
import useBookingStatus from '../../hooks/useBookingStatus';
import useCustomerSuport from '../../hooks/useCustomerSupport';

export default function MapArrivalScreen({navigation}, props) {
  const [location, setLocation] = useState();
  const [loading, setLoading] = useState(false);
  const clientData = useSelector(state => state.booking.user);
  const coordinates = useSelector(state => state.booking.coordinates);
  console.log('coordinates', coordinates);
  const user = useSelector(state => state.user.user.account_type);
  const {handleCallSupport} = useCustomerSuport();
  const handleGetLocation = async () => {
    try {
      const coordinates = await getLocation();
      console.log('currentLocation', coordinates);
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
          provider={PROVIDER_GOOGLE}
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
              <Polyline
                coordinates={[
                  {
                    latitude: location.latitude,
                    longitude: location.longitude,
                  },
                  {
                    latitude: coordinates[0],
                    longitude: coordinates[1],
                  },
                ]}
                strokeWidth={3}
                strokeColor="blue"
              />
            </>
          )}
        </MapView>
      )}
      <View style={{marginTop: widthToDp(2)}} />
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
