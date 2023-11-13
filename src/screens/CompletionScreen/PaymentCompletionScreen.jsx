import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import {useDispatch} from 'react-redux';
import {paymentCheck} from '../../features/review/reviewSlice';
import LottieView from 'lottie-react-native';

export default function PaymentCompletionScreen({navigation}, props) {
  const message = 'Congratulations, your booking is completed!';
  const [firstMsg, secondMsg] = separateStringAfterFirstWord(message);
  function separateStringAfterFirstWord(inputString) {
    const words = inputString.split(' ');

    if (words.length > 1) {
      const firstWord = words[0];
      const restOfTheString = words.slice(1).join(' ');
      return [firstWord, restOfTheString];
    } else {
      return [inputString, ''];
    }
  }
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(paymentCheck());

    const delay = 3000;
    const timer = setTimeout(() => {
      navigation.navigate('HomeScreen');
    }, delay);

    return () => clearTimeout(timer);
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

        <Text style={styles.text}>{firstMsg}</Text>
        <Text style={styles.text}>{secondMsg}</Text>
      </View>
      <Image
        source={require('../../../assets/complete.png')}
        style={styles.complete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  completeIcon: {
    marginTop: heightToDp(30),
  },
  groupimage: {
    flex: 1,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  text: {
    // marginHorizontal: widthToDp(21),
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: 25,
    fontWeight: '700',
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
