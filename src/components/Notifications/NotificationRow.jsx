import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const TONES = {
  booking: {background: '#FFF0E8', color: '#FD6D1F', icon: 'calendar'},
  document: {background: '#EDF4FC', color: '#2879B8', icon: 'file-text'},
  message: {background: '#EEF8F2', color: '#15925A', icon: 'message-circle'},
  observer: {background: '#EEF8F2', color: '#15925A', icon: 'users'},
  session: {background: '#FFF0E8', color: '#FD6D1F', icon: 'video'},
  payment: {background: '#FFF7E6', color: '#C48012', icon: 'credit-card'},
  system: {background: '#F1F2F5', color: '#68717F', icon: 'shield'},
};

export default function NotificationRow({item, last, onPress}) {
  const tone = TONES[item.type] || TONES.system;

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={[styles.container, last && styles.last]}>
      <View style={[styles.iconWrap, {backgroundColor: tone.background}]}>
        <Feather name={tone.icon} size={20} color={tone.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>
        <Text style={styles.time}>{item.displayTime}</Text>
      </View>
      <Feather name="chevron-right" size={19} color="#B1B6BF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#ECEEF1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    minHeight: 108,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    marginHorizontal: 14,
  },
  description: {
    color: '#69717E',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  last: {
    borderBottomWidth: 0,
  },
  time: {
    color: '#9CA2AC',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 7,
  },
  title: {
    color: '#202632',
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 15,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  unreadDot: {
    backgroundColor: '#FD6D1F',
    borderRadius: 4,
    height: 8,
    marginLeft: 8,
    width: 8,
  },
});
