import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LabelTextInput from '../LabelTextInput/LabelTextInput';
import {useSelector} from 'react-redux';
import MainButton from '../MainGradientButton/MainButton';
import {useNavigation} from '@react-navigation/native';
import {EventRegister} from 'react-native-event-listeners';
export default function HomeScreenHeader(props) {
  const userInfo = useSelector(state => state.user.user);
  const navigation = useNavigation();
  const [notificationCount, setNotificationCount] = useState(0);
  useEffect(() => {
    const notificationListener = EventRegister.addEventListener(
      'notification',
      handleNotification,
    );
    return () => {
      EventRegister.removeEventListener(notificationListener);
    };
  }, []);
  const handleNotification = notification => {
    setNotificationCount(notification.count);
  };
  return (
    <View>
      {userInfo !== null ? (
        <View style={styles.topContainer}>
          <View style={styles.namebar}>
            {/* <View> */}
            <TouchableOpacity>
              <Image
                source={{
                  uri: userInfo?.profile_picture,
                }}
                style={styles.imagestyles}
                onError={error => console.error('Image load error:', error)}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.textHeading,
                props.HeaderStyle,
                {marginLeft: widthToDp(5)},
              ]}>
              {userInfo?.first_name}
            </Text>
          </View>
          {/* </Viewstyle={styles.namebar}> */}
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationScreen')}
            style={styles.IconFlex}>
            <Image
              source={require('../../../assets/bellIcon.png')}
              style={styles.backIcon}
            />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.namebar,
            {justifyContent: 'space-between', alignItems: 'center'},
          ]}>
          <Text style={[styles.textHeading, props.HeaderStyle]}>Hi There,</Text>
          <MainButton
            colors={[Colors.OrangeGradientEnd, Colors.OrangeGradientEnd]}
            Title="Log In"
            TextStyle={{color: '#fff'}}
            styles={{
              padding: widthToDp(1),
              fontSize: widthToDp(3.7),
              minWidth: widthToDp(20),
            }}
            GradiStyles={{borderRadius: 5}}
            onPress={() => navigation.navigate('LoginScreen')}
          />
        </View>
      )}
      <Text style={styles.heading}>{props.Title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    margin: widthToDp(5),
    justifyContent: 'space-between',
  },
  namebar: {
    flexDirection: 'row',
    alignContent: 'center',
    margin: widthToDp(5),
  },
  textHeading: {
    alignSelf: 'center',
    fontSize: widthToDp(5),
    fontWeight: '700',
    color: Colors.TextColor,
  },
  heading: {
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
    marginBottom: height * 0.02,
  },
  imagestyles: {
    width: widthToDp(15),
    height: heightToDp(15),
    borderRadius: 10,
  },

  IconFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: widthToDp(2),
  },
  backIcon: {
    width: widthToDp(6),
    height: heightToDp(6),
    marginLeft: widthToDp(2),
  },
  notificationBadge: {
    position: 'absolute',
    backgroundColor: Colors.Orange,
    borderRadius: 30,
    width: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    right: 0,
    top: 0,
  },
  notificationText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: 'bold',
  },
});
