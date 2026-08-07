import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import useCustomerSuport from '../../hooks/useCustomerSupport';
import BookingActionButton from '../../components/Bookings/BookingActionButton';
import BookingColors from '../../themes/BookingColors';

export default function MapArrivalScreen({navigation}) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const clientData = useSelector(state => state.booking.user);
  const coordinates = useSelector(state => state.booking.coordinates);
  const accountType = useSelector(state => state.user.user?.account_type);
  const {handleCallSupport} = useCustomerSuport();
  const clientName = [clientData?.first_name, clientData?.last_name]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      () => setLoading(false),
      Platform.OS === 'android'
        ? {}
        : {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000},
    );
  }, []);

  const confirmArrival = () => {
    Alert.alert(
      'Confirm arrival',
      'Only confirm once you are at the client’s appointment location.',
      [
        {text: 'Not yet', style: 'cancel'},
        {
          text: 'I have arrived',
          onPress: () => navigation.navigate('ClientDetailsScreen'),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <View style={styles.mapShell}>
        {location ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation
            style={styles.map}>
            {coordinates?.length >= 2 && (
              <>
                <Marker
                  coordinate={{
                    latitude: coordinates[0],
                    longitude: coordinates[1],
                  }}
                  description={clientData?.location}
                  title={clientName || 'Client location'}
                />
                <Polyline
                  coordinates={[
                    location,
                    {latitude: coordinates[0], longitude: coordinates[1]},
                  ]}
                  strokeColor={BookingColors.info}
                  strokeWidth={4}
                />
              </>
            )}
          </MapView>
        ) : (
          <View style={styles.mapState}>
            {loading ? (
              <ActivityIndicator color={BookingColors.primary} />
            ) : (
              <Feather name="map-pin" size={28} color={BookingColors.primary} />
            )}
            <Text style={styles.mapStateTitle}>
              {loading ? 'Finding your location' : 'Location unavailable'}
            </Text>
            <Text style={styles.mapStateText}>
              {loading
                ? 'Preparing directions to the appointment.'
                : 'Enable location access to view live directions.'}
            </Text>
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
            <Text style={styles.headerEyebrow}>EN ROUTE TO</Text>
            <Text numberOfLines={1} style={styles.headerTitle}>
              {clientName || 'Client appointment'}
            </Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Contact support"
            activeOpacity={0.7}
            onPress={handleCallSupport}
            style={styles.roundButton}>
            <Feather
              name="help-circle"
              size={20}
              color={BookingColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tripPanel}>
        <View style={styles.tripHandle} />
        <View style={styles.tripHeadingRow}>
          <View style={styles.tripIcon}>
            <Feather
              name="navigation"
              size={20}
              color={BookingColors.primary}
            />
          </View>
          <View style={styles.tripCopy}>
            <Text style={styles.tripTitle}>Appointment navigation</Text>
            <Text style={styles.tripText}>
              Follow the route and confirm when you reach the client.
            </Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Message client"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChatScreen')}
            style={styles.messageButton}>
            <Feather
              name="message-circle"
              size={19}
              color={BookingColors.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.safetyNotice}>
          <Feather name="shield" size={14} color={BookingColors.success} />
          <Text style={styles.safetyText}>
            Your live location is shared securely during travel.
          </Text>
        </View>
        {accountType !== 'client' && (
          <BookingActionButton
            disabled={loading}
            icon="check-circle"
            label="I’ve arrived"
            onPress={confirmArrival}
            style={styles.arrivedButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  mapShell: {flex: 1, backgroundColor: BookingColors.background},
  map: {...StyleSheet.absoluteFillObject},
  mapState: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  mapStateTitle: {
    marginTop: 12,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  mapStateText: {
    marginTop: 4,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
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
    marginHorizontal: 8,
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
  tripPanel: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: BookingColors.textPrimary,
    backgroundColor: BookingColors.textPrimary,
  },
  tripHandle: {
    width: 38,
    height: 4,
    alignSelf: 'center',
    marginBottom: 14,
    borderRadius: 2,
    backgroundColor: BookingColors.textSecondary,
  },
  tripHeadingRow: {flexDirection: 'row', alignItems: 'center'},
  tripIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  tripCopy: {flex: 1, minWidth: 0, marginLeft: 11},
  tripTitle: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  tripText: {
    marginTop: 3,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  messageButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  safetyNotice: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 11,
    borderRadius: 8,
    backgroundColor: BookingColors.successSoft,
  },
  safetyText: {
    flex: 1,
    marginLeft: 8,
    color: BookingColors.success,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  arrivedButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    borderRadius: 8,
  },
});
