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
import React, {useState, useEffect} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useSelector} from 'react-redux';
import {useStripe} from '@stripe/stripe-react-native';
import useStripeApi from '../../hooks/useStripeApi';
export default function PaymentScreen({navigation}) {
  const bookingDetail = useSelector(state => state.booking.booking);
  // console.log('bookingDetail payment', bookingDetail?.documentType?.price);
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const {fetchPaymentSheetParams} = useStripeApi();
  const [loading, setLoading] = useState(false);
  const DocumentPrice = bookingDetail?.documentType?.price;

  const initializePaymentSheet = async () => {
    setLoading(true);
    const response = await fetchPaymentSheetParams(
      DocumentPrice * 100,
      bookingDetail._id,
    );
    const {customer_id, ephemeralKey, paymentIntent} =
      response?.data?.createPaymentIntentR;
    console.log(
      'Payment Intent response',
      customer_id,
      ephemeralKey,
      paymentIntent,
    );
    const {error} = await initPaymentSheet({
      merchantDisplayName: 'The Opal Group',
      customerId: customer_id,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      defaultBillingDetails: {
        name:
          bookingDetail?.booked_by?.first_name +
          ' ' +
          bookingDetail?.booked_by?.last_name,
      },
    });
    if (!error) {
      setLoading(true);
      // console.log('error', error);
    }
    setLoading(false);
  };
  const openPaymentSheet = async () => {
    setLoading(true);
    const {error} = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
      console.log('error.message', error.message);
    } else {
      // Alert.alert('Payment Completed!');
      navigation.navigate('CompletePayment');
    }
    setLoading(false);
  };

  useEffect(() => {
    initializePaymentSheet();
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
              <Text style={styles.textPay}>
                {bookingDetail?.documentType?.name}
              </Text>
              <Text style={styles.textPay}>${DocumentPrice}</Text>
            </View>
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
            <Text style={styles.textPay}>${DocumentPrice}</Text>
          </View>
          <View
            style={{
              marginVertical: heightToDp(10),
            }}>
            <GradientButton
              Title="Complete Payment"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => openPaymentSheet()}
              loading={loading}
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
