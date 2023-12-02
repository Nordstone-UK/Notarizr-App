import {ScrollView, StyleSheet, Text, SafeAreaView, View} from 'react-native';
import React from 'react';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import ChatContacts from '../../components/ChatContacts/ChatContacts';
import {useSelector} from 'react-redux';

export default function ChatContactScreen({navigation}) {
  const chats = useSelector(state => state.chats.allChats);

  return (
    <SafeAreaView style={styles.container}>
      <HomeScreenHeader Title="Find all your messages with our agents here" />
      <BottomSheetStyle>
        <ScrollView>
          {chats.map(chat => (
            <View key={chat._id}>
              {chat.users.map(user => (
                <View key={user._id}>
                  <ChatContacts
                    image={{uri: user.profile_picture}}
                    name={user.first_name + ' ' + user.last_name}
                    onPress={() =>
                      navigation.navigate('ChatScreen', {
                        user: user,
                        chat: chat._id,
                      })
                    }
                  />
                </View>
              ))}
            </View>
          ))}
          {/* <ChatContacts
            image={require('../../../assets/agentPic.png')}
            name="Advocate Jane Juel"
            onPress={() => navigation.navigate('ChatScreen')}
          /> */}
          {/* <ChatContacts
            image={require('../../../assets/profileIcon.png')}
            name="Brandon Roger"
            onPress={() => navigation.navigate('ChatScreen')}
          />
          <ChatContacts
            image={require('../../../assets/agentReview.png')}
            name="Advocate Mary Smith"
            onPress={() => navigation.navigate('ChatScreen')}
          /> */}
        </ScrollView>
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
