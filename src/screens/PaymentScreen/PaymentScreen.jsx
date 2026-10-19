import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useSelector} from 'react-redux';
import {useStripe} from '@stripe/stripe-react-native';
import useStripeApi from '../../hooks/useStripeApi';

const formatMoney = value => `$${Number(value || 0).toFixed(2)}`;

export default function PaymentScreen({navigation}) {
  const bookingDetail = useSelector(state => state.booking.booking);
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const {fetchPaymentSheetParams} = useStripeApi();
  const [loading, setLoading] = useState(false);
  const [paymentSheetReady, setPaymentSheetReady] = useState(false);
  const [paymentSetupError, setPaymentSetupError] = useState(false);
  const paymentInProgress = useRef(false);
  const breakdown = bookingDetail?.price_breakdown;
  const documentItems = Array.isArray(bookingDetail?.document_type)
    ? bookingDetail.document_type
    : Array.isArray(bookingDetail?.documentType)
    ? bookingDetail.documentType
    : bookingDetail?.documentType
    ? [bookingDetail.documentType]
    : [];
  const fallbackDocumentTotal = documentItems.reduce(
    (sum, item) => sum + Number(item?.price || 0),
    0,
  );
  const totalAmount = Number(
    bookingDetail?.totalPrice ??
      breakdown?.customerTotal ??
      bookingDetail?.price ??
      fallbackDocumentTotal,
  );
  const lineItems = breakdown?.lineItems?.length
    ? breakdown.lineItems
    : documentItems.map(item => ({
        key: item?.name,
        label: item?.name || 'Notary document',
        amount: Number(item?.price || 0),
      }));
  const isSessionPayment = bookingDetail?.__typename === 'Session';

  const initializePaymentSheet = async () => {
    setLoading(true);
    setPaymentSheetReady(false);
    setPaymentSetupError(false);
    try {
      if (!bookingDetail?._id) {
        throw new Error(
          'The booking details are missing. Please reopen the booking.',
        );
      }
      const response = await fetchPaymentSheetParams(
        Math.round(totalAmount * 100),
        bookingDetail._id,
        isSessionPayment,
      );
      const payload = response?.data?.createPaymentIntentR;
      if (
        payload?.status !== '201' ||
        !payload?.customer_id ||
        !payload?.ephemeralKey ||
        !payload?.paymentIntent ||
        String(payload.paymentIntent).startsWith('local_payment_intent_')
      ) {
        throw new Error(
          payload?.message ||
            'Secure payment could not be initialized. Please try again.',
        );
      }
      const {error} = await initPaymentSheet({
        merchantDisplayName: 'The Opal Group',
        customerId: payload.customer_id,
        customerEphemeralKeySecret: payload.ephemeralKey,
        paymentIntentClientSecret: payload.paymentIntent,
        defaultBillingDetails: {
          name: [
            bookingDetail?.booked_by?.first_name,
            bookingDetail?.booked_by?.last_name,
          ]
            .filter(Boolean)
            .join(' '),
        },
      });
      if (error) {
        throw new Error(error.message);
      }
      setPaymentSheetReady(true);
    } catch (error) {
      setPaymentSetupError(true);
      Alert.alert(
        'Payment unavailable',
        error?.message ||
          'Secure payment could not be initialized. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };
  const openPaymentSheet = async () => {
    if (!paymentSheetReady || paymentInProgress.current) {
      return;
    }
    paymentInProgress.current = true;
    setLoading(true);
    try {
      const {error} = await presentPaymentSheet();
      if (error) {
        if (error.code !== 'Canceled') {
          Alert.alert('Payment failed', error.message);
        }
        return;
      }
      navigation.navigate('CompletePayment');
    } catch (error) {
      Alert.alert(
        'Payment failed',
        error?.message ||
          'The payment sheet could not be opened. Please try again.',
      );
    } finally {
      paymentInProgress.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    initializePaymentSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Payment Method" />
      <BottomSheetStyle>
        <ScrollView scrollEnabled={true}>
          <Text style={styles.paymentOptions}>Payment options</Text>
          <TouchableOpacity style={styles.PaymentContainer}>
            <View style={styles.PaymentContainer}>
              <Image
                source={require('../../../assets/creditCard.png')}
                style={styles.applePay}
              />
              <Text style={styles.textPay}>Card</Text>
            </View>
            <Image
              source={require('../../../assets/greenIcon.png')}
              style={styles.greenIcon}
            />
          </TouchableOpacity>

          <View style={{marginVertical: heightToDp(2)}}>
            <View style={styles.docsContainer}>
              <Text style={styles.textPay}>Pricing summary</Text>
            </View>
            {lineItems.map((item, index) => (
              <View
                key={`${item.key || item.label || 'item'}-${index}`}
                style={styles.docsContainer}>
                <Text style={styles.textPay}>{item.label}</Text>
                <Text style={styles.textPay}>{formatMoney(item.amount)}</Text>
              </View>
            ))}
          </View>
          <View
            style={{
              borderWidth: 1,
              borderBottomColor: Colors.LineColor,
              marginVertical: heightToDp(1.5),
              width: widthToDp(90),
              alignSelf: 'center',
            }}
          />
          <View style={styles.docsContainer}>
            <Text style={styles.textPay}>Total Amount</Text>
            <Text style={styles.textPay}>{formatMoney(totalAmount)}</Text>
          </View>
          <View
            style={{
              marginVertical: heightToDp(10),
            }}>
            <GradientButton
              Title={
                paymentSetupError ? 'Retry payment setup' : 'Complete Payment'
              }
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() =>
                paymentSheetReady
                  ? openPaymentSheet()
                  : initializePaymentSheet()
              }
              loading={loading}
              isDisabled={loading}
            />
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  textPay: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    marginHorizontal: widthToDp(5),
    fontFamily: 'Manrope-Regular',
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(5),
    width: widthToDp(60),
    fontFamily: 'Manrope-Bold',
  },
  paymentOptions: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(5),
    fontFamily: 'Manrope-Bold',
  },
  cardContainer: {
    flexDirection: 'row',
    columnGap: widthToDp(5),
    paddingHorizontal: widthToDp(3),
    marginVertical: widthToDp(2),
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    marginVertical: widthToDp(2),
  },
  addMore: {
    fontSize: widthToDp(4),
    marginHorizontal: widthToDp(4),
    color: Colors.DullTextColor,
    fontFamily: 'Manrope-Regular',
  },
  addIcon: {
    width: widthToDp(4.5),
    height: heightToDp(4.5),
    marginTop: heightToDp(1),
  },
  PaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: widthToDp(1.5),
  },
  applePay: {
    marginHorizontal: widthToDp(5),
    width: widthToDp(9),
    height: heightToDp(9),
  },
  greenIcon: {
    marginHorizontal: widthToDp(8),
    width: widthToDp(5),
    height: heightToDp(5),
  },
  docsContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: widthToDp(80),
    justifyContent: 'space-between',
  },
});
{
  /* <View style={styles.docsContainer}>
              <Text style={styles.textPay}>Tax 10%</Text>
              <Text style={styles.textPay}>${Fee}</Text>
            </View>
            <View style={styles.docsContainer}>
              <Text style={styles.textPay}>Fees</Text>
              <Text style={styles.textPay}>$2</Text>
            </View> */
}
{
  /* <TouchableOpacity style={styles.PaymentContainer}>
            <View style={styles.PaymentContainer}>
              <Image
                source={require('../../../assets/googlePay.png')}
                style={styles.applePay}
              />
              <Text style={styles.textPay}>Google pay</Text>
            </View>
            <Image
              source={require('../../../assets/unSelected.png')}
              style={styles.greenIcon}
            />
          </TouchableOpacity> */
}
{
  /* <View style={styles.insideContainer}>
            <Text style={styles.insideHeading}>
              Please find all your added cards here
            </Text>
            <ScrollView
              contentContainerStyle={styles.cardContainer}
              showsHorizontalScrollIndicator={false}
              horizontal={true}>
              <Image source={require('../../../assets/Card.png')} />
              <Image source={require('../../../assets/Card.png')} />
            </ScrollView>
          </View> */
}
{
  /* <TouchableOpacity style={styles.addContainer}>
            <Text style={styles.addMore}>Add more</Text>
            <Image
              source={require('../../../assets/addIcon.png')}
              style={styles.addIcon}
            />
          </TouchableOpacity> */
}
