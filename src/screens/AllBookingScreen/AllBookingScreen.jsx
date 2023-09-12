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
                      padding: widthToDp(1.5),
                      fontSize: widthToDp(5),
                    }
                  : {
                      color: Colors.TextColor,
                      padding: widthToDp(1.5),
                      fontSize: widthToDp(5),
                    }
              }
              onPress={() => setIsFocused('Active')}
            />
            <MainButton
              Title="Complete"
              colors={
                isFocused === 'Complete'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={
                isFocused === 'Complete'
                  ? {
                      padding: widthToDp(1.5),
                      fontSize: widthToDp(5),
                    }
                  : {
                      color: Colors.TextColor,
                      padding: widthToDp(1.5),
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
                      padding: widthToDp(1.5),
                      fontSize: widthToDp(5),
                    }
                  : {
                      color: Colors.TextColor,
                      padding: widthToDp(1.5),
                      fontSize: widthToDp(5),
                    }
              }
              onPress={() => setIsFocused('Rejected')}
            />
          </View>
          <AgentCard
            image={require('../../../assets/agentLocation.png')}
            bottomRightText="30 minutes"
            bottomLeftText="0.5 Miles"
            agentName={'Advocate Parimal M. Trivedi'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            Review={true}
          />
          <AgentCard
            image={require('../../../assets/agentLocation.png')}
            bottomRightText="0.5 Miles"
            bottomLeftText="Total"
            agentName={'Advocate Parimal M. Trivedi'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            Review={true}
          />
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
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
