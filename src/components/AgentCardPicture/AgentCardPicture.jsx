import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';

import {heightToDp, widthToDp} from '../../utils/Responsive';
import AgentTimeCard from '../AgentCard/AgentTimeCard';
export default function AgentCardPicture(props) {
  return (
    <View style={{flex: 1}}>
      <ImageBackground source={props.source} style={styles.cardImage}>
        <AgentTimeCard task={props.task} />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  cardImage: {
    margin: widthToDp(2),
    width: widthToDp(30),
    height: '105%',
    borderRadius: 6,
    overflow: 'hidden',
  },
});
