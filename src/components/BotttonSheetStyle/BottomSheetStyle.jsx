import {StyleSheet, Text, View} from 'react-native';
import {widthToDp} from '../../utils/Responsive';
import React from 'react';
import {child} from 'react-native-extended-stylesheet';

export default function BottomSheetStyle({children}) {
  return (
    <View style={styles.bottonSheet}>
      <View style={styles.bottonSheetBar} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#FFF2DC',
  },
  imagestyles: {
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: '15%',
    marginBottom: '10%',
  },
  textHeading: {
    color: '#000',
    marginHorizontal: 15,
    fontSize: 27,
    fontStyle: 'normal',
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
  bottonSheet: {
    flex: 1,
    marginTop: widthToDp(10),
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  bottonSheetBar: {
    borderRadius: 20,
    marginTop: widthToDp(3),
    width: widthToDp(15),
    borderTopWidth: 5,
    borderColor: '#E5E6EB',
    alignSelf: 'center',
  },
});
