import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useQuery} from '@apollo/client';
import {useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import PayoutSummary from '../../components/Payouts/PayoutSummary';
import TransactionRow from '../../components/Payouts/TransactionRow';
import ProfileScreenHeader from '../../components/Profile/ProfileScreenHeader';
import {GET_PAYMENT_INTENTS} from '../../../request/queries/getTranscation.query';

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: String(currency || 'USD').toUpperCase(),
  }).format(Number(amount || 0) / 100);

const normalizeTransaction = transaction => ({
  ...transaction,
  dateKey: moment(transaction.createdAt).format('YYYY-MM-DD'),
  displayAmount: formatAmount(transaction.amount, transaction.currency),
  reference: transaction.transaction_id
    ? `#${transaction.transaction_id.slice(-8).toUpperCase()}`
    : 'Payment reference pending',
  serviceLabel:
    transaction.service_type === 'mobile_notary'
      ? 'Mobile notary'
      : 'Remote online notary',
  statusLabel: String(transaction.status || 'processing').replaceAll('_', ' '),
});

const SectionGap = () => <View style={styles.sectionGap} />;

export default function TransactionScreen({navigation}) {
  const accountType = useSelector(state => state.user.user.account_type);
  const {data, error, loading, refetch} = useQuery(GET_PAYMENT_INTENTS, {
    fetchPolicy: 'network-only',
  });
  const isAgent = accountType !== 'client';
  const transactions = useMemo(
    () =>
      (data?.getPaymentIntents?.transactions || []).map(normalizeTransaction),
    [data?.getPaymentIntents?.transactions],
  );
  const sections = useMemo(() => {
    const grouped = transactions.reduce((result, transaction) => {
      result[transaction.dateKey] = [
        ...(result[transaction.dateKey] || []),
        transaction,
      ];
      return result;
    }, {});
    return Object.entries(grouped)
      .sort(([first], [second]) => second.localeCompare(first))
      .map(([date, rows]) => ({
        title: moment(date).format('MMMM D, YYYY'),
        data: rows,
      }));
  }, [transactions]);
  const totalAmount = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0,
  );
  const displayTotal = formatAmount(
    totalAmount,
    transactions[0]?.currency || 'USD',
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title={isAgent ? 'Earnings' : 'Payments'}
      />
      <SectionList
        contentContainerStyle={[
          styles.content,
          !loading && sections.length === 0 && styles.emptyContent,
        ]}
        sections={sections}
        keyExtractor={item => item._id}
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#168A52" />
              <Text style={styles.stateText}>Loading transactions...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerState}>
              <View style={styles.errorIcon}>
                <Feather name="alert-circle" size={22} color="#C44242" />
              </View>
              <Text style={styles.stateTitle}>Transactions unavailable</Text>
              <Text style={styles.stateText}>Pull down to try again.</Text>
            </View>
          ) : (
            <View style={styles.centerState}>
              <View style={styles.emptyIcon}>
                <Feather name="credit-card" size={22} color="#168A52" />
              </View>
              <Text style={styles.stateTitle}>No transactions yet</Text>
              <Text style={styles.stateText}>
                Completed payments will appear here.
              </Text>
            </View>
          )
        }
        ListHeaderComponent={
          <>
            <View style={styles.intro}>
              <Text style={styles.title}>Payment activity</Text>
              <Text style={styles.subtitle}>
                Review processed payments and payout history.
              </Text>
            </View>
            <PayoutSummary amount={displayTotal} count={transactions.length} />
          </>
        }
        onRefresh={refetch}
        refreshing={loading}
        renderItem={({item}) => <TransactionRow transaction={item} />}
        renderSectionHeader={({section}) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        SectionSeparatorComponent={SectionGap}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  content: {paddingBottom: 28, backgroundColor: '#F7F8FA'},
  emptyContent: {flexGrow: 1},
  intro: {paddingHorizontal: 20, paddingTop: 20},
  title: {color: '#171D29', fontFamily: 'Manrope-Bold', fontSize: 20},
  subtitle: {
    marginTop: 4,
    color: '#7D8591',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 4,
    color: '#7F8792',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  sectionGap: {height: 14},
  centerState: {alignItems: 'center', paddingHorizontal: 28, paddingTop: 70},
  stateTitle: {
    marginTop: 14,
    color: '#242B36',
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  stateText: {
    marginTop: 6,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    textAlign: 'center',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E8F6EE',
  },
  errorIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FCEEEE',
  },
});
