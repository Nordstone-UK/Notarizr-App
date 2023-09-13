import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import ChatContacts from '../../components/ChatContacts/ChatContacts';

export default function ChatContactScreen() {
  return (
    <View style={styles.container}>
      <HomeScreenHeader Title="Find all your messages with our agents here" />
      <BottomSheetStyle>
        <ScrollView>
          <ChatContacts
            image={require('../../../assets/agentPic.png')}
            name="Advocate Jane Juel"
          />
          <ChatContacts
            image={require('../../../assets/profileIcon.png')}
            name="Brandon Roger"
          />
          <ChatContacts
            image={require('../../../assets/agentReview.png')}
            name="Advocate Mary Smith"
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
