import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import React from 'react';
import AgentCard from './src/components/AgentCard/AgentCard';
import {widthToDp} from './src/utils/Responsive';
import NavigationHeader from './src/components/Navigation Header/NavigationHeader';
import AgentReviewCard from './src/components/AgentReviewCard/AgentReviewCard';
import useGetService from './src/hooks/useGetService';

export default function MapScreen({route, navigation}) {
  // const {availableAgents} = useGetService();
  const {agents} = route.params;
  // console.log('MapScreen', agents[0].category);

  const data = [
    {
      key: '1',
      image: require('./assets/agentLocation.png'),
      source: require('./assets/agentCardPic.png'),
      bottomRightText: '30 minutes',
      bottomLeftText: '0.5 Miles',
      agentName: 'Advocate Parimal M. Trivedi',
      agentAddress: 'Shop 28, Jigara Kalakand Road',
    },
    {
      key: '2',
      image: require('./assets/agentLocation.png'),
      source: require('./assets/agentCardPic.png'),
      bottomRightText: '45 minutes',
      bottomLeftText: '1 Mile',
      agentName: 'Advocate Parimal M. Trivedi',
      agentAddress: 'Shop 28, Jigara Kalakand Road',
    },
    {
      key: '3',
      image: require('./assets/agentLocation.png'),
      source: require('./assets/agentCardPic.png'),
      bottomRightText: '20 minutes',
      bottomLeftText: '0.3 Miles',
      agentName: 'Advocate Parimal M. Trivedi',
      agentAddress: 'Shop 28, Jigara Kalakand Road',
    },
  ];
  const renderItem = ({item}) => {
    // console.log('Flat list', item);
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
          navigation.navigate('AgentReviewScreen', {description: item})
        }
      />
    );
  };
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./assets/map.png')}
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
  cardContainer: {
    marginHorizontal: 10,
  },
});
