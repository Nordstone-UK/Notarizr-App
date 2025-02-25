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
import React, {useEffect, useState} from 'react';
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
import {handleGetLocation} from '../../utils/Geocode';
import Geolocation from '@react-native-community/geolocation';
import useFetchUser from '../../hooks/useFetchUser';
// import {ScrollView} from 'react-native-virtualized-view';
import {useDispatch, useSelector} from 'react-redux';
import {setBookingInfoState} from '../../features/booking/bookingSlice';
import DropDownPicker from 'react-native-dropdown-picker';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import Toast from 'react-native-toast-message';
import {color} from '@rneui/base';

export default function NotarizrDocScreen({route, navigation}) {
  const {address} = route.params;

  const dispatch = useDispatch();
  const bookingData = useSelector(state => state.booking.booking);
  const [documentArray, setDocumentArray] = useState();
  const [Limit, setLimit] = useState(2000);
  const [page, setPage] = useState(1);
  const {fetchDocumentTypes} = useFetchUser();
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
  console.log('boookingdatea', bookingData?.address);
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
    if (!array || !Array.isArray(array) || array.length === 0) {
      console.log('Array is undefined, null, or empty');

      return;
    }
    console.log('arrya', array);
    const documentObjects = array?.map(item => {
      const [name, price] = item?.split(' - $');
      return {name, price: parseFloat(price)};
    });
    if (!documentObjects || documentObjects.length === 0) {
      console.log('No documents found');
      // setTotalPrice(0);
      // setSelectedDocs([]);
      return;
    }

    const highestPriceDocument =
      Array.isArray(documentObjects) && documentObjects.length > 0
        ? documentObjects.reduce(
            (max, doc) => (doc.price > max.price ? doc : max),
            documentObjects[0],
          )
        : null;

    console.log('Highest Price Document:', highestPriceDocument);
    setTotalPrice(highestPriceDocument?.price);
    setSelectedDocs(documentObjects);
  }
  // console.log('documentarray', documentArray);
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
      navigation.navigate('LegalDocScreen', {address: address});
    }
    setLoading(false);
  };
  const getState = async query => {
    const state = extractState(address);
    console.log('ssssssssssssssssssssssss', state);
    setLoading(true);

    let stateName = 'USA';
    stateName = state;
    const locationResponse = await handleGetLocation();
    if (
      locationResponse &&
      locationResponse.results &&
      locationResponse.results.length > 0
    ) {
      const addressComponents = locationResponse.results[0]?.address_components;
      console.log('addresscomop;nent', addressComponents);
      if (addressComponents && addressComponents.length >= 5) {
        stateName = state || addressComponents[4]?.long_name || 'USA';
        console.log('statenamere', stateName);
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
    console.log('doumntsfdffdfd', modifiedDocuments);
    setTotalDocs(data.totalDocs);
    setDocumentArray(modifiedDocuments);
    setLoading(false);
    if (Limit < data?.totalDocs) {
      setLimit(Limit + DOCUMENTS_PER_LOAD);
    }
  };
  function extractState(address) {
    if (!address) {
      console.warn('Address is undefined or null:', address);
      return null; // or return a default state if applicable
    }

    const parts = address.split(' ');
    if (parts.length >= 2) {
      const state = parts[parts.length - 2];
      console.log('ststere===========', state);
      return state;
    } else {
      return parts[0].trim();
    }
    return null;
  }

  const handleSearchInput = query => {
    console.log('qure', query);
    setSearchResults(query);
    setDocumentArray();
    getState(query);
  };
  const handleScroll = (event, query) => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height;

    if (isAtBottom && Limit < totalDocs) {
      console.log('Running at bottom');
      getState(searchResults);
    }
  };
  const renderItem = ({item, index}) => (
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
        Title="Notarize Documents"
        // midImg={require('../../../assets/Search.png')}
        // midImgPress={() => setIsVisible(!isVisible)}
      />

      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag">
          <Text style={styles.selectorHeading}>
            Select documents to notarize.
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
                inputStyles={{color: Colors.TextColor}}
                badgeStyles={{backgroundColor: Colors.Orange}}
                dropdownTextStyles={{color: Colors.TextColor}}
                checkBoxStyles={{tintColor: Colors.TextColor}}
                labelStyles={{
                  color: Colors.TextColor,
                  fontSize: widthToDp(4),
                }}
                badgeTextStyles={{
                  fontSize: widthToDp(3.2),
                  color: Colors.white,
                  fontFamily: 'Manrope-SemiBold',
                }}
                notFoundText={
                  <TouchableOpacity
                    onPress={() => console.log('No Documents Found pressed')}>
                    <Text style={{color: Colors.TextColor}}>
                      No Documents Found...
                    </Text>
                  </TouchableOpacity>
                }
              />
            )}
          </View>
          <View
            style={{
              marginVertical: widthToDp(15),
            }}>
            {additionalSignatures >= 1 && (
              <View style={styles.dashedContainer}>
                <Text
                  style={{
                    color: Colors.TextColor,
                    fontFamily: 'Manrope-Bold',
                    fontSize: widthToDp(4),
                  }}>
                  Note:
                </Text>
                <Text
                  style={{
                    color: Colors.TextColor,
                    fontFamily: 'Manrope-Regular',
                    fontSize: widthToDp(3.5),
                  }}>
                  Any additional signature will be
                  <Text style={{fontFamily: 'Manrope-Bold'}}> +$10 </Text>.
                </Text>
              </View>
            )}
            {/* <View
              style={{
                borderWidth: 1,
                marginVertical: widthToDp(2),
              }}
            /> */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: widthToDp(2),
              }}>
              <Text style={styles.Heading1}>Total: </Text>
              <Text style={styles.Heading1}>${totalPrice}</Text>
            </View>
            {additionalSignatures ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: widthToDp(2),
                }}>
                <Text style={styles.Heading1}>Additional signatures cost:</Text>
                <Text style={styles.Heading1}>
                  ${totalAdditionalSignaturesCost}
                </Text>
              </View>
            ) : null}

            <GradientButton
              Title="Proceed"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{borderRadius: 15}}
              onPress={() => submitAddressDetails(selectedDocs)}
            />
            {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: widthToDp(2),
              }}>
              <Text style={styles.Heading}>Total:</Text>
              <Text style={styles.Heading}>${totalPriceWithSignatures}</Text>
            </View> */}
          </View>
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
    // flex: 1,
    marginVertical: heightToDp(3),
  },
  selectorHeading: {
    fontSize: widthToDp(5),
    // fontWeight: '700',
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(2),
  },
  Heading: {
    fontSize: widthToDp(5),
    fontWeight: '700',
    // fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(2),
  },
  Heading1: {
    fontSize: widthToDp(4),
    fontWeight: '700',
    color: Colors.TextColor,
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(2),
  },
  subheading: {
    fontSize: widthToDp(4),
    fontWeight: '700',
    color: Colors.TextColor,
    alignSelf: 'center',
  },
  picture: {
    width: widthToDp(20),
    height: heightToDp(20),
  },
  smalltext: {
    color: Colors.TextColor,
    width: widthToDp(70),
  },
  input: {
    paddingHorizontal: widthToDp(2),
    paddingVertical: heightToDp(2),
    width: widthToDp(15),
    height: heightToDp(10),
    borderColor: Colors.Orange,
    borderWidth: 1,
    borderRadius: widthToDp(3),
    textAlign: 'center',
    marginHorizontal: 10,
    color: 'black',
  },
  browseButton: {
    marginTop: heightToDp(2),
    backgroundColor: Colors.Orange,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    width: '70%',
  },
  browseButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },

  dashedContainer: {
    marginHorizontal: widthToDp(5),
    borderWidth: 3,
    borderColor: Colors.DullTextColor,
    borderStyle: 'dashed',
    backgroundColor: Colors.PinkBackground,
    borderRadius: 10,
    padding: widthToDp(2),
    marginTop: 10,
  },
  signatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  button: {
    width: 40,
    height: 40,
    backgroundColor: Colors.Orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
