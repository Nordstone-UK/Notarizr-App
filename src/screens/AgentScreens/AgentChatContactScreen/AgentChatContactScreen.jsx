import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import ChatContacts from '../../../components/ChatContacts/ChatContacts';
import Colors from '../../../themes/Colors';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';

export default function AgentChatContactScreen({navigation}) {
  return (
    <View style={styles.container}>
      <AgentHomeHeader
        Title="Find all your messages with your clients here"
        Switch={true}
        SearchEnabled={true}
      />
      <BottomSheetStyle>
        <ScrollView>
          <ChatContacts
            image={require('../../../../assets/agentPic.png')}
            name="Advocate Jane Juel"
            onPress={() => navigation.navigate('ChatScreen')}
          />
          <ChatContacts
            image={require('../../../../assets/profileIcon.png')}
            name="Brandon Roger"
            onPress={() => navigation.navigate('ChatScreen')}
          />
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
});
