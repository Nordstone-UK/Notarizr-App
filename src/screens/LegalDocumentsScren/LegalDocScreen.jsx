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

export default function LegalDocScreen({route, navigation}) {
  return (
    <View style={styles.container}>
      <NavigationHeader
        Title="Legal Document"
        lastImg={require('../../../assets/bellIcon.png')}
        midImg={require('../../../assets/Search.png')}
      />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <LegalDocumentCard
            Title="Legal Document 1"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Legal Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Legal Document 2"
            Price="$550"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Legal Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Legal Document 3"
            Price="$600"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Legal Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Legal Document 4"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Legal Documents',
              })
            }
          />
          <LegalDocumentCard
            Title="Legal Document 5"
            onPress={() =>
              navigation.navigate('MainBookingScreen', {
                name: 'Legal Documents',
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
