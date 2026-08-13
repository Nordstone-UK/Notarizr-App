import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import UserAvatar from '../UserAvatar/UserAvatar';

export default function ConversationRow({conversation, onPress, last}) {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.68}
      onPress={onPress}
      style={[styles.container, !last && styles.divider]}>
      <View style={styles.avatarWrap}>
        <UserAvatar
          name={conversation.name}
          online={conversation.online}
          size={54}
          source={conversation.avatar}
        />
      </View>

      <View style={styles.copy}>
        <View style={styles.topRow}>
          <Text
            numberOfLines={1}
            style={[styles.name, hasUnread && styles.unreadName]}>
            {conversation.name}
          </Text>
          <Text style={[styles.time, hasUnread && styles.unreadTime]}>
            {conversation.time}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.service}>
          {conversation.service}
        </Text>
        <View style={styles.messageRow}>
          <Text
            numberOfLines={1}
            style={[styles.message, hasUnread && styles.unreadMessage]}>
            {conversation.message}
          </Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    paddingVertical: 12,
    paddingRight: 20,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },
  avatarWrap: {
    width: 54,
    height: 54,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    minWidth: 0,
    color: '#2A303B',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
  },
  unreadName: {
    color: '#121826',
    fontFamily: 'Manrope-Bold',
  },
  time: {
    marginLeft: 10,
    color: '#9AA0AA',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  unreadTime: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
  },
  service: {
    marginTop: 1,
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  message: {
    flex: 1,
    minWidth: 0,
    color: '#858B96',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  unreadMessage: {
    color: '#4B5260',
    fontFamily: 'Manrope-SemiBold',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#FD6D1F',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
});
