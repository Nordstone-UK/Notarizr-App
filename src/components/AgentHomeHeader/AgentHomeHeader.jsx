import {Image, StyleSheet, Switch, Text, View} from 'react-native';
import React, {useState} from 'react';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LabelTextInput from '../LabelTextInput/LabelTextInput';

export default function AgentHomeHeader(props) {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  return (
    <View>
      <View style={styles.namebar}>
        <View style={styles.nameFlex}>
          <Image
            source={require('../../../assets/agentReview.png')}
            style={styles.imagestyles}
          />
          <Text style={[styles.textHeading, props.HeaderStyle]}>
            Mary Smith
          </Text>
          <Switch
            trackColor={{false: '#767577', true: Colors.GreenSwitch}}
            thumbColor={isEnabled ? Colors.white : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View style={styles.IconFlex}>
          <Image
            source={require('../../../assets/Search.png')}
            style={styles.Icon}
          />
          <Image
            source={require('../../../assets/bellIcon.png')}
            style={styles.Icon}
          />
        </View>
      </View>
      {props?.Title && <Text style={styles.heading}>{props.Title}</Text>}
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
  },
  heading: {
    fontSize: widthToDp(7),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
  },
});
