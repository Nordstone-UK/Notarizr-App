import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
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
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {useSelector} from 'react-redux';
import PhoneTextInput from '../../components/countryCode/PhoneTextInput';
import Toast from 'react-native-toast-message';
import {useLazyQuery} from '@apollo/client';
import {IS_EMAIL_VALID} from '../../../request/queries/isEmailValid.query';
import {captureImage, chooseFile} from '../../utils/ImagePicker';
import useUpdate from '../../hooks/useUpdate';
import useRegister from '../../hooks/useRegister';
import useFetchUser from '../../hooks/useFetchUser';
import MultiLineTextInput from '../../components/MultiLineTextInput/MultiLineTextInput';
import {removeCountryCode} from '../../utils/CountryCode';

export default function ProfileDetailEditScreen({navigation}, props) {
  const {
    gender: oldGender,
    first_name,
    location: oldLocation,
    profile_picture,
    last_name,
    email: oldEmail,
    phone_number,
    description: oldDescription,
  } = useSelector(state => state.user.user);
  const [firstName, setfirstName] = useState(first_name);
  const [lastName, setlastName] = useState(last_name);
  const [phoneNumber, setNumber] = useState(phone_number);
  const [location, setlocation] = useState(oldLocation);
  const [email, setEmail] = useState(oldEmail);
  const [gender, setGender] = useState(oldGender);
  const [emailValid, setEmailValid] = useState();
  const [image, setImage] = useState(profile_picture);
  const [description, setDescription] = useState(oldDescription);
  const [tempLoading, settempLoading] = useState(false);
  const [profilePicture, setProfilePicure] = useState(profile_picture);
  const accountType = useSelector(state => state.register.accountType);
  const {fetchUserInfo} = useFetchUser();
  const {countryCode, phoneNumberWithoutCode} = removeCountryCode(phoneNumber);
  const {handleCompression, uploadBlobToS3} = useRegister();
  const {handleProfileUpdate} = useUpdate();
  const showCameraGalleryAlert = () => {
    Alert.alert(
      'Choose an option',
      'Select a source for your image:',
      [
        {
          text: 'Cancel',
          onPress: () => {
            // Handle Camera button press
            // You can add your camera logic here
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const uri = await chooseFile('photo');
            console.log(uri);
            setProfilePicure(uri);
            setImage(uri);
          },
        },
        {
          text: 'Camera',
          onPress: async () => {
            const uri = await captureImage('photo');
            setImage(uri);
          },
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };
  const submitRegister = async () => {
    settempLoading(true);
    if (image) {
      const imageBlob = await handleCompression(image);
      const url = await uploadBlobToS3(imageBlob);
      setImage(url);
      // console.log('conversion: ', url);
    }

    const params = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber,
      location: location,
      profilePicture: image,
      gender: gender,
      description: description,
    };
    const isUpdated = await handleProfileUpdate(params);
    if (isUpdated) {
      await fetchUserInfo();
      settempLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Profile Updated!',
        text2: 'Your profile has been updated successfully.',
      });
      navigation.navigate('ProfileInfoScreen');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Problem while updating',
      });
      settempLoading(false);
    }
  };
  console.log('====================================');
  console.log('Country: ', removeCountryCode(phoneNumber));
  console.log('====================================');
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Profile Details" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image source={{uri: profilePicture}} style={styles.picture} />
          <TouchableOpacity
            style={styles.camera}
            onPress={() => showCameraGalleryAlert()}>
            <Image source={require('../../../assets/cameraIcon.png')} />
          </TouchableOpacity>
        </View>
        <Text style={styles.textheading}>
          {first_name} {last_name}
        </Text>
        <Text style={styles.textsubheading}>{oldEmail}</Text>
        <BottomSheetStyle>
          <View style={{paddingBottom: widthToDp(5)}}>
            <LabelTextInput
              leftImageSoucre={require('../../../assets/NameIcon.png')}
              Label={true}
              defaultValue={first_name}
              LabelTextInput={'First Name'}
              onChangeText={text => setfirstName(text)}
            />
            <LabelTextInput
              leftImageSoucre={require('../../../assets/NameIcon.png')}
              placeholder={'Enter your last name'}
              defaultValue={last_name}
              Label={true}
              LabelTextInput={'Last Name'}
              onChangeText={text => setlastName(text)}
            />
            <LabelTextInput
              leftImageSoucre={require('../../../assets/emailIcon.png')}
              placeholder={'Enter your email address'}
              LabelTextInput={(emailValid && 'Email Taken') || 'Email Address'}
              onChangeText={text => setEmail(text)}
              defaultValue={oldEmail}
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
              defaultCode={countryCode}
              value={phoneNumberWithoutCode}
              placeholder={'XXXXXXXXXXX'}
            />
            <LabelTextInput
              leftImageSoucre={require('../../../assets/locationIcon.png')}
              Label={true}
              placeholder={'Enter your address'}
              defaultValue={oldLocation}
              LabelTextInput={'Address'}
              onChangeText={text => setlocation(text)}
            />
            <MultiLineTextInput
              Label={true}
              placeholder={'Enter description here'}
              defaultValue={description}
              LabelTextInput={'Description'}
              onChangeText={text => setDescription(text)}
            />
            <View
              style={{
                marginTop: heightToDp(10),
              }}>
              <GradientButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Save Details"
                onPress={() => submitRegister()}
                loading={tempLoading}
              />
            </View>
          </View>
        </BottomSheetStyle>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
  picture: {
    alignSelf: 'center',
    width: widthToDp(25),
    height: heightToDp(25),
    borderRadius: 50,
  },
  camera: {
    position: 'absolute',
    left: widthToDp(55),
    top: heightToDp(18),
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    width: widthToDp(80),
    paddingVertical: heightToDp(2),
    alignSelf: 'center',
    borderRadius: 15,
    marginTop: heightToDp(5),
  },
  textheading: {
    fontSize: widthToDp(6),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  textsubheading: {
    fontSize: widthToDp(4.5),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
    marginBottom: heightToDp(2),
  },
});
// const handleEmailValid = async () => {
//   console.log(email, location, firstName, lastName, gender);
//   if (!email || !location || !phoneNumber || !firstName || !lastName) {
//     Toast.show({
//       type: 'warning',
//       text1: 'Warning!',
//       text2: 'Please fill all the fields before submitting.',
//     });
//   } else {
//     return new Promise(() => {
//       try {
//         isEmailValid({
//           variables: {email},
//         }).then(response => {
//           setEmailValid(response?.data?.isEmailValid?.emailTaken);

//           if (response?.data?.isEmailValid?.emailTaken) {
//             Toast.show({
//               type: 'error',
//               text1: 'This email is already taken!',
//               text2: 'Please enter other email address',
//             });
//           } else {
//             setEmailValid(false);
//             submitRegister({
//               firstName,
//               lastName,
//               email,
//               phoneNumber,
//               location,
//               profilePicture,
//               gender,
//             });
//             console.log('Email is Valid');
//           }
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     });
//   }
// };
