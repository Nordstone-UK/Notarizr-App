import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import AgentReviewCard from '../../components/AgentReviewCard/AgentReviewCard';
import Geolocation from '@react-native-community/geolocation';

export default function MapScreen({route, navigation}) {
  const [location, setLocation] = useState(null);

  const handleGetLocation = async () => {
    try {
      const coordinates = await getLocation();
      console.log('location', coordinates);
      setLocation(coordinates);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetLocation();
    console.log('location', location);
  }, []);
  // const {documents} = route.params;
  // console.log('client location', agents.current_location);
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
  const renderItem = ({item}) => {
    return (
      <AgentReviewCard
        image={item?.image}
        source={{uri: item?.profile_picture}}
        agentName={item?.first_name + ' ' + item?.last_name}
        agentAddress={item?.location}
        onPress={() =>
          navigation.navigate('AgentReviewScreen', {
            description: item,
            // documentType: documents,
          })
        }
      />
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      {location && (
        <>
          <MapView
            zoomEnabled={true}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
            provider={PROVIDER_GOOGLE}
            style={styles.map}>
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

      <NavigationHeader Title="Nearby" />

      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
        }}>
        <View style={{flexDirection: 'row'}}>
          {/* <FlatList
            horizontal
            data={agents}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item._id}
          /> */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,

    flex: 1,
  },
  contentContainerStyle: {
    flexDirection: 'row',
  },
  cardContainer: {
    // marginHorizontal: 10,
  },
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
});
