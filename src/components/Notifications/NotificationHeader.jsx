import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function NotificationHeader({
  navigation,
  onMarkAllRead,
  unreadCount,
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel="Go back"
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Feather name="arrow-left" size={22} color="#202632" />
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          {unreadCount > 0
            ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
            : 'You are all caught up'}
        </Text>
      </View>
      <TouchableOpacity
        accessibilityLabel="Mark all notifications as read"
        activeOpacity={0.7}
        disabled={unreadCount === 0}
        onPress={onMarkAllRead}
        style={styles.readButton}>
        <Feather
          name="check-circle"
          size={20}
          color={unreadCount > 0 ? '#FD6D1F' : '#C7CBD2'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderColor: '#E3E6EA',
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E8EAEE',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  readButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  subtitle: {
    color: '#8B919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  title: {
    color: '#151A28',
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
  },
  titleWrap: {
    flex: 1,
    marginLeft: 14,
  },
});
