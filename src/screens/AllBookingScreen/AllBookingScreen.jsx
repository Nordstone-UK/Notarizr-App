import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
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
import AcceptAgentCard from '../../components/AcceptAgentCard/AcceptAgentCard';
import AgentReviewCard from '../../components/AgentReviewCard/AgentReviewCard';

export default function AllBookingScreen({navigation}) {
  const [isFocused, setIsFocused] = useState('Active');

  return (
    <View style={styles.container}>
      <HomeScreenHeader Title="Find all your bookings with our agents here" />
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
          {isFocused === 'Active' && (
            <AgentCard
              image={require('../../../assets/agentLocation.png')}
              source={require('../../../assets/agentCardPic.png')}
              bottomRightText="$400"
              bottomLeftText="Total"
              agentName={'Advocate Parimal M. Trivedi'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="On Process"
              OrangeText={'At Office'}
            />
          )}
          {isFocused === 'Active' && (
            <AgentCard
              image={require('../../../assets/agentLocation.png')}
              source={require('../../../assets/agentCardPic.png')}
              bottomRightText="$300"
              bottomLeftText="Total"
              agentName={'Advocate Parimal M. Trivedi'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Pending"
              OrangeText={'At Office'}
            />
          )}
          {isFocused === 'Active' && (
            <AgentReviewCard
              image={require('../../../assets/agentLocation.png')}
              source={require('../../../assets/agentCardPic.png')}
              bottomRightText="30 minutes"
              bottomLeftText="0.5 Miles"
              agentName={'Advocate Parimal M. Trivedi'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Pending"
              onPress={() =>
                navigation.navigate('CancelledBookingScreen', {
                  buttonText: 'Choose Another Agent',
                  Status: 'Cancelled',
                })
              }
            />
          )}
          {isFocused === 'Active' && (
            <AgentReviewCard
              image={require('../../../assets/agentLocation.png')}
              source={require('../../../assets/agentCardPic.png')}
              bottomRightText="30 minutes"
              bottomLeftText="0.5 Miles"
              agentName={'Advocate Parimal M. Trivedi'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Pending"
              onPress={() =>
                navigation.navigate('CancelledBookingScreen', {
                  buttonText: 'Cancel Booking',
                  Status: 'Pending',
                })
              }
            />
          )}
          {isFocused === 'Active' && (
            <AgentReviewCard
              image={require('../../../assets/agentLocation.png')}
              source={require('../../../assets/agentCardPic.png')}
              bottomRightText="30 minutes"
              bottomLeftText="0.5 Miles"
              agentName={'Advocate Parimal M. Trivedi'}
              agentAddress={'Legal building, James street,New York'}
              OrangeText={'At Office'}
              onPress={() => navigation.navigate('MedicalBookingScreen')}
            />
          )}
          {isFocused === 'Complete' && (
            <AgentCard
              image={require('../../../assets/agentLocation.png')}
              source={require('../../../assets/agentCardPic.png')}
              bottomRightText="$400"
              bottomLeftText="Total"
              agentName={'Advocate Parimal M. Trivedi'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Completed"
            />
          )}
          {isFocused === 'Complete' && (
            <AgentCard
              image={require('../../../assets/agentLocation.png')}
              source={require('../../../assets/agentCardPic.png')}
              bottomRightText="$400"
              bottomLeftText="Total"
              agentName={'Advocate Parimal M. Trivedi'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Completed"
            />
          )}
          {isFocused === 'Rejected' && (
            <AgentCard
              image={require('../../../assets/agentLocation.png')}
              source={require('../../../assets/agentCardPic.png')}
              bottomRightText="$400"
              bottomLeftText="Total"
              agentName={'Advocate Parimal M. Trivedi'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Rejected"
            />
          )}
          {isFocused === 'Rejected' && (
            <AgentCard
              image={require('../../../assets/agentLocation.png')}
              source={require('../../../assets/agentCardPic.png')}
              bottomRightText="$400"
              bottomLeftText="Total"
              agentName={'Advocate Parimal M. Trivedi'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Rejected"
            />
          )}
        </ScrollView>
      </BottomSheetStyle>
    </View>
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
