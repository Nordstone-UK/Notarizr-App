import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import AuthProgressHeader from '../../components/AuthFlow/AuthProgressHeader';
import AccountTypeCard from '../../components/AuthFlow/AccountTypeCard';
import SignupBenefit from '../../components/AuthFlow/SignupBenefit';
import {
  accountTypeSet,
  setFilledCount,
  setProgress,
} from '../../features/register/registerSlice';
import {goBackOrNavigate} from '../../utils/navigationHelpers';

const ACCOUNT_OPTIONS = {
  client: {
    title: 'I need a notary',
    description: 'Book trusted online or mobile notary services.',
    icon: 'file-text',
  },
  agent: {
    title: "I'm a notary",
    description: 'Join the network and manage client requests.',
    icon: 'briefcase',
  },
};

const BENEFITS = {
  client: {
    icon: 'gift',
    title: 'Start booking in minutes',
    description: 'Create your profile and connect with trusted notaries.',
  },
  agent: {
    icon: 'trending-up',
    title: 'Grow your notary business',
    description: 'Receive new requests and manage appointments in one place.',
  },
};

export default function SignupAsScreen({navigation}) {
  const [selectedType, setSelectedType] = useState('client');
  const [loading, setLoading] = useState(false);
  const registerData = useSelector(state => state.register);
  const dispatch = useDispatch();
  const selectedBenefit = BENEFITS[selectedType];

  useEffect(() => {
    const totalFields = selectedType === 'client' ? 8 : 12;
    dispatch(setFilledCount(1));
    dispatch(setProgress(1 / totalFields));
  }, [dispatch, selectedType]);

  const handleContinue = () => {
    setLoading(true);
    const accountType =
      selectedType === 'client' ? 'client' : 'individual-agent';

    dispatch(accountTypeSet(accountType));
    navigation.navigate('SignUpDetailScreen');
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AuthProgressHeader
        progress={registerData?.progress}
        onBack={() => goBackOrNavigate(navigation, 'LoginScreen')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>CHOOSE YOUR ACCOUNT</Text>
          <Text style={styles.heading}>How will you use Notarizr?</Text>
          <Text style={styles.subheading}>
            Select the option that best matches what you need.
          </Text>
        </View>

        <View style={styles.cardStack}>
          <AccountTypeCard
            {...ACCOUNT_OPTIONS.client}
            selected={selectedType === 'client'}
            onPress={() => setSelectedType('client')}
          />
          <View style={styles.cardSpacer} />
          <AccountTypeCard
            {...ACCOUNT_OPTIONS.agent}
            selected={selectedType === 'agent'}
            onPress={() => setSelectedType('agent')}
          />
        </View>

        <SignupBenefit {...selectedBenefit} />

        <AuthPrimaryButton
          title={
            selectedType === 'client'
              ? 'Continue as a client'
              : 'Continue as a notary'
          }
          icon="arrow-right"
          loading={loading}
          onPress={handleContinue}
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
  },
  intro: {
    marginTop: 8,
    marginBottom: 22,
  },
  eyebrow: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  heading: {
    marginTop: 8,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 28,
    lineHeight: 35,
  },
  subheading: {
    marginTop: 8,
    color: '#6C727F',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  cardStack: {
    width: '100%',
  },
  cardSpacer: {
    height: 12,
  },
});
