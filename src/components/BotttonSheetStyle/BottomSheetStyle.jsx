import React from 'react';
import {StyleSheet, View} from 'react-native';

export default function BottomSheetStyle({children, minHeight}) {
  return (
    <View style={[styles.container, minHeight ? {minHeight} : null]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 16,
    backgroundColor: '#F7F8FA',
  },
});
