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
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {paymentCheck} from '../../features/review/reviewSlice';

export default function CompletePayment({navigation}) {
  const dispatch = useDispatch();
  useEffect(() => {
    const delay = 3000;
    const timer = setTimeout(() => {
      dispatch(paymentCheck(true));

      navigation.navigate('MedicalBookingScreen');
    }, delay);

    return () => clearTimeout(timer);
  }, [navigation]);
  // const [isVisible, setIsVisible] = useState(false);
  // const payment = useSelector(state => state.payment.payment);
  // const dispatch = useDispatch();
  // useFocusEffect(
  //   React.useCallback(() => {
  //     setIsVisible(payment);
  //   }, [payment]),
  // );

  // const handleReduxPayment = () => {
  //   setIsVisible(false);
  //   dispatch(paymentCheck());
  //   navigation.navigate('HomeScreen');
  // };
  {
    /* {isVisible ? (
          <BottomSheet modalProps={{}} isVisible={isVisible}>
            <ReviewPopup onPress={() => handleReduxPayment()} />
          </BottomSheet>
        ) : null} */
  }
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/Group.png')}
        style={styles.groupimage}>
        <View style={styles.completeIcon}>
          <Image
            source={require('../../../assets/completedIcon.png')}
            style={styles.icon}
          />
          <Text style={styles.text}>Success,{'\n'} Payment completed.</Text>
        </View>
        <Image
          source={require('../../../assets/complete.png')}
          style={styles.complete}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  completeIcon: {
    marginTop: heightToDp(25),
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
    fontSize: widthToDp(7),
    fontFamily: 'Manrope-Bold',
  },

  complete: {
    alignSelf: 'flex-end',
    width: widthToDp(75),
    resizeMode: 'contain',
    height: widthToDp(75),
    flex: 1,
    justifyContent: 'flex-end',
  },
});
