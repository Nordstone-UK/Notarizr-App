import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

export default function SignUpScreen() {
  return (
    <View style={styles.container}>
      <CompanyHeader />
      <BottomSheetStyle></BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#FFF2DC',
  },
});
