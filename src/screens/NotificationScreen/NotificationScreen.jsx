import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import {EventRegister} from 'react-native-event-listeners';
import {useSelector} from 'react-redux';
import moment from 'moment';

export default function NotificationScreen({navigation}) {
  const notifications = useSelector(state => state.user.notifications);

  console.log('Notificationsssssssssssssss:', notifications);

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Notifications" />
      <BottomSheetStyle>
        {notifications.length > 0 ? (
          <ScrollView scrollEnabled={true}>
            {notifications.map((notification, index) => (
              <TouchableOpacity
                key={index}
                style={styles.notificationCard}
                onPress={() => {
                  // Handle navigation or action when notification card is pressed
                  console.log('Notification pressed:', notification);
                }}>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>
                    {notification?.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification?.body}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {moment(notification?.rawPayload?.google?.sent_time).format(
                      'MMMM Do YYYY, h:mm:ss a',
                    )}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <ImageBackground
            source={require('../../../assets/Group.png')}
            style={styles.backImage}>
            <Image
              source={require('../../../assets/completedIcon.png')}
              style={styles.image}
            />
            <Text style={styles.HeadingText}>
              Hooray! You have no new notifications.
            </Text>
          </ImageBackground>
        )}
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  backImage: {
    flex: 1,
    alignItems: 'center',
    resizeMode: 'contain',
  },
  image: {
    width: widthToDp(50),
    height: heightToDp(50),
    marginTop: heightToDp(25),
  },
  HeadingText: {
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    fontSize: widthToDp(7),
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: Colors.white,
    elevation: 10,
    padding: 10,
    borderRadius: 10,
    marginVertical: widthToDp(2),
    marginHorizontal: heightToDp(5),
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: Colors.TextColor,
    fontFamily: 'Poppins-Bold',
  },
  notificationMessage: {
    color: Colors.TextColor,
    fontSize: widthToDp(3.5),
    fontFamily: 'Poppins-Regular',
  },
  notificationTime: {
    fontSize: widthToDp(3.5),
    color: Colors.OrangeGradientEnd,
    marginTop: 5,
  },
});
