import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import {useDispatch} from 'react-redux';
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

export default function ToBePaidScreen({route, navigation}) {
  const {bookingData} = route.params;
  const {handleUpdateBookingStatus} = useBookingStatus();
  const dispatch = useDispatch();
  const init = async () => {
    await handleUpdateBookingStatus('pending', bookingData._id);
    dispatch(setBookingInfoState(bookingData));
    dispatch(
      setCoordinates(bookingData?.booked_by?.current_location?.coordinates),
    );
    dispatch(setUser(bookingData?.agent));
    navigation.navigate('MedicalBookingScreen');
  };

  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const {fetchPaymentSheetParams} = useStripeApi();
  const [loading, setLoading] = useState(false);
  const DocumentPrice = bookingData?.document_type?.price;

  const initializePaymentSheet = async () => {
    setLoading(true);
    const response = await fetchPaymentSheetParams(
      DocumentPrice * 100,
      bookingData._id,
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
          bookingData?.booked_by?.first_name +
          ' ' +
          bookingData?.booked_by?.last_name,
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
      navigation.navigate('HomeScreen');
    } else {
      init();
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
      <Image
        source={require('../../../assets/complete.png')}
        style={styles.complete}
      />
      <View style={{marginVertical: widthToDp(5)}}>
        <GradientButton
          Title="Proceed to Pay"
          loading={loading}
          onPress={() => openPaymentSheet()}
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        />
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