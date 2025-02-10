import {FlatList, StyleSheet, Text, SafeAreaView, View} from 'react-native';
import React, {useEffect} from 'react';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import ChatContacts from '../../components/ChatContacts/ChatContacts';
import {useSelector} from 'react-redux';
import useChatService from '../../hooks/useChatService';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import {Image} from 'react-native';

export default function ChatContactScreen({navigation}) {
  const {getClientChats} = useChatService();

  const user = useSelector(state => state.user.user);
  const chats = useSelector(state => state.chats.allChats);
  useEffect(() => {
    const fetchChats = async () => {
      try {
        await getClientChats();
      } catch (error) {
        console.error('Failed to fetch agent chats:', error);
      }
    };

    fetchChats();
  }, []);

  const renderItem = ({item}) => {
    const user = item.agent;
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
  const renderEmptyComponent = () => (
    <View
      style={{
        minHeight: heightToDp(100),
        justifyContent: 'center',
        alignSelf: 'center',
      }}>
      <Image
        source={require('../../../assets/emptyBox.png')}
        style={styles.picture}
      />
      <Text
        style={[
          styles.Heading,

          {
            fontSize: widthToDp(4),
            fontFamily: 'Manrope-SemiBold',
            fontWeight: '600',
          },
        ]}>
        No chats available
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HomeScreenHeader Title="Find all your messages with our agents here" />
      <BottomSheetStyle>
        {user != null ? (
          <FlatList
            data={chats}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            ListEmptyComponent={renderEmptyComponent}
          />
        ) : (
          <View
            style={{
              minHeight: heightToDp(100),
              justifyContent: 'center',
              alignSelf: 'center',
            }}>
            <Image
              source={require('../../../assets/emptyBox.png')}
              style={styles.picture}
            />
            <Text
              style={[
                styles.Heading,

                {
                  fontSize: widthToDp(4),
                  fontFamily: 'Manrope-SemiBold',
                  fontWeight: '600',
                },
              ]}>
              Please Login to see your chats
            </Text>
          </View>
        )}
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  Heading: {
    fontSize: widthToDp(6.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    paddingLeft: widthToDp(2),
  },
  picture: {
    width: widthToDp(20),
    alignSelf: 'center',
    height: heightToDp(20),
  },
});
