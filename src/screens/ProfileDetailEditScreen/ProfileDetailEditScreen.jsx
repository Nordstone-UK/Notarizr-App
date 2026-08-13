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
import AppColors from '../../themes/AppColors';

const ORANGE = AppColors.primary;

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
  const [imageFailed, setImageFailed] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  const {fetchUserInfo} = useFetchUser();
  const {handleCompression, uploadMedia} = useRegister();
  const {handleProfileUpdate} = useUpdate();
  const isClient = user?.account_type === 'client';

  const fullName = useMemo(
    () => [firstName, lastName].filter(Boolean).join(' '),
    [firstName, lastName],
  );
  const initials = useMemo(
    () =>
      [firstName, lastName]
        .filter(Boolean)
        .map(value => value.trim().charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [firstName, lastName],
  );

  const goBack = () => goBackOrNavigate(navigation, 'ProfileInfoScreen');

  const selectImage = async picker => {
    try {
      const uri = await picker('photo');
      if (uri) {
        setImage(uri);
        setImageFailed(false);
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
        profilePicture = await uploadMedia(imageBlob, 'profile');
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
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />
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
          <View style={styles.profileHero}>
            <View style={styles.heroGlow} />
            <Text style={styles.heroEyebrow}>
              {profileEdit ? 'PROFILE APPEARANCE' : 'ACCOUNT IDENTITY'}
            </Text>
            <View style={styles.profileCard}>
              <View style={styles.avatarFrame}>
                <View style={styles.avatarClip}>
                  {image && !imageFailed ? (
                    <Image
                      onError={() => setImageFailed(true)}
                      source={{uri: image}}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitials}>
                        {initials || 'N'}
                      </Text>
                    </View>
                  )}
                </View>
                {profileEdit && (
                  <TouchableOpacity
                    accessibilityLabel="Change profile photo"
                    activeOpacity={0.72}
                    onPress={showPhotoOptions}
                    style={styles.cameraButton}>
                    <Feather name="camera" size={17} color={AppColors.white} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.name}>{fullName || 'Your profile'}</Text>
                <Text style={styles.accountType}>
                  {isClient ? 'Notarizr client' : 'Notary professional'}
                </Text>
                <View style={styles.verifiedRow}>
                  <Feather
                    name="check-circle"
                    size={13}
                    color={AppColors.success}
                  />
                  <Text style={styles.verifiedText}>Account verified</Text>
                </View>
              </View>
            </View>
            {profileEdit && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={showPhotoOptions}
                style={styles.photoAction}>
                <Feather name="image" size={14} color={AppColors.primary} />
                <Text style={styles.changePhoto}>Choose a different photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIcon}>
                <Feather
                  name={profileEdit ? 'edit-3' : 'user-check'}
                  size={18}
                  color={AppColors.primary}
                />
              </View>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>Basic information</Text>
                <Text style={styles.sectionDescription}>
                  {profileEdit
                    ? 'Keep your account information accurate and up to date.'
                    : 'The information connected to your Notarizr account.'}
                </Text>
              </View>
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
                icon="users"
                label="Last name"
                onChangeText={setLastName}
                placeholder="Last name"
                value={lastName}
              />
              <AuthTextField
                editable={false}
                icon="at-sign"
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
                icon="navigation"
                label="Primary address"
                onChangeText={setLocation}
                placeholder="Enter your address"
                value={location}
              />
              {!isClient && (
                <AuthTextField
                  editable={profileEdit}
                  icon="align-left"
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
            {!profileEdit && (
              <View style={styles.readOnlyNote}>
                <Feather
                  name="lock"
                  size={13}
                  color={AppColors.textSecondary}
                />
                <Text style={styles.readOnlyText}>
                  Your personal information is visible only to you.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  accountType: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 3,
  },
  avatar: {borderRadius: 35, height: '100%', width: '100%'},
  avatarClip: {
    borderRadius: 35,
    height: 70,
    overflow: 'hidden',
    width: 70,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  avatarFrame: {
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 38,
    borderWidth: 3,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  avatarInitials: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 21,
  },
  cameraButton: {
    alignItems: 'center',
    backgroundColor: ORANGE,
    borderColor: AppColors.textPrimary,
    borderRadius: 16,
    borderWidth: 2,
    bottom: 0,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 32,
  },
  changePhoto: {
    color: ORANGE,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    marginLeft: 7,
  },
  content: {paddingBottom: 34},
  form: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  formSection: {paddingHorizontal: 16, paddingTop: 22},
  heroEyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 1,
  },
  heroGlow: {
    backgroundColor: 'rgba(253,109,31,0.14)',
    borderRadius: 80,
    height: 160,
    position: 'absolute',
    right: -35,
    top: -78,
    width: 160,
  },
  keyboardView: {flex: 1},
  name: {color: AppColors.white, fontFamily: 'Manrope-Bold', fontSize: 18},
  photoAction: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: AppColors.white,
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 17,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  profileCard: {alignItems: 'center', flexDirection: 'row', marginTop: 18},
  profileCopy: {flex: 1, marginLeft: 14},
  profileHero: {
    backgroundColor: AppColors.textPrimary,
    overflow: 'hidden',
    paddingBottom: 23,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  readOnlyNote: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  readOnlyText: {
    color: AppColors.textSecondary,
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 7,
  },
  safeArea: {backgroundColor: AppColors.white, flex: 1},
  saveButton: {marginBottom: 15, marginTop: 2},
  sectionCopy: {flex: 1, marginLeft: 11},
  sectionDescription: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 13,
  },
  sectionIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  verifiedRow: {alignItems: 'center', flexDirection: 'row', marginTop: 9},
  verifiedText: {
    color: AppColors.success,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    marginLeft: 5,
  },
});
