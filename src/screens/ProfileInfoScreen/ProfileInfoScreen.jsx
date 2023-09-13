import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import SettingOptions from '../../components/SettingOptions/SettingOptions';

export default function ProfileInfoScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/Mask.png')}
        style={styles.picture}
      />
      <BottomSheetStyle>
        <View style={styles.iconContainer}>
          <Image
            source={require('../../../assets/editIcon.png')}
            style={styles.icon}
          />
          <Image
            source={require('../../../assets/settingIcon.png')}
            style={styles.icon}
          />
        </View>
        <SettingOptions
          icon={require('../../../assets/settingProfile.png')}
          Title="Profile Details"
        />
        <SettingOptions
          icon={require('../../../assets/passwordLock.png')}
          Title="Change Password"
        />
        <SettingOptions
          icon={require('../../../assets/greenLocation.png')}
          Title="Address"
        />
        <SettingOptions
          icon={require('../../../assets/blueCard.png')}
          Title="Payment Method"
        />
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',

    marginBottom: widthToDp(8),
  },
  picture: {
    alignSelf: 'center',
    marginVertical: heightToDp(25),
  },
  iconContainer: {
    flexDirection: 'row',
    margin: widthToDp(4),
    justifyContent: 'flex-start',
  },
  icon: {
    marginHorizontal: widthToDp(2),
  },
});
