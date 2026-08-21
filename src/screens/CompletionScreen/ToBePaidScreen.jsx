import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
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
import {useSession} from '../../hooks/useSession';
import Toast from 'react-native-toast-message';
import {hasSavedTestCard} from '../../utils/TestPayments';

export default function ToBePaidScreen({route, navigation}) {
  const {bookingData, autoPay = false} = route.params;
  const {handleUpdateBookingStatus} = useBookingStatus();
  const {updateSession} = useSession();
  const numberOfDocs = useSelector(state => state.booking.numberOfDocs);
  const dispatch = useDispatch();
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const {fetchPaymentSheetParams} = useStripeApi();
  const [loading, setLoading] = useState(false);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const autoPaymentStarted = useRef(false);
  const DocumentPrice = bookingData?.document_type?.price;

  const init = async () => {
    console.log('iniiiiiiii');
    try {
      let confirmedBooking = bookingData;
      if (bookingData?.__typename === 'Session') {
        await updateSession('paid', bookingData._id);
      } else {
        const updatedBooking = await handleUpdateBookingStatus(
          'accepted',
          bookingData._id,
          {navigate: false, throwOnError: true},
        );
        confirmedBooking = updatedBooking || bookingData;
      }

      // Add a small delay to ensure state updates are complete
      await new Promise(resolve => setTimeout(resolve, 500));

      navigation.replace('AgentBookCompletion', {
        bookingData: {...confirmedBooking, status: 'accepted'},
        paymentSuccessful: true,
      });
    } catch (error) {
      console.error('Error in init:', error);
      Alert.alert(
        'Error',
        'There was a problem processing your payment. Please try again.',
      );
    }
  };

  function calculateTotalPrice(documentObjects) {
    return documentObjects.reduce(
      (total, document) => total + document.price,
      0,
    );
  }

  const initializePaymentSheet = async () => {
    setLoading(true);
    let TotalPayment;
    if (bookingData?.__typename === 'Booking') {
      TotalPayment = bookingData.totalPrice;
    } else if (bookingData?.__typename === 'Session') {
      TotalPayment = bookingData.price;
    }
    const response = await fetchPaymentSheetParams(
      TotalPayment * 100,
      bookingData._id,
      bookingData.__typename === 'Session' ? true : false,
    );
    console.log('bookingrocvdfddf,', response);
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

    console.log('error', error);
    if (!error) {
      setLoading(true);
    }
    setLoading(false);
  };
  const openPaymentSheet = async () => {
    setLoading(true);
    try {
      if (await hasSavedTestCard()) {
        await init();
        Toast.show({
          type: 'success',
          text1: 'Test payment approved',
          text2: 'Visa ending in 4242 was used. No real charge was made.',
        });
        return;
      }

      const {error} = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
        console.log('error.message', error.message);
      } else {
        await init();
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Error',
        'There was a problem processing your payment. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    hasSavedTestCard().then(isTestCard => {
      if (isTestCard) {
        setIsDataInitialized(true);
        if (autoPay && !autoPaymentStarted.current) {
          autoPaymentStarted.current = true;
          openPaymentSheet();
        }
        return;
      }
      initializePaymentSheet().then(() => {
        setIsDataInitialized(true);
      });
    });
    // Payment initialization is intentionally tied to the active booking screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPay, navigation]);

  if (autoPay) {
    return (
      <SafeAreaView style={styles.processingContainer}>
        <ActivityIndicator color={Colors.Orange} size="large" />
        <Text style={styles.processingTitle}>Confirming payment</Text>
        <Text style={styles.processingText}>
          Please wait while we confirm your booking.
        </Text>
      </SafeAreaView>
    );
  }

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
            loading={false}
            isDisabled={false}
            onPress={() => openPaymentSheet()}
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: widthToDp(8),
    backgroundColor: '#FFFFFF',
  },
  processingTitle: {
    marginTop: heightToDp(2.5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    fontSize: widthToDp(6),
  },
  processingText: {
    marginTop: heightToDp(1),
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: widthToDp(3.7),
    textAlign: 'center',
  },
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
