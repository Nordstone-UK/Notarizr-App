import {FlatList, StyleSheet, Text, SafeAreaView, View} from 'react-native';
import React, {useEffect} from 'react';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import ChatContacts from '../../components/ChatContacts/ChatContacts';
import {useSelector} from 'react-redux';
import useChatService from '../../hooks/useChatService';

export default function ChatContactScreen({navigation}) {
  const chats = useSelector(state => state.chats.allChats);
  const renderItem = ({item}) => {
    const user = item.agent; // Assuming either "agent" or "client" property exists in each item

    return (
      <ChatContacts
        image={{uri: user?.profile_picture}}
        name={user?.first_name + ' ' + user?.last_name}
        onPress={() =>
          navigation.navigate('ChatScreen', {
            sender: item?.booked_by,
            receiver: user,
            chat: item._id, // Assuming "_id" is the unique identifier for each booking/session
          })
        }
      />
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <HomeScreenHeader Title="Find all your messages with our agents here" />
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
