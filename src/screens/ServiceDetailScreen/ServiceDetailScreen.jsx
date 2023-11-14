import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  View,
  FlatList,
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
  const submitAddressDetails = async () => {
    setLoading(true);
    if (
      selectAddress ||
      (email && firstName && lastName && phoneNumber && location)
    ) {
      dispatch(
        setBookingInfoState({
          serviceType: serviceType,
          service: null,
          agent: null,
          documentType: {
            name: null,
            price: null,
          },
          timeOfBooking: null,
          dateOfBooking: null,
          address: selectAddress,
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
      navigation.navigate('LegalDocScreen');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please fill all the fields',
      });
    }

    setLoading(false);
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Booking" />
      <View style={styles.headingContainer}></View>
      <BottomSheetStyle>
        <ScrollView scrollEnabled={true} removeClippedSubviews={false}>
          <Text style={styles.insideHeading}>
            To whom are you booking this service for:
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
              Title="Other"
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
                  onPress={() => setSelectedAddress(item.location)}
                  Show={selectAddress === item.location}
                />
              ))}

              <GradientButton
                Title="Add a new Address"
                colors={
                  serviceFor === 'self'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: widthToDp(4),
                }}
                styles={{
                  padding: widthToDp(0),
                  fontSize: widthToDp(5),
                }}
                onPress={() => navigation.navigate('AddNewAddress')}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.insideHeading}>
                Provide details of user to whom you are booking this service
                for:
              </Text>
              <LabelTextInput
                leftImageSoucre={require('../../../assets/NameIcon.png')}
                placeholder={'Enter your first name'}
                Label={true}
                LabelTextInput={'First Name'}
                onChangeText={text => setfirstName(text)}
              />
              <LabelTextInput
                leftImageSoucre={require('../../../assets/NameIcon.png')}
                placeholder={'Enter your last name'}
                Label={true}
                LabelTextInput={'Last Name'}
                onChangeText={text => setlastName(text)}
              />
              <LabelTextInput
                leftImageSoucre={require('../../../assets/emailIcon.png')}
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
          <View style={{marginVertical: heightToDp(5)}}>
            <GradientButton
              Title="Proceed"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                paddingVertical: widthToDp(4),
              }}
              styles={{
                padding: widthToDp(0),
                fontSize: widthToDp(5),
              }}
              onPress={() => submitAddressDetails()}
              loading={loading}
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

  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  headingContainer: {
    marginLeft: widthToDp(4),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(3),
    marginHorizontal: widthToDp(5),
  },
  buttonFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: heightToDp(2),
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
