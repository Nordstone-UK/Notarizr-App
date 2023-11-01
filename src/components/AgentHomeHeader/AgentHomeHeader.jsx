import {Image, StyleSheet, Switch, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LabelTextInput from '../LabelTextInput/LabelTextInput';
import {useSelector} from 'react-redux';
import {useMutation} from '@apollo/client';
import {UPDATE_ONLINE_STATUS} from '../../../request/mutations/updateOnlineStatus.mutation';
import Toast from 'react-native-toast-message';

export default function AgentHomeHeader(props) {
  const [isEnabled, setIsEnabled] = useState();
  const [updateOnlineStatusR] = useMutation(UPDATE_ONLINE_STATUS);
  const {profile_picture, first_name, last_name} = useSelector(
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
  return (
    <View>
      <View style={styles.namebar}>
        <View style={styles.nameFlex}>
          <Image source={{uri: profile_picture}} style={styles.imagestyles} />
          <Text style={[styles.textHeading, props.HeaderStyle]}>
            {first_name} {last_name}
          </Text>
          {props?.Switch && (
            <Switch
              trackColor={{false: '#767577', true: Colors.GreenSwitch}}
              thumbColor={isEnabled ? Colors.white : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
              onChange={sendStatusUpdate}
            />
          )}
        </View>
        <View style={styles.IconFlex}>
          {props?.SearchEnabled && (
            <Image
              source={require('../../../assets/Search.png')}
              style={styles.Icon}
            />
          )}
          <Image
            source={require('../../../assets/bellIcon.png')}
            style={styles.Icon}
          />
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
    width: '90%',
  },
  nameFlex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  IconFlex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Icon: {
    marginHorizontal: widthToDp(2),
  },
  textHeading: {
    fontSize: widthToDp(6),
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
    fontSize: widthToDp(7),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
  },
});
