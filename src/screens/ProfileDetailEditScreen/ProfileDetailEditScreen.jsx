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
import React, {useState, useEffect} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import SplashScreen from 'react-native-splash-screen';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {useSelector} from 'react-redux';
import PhoneTextInput from '../../components/countryCode/PhoneTextInput';

export default function ProfileDetailEditScreen({navigation}, props) {
  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [phoneNumber, setNumber] = useState('');
  const [location, setlocation] = useState('');
  const [Email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState();
  const [gender, setgender] = useState('');
  const accountType = useSelector(state => state.register.accountType);
  const {first_name, profile_picture, last_name, email, phone_number} =
    useSelector(state => state.user.user);

  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <View style={styles.container}>
      <NavigationHeader Title="Profile Details" />
      <View>
        <Image source={{uri: profile_picture}} style={styles.picture} />
        <TouchableOpacity style={styles.camera}>
          <Image source={require('../../../assets/cameraIcon.png')} />
        </TouchableOpacity>
      </View>
      <Text style={styles.textheading}>
        {first_name} {last_name}
      </Text>
      <Text style={styles.textsubheading}>{email}</Text>
      <BottomSheetStyle>
        <ScrollView contentContainerStyle={{paddingBottom: heightToDp(10)}}>
          <LabelTextInput
            leftImageSoucre={require('../../../assets/NameIcon.png')}
            Label={true}
            defaultValue={first_name}
            LabelTextInput={'First Name'}
            onChangeText={text => setfirstName(text)}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/NameIcon.png')}
            placeholder={'Enter your last name'}
            defaultValue={last_name}
            Label={true}
            LabelTextInput={'Last Name'}
            onChangeText={text => setlastName(text)}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/emailIcon.png')}
            placeholder={'Enter your email address'}
            LabelTextInput={(emailValid && 'Email Taken') || 'Email Address'}
            onChangeText={text => setEmail(text)}
            defaultValue={email}
            Label={true}
            labelStyle={emailValid && {color: Colors.Red}}
            AdjustWidth={emailValid && {borderColor: Colors.Red}}
          />
          <PhoneTextInput
            onChange={e => {
              setNumber(e);
            }}
            LabelTextInput="Phone Number"
            Label={true}
            placeholder={'XXXXXXXXXXX'}
          />

          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            Label={true}
            placeholder={'Enter your city'}
            // defaultValue={first_name}
            LabelTextInput={'City'}
            onChangeText={text => setlocation(text)}
          />
          <View
            style={{
              marginTop: heightToDp(10),
            }}>
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Save Details"
              onPress={() => navigation.navigate('ProfileInfoScreen')}
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
  picture: {
    alignSelf: 'center',
    width: widthToDp(25),
    height: heightToDp(25),
    borderRadius: 50,
  },
  camera: {
    position: 'absolute',
    left: widthToDp(55),
    top: heightToDp(18),
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
  textheading: {
    fontSize: widthToDp(6),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  textsubheading: {
    fontSize: widthToDp(4.5),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
    marginBottom: heightToDp(2),
  },
});
