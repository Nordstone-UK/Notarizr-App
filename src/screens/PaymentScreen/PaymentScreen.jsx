import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import GradientButton from '../../components/MainGradientButton/GradientButton';
export default function PaymentScreen() {
  return (
    <View style={styles.container}>
      <NavigationHeader Title="Payment Method" />
      <BottomSheetStyle>
        <ScrollView scrollEnabled={true}>
          <View style={styles.insideContainer}>
            <Text style={styles.insideHeading}>
              Please find all your added cards here
            </Text>
            <ScrollView
              contentContainerStyle={styles.cardContainer}
              showsHorizontalScrollIndicator={false}
              horizontal={true}>
              <Image source={require('../../../assets/Card.png')} />
              <Image source={require('../../../assets/Card.png')} />
            </ScrollView>
          </View>
          <TouchableOpacity style={styles.addContainer}>
            <Text style={styles.addMore}>Add more</Text>
            <Image
              source={require('../../../assets/addIcon.png')}
              style={styles.addIcon}
            />
          </TouchableOpacity>
          <Text style={styles.paymentOptions}>More Payment options</Text>
          <TouchableOpacity style={styles.PaymentContainer}>
            <View style={styles.PaymentContainer}>
              <Image
                source={require('../../../assets/applePay.png')}
                style={styles.applePay}
              />
              <Text style={styles.textPay}>Apple pay</Text>
            </View>
            <Image
              source={require('../../../assets/greenIcon.png')}
              style={styles.greenIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.PaymentContainer}>
            <View style={styles.PaymentContainer}>
              <Image
                source={require('../../../assets/googlePay.png')}
                style={styles.applePay}
              />
              <Text style={styles.textPay}>Google pay</Text>
            </View>
            <Image
              source={require('../../../assets/unSelected.png')}
              style={styles.greenIcon}
            />
          </TouchableOpacity>
          <View style={{marginVertical: heightToDp(2)}}>
            <View style={styles.docsContainer}>
              <Text style={styles.textPay}>Medical documents</Text>
              <Text style={styles.textPay}>$400</Text>
            </View>
            <View style={styles.docsContainer}>
              <Text style={styles.textPay}>Tax 10%</Text>
              <Text style={styles.textPay}>$10</Text>
            </View>
            <View style={styles.docsContainer}>
              <Text style={styles.textPay}>Fees</Text>
              <Text style={styles.textPay}>$2</Text>
            </View>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderBottomColor: Colors.LineColor,
              marginVertical: heightToDp(1.5),
              width: widthToDp(90),
              alignSelf: 'center',
            }}
          />
          <View style={styles.docsContainer}>
            <Text style={styles.textPay}>Total Amount</Text>
            <Text style={styles.textPay}>$412</Text>
          </View>
          <View
            style={{
              marginBottom: heightToDp(2),
            }}>
            <GradientButton
              Title="Complete Payment"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            />
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: Colors.PinkBackground,
  },
  textPay: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    marginHorizontal: widthToDp(5),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontWeight: '700',
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(5),
    width: widthToDp(60),
  },
  paymentOptions: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontWeight: '700',
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(5),
  },
  cardContainer: {
    flexDirection: 'row',
    columnGap: widthToDp(5),
    marginHorizontal: widthToDp(3),
    marginVertical: widthToDp(2),
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    marginVertical: widthToDp(2),
  },
  addMore: {
    fontSize: widthToDp(4),
    marginHorizontal: widthToDp(4),
    color: Colors.DullTextColor,
  },
  addIcon: {
    width: widthToDp(4.5),
    height: heightToDp(4.5),
    marginTop: heightToDp(1),
  },
  PaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: widthToDp(1.5),
  },
  applePay: {
    marginHorizontal: widthToDp(5),
    width: widthToDp(5),
    height: heightToDp(6),
  },
  greenIcon: {
    marginHorizontal: widthToDp(8),
    width: widthToDp(5),
    height: heightToDp(5),
  },
  docsContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: widthToDp(80),
    justifyContent: 'space-between',
  },
});
