import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useDispatch} from 'react-redux';
// import {userType} from '../../features/user/userSlice';
import {accountTypeSet} from '../../features/register/registerSlice';

export default function SignupAsScreen({navigation}, props) {
  const [colored, setColored] = useState('client');
  const dispatch = useDispatch();
  const handlUserType = () => {
    dispatch(accountTypeSet(colored));
    // dispatch(userType(colored));
    navigation.navigate('SignUpDetailScreen');
  };

  return (
    <View style={styles.container}>
      <CompanyHeader
        Header={`Join Notarizr 😎 ${'\n'}and enjoy our services`}
        HeaderStyle={{marginHorizontal: widthToDp(5)}}
      />
      <BottomSheetStyle>
        <ScrollView>
          <SignupButton
            Title="SignUp as Client"
            colors={
              colored === 'client'
                ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                : ['#F5F6F7', '#fff']
            }
            TextStyle={colored === 'client' ? {color: '#fff'} : {color: '#000'}}
            picture={require('../../../assets/clientPic.png')}
            onPress={() => setColored('client')}
          />
          <SignupButton
            Title="SignUp as Agent"
            colors={
              colored === 'agent'
                ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                : ['#F5F6F7', '#fff']
            }
            TextStyle={colored === 'agent' ? {color: '#fff'} : {color: '#000'}}
            picture={require('../../../assets/agentPic.png')}
            onPress={() => setColored('agent')}
          />
          <View style={styles.buttonConatiner}>
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Get Started"
              onPress={() => handlUserType()}
            />
          </View>
        </ScrollView>
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
    marginVertical: widthToDp(6),
  },
});
