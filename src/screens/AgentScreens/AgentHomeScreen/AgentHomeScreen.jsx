import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import HomeScreenHeader from '../../../components/HomeScreenHeader/HomeScreenHeader';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import AgentCard from '../../../components/AgentCard/AgentCard';
import Colors from '../../../themes/Colors';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import useFetchBooking from '../../../hooks/useFetchBooking';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-virtualized-view';
import {useDispatch} from 'react-redux';
import {setBookingInfoState} from '../../../features/booking/bookingSlice';

export default function AgentHomeScreen({navigation}) {
  const openLinkInBrowser = () => {
    const url = 'https://www.youtube.com/watch?v=SgD7g0COp-I';
    Linking.openURL(url).catch(err =>
      console.error('An error occurred: ', err),
    );
  };
  const dispatch = useDispatch();
  const {fetchAgentBookingInfo} = useFetchBooking();
  const [Booking, setBooking] = useState([]);
  useEffect(() => {
    const init = async status => {
      const bookingDetail = await fetchAgentBookingInfo(status);
      console.log(bookingDetail);
      setBooking(bookingDetail);
    };
    init('pending');
  }, []);
  const handleNavigation = item => {
    navigation.navigate('ClientDetailsScreen', {clientDetail: item});
    dispatch(setBookingInfoState(item));
  };
  return (
    <SafeAreaView style={styles.container}>
      <AgentHomeHeader Title="Explore your opportunities here." Switch={true} />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.Heading}>
            Know how Notarizr helps you in getting more oppurtunities
          </Text>
          <TouchableOpacity onPress={openLinkInBrowser}>
            <Image
              source={require('../../../../assets/videoIcon.png')}
              style={{
                alignSelf: 'center',
                marginTop: heightToDp(3),
                width: widthToDp(90),
                height: heightToDp(40),
                borderRadius: 15,
              }}
            />
          </TouchableOpacity>
          <View style={{marginVertical: heightToDp(5)}}>
            <GradientButton
              Title="Select a service"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => navigation.navigate('AgentMainBookingScreen')}
            />
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.Heading}>Service requests</Text>
            <Text style={styles.subheaing}>View All</Text>
          </View>
          <View style={{flex: 1}}>
            <FlatList
              data={Booking.slice(0, 2)}
              keyExtractor={item => item._id}
              renderItem={({item}) => {
                return (
                  <ClientServiceCard
                    image={require('../../../../assets/agentLocation.png')}
                    source={{uri: item.booked_by.profile_picture}}
                    bottomLeftText={item.document_type.price}
                    agentName={
                      item.booked_by.first_name + ' ' + item.booked_by.last_name
                    }
                    agentAddress={item.booked_by.location}
                    task="Mobile"
                    OrangeText="At Home"
                    Button={true}
                    clientDetail={item}
                    onPress={() => handleNavigation(item)}
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
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginHorizontal: widthToDp(3),
  },
  contentContainer: {
    paddingVertical: heightToDp(5),
  },
  flexContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: widthToDp(5),
  },
  subheaing: {
    color: Colors.TextColor,
    fontFamily: 'Manrope-SemiBold',
  },
  subheading: {
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
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
