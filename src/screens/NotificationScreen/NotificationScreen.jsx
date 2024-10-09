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
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {GET_NOTIFICATIONS_BY_ID} from '../../../request/queries/getNotificationsbyId.query';
import {store} from '../../app/store';
import {useQuery} from '@apollo/client';
export default function NotificationScreen({navigation}) {
  // const notifications = useSelector(state => state.user.notifications);
  const [notifications, setNotification] = useState([]);
  console.log('notifidfdfdfd', notifications);
  const dispatch = useDispatch();

  const userInfo = store.getState().user.user; // Get the user info from Redux store
  const {loading, error, data} = useQuery(GET_NOTIFICATIONS_BY_ID, {
    variables: {
      receiverId: userInfo?._id,
      page: 1,
      limit: 300,
    },
    skip: !userInfo?._id, // Skip the query if user ID is not available
  });

  useEffect(() => {
    if (data && data.getNotificationById) {
      const fetchedNotifications = data.getNotificationById.notifications;

      setNotification(fetchedNotifications); // Dispatch the fetched notifications to the Redux store
      console.log('Fetched notifications:', fetchedNotifications);
    }
  }, [data, dispatch]);

  if (loading) {
    return <Text>Loading...</Text>; // Optional: You can create a loading component
  }

  if (error) {
    console.error('Error fetching notifications:', error);
    return <Text>Error fetching notifications.</Text>; // Handle the error case
  }
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
                    {notification?.description}{' '}
                    {/* Use description instead of body */}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification?.createdAt
                      ? moment(Number(notification.createdAt)).format(
                          'MMMM Do YYYY, h:mm:ss a',
                        )
                      : 'Unknown date'}
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
