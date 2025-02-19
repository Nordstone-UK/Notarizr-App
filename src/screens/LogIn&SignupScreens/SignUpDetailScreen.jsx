import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

import React, {useState, useEffect} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import SplashScreen from 'react-native-splash-screen';
import {useDispatch, useSelector} from 'react-redux';
import {
  ceredentailSet,
  emailSet,
  setProgress,
  setFilledCount,
} from '../../features/register/registerSlice';
import {useLazyQuery} from '@apollo/react-hooks';
import {IS_EMAIL_VALID} from '../../../request/queries/isEmailValid.query';
import {Picker} from '@react-native-picker/picker';
import PhoneTextInput from '../../components/countryCode/PhoneTextInput';
import Toast from 'react-native-toast-message';
import MultiLineTextInput from '../../components/MultiLineTextInput/MultiLineTextInput';
import {GET_PHONE_OTP} from '../../../request/queries/getPhoneOTP.query';
import {GET_VALID_PHONE_OTP} from '../../../request/queries/getValidPhoneOTP.query';
import CustomDatePicker from '../../components/CustomDatePicker/CustomDatePicker';
import moment from 'moment';

import {statesData} from '../../data/statesData';
import SingleSelectDropDown from '../../components/SingleSelectDropDown/SingleSelectDropDown';
import {IS_MOBILENO_VALID} from '../../../request/queries/isPhoneNoValid.query';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpDetailScreen({navigation}, props) {
  const [date, setDate] = useState('22-05-2010');
  console.log('daterer', date);
  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [phoneNumber, setNumber] = useState('');
  const [location, setlocation] = useState('');
  const [state, setState] = useState(null);
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState();
  const [mobilenoValid, setMobileNoValid] = useState();
  const [gender, setgender] = useState('');
  const [description, setDescription] = useState('');

  const [isEmailValid, {loading: validLoading}] = useLazyQuery(IS_EMAIL_VALID);
  const [isMobileNoValid, {loading: mobilenovalidLoading}] =
    useLazyQuery(IS_MOBILENO_VALID);
  const [getPhoneOtp, {loading: PhoneLoading}] =
    useLazyQuery(GET_VALID_PHONE_OTP);

  const dispatch = useDispatch();
  const registerData = useSelector(state => state.register); // Access progress from Redux store

  const {width} = Dimensions.get('window');
  const variables = useSelector(state => state.register.accountType);
  const handleGenderChange = value => {
    setgender(value);
  };
  useEffect(() => {
    updateProgress();
  }, [firstName, lastName, email, phoneNumber, location, state, description]);
  const totalFields = variables === 'client' ? 8 : 12;

  const updateProgress = () => {
    let filledFields = 1;

    if (firstName.trim() !== '') filledFields++;
    if (lastName.trim() !== '') filledFields++;
    if (email.trim() !== '' && emailRegex.test(email)) filledFields++;
    if (phoneNumber.trim() !== '') filledFields++;
    if (location.trim() !== '') filledFields++;
    if (state !== null) filledFields++;
    if (description.trim() !== '') filledFields++;

    const progressValue = filledFields / totalFields; // Calculate new progress

    dispatch(setFilledCount(filledFields));
    dispatch(setProgress(progressValue));
  };

  const handleEmailValid = async () => {
    if (!email || !location || !phoneNumber || !firstName || !lastName) {
      Toast.show({
        type: 'warning',
        text1: 'Warning!',
        text2: 'Please fill all the fields before submitting.',
      });
    } else if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    } else {
      try {
        const emailResponse = await isEmailValid({variables: {email}});
        const emailTaken = emailResponse?.data?.isEmailValid?.emailTaken;
        setEmailValid(emailTaken);

        if (emailTaken) {
          Toast.show({
            type: 'error',
            text1: 'This email is already taken!',
            text2: 'Please enter another email address',
          });
          return;
        }

        const phoneResponse = await isMobileNoValid({variables: {phoneNumber}});
        const phoneTaken = phoneResponse?.data?.isMobileNoValid?.phoneNoTaken;
        setMobileNoValid(phoneTaken);
        if (phoneTaken) {
          Toast.show({
            type: 'error',
            text1: 'This phone number is already taken!',
            text2: 'Please enter another phone number',
          });
          return;
        }

        setEmailValid(false);
        setMobileNoValid(false);
        handleGetPhoneOtp();
      } catch (error) {
        console.error(error);
      }
    }
  };
  const handleGetPhoneOtp = () => {
    dispatch(emailSet(email));
    try {
      getPhoneOtp({
        variables: {phoneNumber},
      }).then(response => {
        // console.log('dawdads', response.data);
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
            // gender,
            email,
            phoneNumber,
            description,
            date,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  console.log('registerData.progress', registerData.filledCount);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <CompanyHeader
          Header="Profile Details"
          reset="true"
          subHeading=""
          HeaderStyle={{alignSelf: 'center'}}
          subHeadingStyle={{
            alignSelf: 'center',
            fontSize: widthToDp(4.5),
            marginVertical: heightToDp(1.5),
            fontFamily: 'Manrope-Regular',
            color: '#121826',
          }}
        />
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={registerData.progress}
            width={width * 0.9}
            color={Colors.OrangeGradientEnd}
            unfilledColor={Colors.OrangeGradientStart}
            borderWidth={0}
          />
          <Text style={styles.percentageText}>
            {Math.round(registerData.progress * 100)}%
          </Text>
        </View>
        <View style={styles.container}>
          <BottomSheetStyle>
            <View style={{marginVertical: heightToDp(5)}}>
              <LabelTextInput
                leftImageSoucre={require('../../../assets/profileTabIcon.png')}
                placeholder={'Enter your first name'}
                Label={true}
                defaultValue={firstName}
                LabelTextInput={'First Name'}
                onChangeText={text => setfirstName(text)}
              />
              <LabelTextInput
                leftImageSoucre={require('../../../assets/profileTabIcon.png')}
                placeholder={'Enter your last name'}
                defaultValue={lastName}
                Label={true}
                LabelTextInput={'Last Name'}
                onChangeText={text => setlastName(text)}
              />
              <LabelTextInput
                leftImageSoucre={require('../../../assets/profileTabIcon.png')}
                placeholder={'Enter your email address'}
                LabelTextInput={
                  (emailValid && 'Email Taken') || 'Email Address'
                }
                onChangeText={text => setEmail(text)}
                Label={true}
                value={email}
                returnKeyType="next"
                onSubmitEditing={() => phoneInputRef.current.focus()}
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
              {/* <CustomDatePicker
                onConfirm={date => setDate(moment(date).format('DD-MM-YYYY'))}
                Text="Date Of Birth"
                mode="date"
                date={date}
                labelStyle={{}}
                containerStyle={{
                  paddingVertical: widthToDp(4),
                  width: widthToDp(90),
                  alignSelf: 'center',
                }}
                textStyle={{}}
              /> */}
              {variables == 'client' && (
                <SingleSelectDropDown
                  data={statesData}
                  setSelected={item => {
                    console.log('staterere', item);
                    // Remove spaces from the selected state and set it
                    const formattedState = item?.replace(/\s+/g, '');
                    console.log('formateds dste', formattedState);
                    setlocation(formattedState);
                  }}
                  label="State"
                  placeholder="Choose your state..."
                  Label={true}
                  LabelTextInput={'State'}
                  value={state?.label}
                />
              )}
              {variables !== 'client' && (
                <LabelTextInput
                  leftImageSoucre={require('../../../assets/locationIcon.png')}
                  Label={true}
                  placeholder={'Enter your city'}
                  LabelTextInput={'Address'}
                  onChangeText={text => setlocation(text)}
                />
              )}
              {variables !== 'client' && (
                <MultiLineTextInput
                  Label={true}
                  placeholder={'Enter description here'}
                  defaultValue={description}
                  LabelTextInput={'Description'}
                  onChangeText={text => setDescription(text)}
                />
              )}

              {/* <View style={styles.GenderContainer}>
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
              </View> */}
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
                  loading={validLoading || mobilenovalidLoading || PhoneLoading}
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
    // paddingVertical: heightToDp(2),
    borderWidth: 2,
    borderRadius: 15,
    borderColor: '#D3D5DA',
    width: widthToDp(90),
    // height:height*.08
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: 'center',
    width: '100%', // Adjust as needed
    alignSelf: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    position: 'absolute',
    top: -30,
    left: '47%',
    // transform: [{translateX: -50}],
    fontSize: 18,
    fontWeight: 'bold',
    color: 'orange',
  },
});
