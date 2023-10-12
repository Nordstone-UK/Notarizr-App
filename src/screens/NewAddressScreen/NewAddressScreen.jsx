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

export default function NewAddressScreen({navigation}, props) {
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Address" />
      <BottomSheetStyle>
        <ScrollView style={{marginTop: heightToDp(5)}}>
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your address details'}
            LabelTextInput={'Building / Flat'}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your password'}
            LabelTextInput={'Street'}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your address details'}
            LabelTextInput={'City'}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your address details'}
            LabelTextInput={'PIN Code'}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your address details'}
            LabelTextInput={'Landmark'}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your address details'}
            LabelTextInput={'Type'}
          />
          <View
            style={{
              marginVertical: heightToDp(10),
            }}>
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Save Address"
              onPress={() => navigation.navigate('AddressDetails')}
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
});
