import {
  Image,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';

import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {handleGetLocation} from '../../utils/Geocode';
import useFetchUser from '../../hooks/useFetchUser';
// import {ScrollView} from 'react-native-virtualized-view';
import {useDispatch, useSelector} from 'react-redux';
import {setBookingInfoState} from '../../features/booking/bookingSlice';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import useRegister from '../../hooks/useRegister';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import {Xmark} from 'iconoir-react-native';

export default function RonDateDocScreen({route, navigation}) {
  // const [location, setLocation] = useState();
  // const [countryState, setCountryState] = useState();
  const dispatch = useDispatch();
  const bookingData = useSelector(state => state.booking.booking);
  // const {searchUserByEmail} = useFetchUser();
  const [documentArray, setDocumentArray] = useState();
  const [Limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const {fetchDocumentTypes, searchUserByEmail} = useFetchUser();
  const [totalDocs, setTotalDocs] = useState();
  const [prevPage, setPrevPage] = useState();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState();
  const [isVisible, setIsVisible] = useState('');
  const [date, setDate] = useState(new Date());
  const DOCUMENTS_PER_LOAD = 5;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([]);
  const [selected, setSelected] = React.useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClientData, setSelectedClientData] = useState(null);
  const [searchFor, setSearchFor] = useState('');
  const [searchedUser, setSearchedUser] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [fileResponse, setFileResponse] = useState([]);
  console.log('searchuser', selectedClient);
  const [isYes, setIsYes] = useState(true);
  const {uploadMultipleFiles} = useRegister();
  // console.log(selectedDocs);
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
    if (!isYes) {
      dispatch(
        setBookingInfoState({
          serviceType: 'ron',
          dateOfBooking: date,
          // service: null,
          // timeOfBooking: moment(date).format('h:mm A'),
          // dateOfBooking: moment(date).format('MM-DD-YYYY'),
          // agent: null,
          // documentType: docArray,
          // address: null,
          // bookedFor: {
          //   email: null,
          //   first_name: null,
          //   last_name: null,
          //   location: null,
          //   phone_number: null,
          // },
          // bookingType: 'self',
          // documents: null,
          // preferenceAnalysis: 'distance',
        }),
      );
      navigation.navigate('NearbyLoadingScreen', {serviceType: 'ron'});
    } else {
      dispatch(
        setBookingInfoState({
          serviceType: 'ron',
          // service: null,
          // timeOfBooking: moment(date).format('h:mm A'),
          // dateOfBooking: moment(date).format('MM-DD-YYYY'),
          agent: selectedClient,
          dateOfBooking: date,
          // documentType: docArray,
          // address: null,
          // bookedFor: {
          //   email: null,
          //   first_name: null,
          //   last_name: null,
          //   location: null,
          //   phone_number: null,
          // },
          // bookingType: 'self',
          // documents: null,
          // preferenceAnalysis: 'distance',
        }),
      );
      navigation.navigate('NearbyLoadingScreen', {serviceType: 'ron'});
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
  const handleDocumentSelection = async () => {
    const response = await uploadMultipleFiles();
    if (response) {
      setFileResponse(response);
    }
  };
  useEffect(() => {
    getState();
  }, []);
  const SearchUser = async query => {
    setisLoading(true);
    const response = await searchUserByEmail(query);
    setSearchedUser(response);
    setisLoading(false);
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Select Date and Time" />

      <BottomSheetStyle>
        <ScrollView
          // scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <View style={{marginVertical: heightToDp(2)}}>
            <Text style={styles.Heading}>Date & Time:</Text>
            <View style={styles.buttonFlex}>
              <TouchableOpacity onPress={() => setOpen(true)}>
                <Text
                  style={{
                    color: Colors.Orange,
                    fontFamily: 'Manrope-Bold',
                    fontSize: widthToDp(5),
                    borderWidth: 1,
                    borderColor: Colors.Orange,
                    paddingHorizontal: widthToDp(2),
                    borderRadius: widthToDp(2),
                  }}>
                  {moment(date).format('MM-DD-YYYY hh:mm A')}
                </Text>
              </TouchableOpacity>
              <DatePicker
                modal
                mode="datetime"
                minimumDate={date}
                open={open}
                date={date}
                onConfirm={date => {
                  setOpen(false);
                  setDate(date);
                }}
                onCancel={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>

          <View style={{paddingHorizontal: widthToDp(5)}}>
            <Text style={{fontFamily: 'Poppins-Regular', color: 'black'}}>
              Do you want to invite your known Agent to get your documents
              Notarised?
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TouchableOpacity
                onPress={() => setIsYes(true)}
                style={{
                  borderWidth: 1,
                  width: widthToDp(16),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 5,
                  borderColor: Colors.Orange,
                  paddingVertical: 5,
                  backgroundColor: isYes ? Colors.Orange : Colors.white,
                }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    color: isYes ? 'white' : 'black',
                  }}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsYes(false)}
                style={{
                  borderWidth: 1,
                  width: widthToDp(16),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 5,
                  borderColor: Colors.Orange,
                  paddingVertical: 5,
                  backgroundColor: !isYes ? Colors.Orange : Colors.white,
                  marginLeft: widthToDp(2),
                }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    color: !isYes ? 'white' : 'black',
                  }}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{fontFamily: 'Poppins-Bold', color: 'black'}}>
              Note:
            </Text>
            <Text style={{fontFamily: 'Poppins-Regular', color: 'black'}}>
              {isYes
                ? 'We will provide you a invite link, which you can share it with Agent or search for a registered agent on Notarizr'
                : 'We will allocate our best agent for getting your documents notarized'}
            </Text>
          </View>
          {isYes && (
            <View>
              {/* <LabelTextInput
                placeholder="Search client by email"
                defaultValue={''}
                onChangeText={text => {}}
                InputStyles={{padding: widthToDp(2)}}
                AdjustWidth={{width: widthToDp(92), borderColor: Colors.Orange}}
                rightImageSoucre={require('../../../assets/close.png')}
                rightImagePress={() => {}}
              /> */}
              <LabelTextInput
                placeholder="Search client by email"
                defaultValue={selectedClient}
                onChangeText={text => {
                  SearchUser(text);
                  setSearchFor('Agent');
                }}
                InputStyles={{padding: widthToDp(2)}}
                AdjustWidth={{width: widthToDp(92), borderColor: Colors.Orange}}
                rightImageSoucre={require('../../../assets/close.png')}
                rightImagePress={() => {
                  setSearchedUser([]);
                  setSelectedClient(null);
                }}
              />
              {selectedClientData && (
                <View
                  style={{
                    width: widthToDp(90),

                    backgroundColor: 'red',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: widthToDp(3),
                    borderRadius: widthToDp(2),
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,

                    elevation: 5,
                    marginLeft: 3,
                  }}>
                  <View style={{marginRight: 10}}>
                    <Image
                      source={{
                        uri:
                          selectedClientData.profile_picture != 'none'
                            ? selectedClientData.profile_picture
                            : 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                      }}
                      style={{
                        width: widthToDp(14),
                        height: widthToDp(14),
                        borderRadius: widthToDp(7),
                      }}
                    />
                  </View>
                  <View>
                    <Text style={{color: 'black', fontFamily: 'Poppins-Bold'}}>
                      {selectedClientData?.email}
                    </Text>
                    <Text
                      style={{color: 'black', fontFamily: 'Poppins-Regular'}}>
                      {selectedClientData.first_name}{' '}
                      {selectedClientData.last_name}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedClient(null);
                      setSelectedClientData(null);
                      setSearchedUser([]);
                    }}
                    style={{position: 'absolute', right: 5, top: 5}}>
                    <Xmark
                      width={24}
                      height={24}
                      strokeWidth={2}
                      color={Colors.Orange}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {searchFor == 'Agent' &&
              searchedUser.length !== 0 &&
              selectedClient === null ? (
                isLoading ? (
                  <ActivityIndicator
                    size="large"
                    color={Colors.Orange}
                    style={{height: heightToDp(40)}}
                  />
                ) : (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{
                      height: heightToDp(40),
                      marginBottom: widthToDp(3),
                    }}>
                    {searchedUser.map(item => (
                      <TouchableOpacity
                        key={item._id}
                        onPress={() => {
                          setSelectedClient(item.email);
                          setSelectedClientData(item);
                        }}
                        style={{
                          borderColor: Colors.Orange,
                          borderWidth: 1,
                          padding: widthToDp(1),
                          marginLeft: widthToDp(3),
                          marginBottom: widthToDp(3),
                          borderRadius: widthToDp(2),
                          width: widthToDp(88),
                        }}>
                        <Text
                          style={{
                            color: Colors.TextColor,
                            fontSize: widthToDp(4),
                          }}>
                          {item.email}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )
              ) : null}

              {documentArray && (
                <MultipSelectDropDown
                  setSelected={val => setDocumentSelected(val)}
                  data={documentArray.map(item => ({
                    value: `${item.name} - $${item.statePrices[0].price}`,
                  }))}
                  save="value"
                  label="Documents"
                  placeholder="Search for Documents"
                />
              )}
            </View>
          )}
          {/* <Text style={styles.Heading}>
            Please select the documents you want to get notarized.
          </Text> */}
          {/* <View
            style={{
              marginTop: widthToDp(2),
              paddingHorizontal: widthToDp(2),
            }}>
            {documentArray ? (
              <MultipleSelectList
                // maxHeight={heightToDp(30)}
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
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>Document</Text>
            {fileResponse?.length === 0 ? (
              <TouchableOpacity
                style={styles.dottedContianer}
                onPress={handleDocumentSelection}>
                <Image source={require('../../../assets/upload.png')} />
                <View
                  style={{
                    flexDirection: 'row',
                    columnGap: widthToDp(2),
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{color: Colors.TextColor, fontSize: widthToDp(4)}}>
                    Upload
                  </Text>
                  <Image source={require('../../../assets/uploadIcon.png')} />
                </View>
                <Text>Upload your File here...</Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  marginLeft: widthToDp(5),
                  columnGap: widthToDp(3),
                }}>
                {fileResponse?.map((item, index) => (
                  <TouchableOpacity key={index}>
                    <Image
                      source={require('../../../assets/docPic.png')}
                      style={{width: widthToDp(10), height: heightToDp(10)}}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View> */}
          {/* <View
            style={{
              borderWidth: 1,
              marginTop: widthToDp(5),

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
          </View> */}
          <View style={styles.gradientButtonContainer}>
            <GradientButton
              Title="Proceed"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                borderRadius: 15,
                marginTop: heightToDp(2),
                width: widthToDp(90),
              }}
              onPress={() => submitAddressDetails(selectedDocs)}
            />
            {isYes && <Text style={styles.text}>OR</Text>}
            <View>
              {isYes && (
                <GradientButton
                  Title="Invite Agent"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    borderRadius: 15,
                    marginTop: heightToDp(3),
                    width: widthToDp(90),
                  }}
                  onPress={() => submitAddressDetails(selectedDocs)}
                />
              )}
            </View>
          </View>
          {/* </View> */}
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
    // flex: 10,
    paddingBottom: heightToDp(8),
  },
  buttonFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: heightToDp(4),
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
  dottedContianer: {
    alignItems: 'center',
    alignSelf: 'center',
    borderStyle: 'dotted',
    borderWidth: 2,
    borderColor: Colors.DisableColor,
    borderRadius: 5,
    marginVertical: heightToDp(3),
    paddingVertical: heightToDp(2),
    width: widthToDp(80),
  },
  text: {
    color: Colors.Orange, // Assuming TextColor from your Colors file
    fontSize: 24,
    fontWeight: 'bold',
  },
  gradientButtonContainer: {
    flexDirection: 'column',
    rowGap: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
});
