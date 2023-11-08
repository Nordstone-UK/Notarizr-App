import {
  Image,
  StyleSheet,
  Text,
  // ScrollView,
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
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
import {
  callGeocodingAPI,
  getLocation,
  handleGetLocation,
} from '../../utils/Geocode';
import Geolocation from '@react-native-community/geolocation';
import useFetchUser from '../../hooks/useFetchUser';
import {ScrollView} from 'react-native-virtualized-view';
import {useDispatch, useSelector} from 'react-redux';
import {setBookingInfoState} from '../../features/booking/bookingSlice';

export default function LegalDocScreen({route, navigation}) {
  // const [location, setLocation] = useState();
  // const [countryState, setCountryState] = useState();
  const dispatch = useDispatch();
  const bookingData = useSelector(state => state.booking.booking);
  const [documentArray, setDocumentArray] = useState();
  const [Limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const {fetchDocumentTypes} = useFetchUser();
  const [totalDocs, setTotalDocs] = useState();
  const [prevPage, setPrevPage] = useState();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState();
  const [isVisible, setIsVisible] = useState('');
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

    // console.log('====================================');
    // console.log('API called', Limit, data?.totalDocs);
    // console.log('====================================');
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
        lastImg={require('../../../assets/bellIcon.png')}
        lastImgPress={() => navigation.navigate('NotificationScreen')}
        midImg={require('../../../assets/Search.png')}
        midImgPress={() => setIsVisible(!isVisible)}
        isVisible={isVisible}
        onChangeText={e => {
          handleSearchInput(e);
        }}
      />

      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.Heading}>
            Please select the documents you want to get notarized.
          </Text>
          {documentArray ? (
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
          )}
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
