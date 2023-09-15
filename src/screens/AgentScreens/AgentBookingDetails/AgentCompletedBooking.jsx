import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';

export default function AgentCompletedBooking({navigation}) {
  return (
    <View style={styles.container}>
      <AgentHomeHeader Title="Booking Details" SearchEnabled={true} />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.Heading}>Completed Booking</Text>

          <ClientServiceCard
            image={require('../../../../assets/agentLocation.png')}
            source={require('../../../../assets/maleAgentPic.png')}
            bottomLeftText="$400"
            agentName={'Bunny Joel'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            task="Mobile"
            OrangeText="At Home"
            Work={true}
            Time={true}
            WorkStatus="Completed"
          />
          <ClientServiceCard
            image={require('../../../../assets/agentLocation.png')}
            source={require('../../../../assets/maleAgentPic.png')}
            bottomLeftText="$400"
            agentName={'Bunny Joel'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            task="Mobile"
            OrangeText="At Home"
            Time={true}
            Work={true}
            WorkStatus="Completed"
          />
          <ClientServiceCard
            image={require('../../../../assets/agentLocation.png')}
            source={require('../../../../assets/maleAgentPic.png')}
            bottomLeftText="$400"
            agentName={'Bunny Joel'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            task="Mobile"
            OrangeText="At Home"
            Time={true}
            Work={true}
            WorkStatus="Completed"
          />
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
