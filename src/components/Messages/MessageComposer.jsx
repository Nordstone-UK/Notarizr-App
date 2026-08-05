import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function MessageComposer({
  onAttach,
  onSend,
  value,
  onChangeText,
  sending = false,
}) {
  const canSend = value.trim().length > 0 && !sending;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel="Attach document"
        activeOpacity={0.7}
        onPress={onAttach}
        style={styles.attachButton}>
        <Feather name="paperclip" size={20} color="#747C88" />
      </TouchableOpacity>
      <TextInput
        multiline
        onChangeText={onChangeText}
        placeholder="Write a message"
        placeholderTextColor="#A6ABB4"
        style={styles.input}
        value={value}
      />
      <TouchableOpacity
        accessibilityLabel="Send message"
        activeOpacity={0.75}
        disabled={!canSend}
        onPress={onSend}
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}>
        {sending ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Feather name="send" size={18} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  attachButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 38,
  },
  container: {
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    backgroundColor: '#F5F6F8',
    borderColor: '#E4E7EB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#202632',
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    marginHorizontal: 8,
    maxHeight: 94,
    minHeight: 42,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#FD6D1F',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  sendButtonDisabled: {
    backgroundColor: '#C9CDD3',
  },
});
