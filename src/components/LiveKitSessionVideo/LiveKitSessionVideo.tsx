import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useLazyQuery} from '@apollo/client';
import Feather from 'react-native-vector-icons/Feather';
import {
  AudioSession,
  LiveKitRoom,
  VideoTrack,
  useConnectionState,
  useLocalParticipant,
  useParticipants,
  useTracks,
} from '@livekit/react-native';
import {Track} from 'livekit-client';

import {GET_LIVEKIT_ROOM_TOKEN} from '../../../request/queries/getLiveKitRoomToken.query';
import BookingColors from '../../themes/BookingColors';

type Credentials = {
  serverUrl: string;
  token: string;
};

type Props = {
  recordId?: string;
  canJoin: boolean;
  unavailableMessage?: string;
  compact?: boolean;
  isClient?: boolean;
  onComplete?: () => void;
};

const participantName = (track: any) =>
  track?.participant?.name || track?.participant?.identity || 'Participant';

const participantInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return 'P';
  }
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

function RoomView({
  compact,
  isClient,
  onComplete,
}: Omit<Props, 'recordId' | 'canJoin' | 'unavailableMessage'>) {
  const connectionState = useConnectionState();
  const {localParticipant, isMicrophoneEnabled, isCameraEnabled} =
    useLocalParticipant();
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera]) as any[];
  const [speakerEnabled, setSpeakerEnabled] = useState(true);

  const localTrack = useMemo(
    () => tracks.find(track => track?.participant?.isLocal),
    [tracks],
  );
  const remoteTracks = useMemo(
    () => tracks.filter(track => !track?.participant?.isLocal),
    [tracks],
  );
  const remoteParticipants = participants.filter(
    participant => !participant.isLocal,
  );
  const primaryParticipant = remoteParticipants[0] || localParticipant;
  const primaryTrack = tracks.find(
    track => track?.participant?.identity === primaryParticipant?.identity,
  );
  const primaryName =
    primaryParticipant?.name || primaryParticipant?.identity || 'Participant';
  const primaryCameraEnabled = Boolean(primaryParticipant?.isCameraEnabled);
  const isConnected = connectionState === 'connected';
  const status = isConnected
    ? remoteParticipants.length
      ? 'Participant connected'
      : 'Waiting for participant'
    : 'Connecting securely';

  const toggleSpeaker = useCallback(async () => {
    const next = !speakerEnabled;
    await AudioSession.selectAudioOutput(
      next
        ? Platform.OS === 'ios'
          ? 'force_speaker'
          : 'speaker'
        : Platform.OS === 'ios'
        ? 'default'
        : 'earpiece',
    );
    setSpeakerEnabled(next);
  }, [speakerEnabled]);

  const controls = (
    <View style={[styles.controls, compact && styles.compactControls]}>
      <TouchableOpacity
        accessibilityLabel={
          isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'
        }
        disabled={!isConnected}
        onPress={() =>
          localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
        }
        style={styles.control}>
        <Feather
          name={isMicrophoneEnabled ? 'mic' : 'mic-off'}
          size={compact ? 17 : 19}
          color={BookingColors.white}
        />
        {!compact && (
          <Text style={styles.controlLabel}>
            {isMicrophoneEnabled ? 'Mute' : 'Unmute'}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityLabel={isCameraEnabled ? 'Stop video' : 'Start video'}
        disabled={!isConnected}
        onPress={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
        style={styles.control}>
        <Feather
          name={isCameraEnabled ? 'video' : 'video-off'}
          size={compact ? 17 : 19}
          color={BookingColors.white}
        />
        {!compact && (
          <Text style={styles.controlLabel}>
            {isCameraEnabled ? 'Camera' : 'Start video'}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityLabel={speakerEnabled ? 'Use earpiece' : 'Use speaker'}
        disabled={!isConnected}
        onPress={toggleSpeaker}
        style={styles.control}>
        <Feather
          name={speakerEnabled ? 'volume-2' : 'volume-1'}
          size={compact ? 17 : 19}
          color={BookingColors.white}
        />
        {!compact && (
          <Text style={styles.controlLabel}>
            {speakerEnabled ? 'Speaker' : 'Earpiece'}
          </Text>
        )}
      </TouchableOpacity>
      {!isClient && onComplete && (
        <TouchableOpacity
          accessibilityLabel="Complete session"
          onPress={onComplete}
          style={[
            styles.control,
            compact ? styles.compactCompleteControl : styles.completeControl,
          ]}>
          <Feather
            name="check-circle"
            size={compact ? 17 : 19}
            color={BookingColors.white}
          />
          <Text style={styles.controlLabel}>Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (compact) {
    return (
      <View style={styles.compactBar}>
        <View style={styles.statusRow}>
          <View
            style={[styles.statusDot, isConnected && styles.statusDotConnected]}
          />
          <Text style={styles.compactStatus}>{status}</Text>
        </View>
        {isCameraEnabled && localTrack ? (
          <View style={styles.compactVideoTile}>
            <VideoTrack trackRef={localTrack} style={styles.video} mirror />
          </View>
        ) : (
          <View
            accessibilityLabel={`${participantInitials(
              localParticipant?.name || localParticipant?.identity || 'You',
            )} avatar`}
            style={styles.compactAvatar}>
            <Text style={styles.compactAvatarInitials}>
              {participantInitials(
                localParticipant?.name || localParticipant?.identity || 'You',
              )}
            </Text>
          </View>
        )}
        {controls}
      </View>
    );
  }

  return (
    <View style={styles.videoPanel}>
      <View style={styles.videoStage}>
        {primaryParticipant && primaryCameraEnabled && primaryTrack ? (
          <VideoTrack
            trackRef={primaryTrack}
            style={styles.video}
            mirror={Boolean(primaryTrack?.participant?.isLocal)}
          />
        ) : primaryParticipant ? (
          <View style={styles.cameraOffPlaceholder}>
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>
                {participantInitials(primaryName)}
              </Text>
            </View>
            <Text style={styles.placeholderTitle}>{primaryName}</Text>
            <Text style={styles.placeholderCopy}>Camera is off</Text>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <ActivityIndicator color={BookingColors.primary} />
            <Text style={styles.placeholderTitle}>{status}</Text>
            <Text style={styles.placeholderCopy}>
              Your camera and microphone are protected in this private room.
            </Text>
          </View>
        )}
        <View style={styles.statusPill}>
          <View
            style={[styles.statusDot, isConnected && styles.statusDotConnected]}
          />
          <Text style={styles.statusText}>{status}</Text>
        </View>
        {remoteParticipants.length > 0 && (
          <View style={styles.localPip}>
            {isCameraEnabled && localTrack ? (
              <VideoTrack trackRef={localTrack} style={styles.video} mirror />
            ) : (
              <View style={styles.pipAvatar}>
                <Text style={styles.pipInitials}>
                  {participantInitials(
                    localParticipant?.name ||
                      localParticipant?.identity ||
                      'You',
                  )}
                </Text>
              </View>
            )}
            <Text numberOfLines={1} style={styles.pipLabel}>
              You
            </Text>
          </View>
        )}
        {primaryTrack && remoteTracks.length > 1 && (
          <Text style={styles.participantLabel}>
            {participantName(primaryTrack)}
          </Text>
        )}
      </View>
      {controls}
    </View>
  );
}

export default function LiveKitSessionVideo({
  recordId,
  canJoin,
  unavailableMessage,
  ...roomProps
}: Props) {
  const [getCredentials, {loading}] = useLazyQuery(GET_LIVEKIT_ROOM_TOKEN, {
    fetchPolicy: 'network-only',
  });
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!canJoin) {
      setCredentials(null);
      setError(unavailableMessage || 'This session is not available yet.');
      return undefined;
    }
    if (!recordId) {
      setError('The secure meeting details are missing.');
      return undefined;
    }

    const connect = async () => {
      try {
        setError('');
        await AudioSession.startAudioSession();
        const response = await getCredentials({variables: {recordId}});
        const next = response?.data?.getLiveKitRoomToken;
        if (!next?.serverUrl || !next?.token) {
          throw new Error('Unable to create a secure meeting connection.');
        }
        if (active) {
          setCredentials(next);
        }
      } catch (requestError: any) {
        if (active) {
          setError(
            requestError?.message || 'Unable to connect to the secure meeting.',
          );
        }
      }
    };

    connect();
    return () => {
      active = false;
      AudioSession.stopAudioSession().catch(() => undefined);
    };
  }, [canJoin, getCredentials, recordId, unavailableMessage]);

  if (error) {
    return (
      <View style={styles.errorPanel}>
        <Feather name="alert-circle" size={20} color={BookingColors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!credentials || loading) {
    return (
      <View
        style={roomProps.compact ? styles.compactLoading : styles.loadingPanel}>
        <ActivityIndicator color={BookingColors.primary} />
        <Text style={styles.loadingText}>Preparing secure meeting…</Text>
      </View>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={credentials.serverUrl}
      token={credentials.token}
      connect
      audio={false}
      video={false}
      options={{adaptiveStream: {pixelDensity: 'screen'}}}
      onError={connectionError => setError(connectionError.message)}>
      <RoomView {...roomProps} />
    </LiveKitRoom>
  );
}

const styles = StyleSheet.create({
  videoPanel: {flex: 1, backgroundColor: '#121826'},
  videoStage: {flex: 1, minHeight: 280, backgroundColor: '#1E293B'},
  video: {width: '100%', height: '100%'},
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  cameraOffPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  initialsAvatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  initialsText: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 34,
  },
  pipAvatar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  pipInitials: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
  },
  placeholderTitle: {
    marginTop: 14,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  placeholderCopy: {
    marginTop: 6,
    color: '#BBC4D4',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  statusPill: {
    position: 'absolute',
    left: 14,
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
  },
  statusDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: '#F59E0B'},
  statusDotConnected: {backgroundColor: '#22C55E'},
  statusText: {
    color: BookingColors.white,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  participantLabel: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    color: BookingColors.white,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
  },
  localPip: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 94,
    height: 126,
    overflow: 'hidden',
    borderColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#334155',
  },
  pipLabel: {
    position: 'absolute',
    bottom: 5,
    left: 6,
    color: BookingColors.white,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#121826',
  },
  compactControls: {paddingHorizontal: 0, paddingVertical: 0, gap: 4},
  control: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    minHeight: 44,
  },
  completeControl: {backgroundColor: BookingColors.primary, borderRadius: 8},
  compactCompleteControl: {
    minWidth: 38,
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: BookingColors.primary,
  },
  controlLabel: {
    marginTop: 4,
    color: BookingColors.white,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  compactBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#121826',
  },
  compactAvatar: {
    width: 36,
    height: 36,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#334155',
  },
  compactVideoTile: {
    width: 40,
    height: 40,
    marginHorizontal: 6,
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: '#334155',
  },
  compactAvatarInitials: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1},
  compactStatus: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  loadingPanel: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121826',
  },
  compactLoading: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#121826',
  },
  loadingText: {color: '#BBC4D4', fontFamily: 'Manrope-Regular', fontSize: 12},
  errorPanel: {
    minHeight: 74,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFF1F2',
  },
  errorText: {
    color: '#B42318',
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
});
