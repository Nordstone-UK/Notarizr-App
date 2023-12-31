import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  FlatList,
  View,
  SafeAreaView,
} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import SplashScreen from 'react-native-splash-screen';
import useCreateBooking from '../../hooks/useCreateBooking';

export default function RONAgentReviewScreen({route, navigation}, props) {
  const {BookingData, handleBookingCreation, consoleData, setBookingData} =
    useCreateBooking();
  const {agents, documentType} = route.params;
  const user = agents.user;
  console.log('user extracted', documentType);
  useEffect(() => {
    setBookingData({
      ...BookingData,
      serviceType: user?.service?.service_type,
      service: user?.service?._id,
      agent: user?._id,
      documentType: documentType,
    });
  }, []);
  const GradientText = props => {
    return (
      <MaskedView maskElement={<Text {...props} />}>
        <LinearGradient
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}>
          <Text {...props} style={[props.style, {opacity: 0}]} />
        </LinearGradient>
      </MaskedView>
    );
  };
  return (
    <SafeAreaView style={styles.contianer}>
      <NavigationHeader Title="Agent Review" />
      <ScrollView contentContainerStyle={{flex: 1}}>
        <Image source={{uri: user?.profile_picture}} style={styles.picture} />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {user?.first_name} {user?.last_name}
          </Text>
          <GradientText style={styles.placestyle}>
            {user?.rating || '4.0'}
          </GradientText>
          <Image
            source={require('../../../assets/orangeStar.png')}
            style={styles.star}
          />
          <Text style={styles.rating}>Rating</Text>
        </View>
        <View style={{marginTop: heightToDp(2)}} />
        <BottomSheetStyle>
          <ScrollView contentContainerStyle={{flex: 1}}>
            <View style={styles.sheetContainer}>
              <Text style={styles.heading}>Description</Text>
              <Text style={styles.preference}>Email : {user.email}</Text>
              <Text style={styles.preference}>
                Availability : {user?.service?.availability?.startTime} to{' '}
                {user?.service?.availability?.endTime}
              </Text>
              <View>
                <Text style={styles.preference}>Weekdays : </Text>
                <FlatList
                  horizontal
                  data={user?.service?.availability?.weekdays}
                  renderItem={({item}) => (
                    <Text style={styles.preference}>{item.toUpperCase()}</Text>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
              <View style={styles.addressView}>
                <Image
                  source={require('../../../assets/locationIcon.png')}
                  style={styles.locationImage}
                />
                <Text style={styles.detail}>{user.location}</Text>
              </View>
            </View>
            <View style={styles.button}>
              <GradientButton
                Title="Book Now"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() => handleBookingCreation()}
              />
            </View>
          </ScrollView>
        </BottomSheetStyle>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contianer: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  picture: {
    width: widthToDp(40),
    height: heightToDp(40),
    alignSelf: 'center',
  },
  nameContainer: {
    marginVertical: heightToDp(2),
    alignSelf: 'center',
  },
  name: {
    alignSelf: 'center',
    fontSize: widthToDp(7),
    color: Colors.TextColor,

    fontFamily: 'Manrope-Bold',
  },
  placestyle: {
    fontSize: widthToDp(7),
    fontWeight: '900',
    alignSelf: 'center',
  },
  heading: {
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    marginLeft: widthToDp(3),
    fontFamily: 'Manrope-Bold',
  },
  rating: {
    alignSelf: 'center',
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
  },
  preference: {
    marginLeft: widthToDp(3),
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
  },
  star: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  sheetContainer: {
    marginTop: heightToDp(4),
  },
  locationImage: {
    tintColor: Colors.Black,
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightToDp(8),
    marginLeft: widthToDp(4),
  },
  detail: {
    marginLeft: widthToDp(2),
    marginVertical: widthToDp(2),
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Regular',
    color: Colors.DullTextColor,
  },
  button: {
    flex: 1,
    justifyContent: 'flex-end',
    marginVertical: widthToDp(5),
  },
});
