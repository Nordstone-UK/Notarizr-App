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

export default function BusinessDocScreen({route, navigation}) {
  const documents = [
    {
      name: 'Articles of Incorporation',
      price: 500,
    },
    {
      name: 'Corporate Bylaws',
      price: 550,
    },
    {
      name: 'Operating Agreements',
      price: 600,
    },
    {
      name: 'Partnership Agreements',
      price: 600,
    },
    {
      name: 'Commercial Leases',
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
        Title="Business Document"
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
            ? documents.map((item, index) => (
                <LegalDocumentCard
                  key={index}
                  Title={item.name}
                  Price={item.price}
                  source={require('../../../assets/businessDoc.jpg')}
                  onPress={() => {
                    navigation.navigate('MainBookingScreen', {
                      name: 'Business Documents',
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
                      name: 'Business Documents',
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
