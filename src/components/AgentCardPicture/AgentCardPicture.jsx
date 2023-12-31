import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';

import {heightToDp, widthToDp} from '../../utils/Responsive';
import AgentTimeCard from '../AgentCard/AgentTimeCard';
export default function AgentCardPicture(props) {
  return (
    <View
      style={{
        marginHorizontal: widthToDp(2),
        marginVertical: widthToDp(2),
      }}>
      <Image source={props.source} style={styles.cardImage} />
      <AgentTimeCard
        task={props.task}
        dateofBooking={props.dateofBooking}
        timeofBooking={props.timeofBooking}
        createdAt={props.createdAt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardImage: {
    width: widthToDp(25),
    height: heightToDp(17),
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    resizeMode: 'contain',
  },
});
