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
  BackHandler,
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
import OneSignal from 'react-native-onesignal';
import {socket} from '../../utils/Socket';
import AuthenticateModal from '../../components/AuthenticateModal/AuthenticateModal';
import LoginBottomSheet from '../../components/CustomBottomSheet/LoginBottomSheet';

export default function HomeScreen({route, navigation}) {
  const user = useSelector(state => state.user.user);
  const {fetchBookingInfo} = useFetchBooking();
  const dispatch = useDispatch();
  const [Booking, setBooking] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };
  // React.useEffect(() => {
  //   const disableBackButtonHandler = () => {
  //     return true;
  //   };

  //   BackHandler.addEventListener('hardwareBackPress', disableBackButtonHandler);

  //   return () => {
  //     BackHandler.removeEventListener(
  //       'hardwareBackPress',
  //       disableBackButtonHandler,
  //     );
  //   };
  // }, []);
  const handleCloseModal = () => {
    setModalVisible(false);
  };
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
    OneSignal.setExternalUserId(user?._id);
    if (user?._id !== null) {
      const unsubscribe = navigation.addListener('focus', () => {
        init('pending');
      });
      return unsubscribe;
    }
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
      <HomeScreenHeader Title="Please Choose Your Service" />
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
              user != null
                ? navigation.navigate('ServiceDetailScreen', {
                    serviceType: 'mobile_notary',
                  })
                : handleOpenModal()
            }
          />
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.LightBlue}}
            Title="Remote Online Notary"
            Image={require('../../../assets/service2Pic.png')}
            onPress={() =>
              user != null
                ? navigation.navigate('OnlineNotaryScreen')
                : handleOpenModal()
            }
          />
          <View style={styles.CategoryBar}>
            <Text style={styles.Heading}>Active Bookings</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllBookingScreen')}>
              <Text style={styles.subheading}>View all</Text>
            </TouchableOpacity>
          </View>
          {user != null ? (
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
                            bottomRightText={item?.document_type}
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
          ) : (
            <View
              style={{
                minHeight: heightToDp(40),
                justifyContent: 'center',
                alignSelf: 'center',
              }}>
              <Image
                source={require('../../../assets/emptyBox.png')}
                style={styles.picture}
              />
              <Text
                style={[
                  styles.Heading,

                  {
                    fontSize: widthToDp(4),
                    fontFamily: 'Manrope-SemiBold',
                    fontWeight: '600',
                  },
                ]}>
                Please Login to see bookings
              </Text>
            </View>
          )}
        </ScrollView>
      </BottomSheetStyle>
      <LoginBottomSheet
        isVisible={isModalVisible}
        onCloseModal={handleCloseModal}
        Title="Please Login to use this service"
      />
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
    alignSelf: 'center',
  },
});
