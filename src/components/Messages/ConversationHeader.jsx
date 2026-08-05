import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function ConversationHeader({conversation, navigation, onCall}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
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
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel="Go back"
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
        style={styles.iconButton}>
        <Feather name="arrow-left" size={22} color="#202632" />
      </TouchableOpacity>
      <View style={styles.person}>
        <View>
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
        <View style={styles.nameWrap}>
          <Text numberOfLines={1} style={styles.name}>
            {conversation.name}
          </Text>
          <Text numberOfLines={1} style={styles.service}>
            {conversation.online ? 'Online' : conversation.service}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        accessibilityLabel="Call notary"
        activeOpacity={0.7}
        onPress={onCall}
        style={styles.iconButton}>
        <Feather name="phone" size={20} color="#FD6D1F" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 21,
    height: 42,
    width: 42,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF0F3',
  },
  avatarText: {color: '#D65322', fontFamily: 'Manrope-Bold', fontSize: 12},
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E8EAEE',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  iconButton: {
    alignItems: 'center',
    borderColor: '#E3E6EA',
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  name: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  nameWrap: {
    flex: 1,
    marginLeft: 11,
  },
  onlineDot: {
    backgroundColor: '#19A565',
    borderColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 2,
    bottom: 0,
    height: 10,
    position: 'absolute',
    right: 0,
    width: 10,
  },
  person: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 12,
  },
  service: {
    color: '#8B919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 2,
  },
});
