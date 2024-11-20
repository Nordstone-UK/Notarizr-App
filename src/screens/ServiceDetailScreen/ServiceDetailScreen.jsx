import {
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';
import useGetService from '../../hooks/useGetService';
import useCreateBooking from '../../hooks/useCreateBooking';
import MainButton from '../../components/MainGradientButton/MainButton';
import PhoneTextInput from '../../components/countryCode/PhoneTextInput';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import AddressCard from '../../components/AddressCard/AddressCard';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useDispatch, useSelector} from 'react-redux';
import useFetchUser from '../../hooks/useFetchUser';
import {setBookingInfoState} from '../../features/booking/bookingSlice';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

export default function ServiceDetailScreen({route, navigation}) {
  const {serviceType} = route.params;
  const {fetchUserInfo} = useFetchUser();
  const dispatch = useDispatch();
  const {addresses} = useSelector(state => state.user.user);
  const [serviceFor, setServiceFor] = useState('self');
  const [selectAddress, setSelectedAddress] = useState();
  const [firstName, setfirstName] = useState(null);
  const [lastName, setlastName] = useState(null);
  const [phoneNumber, setNumber] = useState(null);
  const [location, setlocation] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [selectedDate, setSelectedDate] = useState('');
  // const [isEnabled, setIsEnabled] = useState(false);
  // const [documents, setDocuments] = useState();
  // const [startTime, setStartTime] = useState(new Date());
  const [date, setDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('date');
  let initialDate = new Date();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserInfo();
    });
    return unsubscribe;
  }, [navigation]);
  const changeServiceFor = string => {
    if (string === 'self') {
      setfirstName(null);
      setlastName(null);
      setNumber(null);
      setlocation(null);
      setEmail(null);
      setServiceFor(string);
    } else {
      setSelectedAddress(null);
      setServiceFor(string);
    }
  };
  console.log('Srvie', serviceFor);
  const submitAddressDetails = () => {
    dispatch(
      setBookingInfoState({
        serviceType: serviceType,
        service: null,
        timeOfBooking: moment(date).format('h:mm A'),
        dateOfBooking: moment(date).format('MM-DD-YYYY'),
        agent: null,
        documentType: {
          name: null,
          price: null,
        },

        address: location,
        bookedFor: {
          email: email,
          first_name: firstName,
          last_name: lastName,
          location: location,
          phone_number: phoneNumber,
        },
        bookingType: serviceFor,
        documents: null,
        preferenceAnalysis: 'distance',
      }),
    );
    navigation.navigate('LegalDocScreen', {address: selectAddress});
  };
  const handleOpenPicker = pickermode => {
    setMode(pickermode);
    setOpen(true);
  };
  const showConfirmation = async () => {
    setLoading(true);
    if (
      (selectAddress && date) ||
      (date && email && firstName && lastName && phoneNumber && location)
    ) {
      Alert.alert(
        'Please Note:',
        'We may contact you to adjust the time based on agent availability and time of day.',
        [
          {
            text: 'OK',
            onPress: () => {
              submitAddressDetails();
            },
            style: 'cancel',
          },
        ],
      );
    } else {
      if (serviceFor === 'self') {
        if (!date && !selectAddress) {
          // Neither date nor address is selected
          Toast.show({
            type: 'error',
            text1: 'Please select Date & Time and Address.',
          });
        } else if (!date && selectAddress) {
          // Address is selected but date is not
          Toast.show({
            type: 'error',
            text1: 'Please select Date & Time.',
          });
        } else if (date && !selectAddress) {
          // Date is selected but address is not
          Toast.show({
            type: 'error',
            text1: 'Please select Address.',
          });
        }
        // Toast.show({
        //   type: 'error',
        //   text1: 'Please Select Date and Address',
        // });
      } else if (
        date &&
        firstName &&
        lastName &&
        email &&
        phoneNumber &&
        location
      ) {
        Toast.show({
          type: 'success',
          text1: 'All fields are filled successfully.',
        });
      } else if (
        !date &&
        firstName &&
        lastName &&
        email &&
        phoneNumber &&
        location
      ) {
        Toast.show({
          type: 'success',
          text1: 'Please select Date & Time.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Please fill in all fields.',
        });
      }
    }
    setLoading(false);
  };

  // const showConfirmation = async () => {
  //   setLoading(true);
  //   if (
  //     selectAddress ||
  //     (email && firstName && lastName && phoneNumber && location)
  //   ) {
  //     Alert.alert(
  //       'Disclaimer',
  //       'We may contact you to modify the time based on local agent availability.',
  //       [
  //         {
  //           text: 'OK',
  //           onPress: () => {
  //             submitAddressDetails();
  //           },
  //           style: 'cancel',
  //         },
  //       ],
  //     );
  //   } else {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Please Select Date and Address',
  //     });
  //   }

  //   setLoading(false);
  // };
  console.log('addressslist', date);
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Booking" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1, paddingBottom: heightToDp(5)}}>
        <ScrollView
          scrollEnabled={true}
          removeClippedSubviews={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <BottomSheetStyle>
            <View style={{paddingBottom: widthToDp(5)}}>
              <View style={{marginVertical: heightToDp(2)}}>
                <Text style={styles.headingContainer}>Date & Time:</Text>
                <View style={styles.buttonFlex}>
                  <TouchableOpacity onPress={() => handleOpenPicker('date')}>
                    <Text style={styles.dateText}>
                      {moment(date || initialDate).format('MM-DD-YYYY')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleOpenPicker('time')}>
                    <Text style={styles.dateText}>
                      {moment(date || initialDate).format(' hh:mm A')}
                    </Text>
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    mode={mode}
                    // minimumDate={date}
                    open={open}
                    date={date || initialDate}
                    onConfirm={selectedDate => {
                      setOpen(false); // Close the modal
                      setDate(selectedDate); // Update the state with the new selected date or time
                    }}
                    onCancel={() => {
                      setOpen(false);
                    }}
                    locale="en"
                  />
                </View>
                {/* <View style={styles.buttonFlex}>
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
                    androidVariant="iosClone"
                    date={date || new Date()}
                    onConfirm={date => {
                      setOpen(false);
                      setDate(date);
                    }}
                    onCancel={() => {
                      setOpen(false);
                    }}
                  />
                </View> */}
              </View>
              <Text style={styles.insideHeading}>
                Who are you booking this service for?
              </Text>

              <View style={styles.buttonFlex}>
                <MainButton
                  Title="Self"
                  colors={
                    serviceFor === 'self'
                      ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                      : [Colors.DisableColor, Colors.DisableColor]
                  }
                  GradiStyles={{
                    width: widthToDp(40),
                    paddingVertical: widthToDp(2),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(5),
                  }}
                  onPress={() => changeServiceFor('self')}
                />
                <MainButton
                  Title="Others"
                  colors={
                    serviceFor === 'other'
                      ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                      : [Colors.DisableColor, Colors.DisableColor]
                  }
                  GradiStyles={{
                    width: widthToDp(40),
                    paddingVertical: widthToDp(2),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(5),
                  }}
                  onPress={() => changeServiceFor('other')}
                />
              </View>

              {serviceFor === 'self' ? (
                <View>
                  <Text style={styles.insideHeading}>
                    Current Available addresses:
                  </Text>
                  {addresses.map((item, index) => (
                    <AddressCard
                      key={index}
                      location={item.location}
                      onPress={() => {
                        setSelectedAddress(item.location);
                        setlocation(item._id);
                      }}
                      Show={selectAddress === item.location}
                      booking="true"
                    />
                  ))}
                </View>
              ) : (
                <View>
                  <Text style={styles.insideHeading}>
                    Provide details of user to whom you are booking this service
                    for:
                  </Text>
                  <LabelTextInput
                    leftImageSoucre={require('../../../assets/profileTabIcon.png')}
                    placeholder={'Enter your first name'}
                    Label={true}
                    LabelTextInput={'First Name'}
                    onChangeText={text => setfirstName(text)}
                  />
                  <LabelTextInput
                    leftImageSoucre={require('../../../assets/profileTabIcon.png')}
                    placeholder={'Enter your last name'}
                    Label={true}
                    LabelTextInput={'Last Name'}
                    onChangeText={text => setlastName(text)}
                  />
                  <LabelTextInput
                    leftImageSoucre={require('../../../assets/EmailIcon.png')}
                    placeholder={'Enter your email address'}
                    LabelTextInput={'Email Address'}
                    onChangeText={text => setEmail(text)}
                    Label={true}
                  />
                  <PhoneTextInput
                    onChange={e => {
                      setNumber(e);
                    }}
                    LabelTextInput="Phone Number"
                    Label={true}
                    placeholder={'XXXXXXXXXXX'}
                  />
                  <LabelTextInput
                    leftImageSoucre={require('../../../assets/locationIcon.png')}
                    Label={true}
                    placeholder={'Enter your address'}
                    LabelTextInput={'Address'}
                    onChangeText={text => setlocation(text)}
                  />
                </View>
              )}
              {/* <View
                style={{
                  marginTop: heightToDp(5),
                }}>
                <GradientButton
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  Title="PROCEED"
                  // onPress={() => submitRegister()}
                  // loading={tempLoading}
                />
              </View> */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginVertical: heightToDp(5),
                }}>
                {serviceFor === 'self' && (
                  <GradientButton
                    Title="Add a new Address"
                    colors={
                      serviceFor === 'self'
                        ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                        : [Colors.DisableColor, Colors.DisableColor]
                    }
                    GradiStyles={{
                      // paddingVertical: widthToDp(4),
                      width: widthToDp(45),
                      height: heightToDp(20),
                    }}
                    styles={{
                      padding: widthToDp(0),
                      // fontSize: widthToDp(2),
                    }}
                    buttonFontSize={widthToDp(5)}
                    onPress={() =>
                      navigation.navigate('CurrentLocationScreen', {
                        previousScreen: 'ServiceDetailScreen',
                      })
                    }
                  />
                )}

                <GradientButton
                  Title="Proceed"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    width: widthToDp(40),
                    height: heightToDp(20),
                  }}
                  styles={{
                    padding: widthToDp(0),
                  }}
                  buttonFontSize={widthToDp(5)}
                  onPress={() => showConfirmation()}
                  loading={loading}
                />
              </View>
            </View>
          </BottomSheetStyle>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },

  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
  },

  headingContainer: {
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(6),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(3),
    marginHorizontal: widthToDp(5),
  },
  buttonFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: heightToDp(5),
  },
  dateText: {
    color: Colors.Orange,
    fontFamily: 'Manrope-Bold',
    fontSize: widthToDp(5),
    borderWidth: 1,
    borderColor: Colors.Orange,
    paddingHorizontal: widthToDp(2),
    borderRadius: widthToDp(2),
    marginRight: widthToDp(2),
  },
});
{
  // const renderItem = ({item}) => (
  //   <AddressCard
  //     location={item.location}
  //     onPress={() => setSelectedAddress(item.location)}
  //     Show={selectAddress === item.location}
  //   />
  {
    /* <FlatList
                data={addresses}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
              /> */
  }
  // );
  /* <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.Pink}}
            Title="Mobile Notary"
            Image={require('../../../assets/service1Pic.png')}
            onPress={() => handleAPIFetch('mobile_notary')}
            // isDisabled={isDisabled}
          />
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.LightBlue}}
            Title="Remote Online Notary"
            Image={require('../../../assets/service2Pic.png')}
            onPress={() =>
              navigation.navigate('OnlineNotaryScreen', documentType)
            }
          />
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.DarkBlue}}
            Title="Local Notary"
            Image={require('../../../assets/service3Pic.png')}
            onPress={() => handleAPIFetch('local')}
            // isDisabled={localDisabled}
          /> */
  //   const {fetchGetServiceAPI} = useGetService();
  //   const {documentType} = route.params;
  //   console.log(documentType);
  //   const [isDisabled, setIsDisabled] = useState(false);
  //   const [localDisabled, setLocalDisabled] = useState(false);
  //   const handleAPIFetch = async string => {
  //     string === 'local' ? setLocalDisabled(true) : setIsDisabled(true);
  //     await fetchGetServiceAPI(string, documentType);
  //     string === 'local' ? setLocalDisabled(false) : setIsDisabled(false);
  //   };
}
