import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { GiftedChat, Actions } from 'react-native-gifted-chat';
import { launchImageLibrary } from 'react-native-image-picker';

const ChatScreen = ({ navigation, receiver, sender, channel, voiceToken }) => {
  const [content, setContent] = React.useState([]);

  const sendmsg = async (newMessage) => {
    // Your existing sendmsg logic here
  };

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        sendmsg({ image }); // Send the image as a message
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  const renderCustomActions = (props) => (
    <Actions
      {...props}
      containerStyle={styles.actionContainer}
      icon={() => (
        <Image
          source={require('../../../assets/imageIcon.png')} // Replace with your icon path
          style={styles.imageIcon}
        />
      )}
      onPressActionButton={pickImage}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title={receiver?.first_name + ' ' + receiver?.last_name}
        ProfilePic={{ uri: receiver?.profile_picture }}
        lastImg={channel ? require('../../../assets/voiceCallIcon.png') : null}
        lastImgPress={() =>
          navigation.navigate('VoiceCallScreen', {
            sender: sender,
            receiver: receiver,
            channelName: channel,
            token: voiceToken,
          })
        }
      />
      <View style={styles.bottonSheet}>
        <GiftedChat
          messages={content}
          onSend={(setContent) => sendmsg(setContent[0])}
          user={{
            _id: sender?._id,
          }}
          renderActions={renderCustomActions}
          textInputProps={{
            style: {
              flex: 1,
              marginHorizontal: 10,
              color: 'black',
              fontSize: 16,
            },
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottonSheet: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  imageIcon: {
    width: 28,
    height: 28,
  },
});

export default ChatScreen;
