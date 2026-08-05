import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function BookingFlowSection({children, subtitle, title}) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 12,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8EAED',
    backgroundColor: '#FFFFFF',
  },
  heading: {
    paddingHorizontal: 20,
  },
  title: {
    color: '#1A202D',
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  subtitle: {
    marginTop: 3,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  content: {
    marginTop: 14,
  },
});
