import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import AgentCard from './src/components/AgentCard/AgentCard';
import {widthToDp} from './src/utils/Responsive';
import NavigationHeader from './src/components/Navigation Header/NavigationHeader';
import AgentReviewCard from './src/components/AgentReviewCard/AgentReviewCard';

export default function MapScreen({navigation}) {
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
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./assets/map.png')}
        style={styles.container}>
        <NavigationHeader
          Title="Nearby"
          lastImg={require('./assets/Search.png')}
          lastImgPress={() => navigation.navigate('NotificationScreen')}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <View style={{flexDirection: 'row'}}>
            <FlatList
              horizontal
              data={data}
              renderItem={({item}) => (
                <AgentReviewCard
                  image={item.image}
                  source={item.source}
                  bottomRightText={item.bottomRightText}
                  bottomLeftText={item.bottomLeftText}
                  agentName={item.agentName}
                  agentAddress={item.agentAddress}
                  onPress={() => navigation.navigate('AgentReviewScreen')}
                />
              )}
              keyExtractor={item => item.key}
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
