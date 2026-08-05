import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useLazyQuery} from '@apollo/react-hooks';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import AuthPhoneField from '../../components/AuthFlow/AuthPhoneField';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import AuthProgressHeader from '../../components/AuthFlow/AuthProgressHeader';
import AuthSelectField from '../../components/AuthFlow/AuthSelectField';
import AuthTextField from '../../components/AuthFlow/AuthTextField';
import {statesData} from '../../data/statesData';
import {
  emailSet,
  setFilledCount,
  setProgress,
} from '../../features/register/registerSlice';
import {IS_EMAIL_VALID} from '../../../request/queries/isEmailValid.query';
import {IS_MOBILENO_VALID} from '../../../request/queries/isPhoneNoValid.query';
import {GET_VALID_PHONE_OTP} from '../../../request/queries/getValidPhoneOTP.query';
import {goBackOrNavigate} from '../../utils/navigationHelpers';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpDetailScreen({navigation}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [description, setDescription] = useState('');
  const [emailTaken, setEmailTaken] = useState(false);
  const [phoneTaken, setPhoneTaken] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isEmailValid, {loading: emailLoading}] = useLazyQuery(IS_EMAIL_VALID);
  const [isMobileNoValid, {loading: phoneValidationLoading}] =
    useLazyQuery(IS_MOBILENO_VALID);
  const [getPhoneOtp, {loading: otpLoading}] =
    useLazyQuery(GET_VALID_PHONE_OTP);
  const dispatch = useDispatch();
  const registerData = useSelector(state => state.register);
  const accountType = registerData.accountType;
  const isClient = accountType === 'client';
  const totalFields = isClient ? 8 : 12;
  const date = '22-05-2010';

  useEffect(() => {
    let filledFields = 1;
    if (firstName.trim()) {
      filledFields += 1;
    }
    if (lastName.trim()) {
      filledFields += 1;
    }
    if (emailRegex.test(email.trim())) {
      filledFields += 1;
    }
    if (phoneNumber.trim()) {
      filledFields += 1;
    }
    if (location.trim()) {
      filledFields += 1;
    }
    if (!isClient && description.trim()) {
      filledFields += 1;
    }

    dispatch(setFilledCount(filledFields));
    dispatch(setProgress(Math.min(filledFields / totalFields, 1)));
  }, [
    description,
    dispatch,
    email,
    firstName,
    isClient,
    lastName,
    location,
    phoneNumber,
    totalFields,
  ]);

  const handleGetPhoneOtp = async () => {
    dispatch(emailSet(email));
    try {
      const response = await getPhoneOtp({variables: {phoneNumber}});
      if (response?.data?.getValidPhoneOtp?.status === '403') {
        Toast.show({
          type: 'error',
          text1: 'We are Sorry!',
          text2: 'This User is Blocked',
        });
      } else if (response?.data?.getValidPhoneOtp?.status !== '200') {
        Toast.show({
          type: 'error',
          text1: 'OTP not sent!',
          text2: 'We encountered a problem please try again',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: `OTP Sent on ${response.data.getValidPhoneOtp.phoneNumber}`,
          text2: '',
        });
        navigation.navigate('SignPhoneVerification', {
          firstName,
          lastName,
          location,
          email,
          phoneNumber,
          description,
          date,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'OTP not sent',
        text2: 'Please try again.',
      });
    }
  };

  const handleContinue = async () => {
    setSubmitted(true);
    const missingRequiredField =
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !location.trim() ||
      (!isClient && !description.trim());

    if (missingRequiredField) {
      Toast.show({
        type: 'warning',
        text1: 'Complete your profile',
        text2: 'Please fill in all required fields.',
      });
      return;
    }
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    }

    try {
      const emailResponse = await isEmailValid({variables: {email}});
      const isEmailTaken = emailResponse?.data?.isEmailValid?.emailTaken;
      setEmailTaken(isEmailTaken);
      if (isEmailTaken) {
        return;
      }

      const phoneResponse = await isMobileNoValid({variables: {phoneNumber}});
      const isPhoneTaken = phoneResponse?.data?.isMobileNoValid?.phoneNoTaken;
      setPhoneTaken(isPhoneTaken);
      if (isPhoneTaken) {
        return;
      }

      await handleGetPhoneOtp();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to continue',
        text2: 'Please check your details and try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AuthProgressHeader
        title="Profile details"
        progress={registerData.progress}
        onBack={() => goBackOrNavigate(navigation, 'SignupAsScreen')}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>
            {isClient ? 'CLIENT PROFILE' : 'NOTARY PROFILE'}
          </Text>
          <Text style={styles.heading}>Tell us about yourself</Text>
          <Text style={styles.subheading}>
            {isClient
              ? 'Add your details so notaries can serve you securely.'
              : 'Build a professional profile clients can trust.'}
          </Text>
        </View>

        <AuthTextField
          label="First name"
          icon="user"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
          autoCapitalize="words"
          error={submitted && !firstName.trim() ? 'First name is required' : ''}
        />
        <AuthTextField
          label="Last name"
          icon="user"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
          autoCapitalize="words"
          error={submitted && !lastName.trim() ? 'Last name is required' : ''}
        />
        <AuthTextField
          label="Email address"
          icon="mail"
          value={email}
          onChangeText={text => {
            setEmail(text);
            setEmailTaken(false);
          }}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={
            emailTaken
              ? 'This email is already registered'
              : submitted && !emailRegex.test(email)
              ? 'Enter a valid email address'
              : ''
          }
        />
        <AuthPhoneField
          value={phoneNumber}
          onChangeText={text => {
            setPhoneNumber(text);
            setPhoneTaken(false);
          }}
          error={
            phoneTaken
              ? 'This phone number is already registered'
              : submitted && !phoneNumber
              ? 'Phone number is required'
              : ''
          }
        />

        {isClient ? (
          <AuthSelectField
            label="State"
            placeholder="Choose your state"
            data={statesData}
            value={selectedState}
            onSelect={item => {
              setSelectedState(item.value);
              setLocation(item.label.replace(/\s+/g, ''));
            }}
            error={submitted && !location ? 'State is required' : ''}
          />
        ) : (
          <>
            <AuthTextField
              label="City"
              icon="map-pin"
              value={location}
              onChangeText={setLocation}
              placeholder="Enter your city"
              autoCapitalize="words"
              error={submitted && !location.trim() ? 'City is required' : ''}
            />
            <AuthTextField
              label="Professional bio"
              icon="align-left"
              value={description}
              onChangeText={setDescription}
              placeholder="Tell clients about your notary experience"
              multiline
              maxLength={500}
              error={
                submitted && !description.trim()
                  ? 'Professional bio is required'
                  : ''
              }
            />
          </>
        )}

        <AuthPrimaryButton
          title="Continue"
          icon="arrow-right"
          loading={emailLoading || phoneValidationLoading || otpLoading}
          onPress={handleContinue}
          style={styles.continueButton}
        />
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
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 36,
  },
  intro: {
    marginBottom: 24,
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
    lineHeight: 35,
  },
  subheading: {
    marginTop: 7,
    color: '#6C727F',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  continueButton: {
    marginTop: 8,
  },
});
