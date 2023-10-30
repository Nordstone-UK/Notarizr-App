import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import MainButton from '../../../components/MainGradientButton/MainButton';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import Colors from '../../../themes/Colors';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import useFetchBooking from '../../../hooks/useFetchBooking';
import {ScrollView} from 'react-native-virtualized-view';

export default function AgentAllBookingScreen({navigation}) {
  const [isFocused, setIsFocused] = useState('Active');
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
  return (
    <SafeAreaView style={styles.container}>
      <AgentHomeHeader
        Title="One Click and Select our services."
        SearchEnabled={true}
        Switch={true}
      />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              alignContent: 'center',
              marginBottom: widthToDp(2),
            }}>
            <MainButton
              Title="Active"
              colors={
                isFocused === 'Active'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={
                isFocused === 'Active'
                  ? {
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
                  : {
                      color: Colors.TextColor,
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
              }
              onPress={() => setIsFocused('Active')}
            />
            <MainButton
              Title="Completed"
              colors={
                isFocused === 'Complete'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={
                isFocused === 'Complete'
                  ? {
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
                  : {
                      color: Colors.TextColor,
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
              }
              onPress={() => setIsFocused('Complete')}
            />
            <MainButton
              Title="Rejected"
              colors={
                isFocused === 'Rejected'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={
                isFocused === 'Rejected'
                  ? {
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
                  : {
                      color: Colors.TextColor,
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
              }
              onPress={() => setIsFocused('Rejected')}
            />
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
                    onPress={() =>
                      navigation.navigate('ClientDetailsScreen', {
                        clientDetail: item,
                      })
                    }
                  />
                );
              }}
            />
          </View>
          {/* {isFocused === 'Active' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
              Button={true}
              onPress={() => navigation.navigate('AgentBookingClientDetail')}
            />
          )}
          {isFocused === 'Active' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
              Work={true}
              WorkStatus="In Progress"
            />
          )}
          {isFocused === 'Complete' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
              Work={true}
              WorkStatus="Completed"
            />
          )}
          {isFocused === 'Complete' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
              Work={true}
              WorkStatus="Completed"
            />
          )}
          {isFocused === 'Rejected' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
              Work={true}
              time={true}
              Canceled={true}
            />
          )}
          {isFocused === 'Rejected' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
              Work={true}
              Canceled={true}
            />
          )} */}
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
    paddingLeft: widthToDp(2),
  },
  contentContainer: {
    paddingVertical: heightToDp(5),
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
