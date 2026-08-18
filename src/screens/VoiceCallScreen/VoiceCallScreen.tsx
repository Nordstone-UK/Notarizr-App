import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
} from 'react-native-agora';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';

import useChatService from '../../hooks/useChatService';
import {
  connectSocket,
  socket,
  socketRequest,
  waitForSocketConnection,
} from '../../utils/Socket';

const AGORA_APP_ID = 'f64e76f674b646bc965dc3e257b4e108';
const RING_TIMEOUT_MS = 45000;

const createChannelName = (senderId: string, receiverId: string) =>
  `notarizr-${[senderId, receiverId].sort().join('-')}-${Date.now()}`;

const displayName = user =>
  [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
  'Notarizr user';

export default function VoiceCallScreen({route, navigation}: any) {
  const {
    sender,
    receiver,
    incoming = false,
    callerId,
    callId: suppliedCallId,
    channelName: suppliedChannel,
    token: suppliedToken,
  } = route.params || {};
  const {getAgoraCallToken} = useChatService();
  const agoraEngineRef = useRef<IRtcEngine>();
  const timerRef = useRef<any>(null);
  const ringTimerRef = useRef<any>(null);
  const acceptResolverRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);
  const startedRef = useRef(false);
  const finishedRef = useRef(false);
  const acceptedRef = useRef(false);
  const callIdRef = useRef(
    suppliedCallId || `${sender?._id || 'caller'}-${Date.now()}`,
  );
  const targetId = String(incoming ? callerId : receiver?._id || '');

  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState(
    incoming ? 'Connecting...' : 'Calling...',
  );
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (ringTimerRef.current) {
      clearTimeout(ringTimerRef.current);
      ringTimerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!timerRef.current) {
      timerRef.current = setInterval(
        () => setCallDuration(current => current + 1),
        1000,
      );
    }
  }, []);

  const leaveChannel = useCallback(() => {
    clearTimers();
    try {
      agoraEngineRef.current?.leaveChannel();
      agoraEngineRef.current?.release();
    } catch (error) {
      console.warn('Agora cleanup failed:', error);
    }
    agoraEngineRef.current = undefined;
  }, [clearTimers]);

  const finishCall = useCallback(
    async (notifyOtherUser = true) => {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      acceptResolverRef.current = null;

      if (notifyOtherUser && targetId) {
        socketRequest('call:end', {
          callId: callIdRef.current,
          targetId,
        }).catch(error =>
          console.warn('Call end signal was not delivered:', error),
        );
      }

      leaveChannel();
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    [leaveChannel, navigation, targetId],
  );

  const initializeAgora = useCallback(
    (channelName: string, token: string) => {
      if (finishedRef.current || agoraEngineRef.current) {
        return;
      }

      const engine = createAgoraRtcEngine();
      agoraEngineRef.current = engine;
      engine.registerEventHandler({
        onJoinChannelSuccess: () => {
          if (mountedRef.current && !finishedRef.current) {
            setCallStatus('Connecting...');
          }
        },
        onUserJoined: () => {
          if (mountedRef.current && !finishedRef.current) {
            setRemoteJoined(true);
            setCallStatus('Connected');
            startTimer();
          }
        },
        onUserOffline: () => {
          if (mountedRef.current && !finishedRef.current) {
            setRemoteJoined(false);
            finishCall(false);
          }
        },
        onError: errorCode => {
          console.error('Agora call error:', errorCode);
        },
      });
      engine.initialize({appId: AGORA_APP_ID});
      engine.enableAudio();
      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.joinChannel(token || '', channelName, 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    },
    [finishCall, startTimer],
  );

  useEffect(() => {
    mountedRef.current = true;

    const accepted = ({callId}) => {
      if (callId === callIdRef.current && !finishedRef.current) {
        acceptedRef.current = true;
        setCallStatus('Connecting...');
        acceptResolverRef.current?.();
        acceptResolverRef.current = null;
      }
    };
    const declined = ({callId}) => {
      if (callId === callIdRef.current && !finishedRef.current) {
        Toast.show({
          type: 'info',
          text1: 'Call declined',
          text2: `${displayName(receiver)} is unavailable right now.`,
        });
        finishCall(false);
      }
    };
    const ended = ({callId}) => {
      if (callId === callIdRef.current && !finishedRef.current) {
        Toast.show({type: 'info', text1: 'Call ended'});
        finishCall(false);
      }
    };

    socket.on('call:accepted', accepted);
    socket.on('call:declined', declined);
    socket.on('call:ended', ended);

    return () => {
      mountedRef.current = false;
      socket.off('call:accepted', accepted);
      socket.off('call:declined', declined);
      socket.off('call:ended', ended);
      leaveChannel();
    };
  }, [finishCall, leaveChannel, receiver]);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const prepareCall = async () => {
      try {
        if (!targetId) {
          throw new Error('The call recipient is unavailable.');
        }
        if (Platform.OS === 'android') {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          );
          if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
            throw new Error('Microphone permission is required for calls.');
          }
        }

        const accessToken = await AsyncStorage.getItem('token');
        if (!accessToken) {
          throw new Error('Please sign in again to start a call.');
        }
        connectSocket(accessToken);
        await waitForSocketConnection();

        let channelName = suppliedChannel;
        let token = suppliedToken || '';
        if (!channelName) {
          try {
            const credentials = await getAgoraCallToken(targetId);
            channelName = credentials?.channelName;
            token = credentials?.token || '';
          } catch (error) {
            console.warn(
              'Agora token service unavailable; using App ID-only mode:',
              error,
            );
          }
        }
        if (!channelName) {
          channelName = createChannelName(String(sender?._id || ''), targetId);
        }

        if (incoming) {
          initializeAgora(channelName, token);
          return;
        }

        await socketRequest('call:start', {
          callId: callIdRef.current,
          receiverId: targetId,
          channelName,
          token,
        });
        if (finishedRef.current) {
          return;
        }
        setCallStatus('Ringing...');

        if (!acceptedRef.current) {
          await new Promise<void>((resolve, reject) => {
            acceptResolverRef.current = resolve;
            ringTimerRef.current = setTimeout(() => {
              acceptResolverRef.current = null;
              reject(new Error('The call was not answered.'));
            }, RING_TIMEOUT_MS);
          });
        }
        if (ringTimerRef.current) {
          clearTimeout(ringTimerRef.current);
          ringTimerRef.current = null;
        }
        initializeAgora(channelName, token);
      } catch (error) {
        if (finishedRef.current) {
          return;
        }
        console.error('Voice call setup failed:', error);
        Toast.show({
          type: 'error',
          text1: 'Call could not start',
          text2: error?.message || 'Please try again.',
        });
        finishCall(true);
      }
    };

    prepareCall();
  }, [
    finishCall,
    getAgoraCallToken,
    incoming,
    initializeAgora,
    sender?._id,
    suppliedChannel,
    suppliedToken,
    targetId,
  ]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    agoraEngineRef.current?.muteLocalAudioStream(nextMuted);
    setIsMuted(nextMuted);
  };

  const toggleSpeaker = () => {
    const nextSpeaker = !speakerEnabled;
    agoraEngineRef.current?.setEnableSpeakerphone(nextSpeaker);
    setSpeakerEnabled(nextSpeaker);
  };

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>NOTARIZR VOICE CALL</Text>
        <View style={styles.avatar}>
          {receiver?.profile_picture ? (
            <Image
              source={{uri: receiver.profile_picture}}
              style={styles.image}
            />
          ) : (
            <Text style={styles.initials}>
              {(receiver?.first_name?.[0] || 'N').toUpperCase()}
              {(receiver?.last_name?.[0] || '').toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={styles.name}>{displayName(receiver)}</Text>
        <Text style={styles.status}>
          {remoteJoined ? formatDuration(callDuration) : callStatus}
        </Text>

        <View style={styles.controls}>
          <View style={styles.controlGroup}>
            <TouchableOpacity
              accessibilityLabel={
                isMuted ? 'Unmute microphone' : 'Mute microphone'
              }
              disabled={!agoraEngineRef.current}
              onPress={toggleMute}
              style={[styles.control, isMuted && styles.controlActive]}>
              <Feather
                name={isMuted ? 'mic-off' : 'mic'}
                size={23}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </View>
          <View style={styles.controlGroup}>
            <TouchableOpacity
              accessibilityLabel="End call"
              onPress={() => finishCall(true)}
              style={styles.endCall}>
              <Feather name="phone-off" size={27} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>End</Text>
          </View>
          <View style={styles.controlGroup}>
            <TouchableOpacity
              accessibilityLabel="Toggle speaker"
              disabled={!agoraEngineRef.current}
              onPress={toggleSpeaker}
              style={[styles.control, speakerEnabled && styles.controlActive]}>
              <Feather name="volume-2" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Speaker</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#111827'},
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  eyebrow: {
    color: '#FD7A32',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  avatar: {
    width: 136,
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 48,
    borderRadius: 68,
    borderWidth: 4,
    borderColor: '#2D3748',
    backgroundColor: '#FFF0E7',
  },
  image: {width: '100%', height: '100%'},
  initials: {color: '#D65322', fontFamily: 'Manrope-Bold', fontSize: 40},
  name: {
    marginTop: 24,
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 25,
  },
  status: {
    marginTop: 8,
    color: '#AAB2C1',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  controls: {
    width: '100%',
    maxWidth: 340,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 54,
  },
  controlGroup: {alignItems: 'center'},
  control: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    backgroundColor: '#2C3545',
  },
  controlActive: {backgroundColor: '#596579'},
  endCall: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    backgroundColor: '#DC4C4C',
  },
  controlLabel: {
    marginTop: 9,
    color: '#C8CFDA',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
});
