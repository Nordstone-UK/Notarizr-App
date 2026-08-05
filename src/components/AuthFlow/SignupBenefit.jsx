import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function SignupBenefit({icon, title, description}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Feather name={icon} size={20} color="#FD6D1F" />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    borderRadius: 14,
    backgroundColor: '#FFF4EC',
  },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  copy: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  description: {
    marginTop: 3,
    color: '#6C727F',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
});
