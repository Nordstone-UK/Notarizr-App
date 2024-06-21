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
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {EventRegister} from 'react-native-event-listeners';

export default function NotificationScreen({navigation}) {
  const [notifications, setNotifications] = useState([]);
  console.log('notiidadfd', notifications);
  useEffect(() => {
    const listener = EventRegister.addEventListener(
      'notification',
      notification => {
        setNotifications(prevNotifications => [
          ...prevNotifications,
          notification,
        ]);
      },
    );

    return () => {
      EventRegister.removeEventListener(listener);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Notifications" />
      <BottomSheetStyle>
        {notifications.length > 0 ? (
          <ScrollView scrollEnabled={true}>
            {notifications.map((notification, index) => (
              <View key={index} style={styles.notificationContainer}>
                <Text style={styles.notificationTitle}>
                  {notification.notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.notification.body}
                </Text>
              </View>
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
  notificationContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LightGray,
  },
  notificationTitle: {
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
  },
  notificationMessage: {
    fontSize: widthToDp(4),
    color: Colors.TextColor,
  },
});
