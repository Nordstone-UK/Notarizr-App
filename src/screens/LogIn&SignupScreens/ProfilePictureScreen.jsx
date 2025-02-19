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
  PermissionsAndroid,
} from 'react-native';
import ProgressBar from 'react-native-progress/Bar';
import React, {useEffect, useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import SkipButton from '../../components/MainGradientButton/SkipButton';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useDispatch, useSelector} from 'react-redux';

import {captureImage, chooseFile} from '../../utils/ImagePicker';

import {
  profilePictureSet,
  setProgress,
  setFilledCount,
} from '../../features/register/registerSlice';
import Toast from 'react-native-toast-message';
import useRegister from '../../hooks/useRegister';
import AuthenticateModal from '../../components/AuthenticateModal/AuthenticateModal';
import useAuthenticate from '../../hooks/useAuthenticate';
import useFetchUser from '../../hooks/useFetchUser';
import {Dimensions} from 'react-native';

export default function ProfilePictureScreen({navigation}) {
  const registerData = useSelector(state => state.register);
  const totalFields = registerData.accountType === 'client' ? 8 : 12;
  const {width} = Dimensions.get('window');
  const [image, setImage] = useState();
  const [errorMessage, setErrorMessage] = useState('');
  const [tempLoading, settempLoading] = useState(false);
  const [profilePicture, setProfilePicure] = useState('');
  const [answer, setAnswer] = useState('');
  const variables = useSelector(state => state.register);
  const [visible, setVisible] = useState(false);
  const [skip, setSkip] = useState(false);
  const dispatch = useDispatch();
  const {handleCompression, uploadBlobToS3, handleRegister} = useRegister();
  const {registerAuthUser, conAgentVerificationScreensentAuth} =
    useAuthenticate();
  const {fetchUserInfo} = useFetchUser();
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
            const progressValue = (registerData.filledCount + 1) / totalFields;
            dispatch(setFilledCount(registerData.filledCount + 1));
            dispatch(setProgress(progressValue));
          },
        },
        {
          text: 'Camera',
          onPress: async () => {
            const uri = await captureImage('photo');
            setImage(uri);
            const progressValue = (registerData.filledCount + 1) / totalFields;
            dispatch(setFilledCount(registerData.filledCount + 1));
            dispatch(setProgress(progressValue));
          },
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  const handleAuthPermission = async state => {
    console.log('state', state);
    setSkip(state);
    setVisible(true);

    // if (state) {
    if (state == 'skip') {
      console.log('Skipping');
      await skipPciture();
      setVisible(false);
    } else if (image) {
      console.log('submitRegister');
      await submitRegister();
      setVisible(false);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please add an image',
      });
    }
    // } else {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'You need to consent to continue',
    //   });
    //   setVisible(false);
    // }
  };
  const AuthFuc = async state => {
    if (state) {
      if (skip) {
        console.log('Skipping');
        await skipPciture();
        setVisible(false);
      } else if (image) {
        console.log('submitRegister');
        await submitRegister();
        setVisible(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Please add an image',
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'You need to consent to continue',
      });
      setVisible(false);
    }
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
        settempLoading(false);
        await registerAuthUser()
          .then(async () => {
            await fetchUserInfo()
              .then(async response => {
                await consentAuth(
                  response?.first_name + ' ' + response?.last_name,
                  response?.userAccessCode,
                );
              })
              .catch(error => {
                console.log('Fetching user Auth', error);
              });
          })
          .catch(error => {
            console.log('Registering user Auth', error);
          });
        const progressValue = (registerData.filledCount + 1) / totalFields;
        dispatch(setFilledCount(registerData.filledCount + 1));
        dispatch(setProgress(progressValue));
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
      // const progressValue = (registerData.filledCount + 1) / totalFields;
      // dispatch(setFilledCount(registerData.filledCount + 1));
      // dispatch(setProgress(progressValue));
      navigation.navigate('AgentVerificationScreen');
    }
  };
  const handleUpload = () => {
    const progressValue = (registerData.filledCount + 1) / totalFields;
    dispatch(setFilledCount(registerData.filledCount + 1));
    dispatch(setProgress(progressValue));
  };

  const handleDelete = () => {
    const progressValue = (registerData.filledCount - 1) / totalFields;
    dispatch(setFilledCount(registerData.filledCount - 1));
    dispatch(setProgress(progressValue));
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
        await registerAuthUser()
          .then(async () => {
            await fetchUserInfo()
              .then(async response => {
                await consentAuth(
                  response?.first_name + ' ' + response?.last_name,
                  response?.userAccessCode,
                );
              })
              .catch(error => {
                console.log('Fetching user Auth', error);
              });
          })
          .catch(error => {
            console.log('Registering user Auth', error);
          });
        await handleUpload();
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
      // dispatch(profilePictureSet(url));
      await handleUpload();
      navigation.navigate('AgentVerificationScreen');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <CompanyHeader
        Header="Profile Image"
        reset="true"
        subHeading="Please provide us with your profile image"
        HeaderStyle={{alignSelf: 'center'}}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: 17,
          marginVertical: heightToDp(1.5),
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
      <BottomSheetStyle>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => {
              setImage('');
              handleDelete();
            }}>
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
            onPress={() => handleAuthPermission(false)}
          />
          <SkipButton
            Title="Skip"
            onPress={() => handleAuthPermission('skip')}
            loading={tempLoading}
          />
        </ScrollView>
      </BottomSheetStyle>
      {/* {visible && (
        <AuthenticateModal
          modalVisible={visible}
          setModalVisible={bool => setVisible(bool)}
          handleConsent={answer => AuthFuc(answer)}
        />
      )} */}
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
  progressContainer: {
    marginVertical: 25,
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
