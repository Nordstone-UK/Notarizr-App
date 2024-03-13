import {
  Image,
  StyleSheet,
  Text,
  // ScrollView,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import {
  calculateTotalPrice,
  heightToDp,
  widthToDp,
} from '../../../utils/Responsive';
import DocumentComponent from '../../../components/DocumentComponent/DocumentComponent';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import MainButton from '../../../components/MainGradientButton/MainButton';
import moment from 'moment-timezone';
import {Picker} from '@react-native-picker/picker';
import DocumentPicker, {types} from 'react-native-document-picker';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import ObserversModal from '../../../components/ModalComponent/ObserversModal';
import NavigationHeader from '../../../components/Navigation Header/NavigationHeader';
import {handleGetLocation} from '../../../utils/Geocode';
import useFetchUser from '../../../hooks/useFetchUser';
import MultipSelectDropDown from '../../../components/MultiSelectDropDown/MultipSelectDropDown';
import {ScrollView} from 'react-native-gesture-handler';
import DatePicker from 'react-native-date-picker';
import useRegister from '../../../hooks/useRegister';
import SplashScreen from 'react-native-splash-screen';
import {useSession} from '../../../hooks/useSession';
import Toast from 'react-native-toast-message';
import {CheckCircle, CheckCircleSolid, Xmark} from 'iconoir-react-native';

export default function AgentSessionInviteScreen({navigation}) {
  const [selected, setSelected] = useState('client_choose');
  const {uploadDocArray, uploadMultipleFiles} = useRegister();
  const {handleSessionCreation} = useSession();
  const [fileResponse, setFileResponse] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [visible, setVisible] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState();
  const [page, setPage] = useState(1);
  const [Limit, setLimit] = useState(10);
  const {fetchDocumentTypes} = useFetchUser();
  const {searchUserByEmail} = useFetchUser();
  const [documentArray, setDocumentArray] = useState();
  const [totalDocs, setTotalDocs] = useState();
  const DOCUMENTS_PER_LOAD = 5;
  const [documentSelect, setDocumentSelected] = useState([]);
  const [searchedUser, setSearchedUser] = useState([]);
  const [observerEmail, setObserverEmail] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedDocs, setSelectedDocs] = useState([]);

  const [selectedClientData, setSelectedClientData] = useState(null);

  const [observers, setObservers] = useState([]);

  const [searchFor, setSearchFor] = useState('');
  const [showObserverSearchView, setShowObserverSearchView] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('on_noarizr');
  let urlResponse;
  useEffect(() => {
    SplashScreen.hide();
    getState();
  }, []);
  const addTextToArray = text => {
    setObserverEmail(prevs => [...prevs, text]);
  };
  const removeItem = index => {
    const updatedList = [...observerEmail];
    updatedList.splice(index, 1);
    setObserverEmail(updatedList);
  };
  const handleDocumentSelection = async () => {
    const response = await uploadMultipleFiles();
    if (response) {
      setFileResponse(response);
    }
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
  const SearchUser = async query => {
    setisLoading(true);
    const response = await searchUserByEmail(query);
    setSearchedUser(response);
    setisLoading(false);
  };

  const printEverything = async () => {
    setLoading(true);
    // console.log(
    //   'workingggg',
    //   urlResponse,
    //   selectedClient,
    //   'schedule_later',
    //   date.toString(),
    //   selected,
    //   observerEmail,
    //   totalPrice,
    //   fileResponse,
    //   documentSelect,
    //   paymentMethod,
    //   observers,
    //   //  documentObjects,
    // );

    if (
      fileResponse.length !== 0 &&
      selectedClient &&
      observers.length !== 0
      // documentSelect.length !== 0
    ) {
      let urlResponse;
      if (fileResponse) {
        urlResponse = await uploadDocArray(fileResponse);
      }

      console.log('urlResponse', urlResponse);
      const documentObjects = documentSelect.map(item => {
        const [name, price] = item.split(' - $');
        return {name, price: parseFloat(price)};
      });

      const response = await handleSessionCreation(
        urlResponse,
        selectedClient,
        'schedule_later',
        date.toString(),
        selected,
        observers.map(item => item.email),
        totalPrice,
        documentObjects,
        paymentMethod,
      );

      console.log('response', response);
      if (response === '200') {
        navigation.navigate('SessionCreation');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Something went wrong',
        });
      }
      setLoading(false);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all the fields',
      });
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Invite Signer" />
      <BottomSheetStyle>
        <ScrollView
          // scrollEnabled={true}
          nestedScrollEnabled={true}
          contentContainerStyle={{
            marginHorizontal: widthToDp(3),
          }}>
          <LabelTextInput
            placeholder="Search client by email"
            defaultValue={selectedClient}
            onChangeText={text => {
              SearchUser(text);
              setSearchFor('Client');
            }}
            InputStyles={{padding: widthToDp(2)}}
            AdjustWidth={{width: widthToDp(92), borderColor: Colors.Orange}}
            rightImageSoucre={require('../../../../assets/close.png')}
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
                <Text style={{color: 'black', fontFamily: 'Poppins-Regular'}}>
                  {selectedClientData.first_name} {selectedClientData.last_name}
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

          {searchFor == 'Client' &&
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
                style={{height: heightToDp(40), marginBottom: widthToDp(3)}}>
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

          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>Observers</Text>
            <Text style={styles.lightHeading}>
              An Observer is anyone with relevant information for all the
              signing that may need to be on the notarization session.
            </Text>

            <LabelTextInput
              placeholder="Search observer by email"
              defaultValue={''}
              onChangeText={text => {
                SearchUser(text);
                setSearchFor('Observer');
                setShowObserverSearchView(true);
              }}
              InputStyles={{padding: widthToDp(2)}}
              AdjustWidth={{width: widthToDp(92), borderColor: Colors.Orange}}
              rightImageSoucre={require('../../../../assets/close.png')}
              rightImagePress={() => {
                setSearchedUser([]);
              }}
            />

            {observers.length > 0 && (
              <View>
                {observers.map(item => {
                  return (
                    <View
                      style={{
                        width: widthToDp(90),
                        marginTop: 10,

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
                              item.profile_picture != 'none'
                                ? item.profile_picture
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
                        <Text
                          style={{color: 'black', fontFamily: 'Poppins-Bold'}}>
                          {item?.email}
                        </Text>
                        <Text
                          style={{
                            color: 'black',
                            fontFamily: 'Poppins-Regular',
                          }}>
                          {item.first_name} {item.last_name}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setObservers(
                            observers.filter(i => i._id !== item._id),
                          );
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
                  );
                })}
              </View>
            )}

            {showObserverSearchView &&
            searchFor == 'Observer' &&
            searchedUser.length !== 0 ? (
              isLoading ? (
                <ActivityIndicator
                  size="large"
                  color={Colors.Orange}
                  style={{height: heightToDp(40)}}
                />
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{height: heightToDp(40), marginBottom: widthToDp(3)}}>
                  {searchedUser.map(item => (
                    <TouchableOpacity
                      key={item._id}
                      onPress={() => {
                        setObservers(prev => [...prev, item]);
                        setShowObserverSearchView(false);
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
            {/* <View
              style={{
                marginTop: heightToDp(3),
                marginHorizontal: widthToDp(2),
                alignSelf: 'flex-start',
              }}>
              <MainButton
                Title="Add Observer"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => setVisible(true)}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: widthToDp(4),
                columnGap: widthToDp(2),
                rowGap: heightToDp(2),
                marginHorizontal: widthToDp(3),
              }}>
              {observerEmail.map((entry, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => props.removeItem(index)}
                  style={{
                    padding: widthToDp(1.5),
                    borderRadius: 5,
                    backgroundColor: Colors.Orange,
                  }}>
                  <Text style={{color: Colors.white, fontSize: widthToDp(4)}}>
                    {entry}
                  </Text>
                </TouchableOpacity>
              ))}
            </View> */}
          </View>
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>
              Type of identity Authentication for Session
            </Text>
            <View style={styles.buttonBottom}>
              <MainButton
                Title="Allow user to choose"
                colors={
                  selected === 'client_choose'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => setSelected('client_choose')}
              />
              <MainButton
                Title="ID Card"
                colors={
                  selected === 'user_id'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => setSelected('user_id')}
              />
              <MainButton
                Title="Passport"
                colors={
                  selected === 'user_passport'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => setSelected('user_passport')}
              />
            </View>
          </View>
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>Session Schedule</Text>
          </View>
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
              minimumDate={new Date()}
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

          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>Payment Info</Text>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setPaymentMethod('on_agent');
                  }}>
                  {paymentMethod == 'on_agent' ? (
                    <CheckCircleSolid
                      width={24}
                      height={24}
                      strokeWidth={2}
                      color={Colors.Orange}
                    />
                  ) : (
                    <CheckCircle
                      width={24}
                      height={24}
                      strokeWidth={2}
                      color={'gray'}
                    />
                  )}
                </TouchableOpacity>
                <Text style={{color: 'black', marginLeft: 10}}>
                  Invoice the client on your own{' '}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setPaymentMethod('on_noarizr');
                  }}>
                  {paymentMethod == 'on_noarizr' ? (
                    <CheckCircleSolid
                      width={24}
                      height={24}
                      strokeWidth={2}
                      color={Colors.Orange}
                    />
                  ) : (
                    <CheckCircle
                      width={24}
                      height={24}
                      strokeWidth={2}
                      color={'gray'}
                    />
                  )}
                </TouchableOpacity>
                <Text style={{color: 'black', marginLeft: 10}}>
                  Invoice the on client Notarizr{' '}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>Document</Text>
            {fileResponse?.length === 0 ? (
              <TouchableOpacity
                style={styles.dottedContianer}
                onPress={handleDocumentSelection}>
                <Image source={require('../../../../assets/upload.png')} />
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
                  <Image
                    source={require('../../../../assets/uploadIcon.png')}
                  />
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
                      source={require('../../../../assets/docPic.png')}
                      style={{width: widthToDp(10), height: heightToDp(10)}}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={{marginBottom: widthToDp(5)}}>
            <GradientButton
              Title="Send Invitation"
              loading={loading}
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              // onPress={() => navigation.navigate('WaitingRoomScreen')}
              onPress={() => printEverything()}
            />
          </View>
        </ScrollView>
      </BottomSheetStyle>
      <ObserversModal
        modalVisible={visible}
        setModalVisible={bool => setVisible(bool)}
        onAdd={text => addTextToArray(text)}
        email={observerEmail}
        removeItem={removeItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  con: {
    justifyContent: 'center',
  },
  picker: {
    width: widthToDp(60),
    marginTop: heightToDp(5),
    borderWidth: 2,
    borderColor: Colors.Orange,
  },
  buttonFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: heightToDp(5),
  },
  lightHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-SemiBold',
  },
  picker: {
    borderWidth: 2,
    borderColor: Colors.DisableColor,
    width: widthToDp(90),
    marginVertical: widthToDp(5),
    borderRadius: 15,
  },
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginHorizontal: widthToDp(3),
  },
  lightHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(3.5),
    fontFamily: 'Manrope-Regular',
    marginHorizontal: widthToDp(3),
  },
  headingContainer: {
    marginVertical: widthToDp(5),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(2),
  },
  insideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightToDp(2),
    marginHorizontal: widthToDp(5),
  },
  flexContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightToDp(2),
  },
  iconContainer: {
    alignContent: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  insideText: {
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
  },
  greenIcon: {
    width: widthToDp(5),
    height: heightToDp(5),
  },
  preference: {
    marginVertical: widthToDp(1),
    fontSize: widthToDp(4),
    color: Colors.DullTextColor,
  },
  detail: {
    marginVertical: widthToDp(2),
    fontSize: widthToDp(4),
    color: Colors.DullTextColor,
  },
  sheetContainer: {},
  locationImage: {
    tintColor: Colors.DullTextColor,
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonBottom: {
    flexDirection: 'row',
    marginTop: heightToDp(3),
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
    rowGap: widthToDp(2),
    columnGap: heightToDp(1),
    marginHorizontal: widthToDp(2),
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
});
{
  /* <SingleSelectDropDown
              setSelected={val => setDocumentSelected(val)}
              data={searchedUser.map(item => ({
                value: item.email,
              }))}
              save="value"
              label="Documents"
              placeholder="Search for Documents"
            /> */
}
{
  /* <DocumentDropDown
              placeholder={'Search Client by Email'}
              multiple={false}
              documentData={searchedUser}
              SearchUser={SearchUser}
            /> */
}
//  <View style={{flex: 1, justifyContent: 'center'}}>
//    <Picker
//      selectedValue={selectedCategory}
//      onValueChange={itemValue => {
//        setSelectedCategory(itemValue);
//        setSelectedDocument(null);
//      }}
//      style={{
//        borderWidth: 5,
//        borderColor: 'orange',
//        marginBottom: 20,
//      }}>
//      <Picker.Item label="Select Category" value={null} />
//      {categoriesData.map(category => (
//        <Picker.Item
//          key={category._id}
//          label={category.name}
//          value={category.name}
//        />
//      ))}
//    </Picker>

//    {selectedCategoryData && (
//      <Picker
//        selectedValue={selectedDocument}
//        style={{borderWidth: 2, borderColor: 'orange'}}
//        onValueChange={itemValue => setSelectedDocument(itemValue)}>
//        <Picker.Item label="Select Document" value={null} />
//        {selectedCategoryData.document.map(document => (
//          <Picker.Item
//            key={document._id}
//            label={document.name}
//            value={document.name}
//          />
//        ))}
//      </Picker>
//    )}
//  </View>;
{
  /* <View style={styles.buttonBottom}>
              <MainButton
                Title="Notarize Now"
                colors={
                  session === 'Notarize Now'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => handleNotarizeNow()}
              />
              <MainButton
                Title="Schedule for Later"
                colors={
                  session === 'Schedule for Later'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => handleSchedule()}
              />
            </View> */
}
