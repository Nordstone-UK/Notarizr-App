import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function PayoutSummary({amount, count}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Feather name="trending-up" size={20} color="#168A52" />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>Total processed</Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
      <View style={styles.countBlock}>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.countLabel}>
          {count === 1 ? 'payment' : 'payments'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDE9E2',
    borderRadius: 8,
    backgroundColor: '#F3FAF6',
  },
  iconBox: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#DFF3E7',
  },
  copy: {flex: 1, minWidth: 0, marginLeft: 12},
  label: {color: '#708078', fontFamily: 'Manrope-Regular', fontSize: 10},
  amount: {
    marginTop: 2,
    color: '#17221C',
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
  },
  countBlock: {alignItems: 'flex-end', marginLeft: 10},
  count: {color: '#168A52', fontFamily: 'Manrope-Bold', fontSize: 16},
  countLabel: {
    marginTop: 1,
    color: '#859089',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
});
