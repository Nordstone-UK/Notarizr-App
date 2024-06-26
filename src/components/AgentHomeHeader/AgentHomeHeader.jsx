import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LabelTextInput from '../LabelTextInput/LabelTextInput';
import {useSelector} from 'react-redux';
import {useMutation} from '@apollo/client';
import {UPDATE_ONLINE_STATUS} from '../../../request/mutations/updateOnlineStatus.mutation';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import {EventRegister} from 'react-native-event-listeners';

export default function AgentHomeHeader(props) {
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = useState();
  const [notificationCount, setNotificationCount] = useState(0);
  const [updateOnlineStatusR] = useMutation(UPDATE_ONLINE_STATUS);
  const {profile_picture, first_name, last_name, online_status} = useSelector(
    state => state.user.user,
  );
  const toggleSwitch = () => {
    setIsEnabled(!isEnabled);
  };
  const sendStatusUpdate = async () => {
    let onlineStatus;
    !isEnabled ? (onlineStatus = 'online') : (onlineStatus = 'offline');
    try {
      const {data} = await updateOnlineStatusR({variables: {onlineStatus}});
      // console.log(data);

      if (data.updateOnlineStatusR.status === '204') {
        Toast.show({
          type: 'success',
          text1: 'Status Updated',
          text2: 'You are now ' + onlineStatus,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Please try again later',
      });
    }
  };
  useEffect(() => {
    if (online_status === 'online') {
      setIsEnabled(true);
    } else {
      setIsEnabled(false);
    }
  }, [online_status]);
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
      <View style={styles.namebar}>
        <View style={styles.nameFlex}>
          <Image source={{uri: profile_picture}} style={styles.imagestyles} />
          <View>
            <Text style={[styles.textHeading, props.HeaderStyle]}>
              {first_name} {last_name}
            </Text>
            <Text style={[styles.simpleText]}>Subscribed</Text>
          </View>
          {props?.Switch && (
            <View style={styles.switchView}>
              <Switch
                trackColor={{false: '#767577', true: Colors.GreenSwitch}}
                thumbColor={isEnabled ? Colors.white : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
                onChange={sendStatusUpdate}
              />
            </View>
          )}
        </View>
        <View style={styles.IconFlex}>
          {props?.SearchEnabled && (
            <Image
              source={require('../../../assets/Search.png')}
              style={{
                width: widthToDp(5),
                height: heightToDp(5),
              }}
            />
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationScreen')}>
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
      </View>
      {props?.Title && <Text style={[styles.heading]}>{props.Title}</Text>}
      {props?.SearchEnabled && (
        <LabelTextInput
          leftImageSoucre={require('../../../assets/Search.png')}
          placeholder={'Search'}
          InputStyles={{
            padding: widthToDp(2),
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  namebar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: widthToDp(5),
    justifyContent: 'space-between',
  },
  nameFlex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchView: {
    height: heightToDp(12),
    flexDirection: 'column',
    alignContent: 'flex-start',
  },
  IconFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    width: widthToDp(6),
    height: heightToDp(6),
    marginLeft: widthToDp(2),
  },
  textHeading: {
    fontSize: widthToDp(5.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(1.5),
  },
  simpleText: {
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(2),
  },
  imagestyles: {
    width: widthToDp(15),
    height: heightToDp(15),
    borderRadius: 25,
  },
  heading: {
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
    marginBottom: height * 0.02,
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
