import {Image, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';

export default function SignupAsScreen({navigation}, props) {
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
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
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
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              // GradiStyles={{marginTop: widthToDp(5)}}
              Title="Get Started"
              onPress={() => navigation.navigate('SignUpScreen')}
            />
          ) : null}
        </View>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
  buttonConatiner: {
    flex: 1,
    justifyContent: 'flex-end',
    marginVertical: widthToDp(5),
  },
});
