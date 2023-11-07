import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import SplashScreen from 'react-native-splash-screen';
import {useDispatch, useSelector} from 'react-redux';
import {ceredentailSet, emailSet} from '../../features/register/registerSlice';
import {useLazyQuery} from '@apollo/react-hooks';
import {IS_EMAIL_VALID} from '../../../request/queries/isEmailValid.query';
import {Picker} from '@react-native-picker/picker';
import PhoneTextInput from '../../components/countryCode/PhoneTextInput';
import Toast from 'react-native-toast-message';
import MultiLineTextInput from '../../components/MultiLineTextInput/MultiLineTextInput';
import {GET_PHONE_OTP} from '../../../request/queries/getPhoneOTP.query';
import {GET_VALID_PHONE_OTP} from '../../../request/queries/getValidPhoneOTP.query';

export default function SignUpDetailScreen({navigation}, props) {
  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [phoneNumber, setNumber] = useState('');
  const [location, setlocation] = useState('');
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState();
  const [gender, setgender] = useState('');
  const [description, setDescription] = useState('');
  const [isEmailValid, {loading: validLoading}] = useLazyQuery(IS_EMAIL_VALID);
  const [getPhoneOtp, {loading: PhoneLoading}] =
    useLazyQuery(GET_VALID_PHONE_OTP);

  const dispatch = useDispatch();
  const variables = useSelector(state => state.register.accountType);
  const handleGenderChange = value => {
    setgender(value);
  };

  const handleEmailValid = async () => {
    if (
      !email ||
      !location ||
      !phoneNumber ||
      !firstName ||
      !lastName ||
      !gender ||
      !description
    ) {
      Toast.show({
        type: 'warning',
        text1: 'Warning!',
        text2: 'Please fill all the fields before submitting.',
      });
    } else {
      return new Promise(() => {
        try {
          isEmailValid({
            variables: {email},
          }).then(response => {
            setEmailValid(response?.data?.isEmailValid?.emailTaken);

            if (response?.data?.isEmailValid?.emailTaken) {
              Toast.show({
                type: 'error',
                text1: 'This email is already taken!',
                text2: 'Please enter other email address',
              });
            } else {
              setEmailValid(false);
              handleGetPhoneOtp();
              // dispatch(
              //   ceredentailSet({
              //     firstName,
              //     lastName,
              //     location,
              //     gender,
              //     email,
              //     phoneNumber,
              //     description,
              //   }),
              // );
              // navigation.navigate('ProfilePictureScreen');
            }
          });
        } catch (error) {
          console.log(error);
        }
      });
    }
  };
  const handleGetPhoneOtp = () => {
    dispatch(emailSet(email));
    try {
      getPhoneOtp({
        variables: {phoneNumber},
      }).then(response => {
        console.log('dawdads', response.data);
        if (response?.data?.getValidPhoneOtp?.status === '403') {
          Toast.show({
            type: 'error',
            text1: 'We are Sorry!',
            text2: 'This User is Blocked',
          });
        } else if (response?.data?.getValidPhoneOtp?.status !== '200') {
          Toast.show({
            type: 'error',
            text1: 'OTP not sent!',
            text2: 'We encountered a problem please try again',
          });
        } else {
          Toast.show({
            type: 'success',
            text1: `OTP Sent on ${response.data.getValidPhoneOtp.phoneNumber}`,
            text2: '',
          });
          navigation.navigate('SignPhoneVerification', {
            firstName,
            lastName,
            location,
            gender,
            email,
            phoneNumber,
            description,
          });
          // dispatch(
          //   ceredentailSet({
          //     firstName,
          //     lastName,
          //     location,
          //     gender,
          //     email,
          //     phoneNumber,
          //     description,
          //   }),
          // );
          // navigation.navigate('ProfilePictureScreen');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <CompanyHeader
          Header="Profile Details"
          subHeading="Please provide us with your profile details"
          HeaderStyle={{alignSelf: 'center'}}
          subHeadingStyle={{
            alignSelf: 'center',
            fontSize: widthToDp(4.5),
            marginVertical: heightToDp(1.5),
            fontFamily: 'Manrope-Regular',
            color: '#121826',
          }}
        />
        <View style={styles.container}>
          <BottomSheetStyle>
            <View style={{marginVertical: heightToDp(5)}}>
              <LabelTextInput
                leftImageSoucre={require('../../../assets/NameIcon.png')}
                placeholder={'Enter your first name'}
                Label={true}
                defaultValue={firstName}
                LabelTextInput={'First Name'}
                onChangeText={text => setfirstName(text)}
              />
              <LabelTextInput
                leftImageSoucre={require('../../../assets/NameIcon.png')}
                placeholder={'Enter your last name'}
                defaultValue={lastName}
                Label={true}
                LabelTextInput={'Last Name'}
                onChangeText={text => setlastName(text)}
              />
              <LabelTextInput
                leftImageSoucre={require('../../../assets/emailIcon.png')}
                placeholder={'Enter your email address'}
                LabelTextInput={
                  (emailValid && 'Email Taken') || 'Email Address'
                }
                onChangeText={text => setEmail(text)}
                Label={true}
                labelStyle={emailValid && {color: Colors.Red}}
                AdjustWidth={emailValid && {borderColor: Colors.Red}}
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
              {variables !== 'client' && (
                <MultiLineTextInput
                  Label={true}
                  placeholder={'Enter description here'}
                  defaultValue={description}
                  LabelTextInput={'Description'}
                  onChangeText={text => setDescription(text)}
                />
              )}
              {/* <View>
              <GooglePlacesInput />
            </View> */}
              <View style={styles.GenderContainer}>
                <Picker
                  selectedValue={gender}
                  onValueChange={handleGenderChange}
                  style={{color: Colors.Black}}
                  placeholder="Select Gender">
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
              <View
                style={{
                  marginTop: heightToDp(10),
                }}>
                <GradientButton
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  Title="Continue"
                  loading={validLoading || PhoneLoading}
                  onPress={() => handleEmailValid()}
                />
              </View>
            </View>
          </BottomSheetStyle>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  GenderContainer: {
    alignSelf: 'center',
    marginTop: heightToDp(3),
    paddingVertical: heightToDp(2),
    borderWidth: 2,
    borderRadius: 15,
    borderColor: '#D3D5DA',
    width: widthToDp(90),
  },
});
