import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  View,
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

export default function ServiceDetailScreen({route, navigation}) {
  const [serviceFor, setServiceFor] = useState('self');
  const handleServiceForChange = string => {
    setServiceFor(string);
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Booking" />
      <View style={styles.headingContainer}></View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
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
              onPress={() => setServiceFor('self')}
            />
            <MainButton
              Title="Others"
              colors={
                serviceFor === 'others'
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
              onPress={() => setServiceFor('others')}
            />
          </View>

          {serviceFor === 'self' ? (
            <View>
              <Text style={styles.insideHeading}>
                Current Avaialable addresses:
              </Text>
              <AddressCard location={'Building 5  Street 4 New York'} />
              <AddressCard location={'Flat 444  Block 9 New York'} />
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
                onPress={() => navigation.navigate('NewAddressScreen')}
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
                //   defaultValue={firstName}
                LabelTextInput={'First Name'}
                //   onChangeText={text => setfirstName(text)}
              />
              <LabelTextInput
                leftImageSoucre={require('../../../assets/NameIcon.png')}
                placeholder={'Enter your last name'}
                //   defaultValue={lastName}
                Label={true}
                LabelTextInput={'Last Name'}
                //   onChangeText={text => setlastName(text)}
              />
              <LabelTextInput
                leftImageSoucre={require('../../../assets/emailIcon.png')}
                placeholder={'Enter your email address'}
                LabelTextInput={'Email Address'}
                //   onChangeText={text => setEmail(text)}
                Label={true}
                //   labelStyle={emailValid && {color: Colors.Red}}
                //   AdjustWidth={emailValid && {borderColor: Colors.Red}}
              />
              <PhoneTextInput
                //   onChange={e => {
                //     setNumber(e);
                //   }}
                LabelTextInput="Phone Number"
                Label={true}
                placeholder={'XXXXXXXXXXX'}
              />
              <LabelTextInput
                leftImageSoucre={require('../../../assets/locationIcon.png')}
                Label={true}
                placeholder={'Enter your city'}
                LabelTextInput={'City'}
                //   onChangeText={text => setlocation(text)}
              />
            </View>
          )}
          <View style={{marginVertical: heightToDp(5)}}>
            <GradientButton
              Title="Select Documents"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                paddingVertical: widthToDp(4),
              }}
              styles={{
                padding: widthToDp(0),
                fontSize: widthToDp(5),
              }}
              onPress={() => navigation.navigate('LegalDocScreen')}
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
