import {StyleSheet, Text, View} from 'react-native';
import {widthToDp} from '../../utils/Responsive';
import React from 'react';

export default function BottomSheetStyle({children}) {
  return (
    <View style={styles.bottonSheet}>
      <View style={styles.bottonSheetBar} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bottonSheet: {
    flex: 1,
    marginTop: widthToDp(2),
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottonSheetBar: {
    borderRadius: 25,
    marginTop: widthToDp(3),
    width: widthToDp(15),
    borderTopWidth: 5,
    borderColor: '#E5E6EB',
    alignSelf: 'center',
  },
});
