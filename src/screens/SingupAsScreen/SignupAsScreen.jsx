import {Image, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {widthToDp} from '../../utils/Responsive';

export default function SignupAsScreen() {
  const [Client, setClient] = useState(false);
  const handleClient = () => {
    setClient(true);
  };

  return (
    <View style={styles.container}>
      <CompanyHeader
        Header={`Join Notarizr 😎 ${'\n'}and enjoy our services`}
        HeaderStyle={{marginHorizontal: widthToDp(5)}}
      />
      <BottomSheetStyle>
        <SignupButton
          Title="SignUp as Client"
          colors={['rgb(255,222,89)', 'rgba(255,145,77,1)']}
          TextStyle={{color: '#fff'}}
          picture={require('../../../assets/clientPic.png')}
          handleFunction={handleClient}
        />
        <SignupButton
          Title="SignUp as Agent"
          colors={['#F5F6F7', '#fff']}
          TextStyle={{color: '#000'}}
          picture={require('../../../assets/agentPic.png')}
          handleFunction={handleClient}
        />
        <View style={styles.buttonConatiner}>
          {Client ? (
            <MainButton
              colors={['rgb(255,222,89)', 'rgba(255,145,77,1)']}
              Title="Get Started"
            />
          ) : null}
        </View>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#FFF2DC',
  },
  buttonConatiner: {
    marginTop: widthToDp(25),
  },
});
