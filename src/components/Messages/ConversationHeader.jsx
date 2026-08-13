import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import UserAvatar from '../UserAvatar/UserAvatar';

export default function ConversationHeader({conversation, navigation, onCall}) {
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
        <UserAvatar
          name={conversation.name}
          online={conversation.online}
          size={42}
          source={conversation.avatar}
        />
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
