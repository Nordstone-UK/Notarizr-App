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
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {useSelector} from 'react-redux';

export default function TransactionScreen({navigation}, props) {
  const user = useSelector(state => state.user.user.account_type);
  console.log('user', user);

  useEffect(() => {}, []);

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Payment Method" />
      <Text style={styles.textheading}>
        Here is your latest transactions with us
      </Text>

      <BottomSheetStyle>
        <ScrollView showsVerticalScrollIndicator={false}></ScrollView>
        <View style={{marginBottom: heightToDp(5)}}>
          <GradientButton
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            Title="Print Invoice"
            // onPress={() => CreateStripeAccount()}
          />
        </View>
      </BottomSheetStyle>
    </SafeAreaView>
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
    fontSize: widthToDp(5.5),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    width: widthToDp(90),
    marginBottom: heightToDp(3),
  },
});
