import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function AuthPrimaryButton({
  title,
  loading,
  icon,
  onPress,
  style,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={loading}
      onPress={onPress}
      style={[styles.button, loading && styles.disabledButton, style]}>
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Text style={[styles.title, icon && styles.titleWithIcon]}>
            {title}
          </Text>
          {icon && <Feather name={icon} size={20} color="#FFFFFF" />}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    borderRadius: 14,
    backgroundColor: '#FD6D1F',
  },
  disabledButton: {
    opacity: 0.7,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  titleWithIcon: {
    marginRight: 10,
  },
});
