import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  ScrollView,
  Alert,
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

export default function SignUpDetailScreen({navigation}, props) {
  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [phoneNumber, setNumber] = useState('');
  const [location, setlocation] = useState('');
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState();
  const [gender, setgender] = useState('');
  const [isEmailValid, {loading: validLoading}] = useLazyQuery(IS_EMAIL_VALID);
  const dispatch = useDispatch();

  const handleGenderChange = value => {
    setgender(value);
  };
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const handleEmailValid = async () => {
    if (
      !email ||
      !location ||
      !phoneNumber ||
      !firstName ||
      !lastName ||
      !gender
    ) {
      Alert.alert('Please fill all the fields before submitting');
    } else {
      return new Promise(() => {
        try {
          isEmailValid({
            variables: {email},
          }).then(response => {
            setEmailValid(response?.data?.isEmailValid?.emailTaken);

            if (response?.data?.isEmailValid?.emailTaken) {
              Alert.alert('This email is already taken');
            } else {
              setEmailValid(false);
              dispatch(
                ceredentailSet({
                  firstName,
                  lastName,
                  location,
                  gender,
                  email,
                  phoneNumber,
                }),
              );
              navigation.navigate('ProfilePictureScreen');
            }
          });
        } catch (error) {
          console.log(error);
        }
      });
    }
  };

  return (
    <View style={styles.container}>
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
          <ScrollView style={{marginVertical: heightToDp(10)}}>
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
              LabelTextInput={(emailValid && 'Email Taken') || 'Email Address'}
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
              placeholder={'Enter your city'}
              LabelTextInput={'City'}
              onChangeText={text => setlocation(text)}
            />
            <View style={styles.GenderContainer}>
              <Picker selectedValue={gender} onValueChange={handleGenderChange}>
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
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Continue"
                loading={validLoading}
                onPress={() => handleEmailValid()}
              />
            </View>
          </ScrollView>
        </BottomSheetStyle>
      </View>
    </View>
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
