import {
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
} from 'react-native';
import React from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import ChatContacts from '../../../components/ChatContacts/ChatContacts';
import Colors from '../../../themes/Colors';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import {useSelector} from 'react-redux';

export default function AgentChatContactScreen({navigation}) {
  const chats = useSelector(state => state.chats.allChats);
  const renderItem = ({item}) => {
    const user = item.booked_by; // Assuming either "agent" or "client" property exists in each item

    return (
      <ChatContacts
        image={{uri: user?.profile_picture}}
        name={user?.first_name + ' ' + user?.last_name}
        onPress={() =>
          navigation.navigate('ChatScreen', {
            sender: item?.agent,
            receiver: user,
            chat: item._id, // Assuming "_id" is the unique identifier for each booking/session
          })
        }
      />
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <AgentHomeHeader
        Title="Find all your messages with your clients here"
        Switch={true}
        // SearchEnabled={true}
      />
      <BottomSheetStyle>
        <FlatList
          data={chats}
          keyExtractor={item => item._id} // Assuming "_id" is the unique identifier for each booking/session
          renderItem={renderItem}
        />
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
});
