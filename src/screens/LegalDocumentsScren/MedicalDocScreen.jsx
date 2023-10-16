import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  View,
} from 'react-native';
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
import ReviewPopup from '../../components/ReviewPopup/ReviewPopup';

export default function MedicalDocScreen({route, navigation}) {
  const documents = [
    {
      name: 'Medical Power of Attorney',
      price: 500,
    },
    {
      name: 'Living Will',
      price: 550,
    },
    {
      name: 'Healthcare Directive',
      price: 600,
    },
    {
      name: 'HIPAA Authorization Form',
      price: 600,
    },
    {
      name: 'Medical Consent Form',
      price: 200,
    },
  ];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isVisible, setIsVisible] = useState('');
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
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Medical Document"
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
          contentContainerStyle={styles.contentContainer}>
          {searchResults === null
            ? documents.map((item, index) => (
                <LegalDocumentCard
                  key={index}
                  Title={item.name}
                  Price={item.price}
                  onPress={() => {
                    navigation.navigate('MainBookingScreen', {
                      name: 'Medical Documents',
                      documentType: item,
                    });
                  }}
                  searchQuery={searchQuery}
                />
              ))
            : searchResults.map((item, index) => (
                <LegalDocumentCard
                  key={index}
                  Title={item.name}
                  Price={item.price}
                  onPress={() => {
                    navigation.navigate('MainBookingScreen', {
                      name: 'Medical Documents',
                      documentType: item,
                    });
                  }}
                />
              ))}
        </ScrollView>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
});
