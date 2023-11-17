import {ScrollView, StyleSheet, Text, View, SafeAreaView} from 'react-native';
import React, {useState, useEffect} from 'react';
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
import {useDispatch, useSelector} from 'react-redux';
import useFetchUser from '../../hooks/useFetchUser';
import {handleGetLocation} from '../../utils/Geocode';
import DropDownPicker from 'react-native-dropdown-picker';
import {Button} from '@rneui/base';

export default function RealEstateDocScreen({navigation}) {
  const documents = [
    {
      label: 'Deeds',
      name: 'Deeds',
      price: 550,
    },
    {
      label: 'Lease Agreements',
      name: 'Lease Agreements',
      price: 550,
    },
    {
      label: 'Property Easements',
      name: 'Property Easements',
      parent: 'Property Easements',
      price: 600,
    },
    {
      label: 'Mortgage Documents',
      name: 'Mortgage Documents',
      parent: 'Mortgage Documents',
      price: 600,
    },
    {
      label: 'Real Estate Contracts',
      name: 'Real Estate Contracts',
      price: 200,
    },
  ];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const dispatch = useDispatch();
  const bookingData = useSelector(state => state.booking.booking);
  const [documentArray, setDocumentArray] = useState();
  const [Limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const {fetchDocumentTypes} = useFetchUser();
  const [totalDocs, setTotalDocs] = useState();
  const [prevPage, setPrevPage] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]); // Array to store selected prices

  const DOCUMENTS_PER_LOAD = 5;
  const submitAddressDetails = async (Name, Price) => {
    setLoading(true);
    dispatch(
      setBookingInfoState({
        ...bookingData,
        documentType: {
          name: Name,
          price: Price,
        },
      }),
    );
    setLoading(false);
    navigation.navigate('MobileNotaryDateScreen');
  };
  const getState = async query => {
    const reponse = await handleGetLocation();

    const data = await fetchDocumentTypes(page, Limit, reponse, query);

    setTotalDocs(data?.totalDocs);
    setDocumentArray(data?.documentTypes);

    if (Limit < data?.totalDocs) {
      setLimit(Limit + DOCUMENTS_PER_LOAD);
    }
  };
  useEffect(() => {
    getState();
  }, []);
  const handleSearchInput = query => {
    setSearchResults(query);
    setDocumentArray();
    getState(query);
  };
  const separatedArray = value.map(item => {
    const [name, price] = item.split('_');
    return {
      name,
      price: parseInt(price, 10),
    };
  });

  const onItemsSelect = selectedValues => {
    setValue(selectedValues);

    // Map selected values to their corresponding details
    const selectedDocuments = documents.filter(doc =>
      selectedValues.includes(doc.value),
    );

    setSelectedItems(selectedDocuments);

    // Extract and store selected prices
    const prices = selectedValues.map(selectedValue => {
      const selectedDocument = documents.find(
        doc => doc.value === selectedValue,
      );
      return selectedDocument.price;
    });

    setSelectedPrices(prices);
  };

  // const handleScroll = (event, query) => {
  //   const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
  //   const isAtBottom =
  //     layoutMeasurement.height + contentOffset.y >= contentSize.height;

  //   if (isAtBottom && Limit < totalDocs) {
  //     console.log('Running at bottom');
  //     getState(searchResults);
  //   }
  // };
  // const renderItem = ({item, index}) => (
  //   <LegalDocumentCard
  //     source={require('../../../assets/legalDoc.png')}
  //     key={index}
  //     Title={item.name}
  //     Price={item.statePrices[0].price}
  //     onPress={() => submitAddressDetails(item.name, item.statePrices[0].price)}
  //   />
  // );

  // const performSearch = query => {
  //   const formattedQuery = query.toLowerCase();
  //   if (formattedQuery === '') {
  //     setSearchResults(null);
  //   } else {
  //     const filteredResults = documents.filter(document => {
  //       const documentname = document.Title ? document.Title.toLowerCase() : '';
  //       return documentTitle.includes(formattedQuery);
  //     });
  //     setSearchResults(filteredResults);
  //   }
  // };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Real Estate Document"
        midImg={require('../../../assets/Search.png')}
        midImgPress={() => setIsVisible(!isVisible)}
        isVisible={isVisible}
        onChangeText={e => {
          handleSearchInput(e);
        }}
        searchQuery={searchQuery}
      />
      <BottomSheetStyle>
        {/* <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          <ScrollView
            horizontal={true}
            contentContainerStyle={{
              marginHorizontal: widthToDp(4),
            }}> */}
        <View
          style={{
            flex: 1,
            marginTop: widthToDp(2),
            paddingHorizontal: widthToDp(2),
          }}>
          <DropDownPicker
            searchable={true}
            placeholder="Select documents"
            open={open}
            value={value}
            items={documents.map((item, index) => ({
              label: `${item.label} - $${item.price}`,
              value: `${item.name}_${item.price}`,
            }))}
            mode="SIMPLE"
            showTickIcon={true}
            min={1}
            max={documents.length}
            onChangeItem={onItemsSelect}
            setOpen={setOpen}
            setValue={setValue}
            theme="LIGHT"
            multiple={true}
            badgeDotColors={[
              '#e76f51',
              '#00b4d8',
              '#e9c46a',
              '#e76f51',
              '#8ac926',
              '#00b4d8',
              '#e9c46a',
            ]}
          />
        </View>
        {/* <View
          style={{
            width: widthToDp(90),
          }}> */}

        {/* </View> */}
        {/* </ScrollView>
        </ScrollView> */}
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
});
{
  /* {searchResults === null
            ? documents.map((item, index) => (
                <LegalDocumentCard
                  key={index}
                  source={require('../../../assets/estateDoc.png')}
                  Title={item.name}
                  Price={item.price}
                  onPress={() => {
                    navigation.navigate('MainBookingScreen', {
                      name: 'Real Estate Documents',
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
                      name: 'Real Estate Documents',
                      documentType: item,
                    });
                  }}
                />
              ))} */
}
