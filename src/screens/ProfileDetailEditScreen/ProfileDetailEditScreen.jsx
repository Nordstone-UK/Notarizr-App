import React, {useMemo, useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import AuthPhoneField from '../../components/AuthFlow/AuthPhoneField';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import AuthTextField from '../../components/AuthFlow/AuthTextField';
import ProfileDateField from '../../components/Profile/ProfileDateField';
import ProfileScreenHeader from '../../components/Profile/ProfileScreenHeader';
import {saveUserInfo} from '../../features/user/userSlice';
import useFetchUser from '../../hooks/useFetchUser';
import useRegister from '../../hooks/useRegister';
import useUpdate from '../../hooks/useUpdate';
import {captureImage, chooseFile} from '../../utils/ImagePicker';
import {goBackOrNavigate} from '../../utils/navigationHelpers';

const ORANGE = '#FD6D1F';

const getInitialDate = dateOfBirth => {
  if (!dateOfBirth) {
    return new Date(1990, 0, 1);
  }

  const parsed = moment.utc(dateOfBirth, ['YYYY-MM-DD', moment.ISO_8601]);
  return parsed.isValid() ? parsed.toDate() : new Date(1990, 0, 1);
};

export default function ProfileDetailEditScreen({navigation, route}) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const profileEdit = Boolean(route.params?.profileEdit);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [location, setLocation] = useState(user?.location || '');
  const [email] = useState(user?.email || '');
  const [description, setDescription] = useState(user?.description || '');
  const [date, setDate] = useState(getInitialDate(user?.date_of_birth));
  const [image, setImage] = useState(user?.profile_picture || '');
  const [imageChanged, setImageChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  const {fetchUserInfo} = useFetchUser();
  const {handleCompression, uploadBlobToS3} = useRegister();
  const {handleProfileUpdate} = useUpdate();
  const isClient = user?.account_type === 'client';

  const fullName = useMemo(
    () => [firstName, lastName].filter(Boolean).join(' '),
    [firstName, lastName],
  );

  const goBack = () => goBackOrNavigate(navigation, 'ProfileInfoScreen');

  const selectImage = async picker => {
    try {
      const uri = await picker('photo');
      if (uri) {
        setImage(uri);
        setImageChanged(true);
      }
    } catch (error) {
      if (!String(error).toLowerCase().includes('cancel')) {
        Toast.show({
          type: 'error',
          text1: 'Photo unavailable',
          text2: 'Please try another photo source.',
        });
      }
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Profile photo', 'Choose where to get your photo.', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Photo library', onPress: () => selectImage(chooseFile)},
      {text: 'Camera', onPress: () => selectImage(captureImage)},
    ]);
  };

  const validate = () => {
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing information',
        text2: 'Add your name and phone number before saving.',
      });
      return false;
    }

    if (moment().diff(moment(date), 'years') < 18) {
      Toast.show({
        type: 'error',
        text1: 'Invalid date of birth',
        text2: 'You must be at least 18 years old.',
      });
      return false;
    }

    if (!isClient && !description.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Description required',
        text2: 'Add a short professional description before saving.',
      });
      return false;
    }

    return true;
  };

  const savePreviewProfile = () => {
    dispatch(
      saveUserInfo({
        ...user,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber,
        location: location.trim(),
        description: description.trim(),
        date_of_birth: moment(date).format('YYYY-MM-DD'),
        profile_picture: image,
      }),
    );
    Toast.show({
      type: 'success',
      text1: 'Profile updated',
      text2: 'Your preview details were saved.',
    });
    goBack();
  };

  const submitProfile = async () => {
    if (!validate()) {
      return;
    }

    if (user?.isHomePreview) {
      savePreviewProfile();
      return;
    }

    setLoading(true);
    try {
      let profilePicture = image;
      if (imageChanged) {
        const imageBlob = await handleCompression(image);
        profilePicture = await uploadBlobToS3(imageBlob);
      }

      const updated = await handleProfileUpdate({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        phoneNumber,
        location: location.trim(),
        profilePicture,
        gender: user?.gender,
        description: description.trim(),
        dateOfBirth: date,
      });

      if (!updated) {
        throw new Error('Profile update failed');
      }

      await fetchUserInfo();
      Toast.show({
        type: 'success',
        text1: 'Profile updated',
        text2: 'Your changes have been saved.',
      });
      goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to save',
        text2: 'Please check your details and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ProfileScreenHeader
        title={profileEdit ? 'Edit profile' : 'Personal details'}
        actionLabel={profileEdit ? undefined : 'Edit'}
        onAction={() => navigation.setParams({profileEdit: true})}
        onBack={goBack}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.photoSection}>
            <View>
              <Image source={{uri: image}} style={styles.avatar} />
              {profileEdit && (
                <TouchableOpacity
                  accessibilityLabel="Change profile photo"
                  activeOpacity={0.72}
                  onPress={showPhotoOptions}
                  style={styles.cameraButton}>
                  <Feather name="camera" size={17} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.name}>{fullName || 'Your profile'}</Text>
            <Text style={styles.accountType}>
              {isClient ? 'Notarizr client' : 'Notary professional'}
            </Text>
            {profileEdit && (
              <TouchableOpacity activeOpacity={0.7} onPress={showPhotoOptions}>
                <Text style={styles.changePhoto}>Change profile photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Basic information</Text>
            <Text style={styles.sectionDescription}>
              {profileEdit
                ? 'Keep your account information accurate and up to date.'
                : 'The information connected to your Notarizr account.'}
            </Text>
          </View>

          <View style={styles.form}>
            <AuthTextField
              editable={profileEdit}
              icon="user"
              label="First name"
              onChangeText={setFirstName}
              placeholder="First name"
              value={firstName}
            />
            <AuthTextField
              editable={profileEdit}
              icon="user"
              label="Last name"
              onChangeText={setLastName}
              placeholder="Last name"
              value={lastName}
            />
            <AuthTextField
              editable={false}
              icon="mail"
              label="Email address"
              placeholder="Email address"
              value={email}
            />
            <AuthPhoneField
              editable={profileEdit}
              label="Phone number"
              onChangeText={setPhoneNumber}
              value={phoneNumber}
            />
            <ProfileDateField
              editable={profileEdit}
              label="Date of birth"
              onChange={setDate}
              value={date}
            />
            <AuthTextField
              editable={profileEdit}
              icon="map-pin"
              label="Primary address"
              onChangeText={setLocation}
              placeholder="Enter your address"
              value={location}
            />
            {!isClient && (
              <AuthTextField
                editable={profileEdit}
                icon="file-text"
                label="Professional description"
                multiline
                onChangeText={setDescription}
                placeholder="Tell clients about your notary experience"
                value={description}
              />
            )}

            {profileEdit && (
              <AuthPrimaryButton
                icon="check"
                loading={loading}
                onPress={submitProfile}
                style={styles.saveButton}
                title="Save changes"
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingBottom: 36,
  },
  photoSection: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    backgroundColor: '#FFF4EA',
  },
  avatar: {
    width: 88,
    height: 88,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 44,
    backgroundColor: '#EDEFF2',
  },
  cameraButton: {
    position: 'absolute',
    right: -2,
    bottom: 0,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 16,
    backgroundColor: ORANGE,
  },
  name: {
    marginTop: 14,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
  },
  accountType: {
    marginTop: 3,
    color: '#747B87',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
  },
  changePhoto: {
    marginTop: 10,
    color: ORANGE,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  sectionHeading: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 18,
  },
  sectionTitle: {
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  sectionDescription: {
    marginTop: 5,
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  form: {
    paddingHorizontal: 20,
  },
  saveButton: {
    marginTop: 8,
  },
});
