import {Image, StyleSheet, Text, ScrollView, View} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import LegalDocumentCard from '../../components/LegalDocumentCard/LegalDocumentCard';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';

export default function LegalDocScreen() {
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
          <LegalDocumentCard Title="Legal Document 1" />
          <LegalDocumentCard Title="Legal Document 2" Price="$550" />
          <LegalDocumentCard Title="Legal Document 3" Price="$600" />
          <LegalDocumentCard Title="Legal Document 4" />
          <LegalDocumentCard Title="Legal Document 5" />
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
});
