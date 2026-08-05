import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function MessagesEmptyState({
  searching,
  unreadOnly,
  audience = 'notaries',
}) {
  const title = searching
    ? 'No conversations found'
    : unreadOnly
    ? 'You are all caught up'
    : 'No messages yet';
  const message = searching
    ? 'Try another name or keyword.'
    : unreadOnly
    ? 'New messages will appear here.'
    : `Your ${audience} conversations will appear here.`;

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Feather name="message-circle" size={28} color="#FD6D1F" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 72,
  },
  iconBox: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  title: {
    marginTop: 16,
    color: '#171C26',
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
  },
  message: {
    marginTop: 5,
    color: '#858B96',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
});
