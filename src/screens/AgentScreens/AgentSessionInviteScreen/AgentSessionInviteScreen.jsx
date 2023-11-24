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
import {heightToDp, widthToDp} from '../../../utils/Responsive';
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

export default function AgentSessionInviteScreen({navigation}) {
  const [selected, setSelected] = useState('Allow user to choose');
  const [session, setSession] = useState('Let Signer Choose');
  const [fileResponse, setFileResponse] = useState([]);
  const [currentDate, setCurrentDate] = useState();
  const [visible, setVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedDocument, setSelectedDocument] = useState();
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
  useEffect(() => {
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
  const categoriesData = [
    {
      _id: '650c6794d57205424f7a614c',
      name: 'Non-legal Documents',
      status: 'active',
      document: [],
      createdAt: '2023-09-21T15:56:04.826Z',
      updatedAt: '2023-09-21T16:24:15.889Z',
    },
    {
      _id: '651ede7d6ab4a249f610ffe9',
      name: 'Business Documents',
      status: 'active',
      document: [
        {
          _id: '652ea91edc12d33d1e9bd7d5',
          name: 'Liquidity Documents',
          price: null,
          image: '',
          createdAt: '2023-10-17T15:32:46.321Z',
          updatedAt: '2023-10-17T15:32:46.321Z',
          statePrices: [],
        },
      ],
      createdAt: '2023-10-05T16:04:13.483Z',
      updatedAt: '2023-10-17T15:32:46.336Z',
    },
    {
      _id: '651ede9e6ab4a249f610fffd',
      name: 'Real Estate Documents',
      status: 'active',
      document: [],
      createdAt: '2023-10-05T16:04:46.824Z',
      updatedAt: '2023-10-05T16:05:25.254Z',
    },
    {
      _id: '651edeab6ab4a249f6110005',
      name: 'Medical Documents',
      status: 'active',
      document: [],
      createdAt: '2023-10-05T16:04:59.215Z',
      updatedAt: '2023-10-05T16:05:25.339Z',
    },
    {
      _id: '651edebe6ab4a249f611000d',
      name: 'Legal Documents',
      status: 'active',
      document: [],
      createdAt: '2023-10-05T16:05:18.753Z',
      updatedAt: '2023-10-05T16:05:25.693Z',
    },
    {
      _id: '65203a1d34ca6d905bb60c7c',
      name: 'Affiliate Documents',
      status: 'active',
      document: [
        {
          _id: '65242e67d9bff38ab0a83aaa',
          name: 'Health documents',
          price: null,
          image: 'image/',
          createdAt: null,
          updatedAt: null,
          statePrices: [],
        },
        {
          _id: '6528298f7d558ecff4eaa737',
          name: 'New Docs 2',
          price: null,
          image: '',
          createdAt: '2023-10-12T17:14:55.147Z',
          updatedAt: '2023-10-12T17:14:55.147Z',
          statePrices: [],
        },
        {
          _id: '652829957d558ecff4eaa73a',
          name: 'New Docs 2',
          price: null,
          image: '',
          createdAt: '2023-10-12T17:15:01.158Z',
          updatedAt: '2023-10-12T17:15:01.158Z',
          statePrices: [],
        },
        {
          _id: '652829dc7d558ecff4eaa746',
          name: 'Test 001',
          price: null,
          image: '',
          createdAt: '2023-10-12T17:16:12.347Z',
          updatedAt: '2023-10-12T17:16:12.347Z',
          statePrices: [],
        },
        {
          _id: '65282a347d558ecff4eaa749',
          name: 'Technical Documents',
          price: null,
          image: '',
          createdAt: '2023-10-12T17:17:40.890Z',
          updatedAt: '2023-10-12T17:17:40.890Z',
          statePrices: [],
        },
        {
          _id: '65282a7b7d558ecff4eaa74c',
          name: 'Technical Documents',
          price: null,
          image: '',
          createdAt: '2023-10-12T17:18:51.526Z',
          updatedAt: '2023-10-12T17:18:51.526Z',
          statePrices: [],
        },
        {
          _id: '65282b057d558ecff4eaa755',
          name: 'New Docs',
          price: null,
          image: '',
          createdAt: '2023-10-12T17:21:09.005Z',
          updatedAt: '2023-10-12T17:21:09.005Z',
          statePrices: [],
        },
        {
          _id: '65282b197d558ecff4eaa759',
          name: 'Docssss',
          price: null,
          image: '',
          createdAt: '2023-10-12T17:21:29.940Z',
          updatedAt: '2023-10-12T17:21:29.940Z',
          statePrices: [],
        },
      ],
      createdAt: '2023-10-06T16:47:25.251Z',
      updatedAt: '2023-10-12T17:57:24.797Z',
    },
    {
      _id: '65258592781d7a0cfcb8d9a4',
      name: 'Immigration Documents',
      status: 'active',
      document: [
        {
          _id: '652ff97b8834bf181d71ea35',
          name: 'Child Support',
          price: null,
          image: '',
          createdAt: '2023-10-18T15:27:55.533Z',
          updatedAt: '2023-10-18T17:09:30.477Z',
          statePrices: [
            {
              state: 'California',
              price: 23,
            },
            {
              state: 'Connecticut',
              price: 43,
            },
            {
              state: 'Arkansas',
              price: 90,
            },
            {
              state: 'Oklahoma',
              price: 100,
            },
            {
              state: 'Washington',
              price: 132,
            },
          ],
        },
        {
          _id: '652ffcc18834bf181d71ea59',
          name: 'Affidavit',
          price: null,
          image: '',
          createdAt: '2023-10-18T15:41:53.129Z',
          updatedAt: '2023-10-18T15:41:53.129Z',
          statePrices: [
            {
              state: 'Arizona',
              price: 323,
            },
            {
              state: 'California',
              price: 323,
            },
            {
              state: 'Florida',
              price: 545,
            },
          ],
        },
        {
          _id: '652fff258834bf181d71ea69',
          name: 'Annuity Doc',
          price: null,
          image: '',
          createdAt: '2023-10-18T15:52:05.757Z',
          updatedAt: '2023-10-18T15:52:05.757Z',
          statePrices: [
            {
              state: 'Florida',
              price: 234,
            },
            {
              state: 'California',
              price: 3254,
            },
            {
              state: 'Louisiana',
              price: 323,
            },
            {
              state: 'Hawaii',
              price: 434,
            },
            {
              state: 'Arizona',
              price: 435,
            },
          ],
        },
      ],
      createdAt: '2023-10-10T17:10:42.269Z',
      updatedAt: '2023-10-18T15:52:05.962Z',
    },
  ];
  const selectedCategoryData = categoriesData.find(
    category => category.name === selectedCategory,
  );
  const handleDocumentSelection = useCallback(async () => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        allowMultiSelection: true,
      });
      setFileResponse(response);
    } catch (err) {
      console.warn(err);
    }
  }, []);
  function add15MinutesAndFormat() {
    const currentTime = moment();
    const updatedTime = currentTime.add(15, 'minutes');
    const formattedTime = updatedTime.format('h:mm A / DD-MMM-YYYY');
    setCurrentDate(formattedTime);
  }
  const handleNotarizeNow = () => {
    setSession('Notarize Now');
    add15MinutesAndFormat();
  };
  const handleSchedule = () => {
    setCurrentDate('');
    setSession('Schedule for Later');
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
    console.log('====================================');
    console.log(response);
    console.log('====================================');
    setSearchedUser(response);
    setisLoading(false);
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
            defaultValue={currentDate}
            editable={currentDate}
            onChangeText={text => SearchUser(text)}
            InputStyles={{padding: widthToDp(2)}}
            AdjustWidth={{width: widthToDp(92), borderColor: Colors.Orange}}
          />

          {searchedUser.length !== 0 ? (
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
            {/* <SingleSelectDropDown
              setSelected={val => setDocumentSelected(val)}
              data={searchedUser.map(item => ({
                value: item.email,
              }))}
              save="value"
              label="Documents"
              placeholder="Search for Documents"
            /> */}
            {/* <DocumentDropDown
              placeholder={'Search Client by Email'}
              multiple={false}
              documentData={searchedUser}
              SearchUser={SearchUser}
            /> */}
            <Text style={styles.Heading}>Observers</Text>
            <Text style={styles.lightHeading}>
              An Observer is anyone with relevant information for all the
              signing that may need to be on the notarization session.
            </Text>
            <View
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
          </View>
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>
              Type of identity Authentication for Session
            </Text>
            <View style={styles.buttonBottom}>
              <MainButton
                Title="Allow user to choose"
                colors={
                  selected === 'Allow user to choose'
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
                onPress={() => setSelected('Allow user to choose')}
              />
              <MainButton
                Title="US Citizens + KBA"
                colors={
                  selected === 'US Citizens + KBA'
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
                onPress={() => setSelected('US Citizens + KBA')}
              />
              <MainButton
                Title="US Citizens/Foreigners + Biometrics"
                colors={
                  selected === 'US Citizens/Foreigners + Biometrics'
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
                onPress={() =>
                  setSelected('US Citizens/Foreigners + Biometrics')
                }
              />
            </View>
          </View>
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>Session Schedule</Text>
            <View style={styles.buttonBottom}>
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
            </View>
          </View>
          <LabelTextInput
            LabelTextInput="Date & Time"
            placeholder="Enter Date & Time here"
            Label={true}
            defaultValue={currentDate}
            editable={currentDate}
            leftImageSoucre={require('../../../../assets/calenderIcon.png')}
          />
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>Document</Text>
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
                <Text style={{color: Colors.TextColor, fontSize: widthToDp(4)}}>
                  Upload
                </Text>
                <Image source={require('../../../../assets/uploadIcon.png')} />
              </View>
              <Text>Upload your File here...</Text>
            </TouchableOpacity>
          </View>
          <GradientButton
            Title="Send Invitation"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            onPress={() => navigation.navigate('WaitingRoomScreen')}
          />
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
  buttonFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: widthToDp(90),
    alignSelf: 'center',
    marginVertical: widthToDp(5),
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
