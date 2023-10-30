import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';

import {heightToDp, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import {Linking} from 'react-native';
import {useSelector} from 'react-redux';
import {ScrollView} from 'react-native-virtualized-view';
import useFetchBooking from '../../hooks/useFetchBooking';

export default function HomeScreen({navigation}) {
  const {fetchBookingInfo} = useFetchBooking();
  const [Booking, setBooking] = useState([]);
  useEffect(() => {
    const init = async () => {
      const bookingDetail = await fetchBookingInfo();
      setBooking(bookingDetail.getBookings.bookings);
    };
    init();
  }, []);
  // console.log(Booking);
  const openLinkInBrowser = () => {
    const url = 'https://www.youtube.com/watch?v=SgD7g0COp-I';
    Linking.openURL(url).catch(err =>
      console.error('An error occurred: ', err),
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <HomeScreenHeader Title="One Click and Select our services." />
      <BottomSheetStyle>
        <ScrollView
          style={{flex: 1}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.Heading}>
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
                onPress={() => navigation.navigate('LegalDocScreen')}>
                <Image
                  source={require('../../../assets/Group1.png')}
                  style={{
                    width: widthToDp(60),
                    height: heightToDp(30),
                    borderRadius: 10,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('RealEstateDocScreen')}>
                <Image
                  source={require('../../../assets/Group2.png')}
                  style={{
                    width: widthToDp(30),
                    height: heightToDp(30),
                    borderRadius: 10,
                  }}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.PictureBar}>
              <TouchableOpacity
                onPress={() => navigation.navigate('MedicalDocScreen')}>
                <Image
                  source={require('../../../assets/Group3.png')}
                  style={{
                    width: widthToDp(30),
                    height: heightToDp(30),
                    borderRadius: 10,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('BusinessDocScreen')}>
                <Image
                  source={require('../../../assets/Group4.png')}
                  style={{
                    width: widthToDp(60),
                    height: heightToDp(30),
                    borderRadius: 10,
                  }}
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
            <FlatList
              data={Booking.slice(0, 2)}
              keyExtractor={item => item._id}
              renderItem={({item}) => {
                return (
                  <AgentCard
                    source={{uri: item.agent.profile_picture}}
                    bottomRightText="$400"
                    bottomLeftText="Total"
                    image={require('../../../assets/agentLocation.png')}
                    agentName={
                      item.agent.first_name + ' ' + item.agent.last_name
                    }
                    agentAddress={item.agent.location}
                    task={item.status}
                    OrangeText={'At Office'}
                    dateofBooking={item.date_of_booking}
                    timeofBooking={item.time_of_booking}
                    createdAt={item.createdAt}
                  />
                );
              }}
            />
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
  Heading: {
    fontSize: widthToDp(6.5),
    fontWeight: '700',
    color: Colors.TextColor,
    paddingLeft: widthToDp(2),
  },
  contentContainer: {
    paddingVertical: heightToDp(5),
  },
  subheading: {
    fontSize: widthToDp(4),
    fontWeight: '700',
    color: Colors.TextColor,
    alignSelf: 'center',
    paddingRight: widthToDp(2),
  },
  CategoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: heightToDp(3),
  },
  PictureBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: heightToDp(1),
  },
  CategoryPictures: {
    marginVertical: heightToDp(2),
  },
});
