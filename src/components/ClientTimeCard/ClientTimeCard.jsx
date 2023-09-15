import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React, {useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import SplashScreen from 'react-native-splash-screen';
export default function ClientTimeCard(props) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <View
      style={{
        flex: 1,
        marginTop: heightToDp(5),
        justifyContent: 'flex-end',
      }}>
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
          <Text style={styles.dateStyle}>12:30</Text>
          <Text
            style={[
              styles.dateStyle,
              {fontFamily: 'Poppins-Bold', fontSize: widthToDp(7)},
            ]}>
            22
          </Text>
          <Text style={styles.dateStyle}>Sep</Text>
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
