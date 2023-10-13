import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React, {useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import SplashScreen from 'react-native-splash-screen';
export default function AgentTimeCard(props) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  console.log(props.timeofBooking);
  const time = props.timeofBooking || '10:00 AM - 11:00 AM';
  const dateObject = new Date(props.dateofBooking);
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
  const monthShort = monthNamesShort[dateObject.getMonth()];
  const date = dateObject.getDate();
  const startTime = time.split(' - ')[0];
  return (
    <View>
      <View
        style={[
          styles.ImageProces,
          props.task && {
            backgroundColor: Colors.CardProcessColor,
          },
          props.task === 'In Process' && {
            backgroundColor: Colors.CardProcessColor,
          },
          props.task === 'Online' && {
            backgroundColor: Colors.DarkPink,
          },
          props.task === 'Completed' && {
            backgroundColor: Colors.Green,
          },
          props.task === 'Rejected' && {
            backgroundColor: Colors.Red,
          },
          props.task === 'Pending' && {
            backgroundColor: Colors.Orange,
          },
        ]}>
        <Text style={styles.text}>{props.task}</Text>
      </View>
      <LinearGradient
        style={styles.dateContainer}
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <View>
          <Text style={styles.dateStyle}>{startTime}</Text>
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
          <Text style={styles.dateStyle}>{monthShort}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  dateContainer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
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
  },
});
