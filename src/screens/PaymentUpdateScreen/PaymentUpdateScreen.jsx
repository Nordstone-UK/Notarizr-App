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
import {hairlineWidth} from 'react-native-extended-stylesheet';

export default function PaymentUpdateScreen({navigation}, props) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <View style={styles.container}>
      <NavigationHeader Title="Payment Method" />
      <Text style={styles.textheading}>
        Please find all our added cards here
      </Text>

      <BottomSheetStyle>
        <ScrollView
          style={{marginTop: heightToDp(5)}}
          showsVerticalScrollIndicator={false}>
          <Image
            source={require('../../../assets/Card.png')}
            style={styles.CardIcons}
          />
          <Image
            source={require('../../../assets/Card.png')}
            style={styles.CardIcons}
          />
        </ScrollView>
        <View style={{marginBottom: heightToDp(5)}}>
          <GradientButton
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            Title="Add Card"
            onPress={() => navigation.navigate('AddCardScreen')}
          />
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
  CardIcons: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  textheading: {
    fontSize: widthToDp(6),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    width: widthToDp(80),
    marginBottom: heightToDp(3),
    textAlign: 'center',
  },
});
