import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {goBackOrNavigate} from '../../utils/navigationHelpers';

export default function ScreenHeader({
  navigation,
  title,
  subtitle,
  fallback = 'HomeScreen',
  fallbackParams,
  rightIcon,
  onRightPress,
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel="Go back"
        activeOpacity={0.7}
        onPress={() => goBackOrNavigate(navigation, fallback, fallbackParams)}
        style={styles.iconButton}>
        <Feather name="arrow-left" size={22} color="#202632" />
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightIcon ? (
        <TouchableOpacity
          accessibilityLabel={rightIcon}
          activeOpacity={0.7}
          onPress={onRightPress}
          style={styles.iconButton}>
          <Feather name={rightIcon} size={20} color="#FD6D1F" />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderColor: '#E3E6EA',
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  spacer: {
    height: 44,
    width: 44,
  },
  subtitle: {
    color: '#8B919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  title: {
    color: '#151A28',
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
  },
  titleWrap: {
    flex: 1,
    marginHorizontal: 14,
  },
});
