import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function BookingFlowHeader({onBack, serviceName, step}) {
  const progress = Math.min(step / 3, 1) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}>
          <Feather name="arrow-left" size={21} color="#171D29" />
        </TouchableOpacity>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.title}>
            {serviceName}
          </Text>
          <Text style={styles.stepText}>Step {step} of 3</Text>
        </View>
        <View style={styles.secureBadge}>
          <Feather name="shield" size={13} color="#168A52" />
          <Text style={styles.secureText}>Secure</Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${progress}%`}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#E9EBEE',
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  title: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  stepText: {
    marginTop: 1,
    color: '#8A919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: '#EAF7EF',
  },
  secureText: {
    marginLeft: 5,
    color: '#168A52',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#EEF0F2',
  },
  progressFill: {
    height: 3,
    backgroundColor: '#FD6D1F',
  },
});
