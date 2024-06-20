import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useQuery} from '@apollo/client';
import {useSelector} from 'react-redux';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {GET_PAYMENT_INTENTS} from '../../../request/queries/getTranscation.query'; // Adjust the path as per your project structure

export default function TransactionScreen({navigation}) {
  const userAccountType = useSelector(state => state.user.user.account_type);
  const {loading, error, data} = useQuery(GET_PAYMENT_INTENTS);
  const [transactions, setTransactions] = useState([]);
  const [dateSections, setDateSections] = useState([]);

  useEffect(() => {
    if (data) {
      // Assuming data.getPaymentIntents.transactions is an array of transactions
      const formattedTransactions = data.getPaymentIntents.transactions.map(
        transaction => ({
          ...transaction,
          formattedAmount: formatAmount(
            transaction.amount,
            transaction.currency,
          ),
        }),
      );
      setTransactions(formattedTransactions);
      groupTransactionsByDate(formattedTransactions);
    }
  }, [data]);

  const formatAmount = (amount, currency) => {
    // Assuming amount is in cents, convert to dollars with cents
    const dollars = amount / 100;
    return `${dollars.toFixed(2)} ${currency}`;
  };

  const groupTransactionsByDate = transactions => {
    const grouped = transactions.reduce((acc, transaction) => {
      const date = transaction.createdAt.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(transaction);
      return acc;
    }, {});

    const sections = Object.keys(grouped).map(date => ({
      date,
      data: grouped[date],
    }));

    setDateSections(sections);
  };
  // const groupTransactionsByDate = transactions => {
  //   return transactions.reduce((groups, transaction) => {
  //     const date = transaction.date;
  //     if (!groups[date]) {
  //       groups[date] = [];
  //     }
  //     groups[date].push(transaction);
  //     return groups;
  //   }, {});
  // };

  const renderItem = ({item}) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionText}>
        Client Name: {item.client?.first_name} {item.client?.last_name}
      </Text>
      <Text style={styles.transactionText}>
        Service: {item.service_type || 'N/A'}
      </Text>
      <Text style={styles.transactionText}>
        Transaction ID: {item.transaction_id}
      </Text>
      <Text style={styles.transactionText}>Status: {item.status}</Text>
      <Text style={styles.transactionText}>Amount: {item.formattedAmount}</Text>
      <Text style={styles.transactionText}>Currency: {item.currency}</Text>
    </View>
  );

  const renderDateSection = ({item}) => (
    <View style={styles.dateSection}>
      <Text style={styles.dateText}>{item.date}</Text>
      <FlatList
        data={item.data}
        renderItem={renderItem}
        keyExtractor={transaction => transaction._id}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Payment Method" />
      <Text style={styles.textheading}>
        Here are your latest transactions with us
      </Text>

      <BottomSheetStyle>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.PrimaryColor} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>Error: {error.message}</Text>
        ) : (
          <FlatList
            data={dateSections}
            renderItem={renderDateSection}
            keyExtractor={item => item.date}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        )}
        {/* <GradientButton
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          title="Print Invoice"
        /> */}
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
    justifyContent: 'center',
    // alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  textheading: {
    fontSize: widthToDp(5.5),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    width: widthToDp(90),
    marginBottom: heightToDp(3),
  },
  flatListContent: {
    paddingHorizontal: widthToDp(5),
  },
  transactionItem: {
    backgroundColor: '#FFF',
    padding: heightToDp(2),
    marginVertical: heightToDp(1),
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  transactionText: {
    fontSize: widthToDp(4),
    color: Colors.TextColor,
  },
  dateSection: {
    marginBottom: heightToDp(3),
  },
  dateText: {
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    color: Colors.Orange,
    marginVertical: heightToDp(1),
  },
});
