import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../themes/Colors';

import {heightToDp, widthToDp} from '../../utils/Responsive';
import AgentTimeCard from '../AgentCard/AgentTimeCard';
import AgentReviewCard from '../AgentCard/AgentReviewCard';
export default function AgentCardPicture(props) {
  return (
    <View>
      <ImageBackground source={props.source} style={styles.cardImage}>
        {props.Review ? (
          <AgentReviewCard />
        ) : (
          <AgentTimeCard task={props.task} />
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  cardImage: {
    margin: widthToDp(1.5),
    width: widthToDp(26),
    borderRadius: 6,
    overflow: 'hidden',
  },
});
