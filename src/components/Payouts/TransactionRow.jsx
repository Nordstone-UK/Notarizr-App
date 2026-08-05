import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const SUCCESS = new Set(['succeeded', 'paid', 'completed']);

export default function TransactionRow({transaction}) {
  const successful = SUCCESS.has(String(transaction.status).toLowerCase());
  const clientName = [
    transaction.client?.first_name,
    transaction.client?.last_name,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, !successful && styles.pendingIcon]}>
        <Feather
          name={successful ? 'arrow-down-left' : 'clock'}
          size={17}
          color={successful ? '#168A52' : '#A86900'}
        />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {clientName || 'Notarizr payment'}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {transaction.serviceLabel} - {transaction.reference}
        </Text>
      </View>
      <View style={styles.amountBlock}>
        <Text style={styles.amount}>{transaction.displayAmount}</Text>
        <Text style={[styles.status, !successful && styles.pendingStatus]}>
          {transaction.statusLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  iconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E8F6EE',
  },
  pendingIcon: {backgroundColor: '#FFF5DC'},
  copy: {flex: 1, minWidth: 0, marginLeft: 11},
  title: {color: '#242B36', fontFamily: 'Manrope-Bold', fontSize: 12},
  meta: {
    marginTop: 3,
    color: '#8A909A',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  amountBlock: {alignItems: 'flex-end', marginLeft: 10},
  amount: {color: '#202632', fontFamily: 'Manrope-Bold', fontSize: 12},
  status: {
    marginTop: 3,
    color: '#168A52',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 8,
    textTransform: 'capitalize',
  },
  pendingStatus: {color: '#A86900'},
});
