import React, {useState, useEffect, useCallback} from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import {throttle} from 'lodash';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {useDispatch, useSelector} from 'react-redux';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import Colors from '../../themes/Colors';
import MapViewDirections from 'react-native-maps-directions';
import useAgentService from '../../hooks/useAgentService';
import {GET_AGENT_LIVE_LOCATION} from '../../../request/queries/getAgentLiveLocation.query';
import {useQuery} from '@apollo/client';
import {setNavigationStatus} from '../../features/booking/bookingSlice';
import useCustomerSuport from '../../hooks/useCustomerSupport';
import {Button} from 'react-native';
const GOOGLE_MAPS_APIKEY = 'AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA';

export default function AgentMapArrivalScreen({navigation}) {
  const dispatch = useDispatch();
  const {handleCallSupport} = useCustomerSuport();
  const {agentLocationUpdate, getCurrentLocation} = useAgentService();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(false);

  const clientData = useSelector(state => state.booking);
  const coordinates = useSelector(state => state.booking?.coordinates);
  console.log('cooofnalf', coordinates);
  const user = useSelector(state => state.user.user?.account_type);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     handleGetLocation();
  //   }, 9000);

  //   return () => clearInterval(intervalId);
  // }, []);

  const handleGetLocation = useCallback(async () => {
    try {
      setLoading(true);
      if (user === 'individual-agent') {
        const currentLocation = await getLocation();
        console.log('currentlocadfddfd', currentLocation);
        setLocation(currentLocation);
        updateDirections(currentLocation);
        await updateAgentLocation(currentLocation);
      } else {
        // refetch();
        const userId = clientData?.booking?.agent?._id;
        const params = {
          userId,
        };
        const agentLocation = await getCurrentLocation(params);
        if (agentLocation) {
          const agentCoordinates = {
            latitude: agentLocation?.coordinates[1],
            longitude: agentLocation?.coordinates[0],
          };
          setLocation(agentCoordinates);
          updateDirections(agentCoordinates);
        } else {
          setLocation(DEFAULT_COORDINATES);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [clientData, user, updateAgentLocation, updateDirections, getLocation]);
  const handleGetLocationThrottled = throttle(handleGetLocation, 10000);

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleGetLocationThrottled();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [handleGetLocationThrottled]);
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
          enableHighAccuracy: highAccuracy,
          timeout: 20000,
          maximumAge: 10000,
        },
      );
    });
  };

  const updateDirections = currentLocation => {
    setDistance(null);
    setDuration(null);
    if (coordinates) {
      const origin = {
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
      };
      const destination = {
        latitude: coordinates[0],
        longitude: coordinates[1],
      };
      const directionsService = new MapViewDirections({
        origin,
        destination,
        apikey: GOOGLE_MAPS_APIKEY,
        mode: 'DRIVING',
        onReady: result => {
          setDistance(result.distance);
          setDuration(result.duration);
          checkHighValues(result.distance, result.duration);
        },
        onError: errorMessage => {
          console.log('GOT AN ERROR', errorMessage);
        },
      });
    }
  };

  const checkHighValues = (distance, duration) => {
    if (distance > 50 || duration > 60) {
      setShowInfo(true);
    } else {
      setShowInfo(true);
    }
  };
  const updateAgentLocation = async currentLocation => {
    try {
      const latString = '' + currentLocation?.latitude;
      const lngString = '' + currentLocation?.longitude;
      const params = {
        lat: latString,
        lng: lngString,
      };

      const response = await agentLocationUpdate(params);
    } catch (error) {
      console.log('Error updating location:', error);
    }
  };
  const showConfirmation = useCallback(() => {
    Alert.alert('Are you at the location?', '', [
      {
        text: 'No',
        onPress: () => {},
      },
      {
        text: 'Yes',
        onPress: () => {
          dispatch(setNavigationStatus('completed'));
          navigation.navigate('ClientDetailsScreen');
        },
        style: 'cancel',
      },
    ]);
  }, [dispatch, navigation]);
  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.OrangeGradientStart}
          style={styles.loader}
        />
      ) : (
        location && (
          <>
            <View style={styles.infoContainer}>
              {showInfo && distance && duration && (
                <Text
                  style={[
                    styles.infoText,
                    (distance > 50 || duration > 60) && styles.highValues,
                  ]}>
                  Distance: {distance.toFixed(2)} km, Duration:{' '}
                  {duration.toFixed(2)} min
                </Text>
              )}
            </View>

            <MapView
              zoomEnabled={true}
              initialRegion={{
                latitude: location?.latitude,
                longitude: location?.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              provider="google"
              showsUserLocation={true}
              style={styles.map}>
              {coordinates && (
                <>
                  <Marker
                    key={clientData?.user?._id}
                    coordinate={{
                      latitude: coordinates[0],
                      longitude: coordinates[1],
                    }}
                    title={
                      clientData?.user?.first_name +
                      ' ' +
                      clientData?.user?.last_name
                    }
                    description={clientData?.user?.location}
                  />

                  <MapViewDirections
                    origin={location}
                    destination={{
                      latitude: coordinates[0],
                      longitude: coordinates[1],
                    }}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={3}
                    strokeColor="#4285F4"
                    mode="DRIVING"
                    onReady={result => {
                      if (
                        result.distance !== distance ||
                        result.duration !== duration
                      ) {
                        setDistance(result.distance);
                        setDuration(result.duration);
                      }
                    }}
                    onError={errorMessage => {
                      console.log('GOT AN ERROR', errorMessage);
                    }}
                  />
                  <Marker
                    coordinate={{
                      latitude: location?.latitude,
                      longitude: location?.longitude,
                    }}
                    title="Your Location"
                    pinColor="green"
                  />
                </>
              )}
            </MapView>
          </>
        )
      )}
      <View style={{marginTop: 20}} />
      <NavigationHeader
        // Title={clientData.user?.first_name + ' ' + clientData.user?.last_name}
        ProfilePic={{uri: clientData?.user?.profile_picture}}
        midImg={require('../../../assets/supportIcon.png')}
        midImgPress={() => handleCallSupport()}
        lastImg={require('../../../assets/chatIcon.png')}
        lastImgPress={() =>
          navigation.navigate('ChatScreen', {
            sender:
              clientData?.booking?.booked_by || clientData.booking?.client,
            receiver: clientData?.booking?.agent,
            chat: clientData?.booking?._id,
            channel: clientData?.booking?.agora_channel_name,
            voiceToken: clientData?.booking?.agora_channel_token,
          })
        }
      />
      {user !== 'client' && (
        <>
          {/* <View style={{backgroundColor: 'red'}}>
            <Text>hsllfldfldl</Text>
          </View> */}
          <View style={styles.button}>
            <GradientButton
              Title="Arrived"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              loading={loading}
              onPress={() => showConfirmation()}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.PinkBackground,
    flex: 1,
  },
  infoContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.OrangeGradientEnd,
  },
  highValues: {
    color: 'red',
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
