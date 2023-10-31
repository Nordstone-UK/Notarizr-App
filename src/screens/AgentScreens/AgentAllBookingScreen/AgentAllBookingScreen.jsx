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
  const [isFocused, setIsFocused] = useState('accepted');
  const {fetchAgentBookingInfo} = useFetchBooking();
  const [Booking, setBooking] = useState([]);

  const init = async status => {
    const bookingDetail = await fetchAgentBookingInfo(status);
    console.log(bookingDetail);
    setBooking(bookingDetail);
  };
  useEffect(() => {
    init('accepted');
  }, []);
  const callBookingsAPI = async status => {
    setBooking(null);
    setIsFocused(status);
    init(status);
  };
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
          <ScrollView
            horizontal={true}
            contentContainerStyle={{}}
            showsHorizontalScrollIndicator={false}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                alignContent: 'center',
                columnGap: widthToDp(5),
                marginHorizontal: widthToDp(5),
              }}>
              <MainButton
                Title="Active"
                colors={
                  isFocused === 'accepted'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={
                  isFocused === 'accepted'
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
                onPress={() => callBookingsAPI('accepted')}
              />
              <MainButton
                Title="Pending"
                colors={
                  isFocused === 'pending'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={
                  isFocused === 'pending'
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
                onPress={() => callBookingsAPI('pending')}
              />
              <MainButton
                Title="Completed"
                colors={
                  isFocused === 'completed'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={
                  isFocused === 'completed'
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
                onPress={() => callBookingsAPI('completed')}
              />
              <MainButton
                Title="Rejected"
                colors={
                  isFocused === 'rejected'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={
                  isFocused === 'rejected'
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
                onPress={() => callBookingsAPI('rejected')}
              />
            </View>
          </ScrollView>
          <View style={{flex: 1}}>
            <FlatList
              data={Booking}
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
