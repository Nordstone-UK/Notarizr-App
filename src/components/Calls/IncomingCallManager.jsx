import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  AppState,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {EventRegister} from 'react-native-event-listeners';
import SoundPlayer from 'react-native-sound-player';
import {useSelector} from 'react-redux';

import {connectSocket, socket, socketRequest} from '../../utils/Socket';

const RING_TIMEOUT_MS = 45000;

const displayName = user =>
  [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
  'Notarizr user';

const stopRingtone = () => {
  try {
    SoundPlayer.stop();
  } catch (error) {
    console.warn('Ringtone could not be stopped:', error);
  }
};

export default function IncomingCallManager({navigation}) {
  const currentUser = useSelector(state => state.user.user);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    let mounted = true;
    const ensureConnection = () =>
      AsyncStorage.getItem('token')
        .then(token => {
          if (mounted && token) {
            connectSocket(token);
          }
        })
        .catch(error =>
          console.warn('Call signaling could not connect:', error),
        );

    ensureConnection();

    const handleIncoming = call => {
      if (
        !currentUser?._id ||
        String(call?.receiverId) === String(currentUser._id)
      ) {
        setIncomingCall(call);
      }
    };
    const handleEnded = ({callId}) => {
      setIncomingCall(call => (call?.callId === callId ? null : call));
    };

    socket.on('call:incoming', handleIncoming);
    socket.on('call:ended', handleEnded);
    const appStateSubscription = AppState.addEventListener(
      'change',
      nextState => {
        if (nextState === 'active') {
          ensureConnection();
        }
      },
    );
    const notificationListener = EventRegister.addEventListener(
      'voice-call',
      handleIncoming,
    );
    return () => {
      mounted = false;
      socket.off('call:incoming', handleIncoming);
      socket.off('call:ended', handleEnded);
      appStateSubscription.remove();
      EventRegister.removeEventListener(notificationListener);
    };
  }, [currentUser?._id]);

  useEffect(() => {
    if (!incomingCall?.callId) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setIncomingCall(call =>
        call?.callId === incomingCall.callId ? null : call,
      );
      stopRingtone();
    }, RING_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [incomingCall?.callId]);

  const decline = async () => {
    const call = incomingCall;
    setIncomingCall(null);
    stopRingtone();
    if (!call) {
      return;
    }
    try {
      await socketRequest('call:decline', {
        callId: call.callId,
        callerId: call.callerId,
      });
    } catch (error) {
      console.warn('Call decline was not delivered:', error);
    }
  };

  const accept = async () => {
    const call = incomingCall;
    if (!call) {
      return;
    }
    setIncomingCall(null);
    stopRingtone();
    try {
      await socketRequest('call:accept', {
        callId: call.callId,
        callerId: call.callerId,
      });
      navigation.navigate('VoiceCallScreen', {
        incoming: true,
        callId: call.callId,
        callerId: call.callerId,
        channelName: call.channelName,
        token: call.token,
        sender: currentUser || {_id: call.receiverId},
        receiver: call.caller,
      });
    } catch (error) {
      console.warn('Call accept was not delivered:', error);
    }
  };

  const caller = incomingCall?.caller;
  return (
    <Modal
      animationType="fade"
      onRequestClose={decline}
      transparent
      visible={Boolean(incomingCall)}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.avatar}>
            {caller?.profile_picture ? (
              <Image
                source={{uri: caller.profile_picture}}
                style={styles.image}
              />
            ) : (
              <Text style={styles.initials}>
                {(caller?.first_name?.[0] || 'N').toUpperCase()}
                {(caller?.last_name?.[0] || '').toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.eyebrow}>INCOMING VOICE CALL</Text>
          <Text style={styles.name}>{displayName(caller)}</Text>
          <Text style={styles.caption}>Calling through Notarizr</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={decline} style={styles.decline}>
              <Feather name="phone-off" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={accept} style={styles.accept}>
              <Feather name="phone" size={25} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.actionLabels}>
            <Text style={styles.actionLabel}>Decline</Text>
            <Text style={styles.actionLabel}>Accept</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(16, 22, 35, 0.72)',
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 46,
    backgroundColor: '#FFF0E7',
  },
  image: {width: '100%', height: '100%'},
  initials: {color: '#D65322', fontFamily: 'Manrope-Bold', fontSize: 28},
  eyebrow: {
    marginTop: 22,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  name: {
    marginTop: 7,
    color: '#151B2B',
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
  },
  caption: {
    marginTop: 5,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
  },
  actions: {
    width: 190,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  decline: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    backgroundColor: '#DC4C4C',
  },
  accept: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    backgroundColor: '#169B62',
  },
  actionLabels: {
    width: 205,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionLabel: {
    width: 76,
    color: '#636B78',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    textAlign: 'center',
  },
});
