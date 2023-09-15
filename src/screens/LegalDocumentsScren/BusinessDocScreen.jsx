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

export default function BusinessDocScreen({route, navigation}) {
  return (
    <View style={styles.container}>
      <NavigationHeader
        Title="Business Document"
        lastImg={require('../../../assets/bellIcon.png')}
        midImg={require('../../../assets/Search.png')}
      />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <LegalDocumentCard
            Title="Business Document 1"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Business Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Business Document 2"
            Price="$550"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Business Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Business Document 3"
            Price="$600"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Business Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Business Document 4"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Business Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Business Document 5"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Business Documents',
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
