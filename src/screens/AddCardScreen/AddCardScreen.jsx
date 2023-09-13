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
import InputCardDetail from '../../components/InputCardDetail/InputCardDetail';
import {beginEvent} from 'react-native/Libraries/Performance/Systrace';

export default function AddCardScreen({navigation}, props) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <View style={styles.container}>
      <NavigationHeader Title="Add Card" />
      <Image
        source={require('../../../assets/Card.png')}
        style={styles.CardIcons}
      />
      {/* <Text style={styles.textheading}>
        Please find all our added cards here
      </Text> */}

      <BottomSheetStyle>
        <ScrollView style={{marginVertical: heightToDp(5)}}>
          <Text style={styles.textheading}>Add your New Card</Text>
          <InputCardDetail
            LabelTextInput={'Card Number'}
            AdjustWidth={{width: widthToDp(90)}}
            keyboardType={'numeric'}
            InputStyles={{width: widthToDp(80)}}
          />
          <View
            style={{
              // marginVertical: heightToDp(5),
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <InputCardDetail
              LabelTextInput={'Validaty Date'}
              AdjustWidth={{width: widthToDp(30)}}
              keyboardType={'numeric'}
              InputStyles={{width: widthToDp(25)}}
            />
            <InputCardDetail
              LabelTextInput={'CVV'}
              AdjustWidth={{width: widthToDp(30)}}
              keyboardType={'numeric'}
              InputStyles={{width: widthToDp(25)}}
            />
          </View>
          <GradientButton
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            Title="Save Card"
            //   onPress={() => navigation.navigate('ProfilePictureScreen')}
          />
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
  CardIcons: {
    alignSelf: 'center',
    marginBottom: heightToDp(8),
  },
  textheading: {
    fontSize: widthToDp(6),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    marginLeft: widthToDp(5),
    marginBottom: heightToDp(3),
  },
});
