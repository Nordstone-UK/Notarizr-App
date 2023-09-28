import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import SettingOptions from '../../components/SettingOptions/SettingOptions';
import {useSelector} from 'react-redux';

export default function ProfileInfoScreen({navigation}) {
  const accountType = useSelector(state => state.register.accountType);
  const {first_name, profile_picture} = useSelector(state => state.user.user);
  return (
    <View style={styles.container}>
      <Image source={{uri: profile_picture}} style={styles.picture} />
      <Text style={styles.textheading}>{first_name}</Text>
      <BottomSheetStyle>
        <ScrollView>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={
                accountType === 'client'
                  ? () => navigation.navigate('ProfileDetailEditScreen')
                  : () => navigation.navigate('AgentProfileEditScreen')
              }>
              <Image
                source={require('../../../assets/editIcon.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('SettingScreen')}>
              <Image
                source={require('../../../assets/settingIcon.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
          <View style={{marginBottom: heightToDp(2)}}>
            <SettingOptions
              icon={require('../../../assets/settingProfile.png')}
              Title="Profile Details"
              onPress={() => navigation.navigate('ProfileDetailEditScreen')}
            />
            <SettingOptions
              icon={require('../../../assets/passwordLock.png')}
              Title="Change Password"
              onPress={() => navigation.navigate('PasswordEditScreen')}
            />
            <SettingOptions
              icon={require('../../../assets/greenLocation.png')}
              Title="Address"
              onPress={() => navigation.navigate('AddressDetails')}
            />
            <SettingOptions
              icon={require('../../../assets/blueCard.png')}
              Title="Payment Method"
              onPress={() => navigation.navigate('PaymentUpdateScreen')}
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
    marginTop: heightToDp(5),
    width: widthToDp(30),
    height: heightToDp(30),
    borderRadius: 100,
  },
  iconContainer: {
    flexDirection: 'row',
    margin: widthToDp(4),
  },
  icon: {
    marginHorizontal: widthToDp(2),
  },
  textheading: {
    fontSize: widthToDp(6),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    marginVertical: heightToDp(3),
  },
});
