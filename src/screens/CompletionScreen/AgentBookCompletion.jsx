import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import {useDispatch} from 'react-redux';
import useFetchBooking from '../../hooks/useFetchBooking';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../features/booking/bookingSlice';

export default function AgentBookCompletion({route, navigation}) {
  // const [booking, setBooking] = useState();
  // const {fetchBookingInfo} = useFetchBooking();
  const {bookingData} = route.params;
  // console.log('====================================');
  // console.log('Agent Completion', bookingData?.agent);
  // console.log('====================================');
  const dispatch = useDispatch();
  const init = async () => {
    dispatch(setBookingInfoState(bookingData));
    dispatch(
      setCoordinates(bookingData?.booked_by?.current_location?.coordinates),
    );
    dispatch(setUser(bookingData?.agent));
    navigation.navigate('MedicalBookingScreen');
  };
  useEffect(() => {
    init();
    // const delay = 3000;
    // const timer = setTimeout(() => {
    //   navigation.navigate('LocalNotaryBookingScreen');
    // }, delay);
    // return () => clearTimeout(timer);
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
            Congratulations,{'\n'} you have booked an agent!
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
