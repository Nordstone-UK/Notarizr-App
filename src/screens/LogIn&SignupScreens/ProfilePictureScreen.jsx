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
export default function ProfilePictureScreen({navigation}) {
  const [image, setImage] = useState('picture');

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
        <GradientButton
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          Title="Continue"
          onPress={
            (() => chooseFile, navigation.navigate('RegisterCompletionScreen'))
          }
          // onPress={() =>}
        />
        <SkipButton Title="Skip" />
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#FFF2DC',
  },
  textRemove: {
    textAlign: 'right',
    top: heightToDp(2),
    right: widthToDp(5),
    color: Colors.Orange,
    fontWeight: '700',
  },
  textEdit: {
    textAlign: 'center',
    color: Colors.Orange,
    fontWeight: '700',
    marginBottom: heightToDp(5),
  },
  profileImage: {
    marginTop: heightToDp(10),
    marginBottom: heightToDp(2),
    alignSelf: 'center',
  },
});
