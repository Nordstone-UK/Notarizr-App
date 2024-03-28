import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import {Linking} from 'react-native';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {ScrollView} from 'react-native-virtualized-view';
export default function ActiveServicesScreen({route, navigation}) {
  const {bookingDetail} = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Categories" />
      <View style={{marginHorizontal: widthToDp(3)}}>
        <Text style={styles.Heading}>
          Find all the active services you have
        </Text>
      </View>
      <BottomSheetStyle>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.CategoryBar}>
            <Text style={styles.Heading}>Active Services</Text>
          </View>
          <FlatList
            data={bookingDetail}
            keyExtractor={item => item._id}
            renderItem={({item}) => {
              return (
                <>
                  <AgentCard
                    source={{uri: item.agent.profile_picture}}
                     calendarImage={require('../../../assets/calenderIcon.png')}
                        servicetype={item.service_type}
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
                </>
              );
            }}
          />
          {/* <AgentCard
            image={require('../../../assets/agentLocation.png')}
            source={require('../../../assets/agentCardPic.png')}
            bottomRightText="$400"
            bottomLeftText="Total"
            agentName={'Advocate Parimal M. Trivedi'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            OrangeText={'At Office'}
            task="On Process"
          />
          <AgentCard
            image={require('../../../assets/agentLocation.png')}
            source={require('../../../assets/agentCardPic.png')}
            bottomRightText="$400"
            bottomLeftText="Total"
            agentName={'Advocate Parimal M. Trivedi'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            OrangeText={'At Office'}
            task="Completed"
            onPress={() => navigation.navigate('MedicalBookingScreen')}
          />
          <AgentCard
            image={require('../../../assets/agentLocation.png')}
            source={require('../../../assets/agentCardPic.png')}
            bottomRightText="$400"
            bottomLeftText="Total"
            agentName={'Advocate Parimal M. Trivedi'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            OrangeText={'At Office'}
            task="Online"
          />
          <AgentCard
            image={require('../../../assets/agentLocation.png')}
            source={require('../../../assets/agentCardPic.png')}
            bottomRightText="$400"
            bottomLeftText="Total"
            agentName={'Advocate Parimal M. Trivedi'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            OrangeText={'At Office'}
            task="On Process"
            onPress={() => navigation.navigate('MedicalBookingScreen')}
          />
          <AgentCard
            image={require('../../../assets/agentLocation.png')}
            source={require('../../../assets/agentCardPic.png')}
            bottomRightText="$400"
            bottomLeftText="Total"
            agentName={'Advocate Parimal M. Trivedi'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            OrangeText={'At Office'}
            task="Completed"
            onPress={() => navigation.navigate('MedicalBookingScreen')}
          />
          <AgentCard
            image={require('../../../assets/agentLocation.png')}
            source={require('../../../assets/agentCardPic.png')}
            bottomRightText="$400"
            bottomLeftText="Total"
            agentName={'Advocate Parimal M. Trivedi'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            OrangeText={'At Office'}
            task="Online"
            onPress={() => navigation.navigate('MedicalBookingScreen')}
          /> */}
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
    marginHorizontal: widthToDp(5),
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
