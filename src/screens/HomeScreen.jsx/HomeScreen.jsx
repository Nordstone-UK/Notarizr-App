import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';

import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import {Linking} from 'react-native';

export default function HomeScreen({navigation}) {
  const openLinkInBrowser = () => {
    const url = 'https://www.youtube.com/watch?v=SgD7g0COp-I';
    Linking.openURL(url).catch(err =>
      console.error('An error occurred: ', err),
    );
  };

  return (
    <View style={styles.container}>
      <HomeScreenHeader Title="One Click and Select our services." />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
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
                  source={require('../../../assets/legalDocIcon.png')}
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
                  source={require('../../../assets/estateDocIcon.png')}
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
                onPress={() =>
                  navigation.navigate('MainBookingScreen', {
                    name: 'Medical Documents',
                  })
                }>
                <Image
                  source={require('../../../assets/medicalDocIcon.png')}
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
                  source={require('../../../assets/businessDocIcon.png')}
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
              onPress={() => navigation.navigate('ActiveServicesScreen')}>
              <Text style={styles.subheading}>View all</Text>
            </TouchableOpacity>
          </View>
          <AgentCard
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
