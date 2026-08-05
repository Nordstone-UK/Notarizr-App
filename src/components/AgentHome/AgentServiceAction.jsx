import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const TONES = {
  mobile: {
    background: '#FFF4EE',
    iconBackground: '#FFE5D7',
    foreground: '#D65322',
  },
  remote: {
    background: '#EDF6FB',
    iconBackground: '#DDEFF8',
    foreground: '#2878A9',
  },
};

export default function AgentServiceAction({
  description,
  icon,
  loading,
  onPress,
  title,
  tone = 'mobile',
}) {
  const colors = TONES[tone] || TONES.mobile;
  return (
    <TouchableOpacity
      activeOpacity={0.74}
      disabled={loading}
      onPress={onPress}
      style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.iconBox, {backgroundColor: colors.iconBackground}]}>
        <Feather name={icon} size={19} color={colors.foreground} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {description}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.foreground} size="small" />
      ) : (
        <Feather name="arrow-up-right" size={18} color={colors.foreground} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
  },
  iconBox: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  copy: {flex: 1, minWidth: 0, marginHorizontal: 12},
  title: {color: '#1B2130', fontFamily: 'Manrope-Bold', fontSize: 13},
  description: {
    marginTop: 3,
    color: '#737B87',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
});
