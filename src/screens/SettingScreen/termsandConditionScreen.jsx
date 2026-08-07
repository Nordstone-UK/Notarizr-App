import React from 'react';
import LegalWebScreen from '../../components/Support/LegalWebScreen';

export default function TermsAndConditionsScreen({navigation}) {
  return (
    <LegalWebScreen
      navigation={navigation}
      title="Terms and conditions"
      description="The rules that keep every Notarizr booking clear, fair, and secure."
      icon="file-text"
      url="https://notarizr.co/terms-and-conditions/"
    />
  );
}
