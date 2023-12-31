import {
  Image,
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
import {
  capitalizeFirstLetter,
  heightToDp,
  widthToDp,
} from '../../utils/Responsive';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import SplashScreen from 'react-native-splash-screen';
import useCreateBooking from '../../hooks/useCreateBooking';
import {ScrollView} from 'react-native-virtualized-view';

export default function AgentReviewScreen({route, navigation}, props) {
  const {BookingData, handleBookingCreation, consoleData, setBookingData} =
    useCreateBooking();
  const {description, documentType} = route.params;
  const {service} = description;

  useEffect(() => {
    setBookingData({
      ...BookingData,
      serviceType: description?.service?.service_type,
      service: description?.service?._id,
      agent: description?._id,
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
      <View style={{flex: 1}}>
        <Image
          source={{uri: description?.profile_picture}}
          style={styles.picture}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {description?.first_name} {description?.last_name}
          </Text>
          <GradientText style={styles.placestyle}>
            {description?.rating || '4.0'}
          </GradientText>
          <Image
            source={require('../../../assets/orangeStar.png')}
            style={styles.star}
          />
          <Text style={styles.rating}>Rating</Text>
        </View>
        <View style={{marginTop: heightToDp(2)}} />
        <BottomSheetStyle>
          <ScrollView contentContainerStyle={{paddingBottom: heightToDp(2)}}>
            <View style={styles.sheetContainer}>
              <Text style={styles.MainHeading}>Description: </Text>
              <Text style={styles.heading}>Email : </Text>
              <Text style={styles.preference}>{description?.email}</Text>
              <Text style={styles.heading}>Availability : </Text>
              <Text style={styles.preference}>
                {service?.availability?.startTime} to{' '}
                {service?.availability?.endTime}
              </Text>
              <View>
                <Text style={styles.heading}>Weekdays : </Text>
                <View
                  style={{
                    marginHorizontal: widthToDp(3),
                  }}>
                  <FlatList
                    horizontal
                    data={service?.availability?.weekdays}
                    renderItem={({item}) => (
                      <LinearGradient
                        style={styles.locationStyle}
                        colors={[
                          Colors.OrangeGradientStart,
                          Colors.OrangeGradientEnd,
                        ]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}>
                        <Text style={styles.weekdays}>
                          {capitalizeFirstLetter(item)}
                        </Text>
                      </LinearGradient>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                  />
                </View>
              </View>
              <View style={styles.addressView}>
                <Image
                  source={require('../../../assets/locationIcon.png')}
                  style={styles.locationImage}
                />
                <Text style={styles.detail}>
                  {capitalizeFirstLetter(description?.location)}
                </Text>
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
      </View>
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
    color: Colors.OrangeGradientEnd,
  },
  MainHeading: {
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    marginLeft: widthToDp(3),
    fontFamily: 'Manrope-Bold',
  },
  heading: {
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    marginLeft: widthToDp(3),
    fontFamily: 'Manrope-Bold',
    marginTop: heightToDp(3),
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
  weekdays: {
    paddingHorizontal: widthToDp(3),
    fontSize: widthToDp(4),
    color: Colors.white,
    fontFamily: 'Manrope-Bold',
  },
  star: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  sheetContainer: {
    marginTop: heightToDp(4),
  },
  locationImage: {
    width: widthToDp(5),
    height: heightToDp(5),
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: widthToDp(5),
  },
  locationStyle: {
    borderRadius: 20,
    marginRight: widthToDp(2),
    // width: widthToDp(15),
    marginTop: widthToDp(2),
    alignItems: 'center',
  },
});
