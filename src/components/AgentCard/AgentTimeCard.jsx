import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React, {useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import SplashScreen from 'react-native-splash-screen';
import moment from 'moment';
export default function AgentTimeCard(props) {
  let date;
  let time;
  let month;
  // console.log(props.createdAt, props.dateofBooking, props.timeofBooking);
  const monthNamesShort = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  // if (props.dateofBooking === null && props.timeofBooking === null) {
  console.log('Working');
  date = moment(props.createdAt).format('D');
  month = moment(props.createdAt).format('MMM');
  time = moment(props.createdAt).format('h:mm A');
  // }
  // else {
  //   const dateObject = new Date(props.dateofBooking);
  //   month = monthNamesShort[dateObject.getMonth()];
  //   date = dateObject.getDate();
  //   time = props.timeofBooking.split(' - ')[0];
  // }
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
            backgroundColor: Colors.CardProcessColor,
          },
          props.task === 'accepted' && {
            backgroundColor: Colors.CardProcessColor,
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
        <Text style={styles.text}>{capitalizeFirstLetter(props.task)}</Text>
      </View>
      <LinearGradient
        style={styles.dateContainer}
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <View>
          <Text style={styles.dateStyle}>{time}</Text>
          <Text
            style={[
              styles.dateStyle,
              {
                fontFamily: 'Poppins-Bold',
                fontSize: widthToDp(7),
                height: heightToDp(10),
              },
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
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    height: heightToDp(5),
    marginVertical: heightToDp(-1),
  },
});
