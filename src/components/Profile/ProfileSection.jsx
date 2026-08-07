import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AppColors from '../../themes/AppColors';

export default function ProfileSection({title, children}) {
  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.line} />
      </View>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginTop: 22, paddingHorizontal: 16},
  heading: {alignItems: 'center', flexDirection: 'row', marginBottom: 10},
  line: {backgroundColor: AppColors.border, flex: 1, height: 1, marginLeft: 10},
  title: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
