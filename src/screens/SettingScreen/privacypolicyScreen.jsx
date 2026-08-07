import React from 'react';
import LegalWebScreen from '../../components/Support/LegalWebScreen';

export default function PrivacyPolicyScreen({navigation}) {
  return (
    <LegalWebScreen
      navigation={navigation}
      title="Privacy policy"
      description="A clear view of how Notarizr collects, uses, and protects your information."
      icon="shield"
      url="https://notarizr.co/privacypolicy/"
    />
  );
}
