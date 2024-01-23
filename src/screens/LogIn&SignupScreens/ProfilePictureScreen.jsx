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
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import SkipButton from '../../components/MainGradientButton/SkipButton';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useDispatch, useSelector} from 'react-redux';

import {captureImage, chooseFile} from '../../utils/ImagePicker';

import {profilePictureSet} from '../../features/register/registerSlice';
import Toast from 'react-native-toast-message';
import useRegister from '../../hooks/useRegister';
import AuthenticateModal from '../../components/AuthenticateModal/AuthenticateModal';

export default function ProfilePictureScreen({navigation}) {
  const [image, setImage] = useState();
  const [errorMessage, setErrorMessage] = useState('');
  const [tempLoading, settempLoading] = useState(false);
  const [profilePicture, setProfilePicure] = useState('');
  const variables = useSelector(state => state.register);
  const [visible, setVisible] = useState(true);
  const dispatch = useDispatch();
  const {handleCompression, uploadBlobToS3, handleRegister} = useRegister();
  const showCameraGalleryAlert = () => {
    Alert.alert(
      'Choose an option',
      'Select a source for your image:',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const uri = await chooseFile('photo');
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

    const imageBlob = await handleCompression(image);
    const url = await uploadBlobToS3(imageBlob);
    if (variables.accountType === 'client') {
      const params = {
        ...variables,
        profilePicture: url,
      };
      const isRegistered = await handleRegister(params);
      if (isRegistered) {
        // <AuthenticateModal
        //   modalVisible={visible}
        //   setModalVisible={bool => setVisible(bool)}
        //   name={variables?.first_name + ' ' + variables?.last_name}
        // />;
        settempLoading(false);
        navigation.navigate('RegisterCompletionScreen');
        // registerAuthUser(); <--Authenticate
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Problem while registering',
        });
        settempLoading(false);
      }
    } else {
      settempLoading(false);
      dispatch(profilePictureSet(url));
      navigation.navigate('AgentVerificationScreen');
    }
  };
  const skipPciture = async () => {
    settempLoading(true);

    if (variables.accountType === 'client') {
      const params = {
        ...variables,
        profilePicture: profilePicture,
      };

      const isRegistered = await handleRegister(params);
      if (isRegistered) {
        settempLoading(false);
        navigation.navigate('RegisterCompletionScreen');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Problem while registering',
        });
        settempLoading(false);
      }
    } else {
      settempLoading(false);
      dispatch(profilePictureSet(url));
      navigation.navigate('AgentVerificationScreen');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setImage('')}>
            <Text style={styles.textRemove}>Remove</Text>
          </TouchableOpacity>
          {image ? (
            <View>
              <Image source={{uri: image}} style={styles.profileImage} />
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
            loading={tempLoading}
            onPress={() => submitRegister()}
          />
          <SkipButton
            Title="Skip"
            onPress={() => skipPciture()}
            loading={tempLoading}
          />
        </ScrollView>
      </BottomSheetStyle>
    </SafeAreaView>
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
