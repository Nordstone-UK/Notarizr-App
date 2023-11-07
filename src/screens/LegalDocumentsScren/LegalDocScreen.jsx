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

export default function LegalDocScreen({route, navigation}) {
  const documents = [
    {
      name: 'Affidavit',
      price: 500,
    },
    {
      name: 'Last Will and Testament',
      price: 550,
    },
    {
      name: 'Power of Attorney',
      price: 600,
    },
    {
      name: 'Sworn Statements',
      price: 600,
    },
    {
      name: 'Court Documents',
      price: 200,
    },
    {
      name: 'Power of Attorney',
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
      name: 'HIPAA  Form',
      price: 600,
    },
    {
      name: 'Medical Consent Form',
      price: 200,
    },
    {
      name: 'Deeds',
      price: 500,
    },
    {
      name: 'Lease Agreements',
      price: 550,
    },
    {
      name: 'Property Easements',
      price: 600,
    },
    {
      name: 'Mortgage Documents',
      price: 600,
    },
    {
      name: 'Real Estate Contracts',
      price: 200,
    },
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
        Title="All Documents"
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
          <Text style={styles.Heading}>
            Please select the documents you want to get notarized.
          </Text>
          {searchResults === null
            ? documents.map((item, index) => (
                <LegalDocumentCard
                  source={require('../../../assets/legalDoc.png')}
                  key={index}
                  Title={item.name}
                  Price={item.price}
                  onPress={() => {
                    navigation.navigate('MobileNotaryDateScreen');
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
                    navigation.navigate('MobileNotaryDateScreen');
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
  contentContainer: {
    marginVertical: heightToDp(3),
  },
  Heading: {
    fontSize: widthToDp(6),
    fontWeight: '700',
    color: Colors.TextColor,
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(2),
  },
});
