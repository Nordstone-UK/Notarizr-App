import {Image, StyleSheet, Text, ScrollView, View} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <HomeScreenHeader />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.Heading}>
            Know how Notarizr helps you in notarizing your documents
          </Text>
          <Image
            source={require('../../../assets/videoIcon.png')}
            style={{alignSelf: 'center', marginTop: heightToDp(3)}}
          />
          <View style={styles.CategoryBar}>
            <Text style={styles.Heading}>Categories</Text>
            <Text style={styles.subheading}>View all</Text>
          </View>
          <View style={styles.CategoryPictures}>
            <View style={styles.PictureBar}>
              <Image source={require('../../../assets/legalDocIcon.png')} />
              <Image source={require('../../../assets/estateDocIcon.png')} />
            </View>
            <View style={styles.PictureBar}>
              <Image source={require('../../../assets/medicalDocIcon.png')} />
              <Image source={require('../../../assets/businessDocIcon.png')} />
            </View>
          </View>
          <View style={styles.CategoryBar}>
            <Text style={styles.Heading}>Active Services</Text>
            <Text style={styles.subheading}>View all</Text>
          </View>
          <AgentCard />
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
