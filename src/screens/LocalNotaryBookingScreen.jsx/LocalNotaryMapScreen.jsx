import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
} from 'react-native';
import React from 'react';
import AgentCard from '../../components/AgentCard/AgentCard';
import AgentReviewCard from '../../components/AgentReviewCard/AgentReviewCard';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';

export default function LocalNotaryMapScreen({route, navigation}) {
  const {agents, documents} = route.params;
  console.log('dawdfnioa', agents);

  const renderItem = ({item}) => {
    const {agent} = item;

    return (
      <AgentReviewCard
        image={item.image}
        source={{uri: agent.profile_picture}}
        // bottomRightText={item.bottomRightText}
        // bottomLeftText={item.bottomLeftText}
        agentName={agent.first_name + ' ' + agent.last_name}
        agentAddress={agent.location}
        onPress={() =>
          navigation.navigate('LocalNotaryAgentReview', {
            description: item,
            documentType: documents,
          })
        }
      />
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/map.png')}
        style={styles.container}>
        <NavigationHeader Title="Nearby" />
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <View style={{flexDirection: 'row'}}>
            <FlatList
              horizontal
              data={agents}
              renderItem={renderItem}
              keyExtractor={item => item._id}
            />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
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
{
  /* <ImageBackground
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
      </ImageBackground> */
}
