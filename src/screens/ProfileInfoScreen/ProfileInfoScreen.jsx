import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import SettingOptions from '../../components/SettingOptions/SettingOptions';

export default function ProfileInfoScreen({navigation}) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/Mask.png')}
        style={styles.picture}
      />
      <Text style={styles.textheading}>Lamthao</Text>
      <BottomSheetStyle>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileDetailEditScreen')}>
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
    marginTop: heightToDp(25),
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
    marginVertical: heightToDp(5),
  },
});
