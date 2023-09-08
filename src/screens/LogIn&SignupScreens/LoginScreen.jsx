import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
// import {TextInput} from 'react-native-paper';

export default function LoginScreen() {
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
        <View
          style={[
            styles.searchSection,
            {borderColor: ColorChange ? '#FF7A28' : '#D3D5DA'},
          ]}>
          <Image
            source={require('../../../assets/emailIcon.png')}
            style={styles.icon}
          />
          <TextInput
            // mode="outlined"
            // label={'Email Address'}
            style={[styles.input]}
            placeholder="Enter your email address"
            // outlineColor="#D3D5DA"
            // activeOutlineColor="#FF7A28"
            onFocus={FocusColorChaneg}
          />
        </View>
        <MainButton colors={['#D3D5DA', '#D3D5DA']} Title="Login" />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: heightToDp(70),
          }}>
          <Text>Don’t have an account? </Text>
          <TouchableOpacity>
            <Text style={{color: '#FF7A28'}}>Sign up</Text>
          </TouchableOpacity>
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
  },
  icon: {
    padding: widthToDp(2),
    marginLeft: widthToDp(3),
  },
});
