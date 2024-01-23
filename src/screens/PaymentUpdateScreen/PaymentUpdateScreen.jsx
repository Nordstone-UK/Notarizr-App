import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  Linking,
  ScrollView,
  SafeAreaView,
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
import {useSelector} from 'react-redux';
import useStripeApi from '../../hooks/useStripeApi';
import WebView from 'react-native-webview';

export default function PaymentUpdateScreen({navigation}, props) {
  const {handleStripeCreation, handleOnboardingLink} = useStripeApi();

  const user = useSelector(state => state.user.user.account_type);
  console.log('user', user);
  const [Link, setLink] = useState();
  const [loading, setLoading] = useState(false);

  // const openLink = async () => {
  //   // const supported = await Linking.canOpenURL(Link);
  //   // if (supported) {
  //   //   await Linking.openURL(Link);
  //   // } else {
  //   //   console.log("Don't know how to open URI: ", Link);
  //   // }
  // };
  useEffect(() => {
    // CreateStripeAccount();
    // onBoardingLink();
  }, []);

  const CreateStripeAccount = async () => {
    setLoading(true);
    const response = await handleStripeCreation();
    console.log('Link is:', response);
    setLink(response);
    setLoading(false);
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Payment Method" />
      <Text style={styles.textheading}>
        Please make a stripe account so you can receive payouts
      </Text>

      <BottomSheetStyle>
        <ScrollView showsVerticalScrollIndicator={false}>
          {Link && (
            <WebView
              source={{uri: Link}}
              style={{
                flex: 1,
                borderWidth: 1,
                height: heightToDp(500),
                marginVertical: heightToDp(2),
              }}
            />
          )}
        </ScrollView>
        <View style={{marginBottom: heightToDp(5)}}>
          {!Link && user !== 'client' && (
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Create Stripe Account"
              onPress={() => CreateStripeAccount()}
              loading={loading}
              isDisabled={loading}
            />
          )}
        </View>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}
{
  /* {Link === undefined && user !== 'client' && (
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Create Stripe Account"
              onPress={() => CreateStripeAccount()}
              GradiStyles={{padding: widthToDp(2)}}
              styles={{
                padding: 0,
              }}
              loading={loading}
            />
          )}
          {Link && (
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Continue signing up"
              onPress={() => openLink()}
              GradiStyles={{padding: widthToDp(2)}}
              styles={{
                padding: 0,
              }}
              loading={loading}
            />
          )} */
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
    fontSize: widthToDp(5.5),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    width: widthToDp(80),
    marginBottom: heightToDp(3),
    textAlign: 'center',
  },
});
