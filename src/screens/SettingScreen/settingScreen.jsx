import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import SettingOptions from '../../components/SettingOptions/SettingOptions';

export default function SettingScreen({navigation}, props) {
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Setting" />
      <BottomSheetStyle>
        <ScrollView style={{marginTop: heightToDp(5)}}>
          <SettingOptions
            icon={require('../../../assets/privacy.png')}
            Title="Privacy Policy"
          />
          <SettingOptions
            icon={require('../../../assets/security.png')}
            Title="Security"
          />
          <SettingOptions
            icon={require('../../../assets/terms.png')}
            Title="Terms & Conditions"
          />
          <SettingOptions
            icon={require('../../../assets/logout.png')}
            Title="Log out"
          />
          <SettingOptions
            icon={require('../../../assets/delete.png')}
            Title="Delete Account"
          />
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
});
