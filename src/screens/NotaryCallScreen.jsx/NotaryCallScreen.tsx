import {
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {Slider} from '@miblanchard/react-native-slider';
import {Picker} from '@react-native-picker/picker';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
  VideoContentHint,
} from 'react-native-agora';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
const appId = 'abd7df71ee024625b2cc979e12aec405';

export default function NotaryCallScreen({route, navigation}) {
  const {channel, token: CutomToken, uid: _id} = route.params;
  const uid = parseInt(_id, 16);
  const channelName = channel;
  const token = CutomToken;
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUids, setRemoteUids] = useState<number[]>([]);
  const agoraEngineRef = useRef<IRtcEngine>();
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [selected, setSelected] = useState('notary room');
  const [value, setValue] = useState(50);
  useEffect(() => {
    const setupVideoSDKEngine = async () => {
      try {
        if (Platform.OS === 'android') {
          await getPermission();
        }
        agoraEngineRef.current = createAgoraRtcEngine();
        const agoraEngine = agoraEngineRef.current;
        agoraEngine.registerEventHandler({
          onJoinChannelSuccess: () => {
            showMessage('Successfully joined ' + channelName);
            setIsJoined(true);
          },
          onUserJoined: (_connection, uid) => {
            showMessage('Remote user joined with uid ' + uid);

            setRemoteUids(prevUids => [...prevUids, uid]);
          },
          onUserOffline: (_connection, uid) => {
            showMessage('Remote user left the channel. uid: ' + uid);

            setRemoteUids(prevUids => prevUids.filter(uid => uid !== uid));
          },
        });
        agoraEngine.initialize({
          appId: appId,
          channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
        });
        agoraEngine.enableVideo();
      } catch (e) {
        console.log(e);
      }
    };
    setupVideoSDKEngine();

    return () => {
      agoraEngineRef.current?.leaveChannel();
    };
  }, []);
  console.log('====================================');
  console.log(remoteUids, isJoined);
  console.log('====================================');
  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngineRef.current?.startPreview();
      agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      setIsJoined(true);
    } catch (e) {
      console.log(e);
    }
  };
  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUids([]);

      setIsJoined(false);
      showMessage('You left the session');
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  function showMessage(msg: string) {
    Toast.show({
      type: 'success',
      text1: msg,
    });
  }
  const mute = () => {
    setIsMuted(!isMuted);
    console.log('====================================');
    console.log(remoteUids, isMuted);
    console.log('====================================');
    agoraEngineRef.current?.muteRemoteAudioStream(remoteUid, isMuted);
  };

  const displayValue = () => {
    return (
      <Text style={[styles.sessionDesc, {color: Colors.Orange}]}>
        {Math.floor(value)}%
      </Text>
    );
  };
  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.NavbarContainer}>
        <View style={styles.NavContainer}>
          <Image
            source={require('../../../assets/waitingNav.png')}
            style={styles.waitingNav}
          />
          <View style={styles.NavTextContainer}>
            <Text style={styles.textHead}>Notary Room</Text>
          </View>
        </View>
        <Image
          source={require('../../../assets/profileIcon.png')}
          style={styles.profilePic}
        />
      </View>
      <View style={styles.buttonContainer}>
        <MainButton
          Title="Notary Room"
          onPress={() => setSelected('notary room')}
          colors={
            selected === 'notary room'
              ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
              : [Colors.PinkBackground, Colors.PinkBackground]
          }
          styles={
            selected === 'notary room'
              ? {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                }
              : {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                  color: Colors.TextColor,
                }
          }
          GradiStyles={{
            borderRadius: 0,
          }}
        />
        <MainButton
          Title="Participants"
          onPress={() => setSelected('participants')}
          colors={
            selected === 'participants'
              ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
              : [Colors.PinkBackground, Colors.PinkBackground]
          }
          styles={
            selected === 'participants'
              ? {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                }
              : {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                  color: Colors.TextColor,
                }
          }
          GradiStyles={{
            borderRadius: 0,
          }}
        />
      </View>
      <ScrollView style={styles.SecondContainer}>
        <View style={styles.flexContainer}>
          <ScrollView
            style={styles.scroll}
            horizontal={true}
            contentContainerStyle={styles.scrollContainer}>
            {isJoined ? (
              <React.Fragment key={0}>
                <RtcSurfaceView canvas={{uid: 0}} style={styles.videoView} />
              </React.Fragment>
            ) : null}
            {remoteUids.map(uid => (
              <React.Fragment key={uid}>
                <RtcSurfaceView canvas={{uid}} style={styles.videoView} />
              </React.Fragment>
            ))}
          </ScrollView>
          <View style={{flex: 0.2, justifyContent: 'space-evenly'}}>
            <TouchableOpacity style={styles.hourGlass} onPress={() => join()}>
              <Image
                source={require('../../../assets/join.png')}
                style={{width: widthToDp(10), height: widthToDp(10)}}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.hourGlass} onPress={() => mute()}>
              <Image
                source={
                  isMuted
                    ? require('../../../assets/unmute.png')
                    : require('../../../assets/mute.png')
                }
                style={{width: widthToDp(10), height: widthToDp(10)}}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.hourGlass} onPress={() => leave()}>
              <Image
                source={require('../../../assets/callDrop.png')}
                style={{width: widthToDp(10), height: widthToDp(10)}}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* <View style={[styles.scrollBar]}>
          <Text style={styles.sessionDesc}>0%</Text>

          <View style={styles.slideContainer}>
            <Slider
              value={value}
              // onValueChange={value => setValue(value)}
              animateTransitions={true}
              maximumValue={100}
              minimumValue={20}
              thumbStyle={{backgroundColor: Colors.OrangeGradientStart}}
              thumbImage={require('../../../assets/thumb.png')}
              trackStyle={{height: heightToDp(3), borderRadius: 5}}
              minimumTrackStyle={{backgroundColor: Colors.Orange}}
              maximumTrackStyle={{backgroundColor: Colors.DisableColor}}
              trackClickable={true}
              renderBelowThumbComponent={displayValue}
            />
          </View>
          <Text style={styles.sessionDesc}>100%</Text>
        </View> */}
        {/* <Text style={styles.textSession}>Document</Text>
        <View style={styles.picker}>
          {/* <Picker
            selectedValue={selectedDocument}
            onValueChange={handleTimezoneSelect}>
            <Picker.Item
              label="Select a document"
              color={Colors.DullTextColor}
            />
            <Picker.Item label="Document 1" color={Colors.DullTextColor} />
            <Picker.Item label="Document 2" color={Colors.DullTextColor} />
            <Picker.Item label="Document 3" color={Colors.DullTextColor} />
          </Picker> */}
        {/* </View>  */}
        {/* <Image
          source={require('../../../assets/image.png')}
          style={{alignSelf: 'center'}}
        />

        <View style={styles.btnContainer}>
          <GradientButton
            Title="Complete Session"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            styles={{fontSize: widthToDp(5)}}
            // onPress={() => navigation.navigate('AgentBookingComplete')}
            // onPress={() => joinMeeting()}
          />
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  NavbarContainer: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(2),
    justifyContent: 'space-between',
  },
  NavContainer: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(2),
    marginVertical: widthToDp(2),
    // borderWidth: 1,
  },
  waitingNav: {
    width: widthToDp(6),
    height: heightToDp(6),
    marginVertical: widthToDp(2),
  },
  profilePic: {
    marginVertical: widthToDp(2),
  },
  flexContainer: {
    flexDirection: 'row',
    height: heightToDp(50),
  },
  scrollBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthToDp(5),
  },
  picker: {
    borderWidth: 2,
    borderColor: Colors.DisableColor,
    width: widthToDp(90),
    marginHorizontal: widthToDp(5),
    borderRadius: 15,
  },
  NavTextContainer: {
    // borderWidth: 1,
    marginLeft: widthToDp(5),
  },
  textHead: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontWeight: '700',
    fontFamily: 'Manrope-Regular',
  },
  textSubHead: {
    color: Colors.TextColor,
    fontSize: widthToDp(3.5),
    fontWeight: '700',
    marginLeft: widthToDp(2),
    fontFamily: 'Manrope-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    // borderWidth: 1,
    justifyContent: 'center',
  },
  SecondContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  hourGlass: {
    alignSelf: 'center',
  },
  textSession: {
    color: Colors.TextColor,
    marginHorizontal: widthToDp(5),
    marginTop: heightToDp(10),
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  sessionDesc: {
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  // btnContainer: {
  //   marginVertical: widthToDp(5),
  // },
  btn: {
    marginVertical: heightToDp(2),
  },
  btncontain: {
    flex: 1,
    justifyContent: 'flex-end',
    marginVertical: heightToDp(5),
  },
  slideContainer: {
    flex: 1,
    marginHorizontal: widthToDp(5),
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 4,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#0055cc',
    margin: 5,
  },
  main: {flex: 1, alignItems: 'center'},
  scroll: {flex: 1, width: '100%'},
  scrollContainer: {
    margin: widthToDp(3),
    columnGap: widthToDp(4),
  },
  videoView: {
    width: widthToDp(35),
    // height: heightToDp(50),
    resizeMode: 'contain',
    borderRadius: 15,
  },
  btnContainer: {flexDirection: 'row', justifyContent: 'center'},
  head: {fontSize: 20},
  info: {backgroundColor: '#ffffe0', color: '#0000ff'},
});
// return (
//   <SafeAreaView style={styles.container}>
//     {/* <View style={styles.NavbarContainer}>
//         <View style={styles.NavContainer}>
//           <Image
//             source={require('../../../assets/waitingNav.png')}
//             style={styles.waitingNav}
//           />
//           <View style={styles.NavTextContainer}>
//             <Text style={styles.textHead}>Notary Room</Text>
//           </View>
//         </View>
//         <Image
//           source={require('../../../assets/profileIcon.png')}
//           style={styles.profilePic}
//         />
//       </View>
//       <View style={styles.buttonContainer}>
//         <MainButton
//           Title="Notary Room"
//           onPress={() => setSelected('notary room')}
//           colors={
//             selected === 'notary room'
//               ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
//               : [Colors.PinkBackground, Colors.PinkBackground]
//           }
//           styles={
//             selected === 'notary room'
//               ? {
//                   fontSize: widthToDp(4),
//                   paddingHorizontal: widthToDp(7),
//                   paddingVertical: widthToDp(3),
//                 }
//               : {
//                   fontSize: widthToDp(4),
//                   paddingHorizontal: widthToDp(7),
//                   paddingVertical: widthToDp(3),
//                   color: Colors.TextColor,
//                 }
//           }
//           GradiStyles={{
//             borderRadius: 0,
//           }}
//         />
//         <MainButton
//           Title="Participants"
//           onPress={() => setSelected('participants')}
//           colors={
//             selected === 'participants'
//               ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
//               : [Colors.PinkBackground, Colors.PinkBackground]
//           }
//           styles={
//             selected === 'participants'
//               ? {
//                   fontSize: widthToDp(4),
//                   paddingHorizontal: widthToDp(7),
//                   paddingVertical: widthToDp(3),
//                 }
//               : {
//                   fontSize: widthToDp(4),
//                   paddingHorizontal: widthToDp(7),
//                   paddingVertical: widthToDp(3),
//                   color: Colors.TextColor,
//                 }
//           }
//           GradiStyles={{
//             borderRadius: 0,
//           }}
//         />
//       </View> */}

//     <ScrollView style={styles.SecondContainer}>
//       <View style={styles.flexContainer}>
//        <ScrollView
//   style={styles.scroll}
//   horizontal={true}
//   contentContainerStyle={styles.scrollContainer}>
//   {isJoined ? (
//     <React.Fragment key={0}>
//       <RtcSurfaceView canvas={{uid: 0}} style={styles.videoView} />
//     </React.Fragment>
//   ) : (
//     <Text>Join a channel</Text>
//   )}
//   {isJoined && remoteUid !== 0 ? (
//     <React.Fragment key={remoteUid}>
//       <RtcSurfaceView
//         canvas={{uid: remoteUid}}
//         style={styles.videoView}
//       />
//     </React.Fragment>
//   ) : (
//     <Text>Waiting for a remote user to join</Text>
//   )}
// </ScrollView>
//         <View style={{flex: 0.2, justifyContent: 'space-evenly'}}>
//           <TouchableOpacity style={styles.hourGlass}>
//             <Image source={require('../../../assets/turnOffCamera.png')} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.hourGlass}>
//             <Image source={require('../../../assets/mic.png')} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.hourGlass}>
//             <Image source={require('../../../assets/callDrop.png')} />
//           </TouchableOpacity>
//         </View>
//       </View>
//       <View
//         style={[
//           styles.flexContainer,
//           {
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             marginHorizontal: widthToDp(5),
//           },
//         ]}>
//         <Text style={styles.sessionDesc}>0%</Text>

//         <View style={styles.slideContainer}>
//           <Slider
//             value={value}
//             onValueChange={value => setValue(value)}
//             animateTransitions={true}
//             maximumValue={100}
//             minimumValue={20}
//             thumbStyle={{backgroundColor: Colors.OrangeGradientStart}}
//             thumbImage={require('../../../assets/thumb.png')}
//             trackStyle={{height: heightToDp(3), borderRadius: 5}}
//             minimumTrackStyle={{backgroundColor: Colors.Orange}}
//             maximumTrackStyle={{backgroundColor: Colors.DisableColor}}
//             trackClickable={true}
//             renderBelowThumbComponent={displayValue}
//           />
//         </View>
//         <Text style={styles.sessionDesc}>100%</Text>
//       </View>
//       <Text style={styles.textSession}>Document</Text>
//       <View style={styles.picker}>
//         <Picker
//           selectedValue={selectedDocument}
//           onValueChange={handleTimezoneSelect}>
//           <Picker.Item label="Select a document" color={Colors.DullTextColor} />
//           <Picker.Item label="Document 1" color={Colors.DullTextColor} />
//           <Picker.Item label="Document 2" color={Colors.DullTextColor} />
//           <Picker.Item label="Document 3" color={Colors.DullTextColor} />
//         </Picker>
//       </View>
//       <Image
//         source={require('../../../assets/image.png')}
//         style={{alignSelf: 'center'}}
//       />
//       {zoomInitailized && (
//         <View style={styles.btnContainer}>
//           <GradientButton
//             Title="Complete Session"
//             colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
//             styles={{fontSize: widthToDp(5)}}
//             // onPress={() => navigation.navigate('AgentBookingComplete')}
//             onPress={() => joinMeeting()}
//           />
//         </View>
//       )}
//     </ScrollView>
//   </SafeAreaView>
// );
// <SafeAreaView style={styles.main}>
//   <Text style={styles.head}>Agora Video Calling Quickstart</Text>
//   <View style={styles.btnContainer}>
//     <Text onPress={join} style={styles.button}>
//       Join
//     </Text>
//     <Text onPress={leave} style={styles.button}>
//       Leave
//     </Text>
//   </View>
//   <ScrollView
//     style={styles.scroll}
//     horizontal={true}
//     contentContainerStyle={styles.scrollContainer}>
//     {isJoined ? (
//       <React.Fragment key={0}>
//         <RtcSurfaceView canvas={{uid: 0}} style={styles.videoView} />

//         {/* <Text>Local user uid: {uid}</Text> */}
//       </React.Fragment>
//     ) : (
//       <Text>Join a channel</Text>
//     )}
//     {isJoined && remoteUid !== 0 ? (
//       <React.Fragment key={remoteUid}>
//         <RtcSurfaceView
//           canvas={{uid: remoteUid}}
//           style={styles.videoView}
//         />
//         {/* <Text>Remote user uid: {remoteUid}</Text> */}
//       </React.Fragment>
//     ) : (
//       <Text>Waiting for a remote user to join</Text>
//     )}
//     {/* <Text style={styles.info}>{message}</Text> */}
//   </ScrollView>
// </SafeAreaView>
