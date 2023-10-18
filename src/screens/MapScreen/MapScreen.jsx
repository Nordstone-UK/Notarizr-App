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

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import AgentReviewCard from '../../components/AgentReviewCard/AgentReviewCard';

export default function MapScreen({route, navigation}) {
  const {agents, documents} = route.params;

  const renderItem = ({item}) => {
    console.log('item', item);
    return (
      <AgentReviewCard
        image={item?.image}
        source={{uri: item?.profile_picture}}
        agentName={item?.first_name + ' ' + item?.last_name}
        agentAddress={item?.location}
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
  cardContainer: {
    marginHorizontal: 10,
  },
});
