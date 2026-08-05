import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function ProfilePreferenceCompletion({navigation}) {
  const finish = () =>
    navigation.navigate('HomeScreen', {screen: 'AllBookingScreen'});

  useEffect(() => {
    const timer = setTimeout(finish, 2500);
    return () => clearTimeout(timer);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Feather name="check" size={34} color="#168A52" />
        </View>
        <Text style={styles.title}>Preferences updated</Text>
        <Text style={styles.subtitle}>
          Your service availability and coverage are ready. Clients can now
          match with your updated profile.
        </Text>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Feather name="calendar" size={16} color="#D65322" />
            <Text style={styles.summaryText}>Availability saved</Text>
          </View>
          <View style={styles.summaryRow}>
            <Feather name="map-pin" size={16} color="#2878A9" />
            <Text style={styles.summaryText}>Service areas saved</Text>
          </View>
        </View>
      </View>
      <View style={styles.actionBar}>
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={finish}
          style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>View bookings</Text>
          <Feather name="arrow-right" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#F7F8FA',
  },
  successIcon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E8F6EE',
  },
  title: {
    marginTop: 22,
    color: '#1D2430',
    fontFamily: 'Manrope-Bold',
    fontSize: 23,
  },
  subtitle: {
    marginTop: 8,
    color: '#7D8490',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  summary: {
    alignSelf: 'stretch',
    marginTop: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E5E9',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  summaryRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 6},
  summaryText: {
    marginLeft: 10,
    color: '#4E5662',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  actionBar: {
    minHeight: 76,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FD6D1F',
  },
  primaryButtonText: {
    marginRight: 8,
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
});
