import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function MessageBubble({message}) {
  return (
    <View style={[styles.row, message.outgoing && styles.outgoingRow]}>
      <View
        style={[
          styles.bubble,
          message.outgoing ? styles.outgoingBubble : styles.incomingBubble,
        ]}>
        <Text
          style={[
            styles.message,
            message.outgoing ? styles.outgoingText : styles.incomingText,
          ]}>
          {message.text}
        </Text>
        <View style={styles.meta}>
          <Text
            style={[
              styles.time,
              message.outgoing ? styles.outgoingTime : styles.incomingTime,
            ]}>
            {message.time}
          </Text>
          {message.outgoing && (
            <Feather name="check" size={12} color="#FFFFFF" />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 8,
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  incomingBubble: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  incomingText: {
    color: '#303642',
  },
  incomingTime: {
    color: '#989EA8',
  },
  message: {
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    marginTop: 5,
  },
  outgoingBubble: {
    backgroundColor: '#FD6D1F',
  },
  outgoingRow: {
    justifyContent: 'flex-end',
  },
  outgoingText: {
    color: '#FFFFFF',
  },
  outgoingTime: {
    color: '#FFE0D1',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  time: {
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
});
