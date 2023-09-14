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
import {
  CreditCardInput,
  LiteCreditCardInput,
} from 'react-native-credit-card-input';

export default function AddCardScreen({navigation}, props) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  _onFocus = field => console.log('focusing', field);
  _onChange = form => console.log(JSON.stringify(form, null, ' '));
  return (
    <View style={styles.container}>
      <NavigationHeader Title="Add Card" />
      {/* <Image
        source={require('../../../assets/Card.png')}
        style={styles.CardIcons}
      />
      {/* <Text style={styles.textheading}>
        Please find all our added cards here
      </Text> */}

      <BottomSheetStyle>
        <View style={{marginVertical: heightToDp(5)}}>
          <View>
            <CreditCardInput
              autoFocus
              requireCVC={true}
              requirePostalCode={true}
            />
          </View>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            marginBottom: widthToDp(5),
          }}>
          <GradientButton
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            Title="Save Card"
            onPress={() => navigation.navigate('PaymentUpdateScreen')}
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

{
  /* <Text style={styles.textheading}>Add your New Card</Text>
          <InputCardDetail
            LabelTextInput={'Card Number'}
            AdjustWidth={{width: widthToDp(90)}}
            keyboardType={'numeric'}
            InputStyles={{width: widthToDp(80)}}
          />
          <View
            style={{
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
          </View> */
}
