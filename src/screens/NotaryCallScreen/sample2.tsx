import {
  Image,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import { height, heightToDp, width, widthToDp } from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import LegalDocumentCard from '../../components/LegalDocumentCard/LegalDocumentCard';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import ReviewPopup from '../../components/ReviewPopup/ReviewPopup';
import { handleGetLocation } from '../../utils/Geocode';
import Geolocation from '@react-native-community/geolocation';
import useFetchUser from '../../hooks/useFetchUser';
// import {ScrollView} from 'react-native-virtualized-view';
import { useDispatch, useSelector } from 'react-redux';
import { setBookingInfoState } from '../../features/booking/bookingSlice';
import DropDownPicker from 'react-native-dropdown-picker';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import Toast from 'react-native-toast-message';

export default function LegalDocScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const bookingData = useSelector(state => state.booking.booking);
  const [documentArray, setDocumentArray] = useState();
  const [Limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const { fetchDocumentTypes } = useFetchUser();
  const [totalDocs, setTotalDocs] = useState();
  const [prevPage, setPrevPage] = useState();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState();
  const [isVisible, setIsVisible] = useState('');
  const DOCUMENTS_PER_LOAD = 5;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([]);
  const [selected, setSelected] = React.useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [additionalSignatures, setAdditionalSignatures] = useState(0);
  useEffect(() => {
    // const fetchData = async () => {
    //   setLoading(true);
    //   await
    getState();
    //   setLoading(false);
    // };

    // fetchData();
  }, []);

  function createDocumentObject(array) {
    console.log('arrya', array);
    const documentObjects = array?.map(item => {
      const [name, price] = item?.split(' - $');
      return { name, price: parseFloat(price) };
    });

    const highestPriceDocument = documentObjects.reduce(
      (max, doc) => (doc.price > max.price ? doc : max),
      documentObjects[0], // Initialize with the first document if the array is not empty
    );

    console.log('Highest Price Document:', highestPriceDocument);
    setTotalPrice(highestPriceDocument?.price);
    setSelectedDocs(documentObjects);
  }
  console.log('documentarray', documentArray);
  const additionalSignaturePrice = 10;

  const calculateAdditionalSignaturesCost = additionalSignatures => {
    if (!isNaN(parseInt(additionalSignatures))) {
      return additionalSignatures * additionalSignaturePrice;
    } else {
      return 0;
    }
  };

  const totalAdditionalSignaturesCost = calculateAdditionalSignaturesCost(
    parseInt(additionalSignatures),
  );
  const totalPriceWithSignatures = totalPrice + totalAdditionalSignaturesCost;
  const handleAdditionalSignaturesChange = text => {
    const newValue = text === '' || isNaN(parseInt(text)) ? 0 : parseInt(text);
    setAdditionalSignatures(newValue);
  };

  const submitAddressDetails = async docArray => {
    setLoading(true);
    if (selectedDocs.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please select at least one document',
      });
    } else {
      dispatch(
        setBookingInfoState({
          ...bookingData,
          totalPrice: parseFloat(totalPriceWithSignatures),
          documentType: docArray,
          totalSignaturesRequired: parseInt(additionalSignatures),
        }),
      );
      navigation.navigate('MobileNotaryDateScreen');
    }
    setLoading(false);
  };
  const getState = async query => {
    setLoading(true);

    let stateName = 'USA';

    const locationResponse = await handleGetLocation();
    console.log('locationres', locationResponse);
    if (
      locationResponse &&
      locationResponse.results &&
      locationResponse.results.length > 0
    ) {
      const addressComponents = locationResponse.results[0]?.address_components;
      console.log('addresscomop;nent', addressComponents);
      if (addressComponents && addressComponents.length >= 5) {
        stateName = addressComponents[4]?.long_name || 'USA'; // Use state name if available, otherwise fallback to 'USA'
      } else {
        console.warn(
          'Address components not found or incomplete:',
          addressComponents,
        );
      }
    } else {
      console.warn('Location response invalid or empty:', locationResponse);
    }

    const data = await fetchDocumentTypes(page, Limit, stateName, query);
    const modifiedDocuments = data.documentTypes.map(doc => ({
      ...doc,
      key: doc._id,
      value: `${doc.name} - $${doc.statePrices[0].price}`, // Use _id as the unique key for each document
    }));
    setDocumentArray(modifiedDocuments);
    console.log('doumntsfdffdfd', data);
    setTotalDocs(data.totalDocs);
    setDocumentArray(modifiedDocuments);
    setLoading(false);
    if (Limit < data?.totalDocs) {
      setLimit(Limit + DOCUMENTS_PER_LOAD);
    }
  };

  const handleSearchInput = query => {
    console.log('qure', query);
    setSearchResults(query);
    setDocumentArray();
    getState(query);
  };
  const handleScroll = (event, query) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height;

    if (isAtBottom && Limit < totalDocs) {
      console.log('Running at bottom');
      getState(searchResults);
    }
  };
  const renderItem = ({ item, index }) => (
    <LegalDocumentCard
      source={require('../../../assets/legalDoc.png')}
      key={index}
      Title={item.name}
      Price={item.statePrices[0].price}
      onPress={() => submitAddressDetails(item.name, item.statePrices[0].price)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="All Documents"
      // midImg={require('../../../assets/Search.png')}
      // midImgPress={() => setIsVisible(!isVisible)}
      />

      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.selectorHeading}>
            Please select the documents you want to get notarized.
          </Text>
          <View
            style={{
              marginTop: widthToDp(2),
              paddingHorizontal: widthToDp(2),
            }}>
            {loading ? (
              <View
                style={{
                  justifyContent: 'center',
                }}>
                <ActivityIndicator size="large" color={Colors.Orange} />
              </View>
            ) : (
              <MultipleSelectList
                setSelected={val => setSelected(val)}
                data={
                  documentArray &&
                  documentArray?.map(item => ({
                    value: `${item?.name} - $${item?.statePrices[0]?.price}`,
                  }))
                }
                save="value"
                onSelect={() => createDocumentObject(selected)}
                label="Documents"
                placeholder="Search for documents"
                boxStyles={{
                  borderColor: Colors.Orange,
                  borderWidth: 2,
                  borderRadius: widthToDp(5),
                }}
                dropdownStyles={{
                  borderColor: Colors.Orange,
                  borderWidth: 2,
                  borderRadius: widthToDp(5),
                  maxHeight: widthToDp(75),
                }}
                inputStyles={{ color: Colors.TextColor }}
                badgeStyles={{ backgroundColor: Colors.Orange }}
                dropdownTextStyles={{ color: Colors.TextColor }}
                checkBoxStyles={{ tintColor: Colors.TextColor }}
                labelStyles={{
                  color: Colors.TextColor,
                  fontSize: widthToDp(4),
                }}
                badgeTextStyles={{
                  fontSize: widthToDp(3),
                }}
                notFoundText={
                  <TouchableOpacity onPress={() => console.log('No Documents Found pressed')}>
                    <Text style={{ color: Colors.TextColor }}>No Documents Found...</Text>
                  </TouchableOpacity>
                }
              />
            )}
          </View>
        </ScrollView>

        <View
          style={{
            paddingVertical: widthToDp(3),
            paddingHorizontal: widthToDp(3),
          }}>
          <Text style={styles.selectorHeading}>
            Number of Additional Signatures Required
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter number of additional signatures"
              placeholderTextColor={Colors.Placeholder}
              onChangeText={handleAdditionalSignaturesChange}
              value={additionalSignatures.toString()}
            />
          </View>
          <Text style={styles.totalPrice}>
            Total Price: ${totalPriceWithSignatures.toFixed(2)}
          </Text>
          <GradientButton
            onPress={() => submitAddressDetails(selectedDocs)}
            title="Continue"
            loading={loading}
            disabled={loading}
          />
        </View>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  contentContainer: {
    paddingVertical: widthToDp(3),
    paddingHorizontal: widthToDp(3),
  },
  selectorHeading: {
    fontSize: widthToDp(5),
    fontWeight: 'bold',
    color: Colors.TextColor,
    marginBottom: widthToDp(2),
  },
  picture: {
    height: heightToDp(40),
    width: widthToDp(80),
    resizeMode: 'contain',
  },
  subheading: {
    fontSize: widthToDp(4),
    fontWeight: 'bold',
    color: Colors.TextColor,
    textAlign: 'center',
    marginTop: widthToDp(2),
  },
  inputContainer: {
    marginVertical: widthToDp(2),
  },
  input: {
    borderColor: Colors.Orange,
    borderWidth: 1,
    borderRadius: widthToDp(2),
    padding: widthToDp(3),
    color: Colors.TextColor,
  },
  totalPrice: {
    fontSize: widthToDp(4.5),
    fontWeight: 'bold',
    color: Colors.TextColor,
    marginVertical: widthToDp(2),
  },
});

