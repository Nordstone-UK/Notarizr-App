import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function SavedAddressRow({address, onDelete, onEdit, last}) {
  return (
    <View style={[styles.container, last && styles.last]}>
      <View style={styles.iconWrap}>
        <Feather
          name={address.label === 'Work' ? 'briefcase' : 'map-pin'}
          size={20}
          color="#FD6D1F"
        />
      </View>
      <View style={styles.content}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{address.label || 'Saved address'}</Text>
          {address.primary && <Text style={styles.primary}>Primary</Text>}
        </View>
        <Text numberOfLines={2} style={styles.location}>
          {address.location}
        </Text>
      </View>
      <TouchableOpacity
        accessibilityLabel="Edit address"
        activeOpacity={0.7}
        onPress={onEdit}
        style={styles.action}>
        <Feather name="edit-2" size={17} color="#68717F" />
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityLabel="Delete address"
        activeOpacity={0.7}
        onPress={onDelete}
        style={styles.action}>
        <Feather name="trash-2" size={17} color="#C84949" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 36,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#ECEEF1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    minHeight: 100,
    paddingVertical: 15,
  },
  content: {
    flex: 1,
    marginLeft: 13,
    marginRight: 4,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  label: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  last: {
    borderBottomWidth: 0,
  },
  location: {
    color: '#7D8490',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  primary: {
    backgroundColor: '#EBF7F0',
    borderRadius: 5,
    color: '#188A56',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
    marginLeft: 8,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
});
