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
import useLogin from '../../hooks/useLogin';
import LottieView from 'lottie-react-native';

export default function RegisterCompletionScreen({navigation}) {
  const {resetStack} = useLogin();
  useEffect(() => {
    const delay = 3000;

    const timer = setTimeout(() => {
      resetStack('signup');
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

        <Text style={styles.text}>
          Congratulations,{'\n'} you have successfully registered!
        </Text>
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
    width: widthToDp(70),
    resizeMode: 'contain',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
