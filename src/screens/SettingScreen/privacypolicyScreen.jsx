import React from 'react';
import LegalWebScreen from '../../components/Support/LegalWebScreen';

export default function PrivacyPolicyScreen({navigation}) {
  return (
    <LegalWebScreen
      navigation={navigation}
      title="Privacy policy"
      url="https://notarizr.co/privacypolicy/"
    />
  );
}
