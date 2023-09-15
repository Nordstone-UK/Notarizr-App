import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';

export default function SignUpScreen({navigation}, props) {
  const [ColorChange, setColorChange] = useState();
  const FocusColorChaneg = () => {
    setColorChange(!ColorChange);
  };
  return (
    <View style={styles.container}>
      <CompanyHeader
        Header="Welcome to Notarizr"
        subHeading="Signup to create an account with us!"
        HeaderStyle={{alignSelf: 'center'}}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: 17,
          marginVertical: heightToDp(1.5),
          color: '#121826',
        }}
      />

      <BottomSheetStyle>
        <View style={{marginTop: heightToDp(5)}}>
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
              viewStyle={props.viewStyle}
              GradiStyles={props.GradiStyles}
              Title="Signup"
              width={{width: widthToDp(80)}}
              onPress={() => navigation.navigate('SignUpDetailScreen')}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: heightToDp(10),
            }}>
            <Text
              style={{
                color: Colors.DullTextColor,
              }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={{color: Colors.Orange}}>Sign in</Text>
            </TouchableOpacity>
          </View>
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
});
