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
import LottieView from 'lottie-react-native';

export default function AgentBookCompletion({navigation}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const delay = 5000; // Delay in milliseconds (5 seconds)

    const timer = setTimeout(() => {
      if (isMounted) {
        navigation.navigate('MedicalBookingScreen');
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, [navigation, isMounted]);

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
          Congratulations,{'\n'} you have booked an agent!
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
    width: widthToDp(75),
    height: widthToDp(75),
    resizeMode: 'contain',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
