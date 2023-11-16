import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import {useDispatch, useSelector} from 'react-redux';
import {ScrollView} from 'react-native-virtualized-view';
import useFetchBooking from '../../hooks/useFetchBooking';
import {WebView} from 'react-native-webview';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../features/booking/bookingSlice';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';
import ModalCheck from '../../components/ModalComponent/ModalCheck';

export default function HomeScreen({route, navigation}) {
  const {fetchBookingInfo} = useFetchBooking();
  const dispatch = useDispatch();
  const [Booking, setBooking] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const init = async status => {
    const bookingDetail = await fetchBookingInfo(status);
    setBooking(bookingDetail);
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    init('pending');
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      init('pending');
    });
    return unsubscribe;
  }, [navigation]);

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
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.CategoryBar}></View>
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.Pink}}
            Title="Mobile Notary"
            Image={require('../../../assets/service1Pic.png')}
            onPress={() =>
              navigation.navigate('ServiceDetailScreen', {
                serviceType: 'mobile_notary',
              })
            }
            // isDisabled={isDisabled}
          />
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.LightBlue}}
            Title="Remote Online Notary"
            Image={require('../../../assets/service2Pic.png')}
            onPress={() =>
              navigation.navigate('OnlineNotaryScreen', documentType)
            }
          />
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
                    source={require('../../../assets/emptyBox.png')}
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
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(3),
    marginHorizontal: widthToDp(5),
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
{
  /* <View style={styles.CategoryPictures}>
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
          </View> */
}
