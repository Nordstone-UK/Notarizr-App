import React from 'react';
import LegalWebScreen from '../../components/Support/LegalWebScreen';

export default function TermsAndConditionsScreen({navigation}) {
  return (
    <LegalWebScreen
      navigation={navigation}
      title="Terms and conditions"
      url="https://notarizr.co/terms-policies/"
    />
  );
}
