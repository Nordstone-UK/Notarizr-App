import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
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

export default function ProfilePictureScreen({navigation}) {
  const [image, setImage] = useState('picture');
  const userType = useSelector(state => state.user.user);

  const variables = useSelector(state => state.register);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          // {
          //   title: 'Camera Permission',
          //   message: 'App needs camera permission',
          // },
        );
        // If CAMERA Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };
  const requestExternalWritePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          // {
          //   title: 'External Storage Write Permission',
          //   message: 'App needs write permission',
          // },
        );
        // If WRITE_EXTERNAL_STORAGE Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        alert('Write permission err', err);
      }
      return false;
    } else return true;
  };
  const captureImage = async type => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      saveToPhotos: true,
    };
    let isCameraPermitted = await requestCameraPermission();
    let isStoragePermitted = await requestExternalWritePermission();
    if (isCameraPermitted && isStoragePermitted) {
      launchCamera(options, response => {
        console.log('Response = ', response);

        if (response.didCancel) {
          alert('User cancelled camera picker');
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          alert('Camera not available on device');
          return;
        } else if (response.errorCode == 'permission') {
          alert('Permission not satisfied');
          return;
        } else if (response.errorCode == 'others') {
          alert(response.errorMessage);
          return;
        }
        setImage(response?.assets[0]?.uri);
        // setFilePath(response);
      });
    }
  };
  const chooseFile = type => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
    };
    launchImageLibrary(options, response => {
      console.log('Response = ', response);

      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }
      // setFilePath(response);
      setImage(response?.assets[0]?.uri);
    });
  };
  const [Register, {loading}] = useMutation(REGISTER_USER);
  const [errorMessage, setErrorMessage] = useState('');
  const hanfleRegister = async () => {
    const {data, errors} = await Register({
      variables,
    });
    console.log(data);
    console.log('inside', errors);
    setErrorMessage(JSON.stringify(errors[0]?.message));
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
          <Text style={styles.textRemove}>Remove</Text>
          {image ? (
            <View>
              <Image source={ProfilePicture} style={styles.profileImage} />
              <Text style={styles.textEdit}>Edit Profile Image</Text>
            </View>
          ) : (
            <MainButton
              colors={['#fff', '#fff']}
              Title="Upload Picture"
              width={{width: widthToDp(80)}}
              viewStyle={{
                borderWidth: 2,
                borderColor: Colors.Orange,
                borderRadius: 10,
              }}
              styles={{color: Colors.Orange}}
            />
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
            onPress={
              () => hanfleRegister()
              // userType !== 'agent'
              //   ? () => navigation.navigate('RegisterCompletionScreen')
              //   : () => navigation.navigate('AgentVerificationScreen')
            }
          />
          <SkipButton
            Title="Skip"
            onPress={
              userType !== 'agent'
                ? () => navigation.navigate('RegisterCompletionScreen')
                : () => navigation.navigate('AgentVerificationScreen')
            }
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
  },
});
