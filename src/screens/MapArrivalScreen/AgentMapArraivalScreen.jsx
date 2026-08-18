import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {throttle} from 'lodash';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import BookingColors from '../../themes/BookingColors';
import BookingActionButton from '../../components/Bookings/BookingActionButton';
import MapViewDirections from 'react-native-maps-directions';
import useAgentService from '../../hooks/useAgentService';
import useBookingStatus from '../../hooks/useBookingStatus';
import {setNavigationStatus} from '../../features/booking/bookingSlice';
import useCustomerSuport from '../../hooks/useCustomerSupport';
import Feather from 'react-native-vector-icons/Feather';
const GOOGLE_MAPS_APIKEY = 'AIzaSyBsbK6vyTfQd9fuLJkU9a_t5TEEm2QsNpA';
const DEFAULT_COORDINATES = {latitude: 36.778259, longitude: -119.417931};

export default function AgentMapArrivalScreen({navigation}) {
  const dispatch = useDispatch();
  const {handleCallSupport} = useCustomerSuport();
  const {agentLocationUpdate, getCurrentLocation} = useAgentService();
  const {handleVerifyArrivalOtp} = useBookingStatus();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [enteringOtp, setEnteringOtp] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const clientData = useSelector(state => state.booking);
  const coordinates = useSelector(state => state.booking?.coordinates);
  const user = useSelector(state => state.user.user?.account_type);
  const arrivalOtp = useSelector(state => state.booking?.booking?.arrival_otp);
  console.log('distanceee', distance);
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
        setLocation(currentLocation);
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
        } else {
          setLocation(DEFAULT_COORDINATES);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    // Service helpers are recreated by the legacy hook; the booking/user values
    // are the stable inputs that should restart live tracking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientData, user]);
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
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 10000,
        },
      );
    });
  };

  const updateAgentLocation = async currentLocation => {
    try {
      const latString = '' + currentLocation?.latitude;
      const lngString = '' + currentLocation?.longitude;
      const params = {
        lat: latString,
        lng: lngString,
      };

      await agentLocationUpdate(params);
    } catch (error) {
      console.log('Error updating location:', error);
    }
  };
  const showConfirmation = useCallback(() => {
    setOtpError('');
    setOtpValue('');
    setEnteringOtp(true);
  }, []);

  const handleConfirmArrival = useCallback(async () => {
    const bookingId = clientData?.booking?._id;
    if (!bookingId) {
      setOtpError('Booking details are missing. Go back and try again.');
      return;
    }
    if (otpValue.trim().length < 4) {
      setOtpError('Ask the client for their 4-digit arrival code.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');
    try {
      const result = await handleVerifyArrivalOtp(bookingId, otpValue.trim());
      if (result?.status !== '200') {
        setOtpError(result?.message || 'That code doesn’t match. Try again.');
        return;
      }
      Toast.show({type: 'success', text1: 'Arrival confirmed'});
      dispatch(setNavigationStatus('completed'));
      setEnteringOtp(false);
      navigation.navigate('ClientDetailsScreen');
    } catch (error) {
      setOtpError('Could not verify that code. Check your connection.');
    } finally {
      setVerifyingOtp(false);
    }
  }, [clientData?.booking?._id, dispatch, handleVerifyArrivalOtp, navigation, otpValue]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      {loading ? (
        <ActivityIndicator
          size="large"
          color={BookingColors.primary}
          style={styles.loader}
        />
      ) : (
        location && (
          <>
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
                    strokeColor={BookingColors.info}
                    mode="DRIVING"
                    onReady={result => {
                      if (
                        result.distance !== distance ||
                        result.duration !== duration
                      ) {
                        console.log('reisputdistance', result);
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
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <Feather
            name="arrow-left"
            size={20}
            color={BookingColors.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerEyebrow}>LIVE ROUTE</Text>
          <Text numberOfLines={1} style={styles.headerTitle}>
            {[clientData?.user?.first_name, clientData?.user?.last_name]
              .filter(Boolean)
              .join(' ') || 'Client appointment'}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCallSupport}
          style={styles.headerButton}>
          <Feather
            name="help-circle"
            size={20}
            color={BookingColors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('ChatScreen', {
              sender:
                clientData?.booking?.booked_by || clientData.booking?.client,
              receiver: clientData?.booking?.agent,
              chat: clientData?.booking?._id,
              channel: clientData?.booking?.agora_channel_name,
              voiceToken: clientData?.booking?.agora_channel_token,
            })
          }
          style={[styles.headerButton, styles.chatButton]}>
          <Feather
            name="message-circle"
            size={19}
            color={BookingColors.primary}
          />
        </TouchableOpacity>
      </View>
      {user !== 'client' && (
        <View style={styles.tripPanel}>
          <View style={styles.tripHandle} />
          <View style={styles.tripSummary}>
            <View style={styles.routeIcon}>
              <Feather
                name="navigation"
                size={20}
                color={BookingColors.primary}
              />
            </View>
            <View style={styles.tripCopy}>
              <Text style={styles.tripTitle}>On the way</Text>
              <Text style={styles.tripText}>
                {distance && duration
                  ? `${distance.toFixed(1)} km • ${duration.toFixed(0)} min`
                  : 'Calculating live route…'}
              </Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          {enteringOtp ? (
            <View style={styles.otpEntry}>
              <Text style={styles.otpEntryLabel}>
                Ask the client for their arrival code
              </Text>
              <TextInput
                autoFocus
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={value => {
                  setOtpValue(value.replace(/[^0-9]/g, ''));
                  setOtpError('');
                }}
                placeholder="0000"
                placeholderTextColor={BookingColors.textMuted}
                style={styles.otpInput}
                value={otpValue}
              />
              {!!otpError && <Text style={styles.otpErrorText}>{otpError}</Text>}
              <View style={styles.otpActionRow}>
                <TouchableOpacity
                  disabled={verifyingOtp}
                  onPress={() => setEnteringOtp(false)}
                  style={styles.otpCancelButton}>
                  <Text style={styles.otpCancelText}>Cancel</Text>
                </TouchableOpacity>
                <BookingActionButton
                  disabled={verifyingOtp || otpValue.length < 4}
                  icon="check-circle"
                  label="Confirm arrival"
                  loading={verifyingOtp}
                  onPress={handleConfirmArrival}
                  style={styles.otpConfirmButton}
                />
              </View>
            </View>
          ) : (
            <BookingActionButton
              disabled={loading}
              icon="check-circle"
              label="I’ve arrived"
              onPress={showConfirmation}
              style={styles.arrivedButton}
            />
          )}
        </View>
      )}

      {user === 'client' && (
        <View style={styles.tripPanel}>
          <View style={styles.tripHandle} />
          <View style={styles.tripSummary}>
            <View style={styles.routeIcon}>
              <Feather
                name="navigation"
                size={20}
                color={BookingColors.primary}
              />
            </View>
            <View style={styles.tripCopy}>
              <Text style={styles.tripTitle}>Your notary is on the way</Text>
              <Text style={styles.tripText}>
                {distance && duration
                  ? `${distance.toFixed(1)} km away • ~${duration.toFixed(
                      0,
                    )} min`
                  : 'Locating your notary…'}
              </Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          {arrivalOtp ? (
            <View style={styles.otpShareCard}>
              <Text style={styles.otpShareLabel}>
                Share this code on arrival
              </Text>
              <View style={styles.otpDigitsRow}>
                {arrivalOtp.split('').map((digit, index) => (
                  <View key={`${digit}-${index}`} style={styles.otpDigitBox}>
                    <Text style={styles.otpDigitText}>{digit}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.otpShareHint}>
                Your notary enters this to confirm they’re at the right
                location.
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BookingColors.surface,
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  chatButton: {
    marginLeft: 8,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.primarySoft,
  },
  headerCopy: {
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
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
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
  tripSummary: {flexDirection: 'row', alignItems: 'center'},
  routeIcon: {
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
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: BookingColors.successSoft,
  },
  liveDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor: BookingColors.success,
  },
  liveText: {
    color: BookingColors.success,
    fontFamily: 'Manrope-Bold',
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
  otpEntry: {marginTop: 16},
  otpEntryLabel: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    marginBottom: 8,
  },
  otpInput: {
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BookingColors.borderStrong,
    backgroundColor: BookingColors.surface,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
    letterSpacing: 10,
    textAlign: 'center',
  },
  otpErrorText: {
    marginTop: 8,
    color: BookingColors.error,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  otpActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  otpCancelButton: {
    height: 50,
    paddingHorizontal: 18,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BookingColors.textSecondary,
  },
  otpCancelText: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  otpConfirmButton: {flex: 1, borderRadius: 8},
  otpShareCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  otpShareLabel: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  otpDigitsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  otpDigitBox: {
    width: 44,
    height: 52,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  otpDigitText: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
  },
  otpShareHint: {
    marginTop: 10,
    maxWidth: 260,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
  },
});
