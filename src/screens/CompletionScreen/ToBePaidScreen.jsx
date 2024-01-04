import {StyleSheet, Text, View, Image, SafeAreaView, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import {useDispatch, useSelector} from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../features/booking/bookingSlice';
import LottieView from 'lottie-react-native';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import useStripeApi from '../../hooks/useStripeApi';
import {useStripe} from '@stripe/stripe-react-native';
import useBookingStatus from '../../hooks/useBookingStatus';
import useChatService from '../../hooks/useChatService';

export default function ToBePaidScreen({route, navigation}) {
  const {bookingData} = route.params;
  const {handleUpdateBookingStatus} = useBookingStatus();
  const {createChatWithUser} = useChatService();
  const numberOfDocs = useSelector(state => state.booking.numberOfDocs);
  const dispatch = useDispatch();
  const init = async () => {
    await handleUpdateBookingStatus('pending', bookingData._id);
    dispatch(setBookingInfoState(bookingData));
    dispatch(setCoordinates(bookingData?.agent?.current_location?.coordinates));
    dispatch(setUser(bookingData?.agent));
  };
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const {fetchPaymentSheetParams} = useStripeApi();
  const [loading, setLoading] = useState(false);
  const DocumentPrice = bookingData?.document_type?.price;
  const TotalPayment = DocumentPrice + numberOfDocs * 10;
  function calculateTotalPrice(documentObjects) {
    return documentObjects.reduce(
      (total, document) => total + document.price,
      0,
    );
  }
  const initializePaymentSheet = async () => {
    setLoading(true);
    var TotalPayment = await calculateTotalPrice(bookingData?.document_type);
    TotalPayment = TotalPayment + numberOfDocs * 10;
    const response = await fetchPaymentSheetParams(
      TotalPayment * 100,
      bookingData._id,
    );
    console.log('payment', response);
    const {customer_id, ephemeralKey, paymentIntent} =
      response?.data?.createPaymentIntentR;

    const {error} = await initPaymentSheet({
      merchantDisplayName: 'The Opal Group',
      customerId: customer_id,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      defaultBillingDetails: {
        name:
          bookingData?.booked_by?.first_name +
          ' ' +
          bookingData?.booked_by?.last_name,
      },
    });
    if (!error) {
      setLoading(true);
    }
    setLoading(false);
  };
  const openPaymentSheet = async () => {
    setLoading(true);
    const {error} = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
      console.log('error.message', error.message);
      navigation.navigate('HomeScreen');
    } else {
      await init();
      navigation.navigate('AgentBookCompletion');
    }
    setLoading(false);
  };
  useEffect(() => {
    initializePaymentSheet();
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
        }}>
        <LottieView
          source={require('../../../assets/confetti.json')}
          autoPlay
          loop
          style={{
            height: '100%',
            width: '100%',
          }}
          resizeMode="cover"
        />
      </View>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <View style={styles.completeIcon}>
          <Image
            source={require('../../../assets/completedIcon.png')}
            style={styles.icon}
          />

          <Text style={styles.text}>
            You have been matched with an Agent. Please pay to proceed with your
            booking!
          </Text>
        </View>
        <View style={{marginTop: widthToDp(15), marginBottom: widthToDp(5)}}>
          <Text style={[styles.text, {fontSize: widthToDp(5)}]}>
            Please be assured that if the service is canceled or not completed
            for any reason, your payment will be promptly refunded!
          </Text>
        </View>
        <View style={{marginVertical: widthToDp(5)}}>
          <GradientButton
            Title="Proceed to Pay"
            loading={loading}
            onPress={() => openPaymentSheet()}
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: Colors.PinkBackground,
  },
  completeIcon: {
    marginTop: heightToDp(5),
  },
  groupimage: {
    flex: 1,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
    width: widthToDp(50),
    height: widthToDp(50),
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginHorizontal: widthToDp(5),
  },

  complete: {
    alignSelf: 'flex-end',
    width: widthToDp(75),
    height: widthToDp(75),
    resizeMode: 'contain',
    marginVertical: widthToDp(5),
  },
});
