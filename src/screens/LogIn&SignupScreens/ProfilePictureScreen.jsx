import React, {useState} from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import AuthProgressHeader from '../../components/AuthFlow/AuthProgressHeader';
import AuthUploadCard from '../../components/AuthFlow/AuthUploadCard';
import {
  profilePictureSet,
  setFilledCount,
  setProgress,
} from '../../features/register/registerSlice';
import useAuthenticate from '../../hooks/useAuthenticate';
import useFetchUser from '../../hooks/useFetchUser';
import useRegister from '../../hooks/useRegister';
import {captureImage, chooseFile} from '../../utils/ImagePicker';
import {goBackOrNavigate} from '../../utils/navigationHelpers';

export default function ProfilePictureScreen({navigation}) {
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const registerData = useSelector(state => state.register);
  const isClient = registerData.accountType === 'client';
  const totalFields = isClient ? 8 : 12;
  const dispatch = useDispatch();
  const {handleCompression, uploadBlobToS3, handleRegister} = useRegister();
  const {registerAuthUser, consentAuth} = useAuthenticate();
  const {fetchUserInfo} = useFetchUser();

  const updateProgress = () => {
    const filledCount = Math.min(registerData.filledCount + 1, totalFields);
    dispatch(setFilledCount(filledCount));
    dispatch(setProgress(filledCount / totalFields));
  };

  const showImageSourceAlert = () => {
    Alert.alert('Add profile photo', 'Choose where to get your photo.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Photo Library',
        onPress: async () => {
          const uri = await chooseFile('photo');
          if (uri) {
            setImage(uri);
          }
        },
      },
      {
        text: 'Camera',
        onPress: async () => {
          const uri = await captureImage('photo');
          if (uri) {
            setImage(uri);
          }
        },
      },
    ]);
  };

  const finishClientRegistration = async profilePicture => {
    const isRegistered = await handleRegister({
      ...registerData,
      profilePicture,
    });
    if (!isRegistered) {
      return false;
    }

    await registerAuthUser();
    const user = await fetchUserInfo();
    if (user?.userAccessCode) {
      await consentAuth(
        `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
        user.userAccessCode,
      );
    }
    updateProgress();
    navigation.navigate('RegisterCompletionScreen');
    return true;
  };

  const continueNotaryRegistration = profilePicture => {
    if (profilePicture) {
      dispatch(profilePictureSet(profilePicture));
    }
    updateProgress();
    navigation.navigate('AgentVerificationScreen');
  };

  const handleContinue = async () => {
    if (!image) {
      Toast.show({
        type: 'warning',
        text1: 'Add a profile photo',
        text2: 'Choose a photo or skip this step.',
      });
      return;
    }

    setLoading(true);
    try {
      const imageBlob = await handleCompression(image);
      const profilePicture = await uploadBlobToS3(imageBlob);
      if (isClient) {
        const completed = await finishClientRegistration(profilePicture);
        if (!completed) {
          throw new Error('Registration failed');
        }
      } else {
        continueNotaryRegistration(profilePicture);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to continue',
        text2: 'Please try uploading your photo again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      if (isClient) {
        const completed = await finishClientRegistration('');
        if (!completed) {
          throw new Error('Registration failed');
        }
      } else {
        continueNotaryRegistration('');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to continue',
        text2: 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AuthProgressHeader
        title="Profile photo"
        progress={registerData.progress}
        onBack={() => goBackOrNavigate(navigation, 'SignUpDetailScreen')}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>MAKE IT PERSONAL</Text>
          <Text style={styles.heading}>Add a profile photo</Text>
          <Text style={styles.subheading}>
            {isClient
              ? 'A clear photo helps your notary recognize you.'
              : 'Use a professional photo that clients can recognize.'}
          </Text>
        </View>

        {image ? (
          <View style={styles.previewSection}>
            <View style={styles.imageWrap}>
              <Image source={{uri: image}} style={styles.profileImage} />
              <TouchableOpacity
                accessibilityLabel="Change profile photo"
                activeOpacity={0.78}
                onPress={showImageSourceAlert}
                style={styles.editButton}>
                <Feather name="camera" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setImage('')}>
              <Text style={styles.removeText}>Remove photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <AuthUploadCard
            title="Choose a profile photo"
            description="Use your camera or select an image from your library."
            icon="camera"
            onPress={showImageSourceAlert}
          />
        )}

        <View style={styles.privacyNote}>
          <Feather name="shield" size={19} color="#FD6D1F" />
          <Text style={styles.privacyText}>
            Your photo is stored securely and only used for your profile.
          </Text>
        </View>

        <AuthPrimaryButton
          title="Continue"
          icon="arrow-right"
          loading={loading}
          onPress={handleContinue}
          style={styles.continueButton}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={loading}
          onPress={handleSkip}
          style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  intro: {
    marginBottom: 28,
  },
  eyebrow: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  heading: {
    marginTop: 7,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 28,
  },
  subheading: {
    marginTop: 8,
    color: '#6C727F',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  previewSection: {
    alignItems: 'center',
  },
  imageWrap: {
    position: 'relative',
  },
  profileImage: {
    width: 168,
    height: 168,
    borderWidth: 5,
    borderColor: '#FFF0E7',
    borderRadius: 84,
  },
  editButton: {
    position: 'absolute',
    right: 4,
    bottom: 8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 22,
    backgroundColor: '#FD6D1F',
  },
  removeText: {
    marginTop: 14,
    color: '#D92D20',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF7F2',
  },
  privacyText: {
    flex: 1,
    marginLeft: 11,
    color: '#636B77',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  continueButton: {
    marginTop: 28,
  },
  skipButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  skipText: {
    color: '#596170',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
});
