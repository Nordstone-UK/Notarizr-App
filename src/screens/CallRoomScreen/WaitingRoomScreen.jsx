import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';
import {useMutation} from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {CREATE_CHAT} from '../../../request/mutations/createChat.mutation';
import {SAVE_MESSAGE} from '../../../request/mutations/chat.mutation';
import {ADD_OBSERVERS} from '../../../request/mutations/inviteObservers.mutation';
import {
  connectSocket,
  socketRequest,
  waitForSocketConnection,
} from '../../utils/Socket';
import {buildSessionInviteMedia} from '../../utils/sessionInvite';
import {getSessionAvailability} from '../../utils/sessionAvailability';
import {getObserverPhone} from '../../utils/observerPhone';
import RegisteredObserverPicker from '../../components/Observers/RegisteredObserverPicker';

const getInitials = participant => {
  const name = `${participant?.first_name || ''} ${
    participant?.last_name || ''
  }`.trim();
  if (!name) {
    return 'N';
  }
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(value => value[0])
    .join('')
    .toUpperCase();
};

const getParticipantName = participant =>
  `${participant?.first_name || ''} ${participant?.last_name || ''}`.trim() ||
  participant?.phone_number ||
  participant?.email ||
  'Session participant';

const participantKey = participant =>
  participant?._id || participant?.phone_number || participant?.email;

function Avatar({participant, size = 52}) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = participant?.profile_picture;

  if (image && !imageFailed) {
    return (
      <Image
        source={{uri: image}}
        onError={() => setImageFailed(true)}
        style={[styles.avatarImage, {height: size, width: size}]}
      />
    );
  }

  return (
    <View style={[styles.avatarFallback, {height: size, width: size}]}>
      <Text style={[styles.avatarInitials, {fontSize: size * 0.32}]}>
        {getInitials(participant)}
      </Text>
    </View>
  );
}

function ParticipantRow({participant, currentUserId}) {
  const isCurrentUser = participantKey(participant) === currentUserId;

  return (
    <View style={styles.participantRow}>
      <View style={styles.avatarWrap}>
        <Avatar participant={participant} />
        <View style={styles.onlineDot} />
      </View>
      <View style={styles.participantCopy}>
        <View style={styles.participantNameRow}>
          <Text numberOfLines={1} style={styles.participantName}>
            {getParticipantName(participant)}
          </Text>
          {isCurrentUser ? <Text style={styles.youBadge}>You</Text> : null}
        </View>
        <Text style={styles.participantRole}>{participant.role}</Text>
      </View>
      <View style={styles.readyBadge}>
        <Feather name="check" size={12} color="#168A52" />
        <Text style={styles.readyText}>Ready</Text>
      </View>
    </View>
  );
}

function DetailRow({icon, title, description}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Feather name={icon} size={18} color="#FD6D1F" />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={styles.detailDescription}>{description}</Text>
      </View>
      <Feather name="check-circle" size={18} color="#1A9B61" />
    </View>
  );
}

export default function WaitingRoomScreen({route, navigation}) {
  const {uid, channel, token, time, date} = route.params || {};
  const bookingDetail = useSelector(state => state.booking.booking);
  const user = useSelector(state => state.user.user);
  const [selectedTab, setSelectedTab] = useState('waiting');
  const [refreshing, setRefreshing] = useState(false);
  const [availabilityCheckedAt, setAvailabilityCheckedAt] = useState(
    Date.now(),
  );
  const [joining, setJoining] = useState(false);
  const [invitingObserver, setInvitingObserver] = useState(false);
  const [localObservers, setLocalObservers] = useState([]);
  const [createChat] = useMutation(CREATE_CHAT);
  const [saveMessage] = useMutation(SAVE_MESSAGE);
  const [inviteObservers] = useMutation(ADD_OBSERVERS);

  const scheduledDate =
    date || bookingDetail?.date_of_booking || bookingDetail?.date_time_session;
  const scheduledTime =
    time || bookingDetail?.time_of_booking || bookingDetail?.date_time_session;
  const sessionAvailability = useMemo(
    () =>
      getSessionAvailability({
        date: scheduledDate,
        time: scheduledTime,
        now: availabilityCheckedAt,
      }),
    [availabilityCheckedAt, scheduledDate, scheduledTime],
  );
  const sessionDate = sessionAvailability.sessionDate;
  const sessionStarted = sessionAvailability.canJoin;

  const refreshSessionStatus = useCallback(() => {
    setAvailabilityCheckedAt(Date.now());
  }, []);

  useEffect(() => {
    refreshSessionStatus();
  }, [refreshSessionStatus]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refreshSessionStatus();
    setTimeout(() => setRefreshing(false), 500);
  }, [refreshSessionStatus]);

  const isAgent = String(user?.account_type || '').includes('agent');
  const serviceType = String(
    bookingDetail?.service_type || bookingDetail?.service?.service_type || '',
  ).toLowerCase();
  const isRemoteSession =
    bookingDetail?.__typename === 'Session' ||
    ['ron', 'remote_online_notary'].includes(serviceType);
  const agent = bookingDetail?.agent || (isAgent ? user : null);
  const client =
    bookingDetail?.booked_by ||
    bookingDetail?.booked_for ||
    (!isAgent ? user : null);

  const participants = useMemo(() => {
    const observers = [
      ...(Array.isArray(bookingDetail?.observers)
        ? bookingDetail.observers
        : []),
      ...localObservers,
    ].map(observer =>
      typeof observer === 'string'
        ? {phone_number: observer, first_name: observer}
        : observer,
    );
    const values = [
      agent ? {...agent, role: 'Notary professional'} : null,
      client ? {...client, role: 'Primary signer'} : null,
      ...observers.map(observer => ({
        ...observer,
        role: 'Observer',
      })),
    ].filter(Boolean);

    const seen = new Set();
    return values.filter(participant => {
      const key = participantKey(participant);
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [agent, bookingDetail?.observers, client, localObservers]);

  const existingObserverPhones = useMemo(
    () =>
      [
        ...(Array.isArray(bookingDetail?.observers)
          ? bookingDetail.observers
          : []),
        ...localObservers,
      ]
        .map(getObserverPhone)
        .filter(Boolean),
    [bookingDetail?.observers, localObservers],
  );

  const sessionLabel = sessionDate?.isValid()
    ? sessionDate.format('ddd, MMM D [at] h:mm A')
    : 'Secure notary appointment';

  const sendObserverInvitation = async observerUser => {
    const recipientId = String(observerUser?._id || '');
    if (!recipientId) {
      return false;
    }

    const result = await createChat({variables: {userId: recipientId}});
    const chatId = String(result?.data?.createChat?.chatID || '');
    if (!chatId) {
      return false;
    }

    const sessionMedia = buildSessionInviteMedia({
      bookingId: bookingDetail?._id || uid,
      channel: channel || bookingDetail?.agora_channel_name || '',
      token: token || bookingDetail?.agora_channel_token || '',
      date: scheduledDate,
      time: scheduledTime,
      joinedBy: String(user?._id || ''),
    });

    await saveMessage({
      variables: {
        chatId,
        receiverId: recipientId,
        text: `You were invited as an observer to a secure notary session on ${sessionLabel}. Open this invitation to view the meeting and join when it opens.`,
        mediaUrl: sessionMedia,
      },
    });
    return true;
  };

  const addObserver = async observerUser => {
    const phone = getObserverPhone(observerUser);
    if (!phone) {
      return;
    }
    if (existingObserverPhones.includes(phone)) {
      Toast.show({type: 'info', text1: 'Observer already invited'});
      return;
    }
    if (existingObserverPhones.length >= 5) {
      Toast.show({type: 'info', text1: 'Only 5 observers are allowed'});
      return;
    }

    const bookingId = String(bookingDetail?._id || uid || '');
    if (!bookingId) {
      Toast.show({type: 'error', text1: 'Booking is unavailable'});
      return;
    }

    setInvitingObserver(true);
    try {
      const response = await inviteObservers({
        variables: {bookingId, observers: [phone]},
      });
      const result = response?.data?.inviteObservers;
      const status = String(result?.status || '').toLowerCase();
      if (status && !['200', '201', 'success'].includes(status)) {
        throw new Error(result?.message || 'The invitation could not be sent.');
      }
      setLocalObservers(current => [
        ...current,
        {...observerUser, phone_number: phone},
      ]);

      let messageSent = false;
      try {
        messageSent = await sendObserverInvitation(observerUser);
      } catch (_) {
        messageSent = false;
      }

      Toast.show({
        type: 'success',
        text1: 'Observer invited',
        text2: messageSent
          ? 'The invitation is available in their messages.'
          : `${phone} was added to the session.`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Observer not invited',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setInvitingObserver(false);
    }
  };
  const currentUserId = participantKey(user);

  const joinSession = async () => {
    if (joining || !sessionAvailability.canJoin) {
      if (!sessionAvailability.canJoin) {
        Toast.show({
          type: 'info',
          text1: sessionAvailability.title,
          text2: sessionAvailability.message,
        });
      }
      return;
    }

    setJoining(true);
    const recipient = isAgent ? client : agent;
    const recipientId = String(
      typeof recipient === 'string' ? recipient : recipient?._id || '',
    );
    const messageText = isAgent
      ? 'Your notary has joined the secure session and is ready for you.'
      : 'I am joining our secure notary session now.';
    const sessionMedia = buildSessionInviteMedia({
      bookingId: bookingDetail?._id || uid,
      channel,
      token,
      date,
      time,
      joinedBy: String(user?._id || ''),
    });

    try {
      if (recipientId) {
        const result = await createChat({variables: {userId: recipientId}});
        const chatId = String(result?.data?.createChat?.chatID || '');

        if (chatId) {
          const accessToken = await AsyncStorage.getItem('token');
          let deliveredRealtime = false;

          if (accessToken) {
            try {
              connectSocket(accessToken);
              await waitForSocketConnection(5000);
              await socketRequest('chat:join', {chatId}, 5000);
              await socketRequest(
                'chat:send',
                {
                  chatId,
                  receiverId: recipientId,
                  text: messageText,
                  mediaUrl: sessionMedia,
                  tempId: `session-${Date.now()}`,
                },
                6000,
              );
              deliveredRealtime = true;
            } catch (_) {
              deliveredRealtime = false;
            }
          }

          if (!deliveredRealtime) {
            await saveMessage({
              variables: {
                chatId,
                receiverId: recipientId,
                text: messageText,
                mediaUrl: sessionMedia,
              },
            });
          }
        }
      }
    } catch (error) {
      Toast.show({
        type: 'info',
        text1: 'Opening the session',
        text2: 'The participant notification could not be sent.',
      });
    } finally {
      setJoining(false);
      // Identity verification (for clients) already happened before reaching
      // the waiting room, so both roles go straight into the call from here.
      navigation.navigate('NotaryCallScreen', {
        uid,
        channel,
        token,
        date: scheduledDate,
        time: scheduledTime,
        routeFrom: isAgent ? 'agent' : 'client',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <Feather name="arrow-left" size={22} color="#171D29" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Notary session</Text>
          <Text numberOfLines={1} style={styles.headerSubtitle}>
            {sessionLabel}
          </Text>
        </View>
        <View style={styles.secureBadge}>
          <Feather name="shield" size={14} color="#168A52" />
          <Text style={styles.secureText}>Secure</Text>
        </View>
      </View>

      <View style={styles.tabsWrap}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setSelectedTab('waiting')}
          style={[styles.tab, selectedTab === 'waiting' && styles.tabSelected]}>
          <Feather
            name="clock"
            size={16}
            color={selectedTab === 'waiting' ? '#FD6D1F' : '#7D8592'}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'waiting' && styles.tabTextSelected,
            ]}>
            Waiting room
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setSelectedTab('participants')}
          style={[
            styles.tab,
            selectedTab === 'participants' && styles.tabSelected,
          ]}>
          <Feather
            name="users"
            size={16}
            color={selectedTab === 'participants' ? '#FD6D1F' : '#7D8592'}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'participants' && styles.tabTextSelected,
            ]}>
            Participants
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{participants.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        {selectedTab === 'waiting' ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View
                  style={[
                    styles.statusBadge,
                    !sessionStarted && styles.statusBadgeScheduled,
                  ]}>
                  <View
                    style={[
                      styles.statusDot,
                      !sessionStarted && styles.statusDotScheduled,
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      !sessionStarted && styles.statusTextScheduled,
                    ]}>
                    {sessionStarted ? 'Session live' : 'Scheduled'}
                  </Text>
                </View>
                <View style={styles.heroIcon}>
                  <Feather
                    name={sessionStarted ? 'video' : 'calendar'}
                    size={22}
                    color="#FD6D1F"
                  />
                </View>
              </View>
              <Text style={styles.heroTitle}>
                {sessionStarted
                  ? 'Your notary room is ready'
                  : 'Your session is booked'}
              </Text>
              <Text style={styles.heroDescription}>
                {sessionStarted
                  ? 'Join when you are ready. Your identity and documents stay protected throughout the call.'
                  : `Return on ${sessionLabel}. The room will become available when the appointment begins.`}
              </Text>
            </View>

            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.sectionTitle}>Before you join</Text>
                <Text style={styles.sectionSubtitle}>
                  Everything needed for the appointment.
                </Text>
              </View>
              <Text style={styles.readyCount}>3 of 3 ready</Text>
            </View>

            <View style={styles.detailsCard}>
              <DetailRow
                icon="user-check"
                title="Identity ready"
                description="Keep your original photo ID nearby."
              />
              <View style={styles.divider} />
              <DetailRow
                icon="file-text"
                title="Documents ready"
                description="Have unsigned originals available."
              />
              <View style={styles.divider} />
              <DetailRow
                icon="wifi"
                title="Device ready"
                description="Use a stable connection and quiet room."
              />
            </View>

            {agent ? (
              <View style={styles.hostCard}>
                <Avatar participant={agent} size={48} />
                <View style={styles.hostCopy}>
                  <Text style={styles.hostLabel}>YOUR NOTARY</Text>
                  <Text numberOfLines={1} style={styles.hostName}>
                    {getParticipantName(agent)}
                  </Text>
                </View>
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineBadgeDot} />
                  <Text style={styles.onlineBadgeText}>Online</Text>
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.participantsHeading}>
              <Text style={styles.sectionTitle}>Session participants</Text>
              <Text style={styles.sectionSubtitle}>
                People invited to this secure appointment.
              </Text>
            </View>
            <View style={styles.participantsCard}>
              {participants.length ? (
                participants.map((participant, index) => (
                  <React.Fragment key={participantKey(participant)}>
                    <ParticipantRow
                      participant={participant}
                      currentUserId={currentUserId}
                    />
                    {index < participants.length - 1 ? (
                      <View style={styles.participantDivider} />
                    ) : null}
                  </React.Fragment>
                ))
              ) : (
                <View style={styles.emptyParticipants}>
                  <Feather name="users" size={24} color="#9AA1AC" />
                  <Text style={styles.emptyParticipantsText}>
                    Participant details are not available yet.
                  </Text>
                </View>
              )}
            </View>
            {!isAgent && isRemoteSession ? (
              <View style={styles.observerCard}>
                <View style={styles.observerHeading}>
                  <View style={styles.observerIcon}>
                    <Feather name="user-plus" size={18} color="#FD6D1F" />
                  </View>
                  <View style={styles.observerCopy}>
                    <Text style={styles.observerTitle}>Add an observer</Text>
                    <Text style={styles.observerDescription}>
                      Invite someone to attend this remote notary session.
                    </Text>
                  </View>
                </View>
                <View style={styles.observerSearchWrap}>
                  <RegisteredObserverPicker
                    disabled={
                      invitingObserver || existingObserverPhones.length >= 5
                    }
                    excludedPhones={existingObserverPhones}
                    excludedUserIds={[
                      user?._id,
                      typeof agent === 'string' ? agent : agent?._id,
                      typeof client === 'string' ? client : client?._id,
                    ]}
                    onSelect={addObserver}
                  />
                </View>
                <Text style={styles.observerLimit}>
                  {existingObserverPhones.length} of 5 observers invited
                </Text>
              </View>
            ) : null}
            <View style={styles.securityNote}>
              <Feather name="lock" size={16} color="#168A52" />
              <Text style={styles.securityNoteText}>
                Only invited participants can enter this session.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {selectedTab === 'waiting' ? (
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!sessionStarted || joining}
            onPress={joinSession}
            style={[
              styles.joinButton,
              (!sessionStarted || joining) && styles.joinButtonDisabled,
            ]}>
            {joining ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="video" size={19} color="#FFFFFF" />
                <Text style={styles.joinButtonText}>
                  {sessionStarted
                    ? 'Join secure session'
                    : sessionAvailability.actionLabel}
                </Text>
                <Feather name="arrow-right" size={19} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: '#FFF0E7',
    borderRadius: 999,
    justifyContent: 'center',
  },
  avatarImage: {borderRadius: 999},
  avatarInitials: {
    color: '#D95118',
    fontFamily: 'Manrope-Bold',
  },
  avatarWrap: {position: 'relative'},
  container: {backgroundColor: '#F6F7F9', flex: 1},
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#E8EAEE',
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    marginLeft: 7,
    minWidth: 18,
    paddingHorizontal: 4,
  },
  countText: {
    color: '#68707D',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  detailCopy: {flex: 1, marginHorizontal: 12},
  detailDescription: {
    color: '#8A919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    marginTop: 3,
  },
  detailIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF0E7',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  detailRow: {alignItems: 'center', flexDirection: 'row', padding: 16},
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E4E8',
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 20,
  },
  detailTitle: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  divider: {backgroundColor: '#ECEEF1', height: 1, marginLeft: 66},
  emptyParticipants: {alignItems: 'center', padding: 36},
  emptyParticipantsText: {
    color: '#8A919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E8EAEE',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderColor: '#E2E5E9',
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerCopy: {flex: 1, marginHorizontal: 13, minWidth: 0},
  headerSubtitle: {
    color: '#8A919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  headerTitle: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 19,
  },
  heroCard: {
    backgroundColor: '#131927',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
  },
  heroDescription: {
    color: '#AEB5C2',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF0E7',
    borderRadius: 9,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
    marginTop: 24,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hostCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E4E8',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    margin: 20,
    padding: 14,
  },
  hostCopy: {flex: 1, marginLeft: 12},
  hostLabel: {
    color: '#979EAA',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  hostName: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    marginTop: 3,
  },
  joinButton: {
    alignItems: 'center',
    backgroundColor: '#FD6D1F',
    borderRadius: 9,
    flexDirection: 'row',
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  joinButtonDisabled: {backgroundColor: '#C9CDD3'},
  joinButtonText: {
    color: '#FFFFFF',
    flex: 1,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    marginHorizontal: 12,
    textAlign: 'center',
  },
  onlineBadge: {
    alignItems: 'center',
    backgroundColor: '#EAF7EF',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  onlineBadgeDot: {
    backgroundColor: '#1A9B61',
    borderRadius: 3,
    height: 6,
    marginRight: 5,
    width: 6,
  },
  onlineBadgeText: {
    color: '#168A52',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  onlineDot: {
    backgroundColor: '#1A9B61',
    borderColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 2,
    bottom: 0,
    height: 12,
    position: 'absolute',
    right: 0,
    width: 12,
  },
  observerCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E4E8',
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
  },
  observerCopy: {flex: 1, marginLeft: 12},
  observerDescription: {
    color: '#8A919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  observerHeading: {alignItems: 'center', flexDirection: 'row'},
  observerIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF0E7',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  observerSearchWrap: {marginTop: 15},
  observerLimit: {
    color: '#8A919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    marginTop: 9,
  },
  observerTitle: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  participantCopy: {flex: 1, marginHorizontal: 12, minWidth: 0},
  participantDivider: {
    backgroundColor: '#ECEEF1',
    height: 1,
    marginLeft: 82,
  },
  participantName: {
    color: '#171D29',
    flexShrink: 1,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  participantNameRow: {alignItems: 'center', flexDirection: 'row'},
  participantRole: {
    color: '#8A919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    marginTop: 3,
  },
  participantRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 82,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  participantsCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E4E8',
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 20,
  },
  participantsHeading: {margin: 20},
  readyBadge: {
    alignItems: 'center',
    backgroundColor: '#EAF7EF',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  readyCount: {
    color: '#168A52',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  readyText: {
    color: '#168A52',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    marginLeft: 4,
  },
  scrollContent: {flexGrow: 1, paddingBottom: 12},
  sectionHeadingRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionSubtitle: {
    color: '#8A919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  secureBadge: {
    alignItems: 'center',
    backgroundColor: '#EAF7EF',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  secureText: {
    color: '#168A52',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    marginLeft: 5,
  },
  securityNote: {
    alignItems: 'center',
    backgroundColor: '#EAF7EF',
    borderRadius: 9,
    flexDirection: 'row',
    margin: 20,
    padding: 14,
  },
  securityNoteText: {
    color: '#34735A',
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
  },
  statusBadge: {
    alignItems: 'center',
    backgroundColor: '#EAF7EF',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusBadgeScheduled: {backgroundColor: '#FFF4D9'},
  statusDot: {
    backgroundColor: '#1A9B61',
    borderRadius: 4,
    height: 8,
    marginRight: 7,
    width: 8,
  },
  statusDotScheduled: {backgroundColor: '#B77900'},
  statusText: {
    color: '#168A52',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  statusTextScheduled: {color: '#A56A00'},
  tab: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    height: 42,
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E5E9',
    borderWidth: 1,
  },
  tabsWrap: {
    backgroundColor: '#EEF0F3',
    borderRadius: 10,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 14,
    padding: 4,
  },
  tabText: {
    color: '#7D8592',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    marginLeft: 7,
  },
  tabTextSelected: {color: '#FD6D1F'},
  youBadge: {
    backgroundColor: '#F0F2F5',
    borderRadius: 6,
    color: '#68707D',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    marginLeft: 7,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
});
