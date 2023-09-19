import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import GradientButton from '../../components/MainGradientButton/GradientButton';

export default function RejectedByAgentScreen({navigation}, props) {
  return (
    <View style={styles.container}>
      <View style={styles.completeIcon}>
        <Image
          source={require('../../../assets/rejectedIcon.png')}
          style={styles.icon}
        />
        <Text style={styles.text}>
          Sorry, as you canceled your booking. Please provide us an opportunity
          to service you better
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <GradientButton
          Title="Create Booking"
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          onPress={() => navigation.navigate('HomeScreen')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  completeIcon: {
    marginTop: heightToDp(20),
  },
  groupimage: {
    flex: 1,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  text: {
    marginHorizontal: widthToDp(10),
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },

  buttonContainer: {
    marginVertical: heightToDp(5),
  },
});
