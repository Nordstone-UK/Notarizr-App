import {
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

import React, {useEffect, useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import {
  setProgress,
  setFilledCount,
} from '../../features/register/registerSlice';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useDispatch, useSelector} from 'react-redux';
import {accountTypeSet} from '../../features/register/registerSlice';

export default function SignupAsScreen({navigation}) {
  const [colored, setColored] = useState('client');
  const [loading, setLoading] = useState(false);
  const registerData = useSelector(state => state.register);

  const {width} = Dimensions.get('window');

  const dispatch = useDispatch();
  const handleUserType = async colored => {
    setLoading(true);
    try {
      if (colored === 'client') {
        await navigation.navigate('SignUpDetailScreen');
        dispatch(accountTypeSet(colored));
      } else {
        //await navigation.navigate('AgentSignupScreen');
        dispatch(accountTypeSet('individual-agent'));
        navigation.navigate('SignUpDetailScreen');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const totalFields = colored === 'client' ? 8 : 12;
    const progressValue = 1 / totalFields;
    dispatch(setFilledCount(1));
    dispatch(setProgress(progressValue));
  }, [colored]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Your Notary Journey: {Math.round(registerData?.progress * 100)}% 🚀
        </Text>
        <ProgressBar
          progress={registerData.progress}
          width={width * 0.9}
          color={Colors.OrangeGradientEnd}
          unfilledColor={Colors.OrangeGradientStart}
          borderWidth={0}
        />
      </View>

      <CompanyHeader
        Header={`Join Notarizr 😎 ${'\n'}and enjoy our services`}
        HeaderStyle={{marginHorizontal: widthToDp(5)}}
      />
      <BottomSheetStyle>
        <ScrollView showsVerticalScrollIndicator={false}>
          <SignupButton
            Title="Become a VIP Clients 🎟️"
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
            Title="Join the Elite Notary Network 🚀"
            colors={
              colored === 'agent'
                ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                : ['#F5F6F7', '#fff']
            }
            TextStyle={colored === 'agent' ? {color: '#fff'} : {color: '#000'}}
            picture={require('../../../assets/agentPic.png')}
            onPress={() => setColored('agent')}
          />
          {/* Avatar & Challenge Section */}
          <View style={styles.challengeContainer}>
            <Text style={styles.challengeText}>
              Earn points for completed tasks! 🎯
            </Text>
            <Text style={styles.challengeSubText}>
              {colored === 'agent'
                ? 'Complete 5 tasks to earn your first badge! 🏆'
                : 'Book your first notarization and earn a discount! 💰'}
            </Text>
            {colored === 'agent' ? (
              <Image
                source={require('../../../assets/trophy.png')}
                style={styles.badgeImage}
              />
            ) : (
              <Image
                source={require('../../../assets/money.png')}
                style={styles.badgeImage}
              />
            )}
          </View>

          <View style={styles.buttonConatiner}>
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Unlock Notarization Power! 🔓"
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
  progressContainer: {
    marginTop: widthToDp(2),
    paddingHorizontal: widthToDp(5),
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.OrangeGradientEnd,
    marginBottom: widthToDp(1),
  },
  progressBar: {
    height: widthToDp(2),
  },
  challengeContainer: {
    marginTop: widthToDp(5),
    alignItems: 'center',
  },
  challengeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7A28',
  },
  challengeSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: widthToDp(2),
  },
  badgeImage: {
    width: widthToDp(10),
    height: widthToDp(10),
    resizeMode: 'contain',
  },
});
