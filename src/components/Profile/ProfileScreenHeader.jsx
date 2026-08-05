import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function ProfileScreenHeader({
  title,
  actionLabel,
  onBack,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel="Go back"
        activeOpacity={0.7}
        onPress={onBack}
        style={styles.iconButton}>
        <Feather name="arrow-left" size={21} color="#121826" />
      </TouchableOpacity>
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      {actionLabel ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onAction}
          style={styles.actionButton}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    marginHorizontal: 8,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
    textAlign: 'center',
  },
  actionButton: {
    minWidth: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
});
