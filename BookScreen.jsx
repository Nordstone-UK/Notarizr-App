import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Colors from './src/themes/Colors';

export default function BookScreen() {
  return (
    <View style={styles.contianer}>
      <Text>BookScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contianer: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
});
