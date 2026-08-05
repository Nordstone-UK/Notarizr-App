import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function HomeSectionHeader({
  actionLabel,
  onAction,
  subtitle,
  title,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onAction}
          style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Feather name="chevron-right" size={15} color="#FD6D1F" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  subtitle: {
    marginTop: 2,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  action: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionText: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
});
