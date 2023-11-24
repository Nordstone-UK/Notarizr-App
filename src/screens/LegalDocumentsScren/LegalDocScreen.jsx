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

export default function LegalDocScreen({route, navigation}) {
  const dispatch = useDispatch();
  const bookingData = useSelector(state => state.booking.booking);
  const [documentArray, setDocumentArray] = useState();
  const [Limit, setLimit] = useState(50);
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
  function calculateTotalPrice(documentObjects) {
    return documentObjects.reduce(
      (total, document) => total + document.price,
      0,
    );
  }
  function createDocumentObject(array) {
    const documentObjects = array.map(item => {
      const [name, price] = item.split(' - $');
      return {name, price: parseFloat(price)};
    });
    const totalPrice = calculateTotalPrice(documentObjects);
    setTotalPrice(totalPrice);
    setSelectedDocs(documentObjects);
  }
  const submitAddressDetails = async docArray => {
    setLoading(true);
    if (selectedDocs.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please select atleast one document',
      });
    } else {
      dispatch(
        setBookingInfoState({
          ...bookingData,
          documentType: docArray,
        }),
      );
      navigation.navigate('MobileNotaryDateScreen');
    }
    setLoading(false);
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
        Title="All Documents"
        // midImg={require('../../../assets/Search.png')}
        // midImgPress={() => setIsVisible(!isVisible)}
      />

      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.Heading}>
            Please select the documents you want to get notarized.
          </Text>
          <View
            style={{
              marginTop: widthToDp(2),
              paddingHorizontal: widthToDp(2),
            }}>
            {documentArray ? (
              <MultipleSelectList
                setSelected={val => setSelected(val)}
                data={documentArray.map(item => ({
                  value: `${item.name} - $${item.statePrices[0].price}`,
                }))}
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
                labelStyles={{color: Colors.TextColor, fontSize: widthToDp(4)}}
                badgeTextStyles={{
                  fontSize: widthToDp(3.2),
                  color: Colors.white,
                  fontFamily: 'Manrope-SemiBold',
                }}
              />
            ) : (
              <View
                style={{
                  justifyContent: 'center',
                }}>
                <ActivityIndicator size="large" color={Colors.Orange} />
              </View>
            )}
          </View>
          <View
            style={{
              marginVertical: widthToDp(15),
            }}>
            <View
              style={{
                borderWidth: 1,
                marginVertical: widthToDp(2),
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: widthToDp(2),
              }}>
              <Text style={styles.Heading}>Total Price:</Text>
              <Text style={styles.Heading}>${totalPrice}</Text>
            </View>
            <GradientButton
              Title="Proceed"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{borderRadius: 15}}
              onPress={() => submitAddressDetails(selectedDocs)}
            />
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
    flex: 1,
    marginVertical: heightToDp(3),
  },
  Heading: {
    fontSize: widthToDp(6),
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
});

{
  /* {documentArray ? (
            documentArray.length !== 0 ? (
              <FlatList
                data={documentArray}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  height: heightToDp(100),
                  justifyContent: 'center',
                }}>
                <Image
                  source={require('../../../assets/emptyBox.png')}
                  style={styles.picture}
                />
                <Text style={styles.subheading}>No Documents Found...</Text>
              </View>
            )
          ) : (
            <View
              style={{
                // borderWidth: 1,
                height: heightToDp(100),
                justifyContent: 'center',
              }}>
              <ActivityIndicator size="large" color={Colors.Orange} />
            </View>
          )} */
}
