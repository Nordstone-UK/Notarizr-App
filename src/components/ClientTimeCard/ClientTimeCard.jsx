import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React, {useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import SplashScreen from 'react-native-splash-screen';
import moment from 'moment';
export default function ClientTimeCard(props) {
  let date;
  let time;
  let month;

  date = moment(props?.dateofBooking).format('D');
  month = moment(props?.dateofBooking).format('MMM');
  time = moment(props?.createdAt).format('h:mm A');
  function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return (
    <View>
      <View
        style={[
          styles.ImageProces,
          props.task && {
            backgroundColor: Colors.ClientCard,
          },
          props.task === 'Mobile' && {
            backgroundColor: Colors.ClientCard,
          },
          props.task === 'Online' && {
            backgroundColor: Colors.DarkPink,
          },
          props.task === 'completed' && {
            backgroundColor: Colors.Green,
          },
          props.task === 'rejected' && {
            backgroundColor: Colors.Red,
          },
          props.task === 'pending' && {
            backgroundColor: Colors.Orange,
          },
        ]}>
        {props.task === 'to_be_paid' ? (
          <Text style={styles.text}>To be Paid</Text>
        ) : (
          <Text style={styles.text}>{capitalizeFirstLetter(props.task)}</Text>
        )}
      </View>
      <LinearGradient
        style={styles.dateContainer}
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <View>
          <Text style={styles.dateStyle}>{props.timeofBooking || time}</Text>
          <Text
            style={[
              styles.dateStyle,
              {fontFamily: 'Poppins-Bold', fontSize: widthToDp(7)},
            ]}>
            {date}
          </Text>
          <Text style={styles.dateStyle}>{month}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  dateContainer: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    alignItems: 'center',
    padding: widthToDp(1.5),
  },
  ImageProces: {
    paddingVertical: widthToDp(1),
  },
  text: {
    alignSelf: 'center',
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: widthToDp(3.5),
  },

  dateStyle: {
    color: Colors.white,
    fontSize: widthToDp(3.5),
    fontFamily: 'Poppins-SemiBold',
    marginVertical: heightToDp(-1.5),
    textAlign: 'center',
  },
});
