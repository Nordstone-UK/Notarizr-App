import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';

export default function SignupAsScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/notarizrLogo.png')}
        style={styles.imagestyles}
      />
      <Text style={styles.textHeading}>Join Notarizr 😎</Text>
      <Text style={styles.textHeading}>and enjoy our services</Text>
      <SignupButton
        Title="SignUp as Client"
        colors={['rgb(255,222,89)', 'rgba(255,145,77,1)']}
        TextStyle={{color: '#fff'}}
      />
      <SignupButton
        Title="SignUp as Agent"
        colors={['#F5F6F7', '#fff']}
        TextStyle={{color: '#000'}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#FFF2DC',
  },
  imagestyles: {
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: '15%',
    marginBottom: '10%',
  },
  textHeading: {
    color: '#000',
    marginHorizontal: 15,
    fontSize: 27,
    fontStyle: 'normal',
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
});
