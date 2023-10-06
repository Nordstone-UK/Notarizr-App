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
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';

export default function RealEstateDocScreen({navigation}) {
  const documents = [
    {
      Title: 'Deeds',
      Price: '$500',
    },
    {
      Title: 'Lease Agreements',
      Price: '$550',
    },
    {
      Title: 'Property Easements',
      Price: '$600',
    },
    {
      Title: 'Mortgage Documents',
      Price: '$600',
    },
    {
      Title: 'Real Estate Contracts',
      Price: '$200',
    },
  ];
  const onPress = () => {
    navigation.navigate('MainBookingScreen', {name: 'Real Estate Documents'});
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleSearchInput = query => {
    setSearchQuery(query);
    performSearch(query);
  };

  const performSearch = query => {
    const formattedQuery = query.toLowerCase();
    if (formattedQuery === '') {
      setSearchResults(null);
    } else {
      const filteredResults = documents.filter(document => {
        const documentTitle = document.Title
          ? document.Title.toLowerCase()
          : '';
        return documentTitle.includes(formattedQuery);
      });
      setSearchResults(filteredResults);
    }
  };
  return (
    <View style={styles.container}>
      <NavigationHeader
        Title="Real Estate Document"
        lastImg={require('../../../assets/bellIcon.png')}
        lastImgPress={() => navigation.navigate('NotificationScreen')}
        midImg={require('../../../assets/Search.png')}
        midImgPress={() => setIsVisible(!isVisible)}
        isVisible={isVisible}
        onChangeText={e => {
          handleSearchInput(e);
        }}
        searchQuery={searchQuery}
      />

      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          {searchResults === null
            ? documents.map((document, index) => (
                <LegalDocumentCard
                  key={index}
                  Title={document.Title}
                  Price={document.Price}
                  onPress={onPress}
                  searchQuery={searchQuery}
                />
              ))
            : searchResults.map((document, index) => (
                <LegalDocumentCard
                  key={index}
                  Title={document.Title}
                  Price={document.Price}
                  onPress={onPress}
                />
              ))}
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
