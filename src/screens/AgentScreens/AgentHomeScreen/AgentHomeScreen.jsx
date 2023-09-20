import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import HomeScreenHeader from '../../../components/HomeScreenHeader/HomeScreenHeader';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import AgentCard from '../../../components/AgentCard/AgentCard';
import Colors from '../../../themes/Colors';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import GradientButton from '../../../components/MainGradientButton/GradientButton';

export default function AgentHomeScreen({navigation}) {
  const openLinkInBrowser = () => {
    const url = 'https://www.youtube.com/watch?v=SgD7g0COp-I';
    Linking.openURL(url).catch(err =>
      console.error('An error occurred: ', err),
    );
  };
  return (
    <View style={styles.container}>
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
              style={{alignSelf: 'center', marginTop: heightToDp(3)}}
            />
          </TouchableOpacity>
          <View style={{marginVertical: heightToDp(5)}}>
            <GradientButton
              Title="Setup Your Profile"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => navigation.navigate('AgentMainBookingScreen')}
            />
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.Heading}>Service requests</Text>
            <Text style={styles.subheaing}>View All</Text>
          </View>
          <ClientServiceCard
            image={require('../../../../assets/agentLocation.png')}
            source={require('../../../../assets/maleAgentPic.png')}
            bottomLeftText="$400"
            agentName={'Bunny Joel'}
            agentAddress={'Shop 28, jigara Kalakand Road'}
            task="Mobile"
            OrangeText="At Home"
            Button={true}
            noButton={true}
            onPress={() => navigation.navigate('ClientDetailsScreen')}
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
