import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';

import {heightToDp, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import {Linking} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {ScrollView} from 'react-native-virtualized-view';
import useFetchBooking from '../../hooks/useFetchBooking';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../features/booking/bookingSlice';

export default function HomeScreen({navigation}) {
  const {fetchBookingInfo} = useFetchBooking();
  const dispatch = useDispatch();
  const [Booking, setBooking] = useState([]);
  useEffect(() => {
    const init = async status => {
      const bookingDetail = await fetchBookingInfo(status);
      console.log('bookingDetail', bookingDetail);
      setBooking(bookingDetail);
    };
    init('pending');
  }, []);
  const openLinkInBrowser = () => {
    const url = 'https://www.youtube.com/watch?v=SgD7g0COp-I';
    Linking.openURL(url).catch(err =>
      console.error('An error occurred: ', err),
    );
  };
  const handleAgentData = item => {
    navigation.navigate('MedicalBookingScreen', {
      item: item,
    });
    dispatch(setBookingInfoState(item));
    dispatch(setCoordinates(item?.booked_by?.current_location?.coordinates));
    dispatch(setUser(item?.agent));
  };
  return (
    <SafeAreaView style={styles.container}>
      <HomeScreenHeader Title="One Click and Select our services." />
      <BottomSheetStyle>
        <ScrollView
          style={{flex: 1}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.MainHeading}>
            Know how Notarizr helps you in notarizing your documents
          </Text>
          <TouchableOpacity onPress={openLinkInBrowser} style={{}}>
            <Image
              source={require('../../../assets/videoIcon.png')}
              style={{
                alignSelf: 'center',
                width: widthToDp(90),
                height: heightToDp(40),
                borderRadius: 15,
                marginTop: heightToDp(3),
              }}
            />
          </TouchableOpacity>
          <View style={styles.CategoryBar}>
            <Text style={styles.Heading}>Categories</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CategoryDetailScreen')}>
              <Text style={styles.subheading}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.CategoryPictures}>
            <View style={styles.PictureBar}>
              <TouchableOpacity
                onPress={() => navigation.navigate('LegalDocScreen')}
                style={{position: 'relative'}}>
                <Text style={styles.LongImage}>Legal Documents</Text>
                <Image
                  source={require('../../../assets/legalDocIcon.png')}
                  style={styles.ImageLong}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('RealEstateDocScreen')}
                style={{position: 'relative'}}>
                <Text style={styles.ShortImage}>Real Estate Documents</Text>
                <Image
                  source={require('../../../assets/estateDocIcon.png')}
                  style={styles.ImageShort}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.PictureBar}>
              <TouchableOpacity
                onPress={() => navigation.navigate('MedicalDocScreen')}
                style={{position: 'relative'}}>
                <Text style={styles.ShortImage}>Medical Documents</Text>
                <Image
                  source={require('../../../assets/medicalDocIcon.png')}
                  style={styles.ImageShort}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('BusinessDocScreen')}
                style={{position: 'relative'}}>
                <Text style={styles.LongImage}>Business Documents</Text>
                <Image
                  source={require('../../../assets/businessDocIcon.png')}
                  style={styles.ImageLong}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.CategoryBar}>
            <Text style={styles.Heading}>Active Services</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllBookingScreen')}>
              <Text style={styles.subheading}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1}}>
            {Booking ? (
              Booking.length !== 0 ? (
                <FlatList
                  data={Booking.slice(0, 2)}
                  keyExtractor={item => item._id}
                  renderItem={({item}) => {
                    return (
                      <TouchableOpacity onPress={() => handleAgentData(item)}>
                        <AgentCard
                          source={{uri: item?.agent?.profile_picture}}
                          bottomRightText={item?.document_type?.price}
                          bottomLeftText="Total"
                          image={require('../../../assets/agentLocation.png')}
                          agentName={
                            item?.agent?.first_name +
                            ' ' +
                            item?.agent?.last_name
                          }
                          agentAddress={item?.agent?.location}
                          task={item?.status}
                          OrangeText={'At Office'}
                          dateofBooking={item?.date_of_booking}
                          timeofBooking={item?.time_of_booking}
                          createdAt={item?.createdAt}
                        />
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: widthToDp(10),
                  }}>
                  <Image
                    source={require('../../../assets/mainLogo.png')}
                    style={styles.picture}
                  />
                  <Text style={styles.subheading}>No Booking Found...</Text>
                </View>
              )
            ) : (
              <ActivityIndicator size="large" color={Colors.Orange} />
            )}
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  MainHeading: {
    fontSize: widthToDp(6.5),
    fontWeight: '700',
    color: Colors.TextColor,
    marginHorizontal: widthToDp(4),
  },
  LongImage: {
    position: 'absolute',
    zIndex: 99,
    margin: widthToDp(2),
    fontSize: widthToDp(5.5),
    marginTop: widthToDp(1),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginRight: widthToDp(20),
  },
  ShortImage: {
    position: 'absolute',
    zIndex: 1,
    margin: widthToDp(2),
    fontSize: widthToDp(4),
    marginTop: widthToDp(1),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
  },
  ImageShort: {
    width: widthToDp(30),
    height: heightToDp(30),
    borderRadius: 10,
  },
  ImageLong: {
    width: widthToDp(60),
    height: heightToDp(30),
    borderRadius: 10,
  },
  Heading: {
    fontSize: widthToDp(6.5),
    fontWeight: '700',
    color: Colors.TextColor,
  },
  contentContainer: {
    paddingVertical: heightToDp(5),
  },
  subheading: {
    fontSize: widthToDp(4),
    fontWeight: '700',
    color: Colors.TextColor,
    alignSelf: 'center',
  },
  CategoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: heightToDp(3),
    marginHorizontal: widthToDp(4),
    alignItems: 'center',
  },
  PictureBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: heightToDp(1),
  },
  CategoryPictures: {
    marginVertical: heightToDp(2),
  },
  picture: {
    width: widthToDp(20),
    height: heightToDp(20),
  },
});
