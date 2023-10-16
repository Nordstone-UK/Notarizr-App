import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
} from 'react-native';
import React, {useEffect} from 'react';
import AgentCard from './src/components/AgentCard/AgentCard';
import {widthToDp} from './src/utils/Responsive';
import NavigationHeader from './src/components/Navigation Header/NavigationHeader';
import AgentReviewCard from './src/components/AgentReviewCard/AgentReviewCard';
import useGetService from './src/hooks/useGetService';
import useCreateBooking from './src/hooks/useCreateBooking';

export default function MapScreen({route, navigation}) {
  const {agents, documents} = route.params;

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
    const {agent} = item;
    // console.log(agent.profile_picture);
    return (
      <AgentReviewCard
        image={item.image}
        source={{uri: agent.profile_picture}}
        // bottomRightText={item.bottomRightText}
        // bottomLeftText={item.bottomLeftText}
        agentName={agent.first_name + ' ' + agent.last_name}
        agentAddress={agent.location}
        onPress={() =>
          navigation.navigate('AgentReviewScreen', {
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
  cardContainer: {
    marginHorizontal: 10,
  },
});
