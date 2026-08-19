import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';

const GOOGLE_MAPS_KEY = 'AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA';

// A plain, read-only pin drop for "where is this appointment" — no directions,
// no live tracking, just the address geocoded and centred on a map. Used
// wherever a booking's address used to open the device's external Maps app.
export default function BookingLocationPreviewScreen({navigation, route}) {
  const address = route.params?.address || '';
  const [coordinate, setCoordinate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const geocode = async () => {
      if (!address.trim()) {
        setError(true);
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          'https://maps.googleapis.com/maps/api/geocode/json',
          {
            params: {address, key: GOOGLE_MAPS_KEY},
            timeout: 8000,
          },
        );
        const location = response.data?.results?.[0]?.geometry?.location;
        if (!active) {
          return;
        }
        if (location) {
          setCoordinate({latitude: location.lat, longitude: location.lng});
        } else {
          setError(true);
        }
      } catch (geocodeError) {
        console.warn('Booking location geocoding failed:', geocodeError);
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    geocode();
    return () => {
      active = false;
    };
  }, [address]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <View style={styles.mapShell}>
        {coordinate ? (
          <MapView
            initialRegion={{
              ...coordinate,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            provider={PROVIDER_GOOGLE}
            style={styles.map}>
            <Marker coordinate={coordinate} pinColor={BookingColors.primary} />
          </MapView>
        ) : (
          <View style={styles.mapState}>
            {loading ? (
              <ActivityIndicator color={BookingColors.primary} />
            ) : (
              <Feather name="map-pin" size={28} color={BookingColors.primary} />
            )}
            <Text style={styles.mapStateTitle}>
              {loading ? 'Finding location…' : 'Location unavailable'}
            </Text>
            {error && !loading ? (
              <Text style={styles.mapStateText}>
                Couldn’t find this address on the map.
              </Text>
            ) : null}
          </View>
        )}

        <View style={styles.floatingHeader}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.roundButton}>
            <Feather
              name="arrow-left"
              size={20}
              color={BookingColors.textPrimary}
            />
          </TouchableOpacity>
          <View style={styles.headerTitleCard}>
            <Text style={styles.headerEyebrow}>APPOINTMENT LOCATION</Text>
            <Text numberOfLines={1} style={styles.headerTitle}>
              {address || 'Address unavailable'}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  mapShell: {flex: 1, backgroundColor: BookingColors.background},
  map: {...StyleSheet.absoluteFillObject},
  mapState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  mapStateTitle: {
    marginTop: 12,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    textAlign: 'center',
  },
  mapStateText: {
    marginTop: 4,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    textAlign: 'center',
  },
  floatingHeader: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  headerTitleCard: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  headerEyebrow: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Bold',
    fontSize: 8,
  },
  headerTitle: {
    marginTop: 1,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
});
