import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import AgentCard from '../../components/AgentCard/AgentCard';
import AgentReviewCard from '../../components/AgentReviewCard/AgentReviewCard';

export default function LocalNotaryMapScreen({navigation}) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/map.png')}
        style={styles.container}>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
          <View style={{flexDirection: 'row'}}>
            <ScrollView
              horizontal={true}
              contentContainerStyle={styles.contentContainerStyle}>
              <AgentReviewCard
                image={require('../../../assets/agentLocation.png')}
                source={require('../../../assets/agentCardPic.png')}
                bottomRightText="30 Minutes"
                bottomLeftText="0.5 Miles"
                agentName={'Advocate Parimal M. Trivedi'}
                agentAddress={'Shop 28, jigara Kalakand Road'}
                onPress={() => navigation.navigate('LocalNotaryAgentReview')}
              />

              <AgentReviewCard
                image={require('../../../assets/agentLocation.png')}
                source={require('../../../assets/agentCardPic.png')}
                onPress={() => navigation.navigate('LocalNotaryAgentReview')}
                bottomRightText="30 Minutes"
                bottomLeftText="0.5 Miles"
                agentName={'Advocate Parimal M. Trivedi'}
                agentAddress={'Shop 28, jigara Kalakand Road'}
              />
            </ScrollView>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStyle: {
    flexDirection: 'row',
  },
});
