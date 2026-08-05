import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export default function ConversationRow({conversation, onPress, last}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const hasUnread = conversation.unreadCount > 0;
  const avatarIdentity =
    typeof conversation.avatar === 'object' && conversation.avatar !== null
      ? conversation.avatar.uri
      : conversation.avatar;
  const initials = conversation.name
    .split(' ')
    .filter(Boolean)
    .map(value => value[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarIdentity]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.68}
      onPress={onPress}
      style={[styles.container, !last && styles.divider]}>
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarText}>{initials || 'C'}</Text>
          {conversation.avatar && !avatarFailed ? (
            <Image
              onError={() => setAvatarFailed(true)}
              source={conversation.avatar}
              style={styles.avatarImage}
            />
          ) : null}
        </View>
        {conversation.online && <View style={styles.onlineDot} />}
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
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EEF0F3',
  },
  avatarFallback: {alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: '#D65322', fontFamily: 'Manrope-Bold', fontSize: 14},
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 13,
    height: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 7,
    backgroundColor: '#23A566',
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
