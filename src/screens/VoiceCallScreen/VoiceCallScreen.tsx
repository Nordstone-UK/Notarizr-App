import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import LottieView from 'lottie-react-native';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
} from 'react-native-agora';
import useChatService from '../../hooks/useChatService';
export default function VoiceCallScreen({route, navigation}: any) {
  const {sender, receiver} = route.params;
  const {getAgoraCallToken} = useChatService();
  const appId = 'abd7df71ee024625b2cc979e12aec405';
  const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance
  const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [message, setMessage] = useState('');
  const [channel, setChannelName] = useState('');
  const [callToken, setCallToken] = useState('');
  const uid = sender?._id;
  const getVoiceToken = async () => {
    const {channelName, token} = await getAgoraCallToken(receiver._id);
    setChannelName(channelName);
    setCallToken(token);
  };
  const setupVoiceSDKEngine = async () => {
    try {
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection: any, Uid: number) => {
          showMessage('Remote user joined with uid ' + Uid);
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection: any, Uid: number) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setRemoteUid(0);
        },
      });
      agoraEngine.initialize({
        appId: appId,
      });
    } catch (e) {
      console.log(e);
    }
  };
  const CallSetup = async () => {
    await getVoiceToken();
    await setupVoiceSDKEngine();
    join();
  };
  useEffect(() => {
    CallSetup();
  }, []);
  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  };
  function showMessage(msg: string) {
    console.log(msg);
    setMessage(msg);
  }
  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      console.log('call', callToken, channel);
      agoraEngineRef.current?.joinChannel(callToken, channel, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };
  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage('You left the channel');
      navigation.goBack();
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pictureContainer}>
        <View>
          <Image
            source={{uri: receiver?.profile_picture}}
            style={{
              width: widthToDp(30),
              height: heightToDp(30),
              borderRadius: widthToDp(25),
            }}
          />
          <Text style={styles.text}>
            {receiver?.first_name as string} {receiver?.last_name as string}
          </Text>
        </View>

        <TouchableOpacity
          style={{
            alignItems: 'center',
            marginBottom: heightToDp(5),
          }}>
          <Image
            source={require('../../../assets/callDrop.png')}
            style={{width: widthToDp(15), height: heightToDp(15)}}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  pictureContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: widthToDp(10),
  },
  completeIcon: {
    marginTop: heightToDp(25),
  },
  groupimage: {
    flex: 1,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
    width: widthToDp(50),
    height: widthToDp(50),
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: widthToDp(5.5),
    fontFamily: 'Manrope-Bold',
    marginTop: widthToDp(5),
  },

  complete: {
    alignSelf: 'flex-end',
    width: widthToDp(75),
    height: widthToDp(75),
    resizeMode: 'contain',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
