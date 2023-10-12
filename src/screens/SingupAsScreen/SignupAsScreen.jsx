import {
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useDispatch} from 'react-redux';
import {accountTypeSet} from '../../features/register/registerSlice';

export default function SignupAsScreen({navigation}) {
  const [colored, setColored] = useState('client');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const handleUserType = async colored => {
    setLoading(true);
    try {
      if (colored === 'client') {
        await navigation.navigate('SignUpDetailScreen');
        dispatch(accountTypeSet(colored));
      } else {
        await navigation.navigate('AgentSignupScreen');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CompanyHeader
        Header={`Join Notarizr 😎 ${'\n'}and enjoy our services`}
        HeaderStyle={{marginHorizontal: widthToDp(5)}}
      />
      <BottomSheetStyle>
        <ScrollView showsVerticalScrollIndicator={false}>
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
              loading={loading}
              onPress={() => handleUserType(colored)}
            />
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </SafeAreaView>
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
