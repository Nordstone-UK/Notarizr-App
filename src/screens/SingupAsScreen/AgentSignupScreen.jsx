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
import {accountTypeSet} from '../../features/register/registerSlice';

export default function AgentSignupScreen({navigation}) {
  const [colored, setColored] = useState('individual');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const handleUserType = async colored => {
    setLoading(true);
    try {
      //   await dispatch(accountTypeSet(colored));
      await navigation.navigate('SignUpDetailScreen');
    } catch (error) {
      console.error('Error occurred:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CompanyHeader
        Header={`Select whether you are an Individual or a Business`}
        HeaderStyle={{marginHorizontal: widthToDp(5)}}
      />
      <BottomSheetStyle>
        <ScrollView showsVerticalScrollIndicator={false}>
          <SignupButton
            Title="SignUp as Individual"
            colors={
              colored === 'individual'
                ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                : ['#F5F6F7', '#fff']
            }
            TextStyle={
              colored === 'individual' ? {color: '#fff'} : {color: '#000'}
            }
            picture={require('../../../assets/clientPic.png')}
            onPress={() => setColored('individual')}
          />
          <SignupButton
            Title="SignUp as Business"
            colors={
              colored === 'business'
                ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                : ['#F5F6F7', '#fff']
            }
            TextStyle={
              colored === 'business' ? {color: '#fff'} : {color: '#000'}
            }
            picture={require('../../../assets/business.jpg')}
            onPress={() => setColored('business')}
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
