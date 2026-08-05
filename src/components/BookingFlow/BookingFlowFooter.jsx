import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function BookingFlowFooter({disabled, label, loading, onPress}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.76}
        disabled={disabled || loading}
        onPress={onPress}
        style={[styles.button, (disabled || loading) && styles.disabledButton]}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Text style={styles.label}>{label}</Text>
            <Feather name="arrow-right" size={17} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E5E9',
    backgroundColor: '#FFFFFF',
  },
  button: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FD6D1F',
  },
  disabledButton: {
    backgroundColor: '#C9CDD3',
  },
  label: {
    marginRight: 8,
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
});
