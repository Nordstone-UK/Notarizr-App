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
import React, {useEffect, useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Colors from '../../themes/Colors';
import SkipButton from '../../components/MainGradientButton/SkipButton';
import ProfilePicture from '../../../assets/profilePicture.png';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useSelector} from 'react-redux';
import {REGISTER_USER} from '../../../request/mutations/register.mutation';
import {useMutation} from '@apollo/react-hooks';
import {PermissionsAndroid} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import {captureImage, chooseFile, uriToBlob} from '../../utils/ImagePicker';
import useCompress from '../../hooks/useCompress';
import RNFetchBlob from 'rn-fetch-blob'; // For file access (React Native)

export default function ProfilePictureScreen({navigation}) {
  const {compressImages} = useCompress();

  useEffect(() => {
    SplashScreen.hide();
  }, []);
  const [image, setImage] = useState();
  const [Register, {loading}] = useMutation(REGISTER_USER);
  const [errorMessage, setErrorMessage] = useState('');
  const variables = useSelector(state => state.register);
  let uri;
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
            uri = await chooseFile('photo');
            setImage(uri);
          },
        },
        {
          text: 'Camera',
          onPress: async () => {
            uri = await captureImage('photo');
            setImage(uri);
          },
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };
  const hanfleRegister = async () => {
    const {data, errors} = await Register({
      variables,
    });
    console.log(data);
    console.log('inside', errors);
    setErrorMessage(JSON.stringify(errors[0]?.message));
  };
  const handleCompression = async () => {
    const compressedImage = await compressImages(uri);
  };
  return (
    <View style={styles.container}>
      <CompanyHeader
        Header="Profile Image"
        subHeading="Please provide us with your profile image"
        HeaderStyle={{alignSelf: 'center'}}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: 17,
          marginVertical: heightToDp(1.5),
          color: '#121826',
        }}
      />

      <BottomSheetStyle>
        <ScrollView>
          <TouchableOpacity onPress={() => setImage('')}>
            <Text style={styles.textRemove}>Remove</Text>
          </TouchableOpacity>

          {image ? (
            <View>
              <Image source={{uri: image}} style={styles.profileImage} />
              <TouchableOpacity
                onPress={
                  () => handleCompression(image)
                  // Alert.alert('This feature is in development')
                }>
                <Text style={styles.textEdit}>Edit Profile Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.dottedContianer}
              onPress={() => showCameraGalleryAlert()}>
              <Image source={require('../../../assets/upload.png')} />
              <View
                style={{
                  flexDirection: 'row',
                  columnGap: widthToDp(2),
                  alignItems: 'center',
                }}>
                <Text style={{color: Colors.TextColor, fontSize: widthToDp(4)}}>
                  Upload
                </Text>
                <Image source={require('../../../assets/uploadIcon.png')} />
              </View>
              <Text>Upload your Profile Picture here...</Text>
            </TouchableOpacity>
          )}
          <Text
            style={{
              color: '#000',
              fontSize: widthToDp(5),
              alignSelf: 'center',
            }}>
            {errorMessage}
          </Text>
          <GradientButton
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            Title="Continue"
            loading={loading}
            // onPress={
            //   () => hanfleRegister()
            //   // userType !== 'agent'
            //   //   ? () => navigation.navigate('RegisterCompletionScreen')
            //   //   : () => navigation.navigate('AgentVerificationScreen')
            // }
          />
          <SkipButton
            Title="Skip"
            // onPress={
            //   userType !== 'agent'
            //     ? () => navigation.navigate('RegisterCompletionScreen')
            //     : () => navigation.navigate('AgentVerificationScreen')
            // }
          />
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
  textRemove: {
    textAlign: 'right',
    top: heightToDp(2),
    right: widthToDp(5),
    color: Colors.Orange,
    fontFamily: 'Manrope-Bold',
  },
  textEdit: {
    textAlign: 'center',
    color: Colors.Orange,
    fontFamily: 'Manrope-Bold',
    marginBottom: heightToDp(5),
  },
  profileImage: {
    marginTop: heightToDp(10),
    marginBottom: heightToDp(2),
    alignSelf: 'center',
    width: widthToDp(50),
    height: heightToDp(50),
  },
  dottedContianer: {
    alignItems: 'center',
    alignSelf: 'center',
    borderStyle: 'dotted',
    borderWidth: 2,
    borderColor: Colors.DisableColor,
    borderRadius: 5,
    marginTop: heightToDp(15),
    paddingVertical: heightToDp(2),
    width: widthToDp(80),
  },
});
