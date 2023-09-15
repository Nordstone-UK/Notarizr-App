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

export default function LoginScreen({navigation}, props) {
  const [ColorChange, setColorChange] = useState();
  const FocusColorChaneg = () => {
    setColorChange(!ColorChange);
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
              Title="Login"
              viewStyle={props.viewStyle}
              GradiStyles={props.GradiStyles}
              onPress={() => navigation.navigate('HomeScreen')}
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
              Don’t have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignupAsScreen')}>
              <Text style={{color: Colors.Orange}}>Sign up</Text>
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
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    width: widthToDp(80),
    paddingVertical: heightToDp(2),
    alignSelf: 'center',
    borderRadius: 15,
    marginTop: heightToDp(5),
    // position: 'absolute',
  },
  input: {
    alignSelf: 'center',
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: '#fff',
    color: '#424242',
    marginLeft: widthToDp(3),
    width: widthToDp(80),
  },
  icon: {
    padding: widthToDp(2),
    marginTop: widthToDp(3),
  },
  conta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, // Add any additional styling you want for the container
  },
  input: {
    flex: 1, // Take up all available space in the container
    padding: 8, // Adjust padding as needed
  },
  image: {
    width: 20,
    height: 20,
    marginRight: 10,
    position: 'absolute',
    right: 10, // Adjust the right position as needed
  },
});
{
  /* <TextInput
  mode="outlined"
  label={'Email Address'}
  style={[styles.input]}
  placeholder="Enter your email address"
  underlineColor="#fff"
  outlineColor="#fff"
  // activeOutlineColor="#fff"

  editable={true}
  // render={() => (
  //   <Image
  //     source={require('../../../assets/emailIcon.png')}
  //     style={styles.icon}
  //   />
  // )}
/>; */
}
