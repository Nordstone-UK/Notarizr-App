import {Image, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

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
          color={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
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
              color={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
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
