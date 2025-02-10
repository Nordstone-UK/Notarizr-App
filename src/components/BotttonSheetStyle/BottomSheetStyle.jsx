import {StyleSheet, Text, View} from 'react-native';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import React from 'react';

export default function BottomSheetStyle({children, minHeight}) {
  return (
    <View
      style={[
        styles.bottonSheet,
        {
          minHeight: minHeight ? heightToDp(minHeight) : heightToDp(135),
        },
      ]}>
      <View style={styles.bottonSheetBar} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bottonSheet: {
    flex: 1,
    marginTop: widthToDp(2),
    paddingBottom: widthToDp(4),
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
    // marginBottom:heightToDp(20),
  },
});
