import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function ProfileSection({title, children}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },
  title: {
    marginBottom: 7,
    paddingHorizontal: 20,
    color: '#858B96',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  content: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
});
