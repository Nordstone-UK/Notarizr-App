import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useMutation} from '@apollo/client';
import {useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import ProfileScreenHeader from '../../../components/Profile/ProfileScreenHeader';
import useCustomerSuport from '../../../hooks/useCustomerSupport';
import {
  getBookingClient,
  normalizeAgentBooking,
} from '../../../utils/agentBookingPresentation';
import {
  ACCEPT_ALLOCATION_REQUEST,
  REJECT_ALLOCATION_REQUEST,
} from '../../../../request/mutations/updateAllocationRequest.mutation';
import {UPDATE_BOOKING_STATUS} from '../../../../request/mutations/updateBookingStatus.mutation';
import {UPDATE_SESSION_STATUS} from '../../../../request/mutations/updateSessionStatus.mutation';

const STATUS_CONFIG = {
  pending: {background: '#FFF5DC', color: '#A86900', icon: 'clock'},
  to_be_paid: {background: '#FFF5DC', color: '#A86900', icon: 'credit-card'},
  paid: {background: '#EAF2FC', color: '#2571B9', icon: 'credit-card'},
  payment_confirmed: {
    background: '#EAF2FC',
    color: '#2571B9',
    icon: 'check-circle',
  },
  accepted: {background: '#EAF7EF', color: '#168A52', icon: 'check-circle'},
  travelling: {background: '#EAF4FB', color: '#2878A9', icon: 'navigation'},
  ongoing: {background: '#EAF4FB', color: '#2878A9', icon: 'activity'},
  completed: {background: '#EAF2FC', color: '#2571B9', icon: 'check-circle'},
  rejected: {background: '#FCEEEE', color: '#C44242', icon: 'x-circle'},
};

const formatStatus = value =>
  String(value || 'pending')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase());

function DetailRow({icon, label, value, last = false}) {
  return (
    <View style={[styles.detailRow, last && styles.lastDetailRow]}>
      <View style={styles.detailIcon}>
        <Feather name={icon} size={16} color="#D65322" />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function Section({children, title}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function AgentBookingOverviewScreen({navigation, route}) {
  const storedBooking = useSelector(state => state.booking.booking);
  const booking = route.params?.clientDetail || storedBooking;
  const normalized = useMemo(() => normalizeAgentBooking(booking), [booking]);
  const client = getBookingClient(booking);
  const initialStatus =
    booking?.agentResquesStatus || booking?.status || 'pending';
  const [status, setStatus] = useState(String(initialStatus).toLowerCase());
  const [activeAction, setActiveAction] = useState(null);
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS);
  const [updateSessionStatus] = useMutation(UPDATE_SESSION_STATUS);
  const [acceptAllocation] = useMutation(ACCEPT_ALLOCATION_REQUEST);
  const [rejectAllocation] = useMutation(REJECT_ALLOCATION_REQUEST);
  const {handleCallSupport} = useCustomerSuport();

  const isAllocation = booking?.__typename === 'Allocation';
  const isSession = booking?.__typename === 'Session';
  const pending = status === 'pending';
  const statusStyle = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const documentLabel = Array.isArray(booking?.document_type)
    ? booking.document_type
        .map(document => document.name)
        .filter(Boolean)
        .join(', ')
    : booking?.document_type?.name || 'Notary documents';
  const clientName = [client?.first_name, client?.last_name]
    .filter(Boolean)
    .join(' ');
  const price = Number(booking?.totalPrice ?? booking?.price ?? 0);

  const updateStatus = async nextStatus => {
    setActiveAction(nextStatus);
    try {
      if (isAllocation) {
        const {data} =
          nextStatus === 'rejected'
            ? await rejectAllocation({variables: {allocationId: booking._id}})
            : await acceptAllocation({variables: {allocationId: booking._id}});
        const response =
          data?.rejectAllocationRequest || data?.acceptAllocationRequest;
        if (response?.status !== 'success') {
          throw new Error(response?.message || 'Allocation update failed');
        }
        setStatus(nextStatus === 'rejected' ? 'rejected' : 'to_be_paid');
      } else if (isSession) {
        const {data} = await updateSessionStatus({
          variables: {sessionId: booking._id, status: nextStatus},
        });
        if (!data?.updateSessionStatus?.session) {
          throw new Error('Session update failed');
        }
        setStatus(nextStatus);
      } else {
        const {data} = await updateBookingStatus({
          variables: {bookingId: booking._id, status: nextStatus},
        });
        const updatedStatus = data?.updateBookingStatusR?.booking?.status;
        if (!updatedStatus) {
          throw new Error('Booking update failed');
        }
        setStatus(String(updatedStatus).toLowerCase());
      }

      Toast.show({
        type: nextStatus === 'rejected' ? 'info' : 'success',
        text1:
          nextStatus === 'rejected' ? 'Request declined' : 'Request accepted',
      });
      if (nextStatus === 'rejected') {
        navigation.goBack();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Booking not updated',
        text2: 'Please try again in a moment.',
      });
    } finally {
      setActiveAction(null);
    }
  };

  const openWorkspace = () =>
    navigation.navigate('AgentBookingWorkspace', {clientDetail: booking});

  const handlePrimary = () => {
    if (pending && isSession) {
      openWorkspace();
      return;
    }
    if (pending) {
      updateStatus('to_be_paid');
      return;
    }
    openWorkspace();
  };

  const primaryLabel = pending
    ? isSession
      ? 'Review request setup'
      : 'Accept request'
    : status === 'completed'
    ? 'View completed record'
    : 'Manage booking';

  if (!booking?._id) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ProfileScreenHeader
          onBack={() => navigation.goBack()}
          title="Booking details"
        />
        <View style={styles.missingState}>
          <Feather name="alert-circle" size={26} color="#C44242" />
          <Text style={styles.missingTitle}>Booking unavailable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ProfileScreenHeader
        actionLabel="Help"
        onAction={handleCallSupport}
        onBack={() => navigation.goBack()}
        title={isAllocation ? 'Allocation details' : 'Booking details'}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View style={styles.summaryTopRow}>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: statusStyle.background},
              ]}>
              <Feather
                name={statusStyle.icon}
                size={13}
                color={statusStyle.color}
              />
              <Text style={[styles.statusText, {color: statusStyle.color}]}>
                {formatStatus(status)}
              </Text>
            </View>
            <Text style={styles.reference}>
              #{String(booking._id).slice(-8).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.serviceTitle}>
            {normalized.service_type === 'mobile_notary'
              ? 'Mobile notary'
              : 'Remote online notary'}
          </Text>
          <Text style={styles.serviceText}>
            {normalized.displayDate} at {normalized.displayTime}
          </Text>
        </View>

        <Section title="Client">
          <View style={styles.clientRow}>
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {clientName
                  .split(' ')
                  .filter(Boolean)
                  .map(value => value[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'C'}
              </Text>
            </View>
            <View style={styles.clientCopy}>
              <Text style={styles.clientName}>
                {clientName || 'Notarizr client'}
              </Text>
              <Text style={styles.clientMeta}>
                {client?.phone_number ||
                  client?.email ||
                  'Contact through Notarizr'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('ChatScreen', {
                  sender: booking?.agent,
                  receiver: client,
                  chat: booking?._id,
                  channel: booking?.agora_channel_name,
                  voiceToken: booking?.agora_channel_token,
                })
              }
              style={styles.messageButton}>
              <Feather name="message-circle" size={19} color="#D65322" />
            </TouchableOpacity>
          </View>
        </Section>

        <Section title="Appointment">
          <DetailRow
            icon="calendar"
            label="Date"
            value={normalized.displayDate}
          />
          <DetailRow icon="clock" label="Time" value={normalized.displayTime} />
          <DetailRow
            icon={
              normalized.service_type === 'mobile_notary' ? 'map-pin' : 'video'
            }
            label={
              normalized.service_type === 'mobile_notary'
                ? 'Location'
                : 'Meeting'
            }
            last
            value={normalized.location}
          />
        </Section>

        <Section title="Request">
          <DetailRow icon="file-text" label="Documents" value={documentLabel} />
          <DetailRow
            icon="align-left"
            label="Instructions"
            value={booking?.notes || 'No additional instructions provided.'}
          />
          <DetailRow
            icon="dollar-sign"
            label="Estimated total"
            last
            value={
              price > 0 ? `$${price.toFixed(2)}` : 'Set in booking workspace'
            }
          />
        </Section>
      </ScrollView>

      <View style={styles.actionBar}>
        {pending && (
          <TouchableOpacity
            activeOpacity={0.75}
            disabled={Boolean(activeAction)}
            onPress={() => updateStatus('rejected')}
            style={styles.secondaryButton}>
            {activeAction === 'rejected' ? (
              <ActivityIndicator color="#C44242" size="small" />
            ) : (
              <Text style={styles.secondaryButtonText}>Decline</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={0.78}
          disabled={Boolean(activeAction)}
          onPress={handlePrimary}
          style={styles.primaryButton}>
          {activeAction && activeAction !== 'rejected' ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
              <Feather name="arrow-right" size={17} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  content: {paddingBottom: 24, backgroundColor: '#F7F8FA'},
  summary: {padding: 20, backgroundColor: '#FFFFFF'},
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderRadius: 7,
  },
  statusText: {marginLeft: 5, fontFamily: 'Manrope-Bold', fontSize: 10},
  reference: {color: '#9AA0A9', fontFamily: 'Manrope-SemiBold', fontSize: 9},
  serviceTitle: {
    marginTop: 16,
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 21,
  },
  serviceText: {
    marginTop: 4,
    color: '#7B838F',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  section: {marginTop: 18, paddingHorizontal: 20},
  sectionTitle: {
    marginBottom: 9,
    color: '#7F8792',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  sectionBody: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E3E6EA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  clientRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: '#FFF0E7',
  },
  avatarText: {color: '#D65322', fontFamily: 'Manrope-Bold', fontSize: 13},
  clientCopy: {flex: 1, minWidth: 0, marginLeft: 11},
  clientName: {color: '#242B36', fontFamily: 'Manrope-Bold', fontSize: 13},
  clientMeta: {
    marginTop: 3,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  messageButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F2D9CB',
    borderRadius: 8,
    backgroundColor: '#FFF7F2',
  },
  detailRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    paddingVertical: 11,
    paddingRight: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },
  lastDetailRow: {borderBottomWidth: 0},
  detailIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  detailCopy: {flex: 1, minWidth: 0, marginLeft: 11},
  detailLabel: {color: '#9197A1', fontFamily: 'Manrope-Regular', fontSize: 9},
  detailValue: {
    marginTop: 2,
    color: '#303642',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    lineHeight: 16,
  },
  actionBar: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: '#E7CACA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#C44242',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  primaryButton: {
    height: 52,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FD6D1F',
  },
  primaryButtonText: {
    marginRight: 8,
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  missingState: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  missingTitle: {
    marginTop: 12,
    color: '#242B36',
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
});
