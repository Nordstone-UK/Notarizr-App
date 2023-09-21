import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useDispatch} from 'react-redux';
import {userType} from '../../features/user/userSlice';
export default function LoginScreen({navigation}, props) {
  const [ColorChange, setColorChange] = useState();
  const FocusColorChaneg = () => {
    setColorChange(!ColorChange);
  };
  const dispatch = useDispatch();

  const resetStack = () => {
    dispatch(userType('client'));
    navigation.reset({
      index: 0,
      routes: [{name: 'HomeScreen'}],
    });
  };
  return (
    <View style={styles.container}>
      <CompanyHeader
        Header="Welcome Back to Notarizr"
        subHeading="Hello there, sign in to continue!"
        HeaderStyle={{alignSelf: 'center'}}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: 17,
          marginVertical: heightToDp(1.5),
          color: '#121826',
        }}
      />

      <BottomSheetStyle>
        <ScrollView style={{marginTop: heightToDp(5)}}>
          <LabelTextInput
            leftImageSoucre={require('../../../assets/emailIcon.png')}
            placeholder={'Enter your email address'}
            LabelTextInput={'Email Address'}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/lockIcon.png')}
            rightImageSource={require('../../../assets/eyeIcon.png')}
            placeholder={'Enter your password'}
            LabelTextInput={'Password'}
            secureTextEntry={true}
          />
          <View
            style={{
              marginTop: heightToDp(10),
            }}>
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Login"
              viewStyle={props.viewStyle}
              GradiStyles={props.GradiStyles}
              onPress={() => resetStack()}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginVertical: heightToDp(10),
            }}>
            <Text
              style={{
                color: Colors.DullTextColor,
              }}>
              Don’t have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignupAsScreen')}>
              <Text style={{color: Colors.Orange}}>Sign up</Text>
            </TouchableOpacity>
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
});
