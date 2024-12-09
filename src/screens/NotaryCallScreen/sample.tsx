// import React, { useEffect, useState, useRef } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   View,
//   PermissionsAndroid,
//   Platform,
// } from 'react-native';
// import { GiftedChat } from 'react-native-gifted-chat';
// import { ChatClient } from 'react-native-agora-chat';
// import {
//   createAgoraRtcEngine,
//   IRtcEngine,
// } from 'react-native-agora';
// import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
// import Colors from '../../themes/Colors';

// export default function ChatScreen({ route, navigation }: any) {
//   const agoraEngineRef = useRef<IRtcEngine | null>(null);
//   const chatClient = ChatClient.getInstance();
//   const { sender, receiver, channel, voiceToken } = route.params;

//   const [content, setContent] = useState([]);

//   const logoutAgora = async () => {
//     try {
//       // Log off from Agora Chat
//       await chatClient.logout();
//       console.log('Successfully logged out from Agora.');
//     } catch (error) {
//       console.error('Failed to log out from Agora:', error);
//     }

//     // Release the Agora RTC Engine
//     if (agoraEngineRef.current) {
//       agoraEngineRef.current.leaveChannel();
//       agoraEngineRef.current.release();
//       console.log('Agora RTC Engine released.');
//     }
//   };

//   useEffect(() => {
//     const getPermission = async () => {
//       if (Platform.OS === 'android') {
//         await PermissionsAndroid.requestMultiple([
//           PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         ]);
//       }
//     };

//     const initAgora = async () => {
//       const agoraEngine = createAgoraRtcEngine();
//       agoraEngineRef.current = agoraEngine;

//       // Initialize Agora RTC Engine
//       agoraEngine.initialize({
//         appId: 'YOUR_AGORA_APP_ID', // Replace with your Agora App ID
//         channelProfile: 0,
//       });

//       console.log('Agora RTC Engine initialized.');
//     };

//     getPermission();
//     initAgora();

//     const unsubscribeFocus = navigation.addListener('focus', () => {
//       console.log('ChatScreen focused.');
//     });

//     const unsubscribeBlur = navigation.addListener('blur', () => {
//       logoutAgora();
//     });

//     // Cleanup
//     return () => {
//       unsubscribeFocus();
//       unsubscribeBlur();
//       logoutAgora(); // Ensure Agora is logged off when component unmounts
//     };
//   }, [navigation]);

//   const sendmsg = (newMessage: any) => {
//     const content = newMessage.text;

//     if (!chatClient.isInitialized) {
//       console.log('Perform initialization first.');
//       return;
//     }

//     let msg = ChatMessage.createTextMessage(
//       receiver._id,
//       content,
//       ChatMessageChatType.PeerChat,
//     );

//     chatClient.chatManager
//       .sendMessage(msg)
//       .then(() => {
//         const newMessages = [
//           {
//             _id: msg.localMsgId,
//             text: content,
//             createdAt: new Date(),
//             user: { _id: sender._id },
//           },
//         ];
//         setContent(previousMessages => GiftedChat.append(previousMessages, newMessages));
//       })
//       .catch(reason => {
//         console.log('Send message failed:', reason);
//       });
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <NavigationHeader
//         Title={receiver?.first_name + ' ' + receiver?.last_name}
//         ProfilePic={{ uri: receiver?.profile_picture }}
//         lastImg={channel ? require('../../../assets/voiceCallIcon.png') : null}
//         lastImgPress={() =>
//           navigation.navigate('VoiceCallScreen', {
//             sender,
//             receiver,
//             channelName: channel,
//             token: voiceToken,
//           })
//         }
//       />
//       <View style={styles.bottonSheet}>
//         <GiftedChat
//           messages={content}
//           onSend={newMessages => sendmsg(newMessages[0])}
//           user={{ _id: sender._id }}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: Colors.PinkBackground,
//     flex: 1,
//   },
//   bottonSheet: {
//     marginTop: 20,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
// });
