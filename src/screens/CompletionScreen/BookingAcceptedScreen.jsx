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
import {serviceCheck} from '../../features/service/serviceSlice';

export default function BookingAcceptedScreen({route, navigation}) {
  const dispatch = useDispatch();
  useEffect(() => {
    const delay = 3000;
    dispatch(serviceCheck());
    const timer = setTimeout(() => {
      navigation.navigate('AgentLocalClientReviewScreen');
    }, delay);

    return () => clearTimeout(timer);
  }, [navigation]);
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

          <Text style={styles.text}>
            Congratulations,{'\n'} you have accepted the booking
          </Text>
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
    height: widthToDp(75),
    resizeMode: 'contain',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
