import {Image, StyleSheet, Text, ScrollView, View} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import LegalDocumentCard from '../../components/LegalDocumentCard/LegalDocumentCard';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';

export default function RealEstateDocScreen({navigation}) {
  return (
    <View style={styles.container}>
      <NavigationHeader
        Title="Real Estate Document"
        lastImg={require('../../../assets/bellIcon.png')}
        midImg={require('../../../assets/Search.png')}
      />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <LegalDocumentCard
            Title="Real Estate Document 1"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Real Estate Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Real Estate Document 2"
            Price="$550"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Real Estate Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Real Estate Document 3"
            Price="$600"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Real Estate Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Real Estate Document 4"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Real Estate Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Real Estate Document 5"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Real Estate Documents',
              })
            }
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
});
