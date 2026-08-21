import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  Linking,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import {useMutation} from '@apollo/client';
import {useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import ProfileScreenHeader from '../../../components/Profile/ProfileScreenHeader';
import BookingActionButton from '../../../components/Bookings/BookingActionButton';
import AvailabilitySchedule from '../../../components/Bookings/AvailabilitySchedule';
import useCustomerSuport from '../../../hooks/useCustomerSupport';
import BookingColors from '../../../themes/BookingColors';
import {
  getBookingClient,
  normalizeAgentBooking,
} from '../../../utils/agentBookingPresentation';
import {getSessionAvailability} from '../../../utils/sessionAvailability';
import {
  ACCEPT_ALLOCATION_REQUEST,
  REJECT_ALLOCATION_REQUEST,
} from '../../../../request/mutations/updateAllocationRequest.mutation';
import {UPDATE_BOOKING_STATUS} from '../../../../request/mutations/updateBookingStatus.mutation';
import {UPDATE_SESSION_STATUS} from '../../../../request/mutations/updateSessionStatus.mutation';
import ReactNativeBlobUtil from 'react-native-blob-util';

const STATUS_CONFIG = {
  pending: {
    background: BookingColors.warningSoft,
    color: BookingColors.warning,
    icon: 'clock',
  },
  to_be_paid: {
    background: BookingColors.warningSoft,
    color: BookingColors.warning,
    icon: 'credit-card',
  },
  paid: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'credit-card',
  },
  payment_confirmed: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'check-circle',
  },
  accepted: {
    background: BookingColors.successSoft,
    color: BookingColors.success,
    icon: 'check-circle',
  },
  travelling: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'navigation',
  },
  ongoing: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'activity',
  },
  completed: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'check-circle',
  },
  rejected: {
    background: BookingColors.errorSoft,
    color: BookingColors.error,
    icon: 'x-circle',
  },
};

const formatStatus = value =>
  String(value || 'pending')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase());

function DetailRow({
  icon,
  label,
  value,
  last = false,
  onPress,
  rightIcon,
  rightLoading,
}) {
  const content = (
    <>
      <View style={styles.detailIcon}>
        <Feather name={icon} size={16} color={BookingColors.primary} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
      {onPress ? (
        rightLoading ? (
          <ActivityIndicator size="small" color={BookingColors.primary} />
        ) : (
          <Feather
            name={rightIcon || 'chevron-right'}
            size={18}
            color={rightIcon ? BookingColors.primary : BookingColors.textMuted}
          />
        )
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.detailRow, last && styles.lastDetailRow]}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.detailRow, last && styles.lastDetailRow]}>
      {content}
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

const SIGNATURE_RATE = 2;
const PRINT_RATE = 1;

function PricingBreakdown({booking, price}) {
  const [expanded, setExpanded] = useState(false);

  const docTypes = Array.isArray(booking?.document_type)
    ? booking.document_type
    : booking?.document_type
    ? [booking.document_type]
    : [];

  const signatures = Array.isArray(booking?.signatures)
    ? booking.signatures
    : [];

  const isMobile =
    (booking?.service_type || booking?.service?.service_type) ===
    'mobile_notary';

  if (price <= 0) {
    return (
      <DetailRow
        icon="dollar-sign"
        label="Estimated total"
        last
        value="Set in booking workspace"
      />
    );
  }

  const documentFee = docTypes.reduce(
    (sum, doc) => sum + Number(doc.price || 0),
    0,
  );
  const signatureFee = signatures.length * SIGNATURE_RATE;
  const printingFee = isMobile ? docTypes.length * PRINT_RATE : 0;
  const computedSum = documentFee + signatureFee + printingFee;
  const serviceFee = Math.max(0, price - computedSum);

  const lineItems = [
    ...docTypes
      .filter(doc => Number(doc.price || 0) > 0)
      .map(doc => ({
        icon: 'file-text',
        label: doc.name || 'Document',
        sublabel: 'Notarization fee',
        amount: Number(doc.price),
      })),
    signatures.length > 0 && {
      icon: 'edit-3',
      label: 'Signatures',
      sublabel: `${signatures.length} signer${
        signatures.length !== 1 ? 's' : ''
      } × $${SIGNATURE_RATE.toFixed(2)}`,
      amount: signatureFee,
    },
    isMobile &&
      docTypes.length > 0 && {
        icon: 'printer',
        label: 'Printing',
        sublabel: `${docTypes.length} document${
          docTypes.length !== 1 ? 's' : ''
        }  × $${PRINT_RATE.toFixed(2)}`,
        amount: printingFee,
      },
    serviceFee > 0 && {
      icon: 'briefcase',
      label: 'Notary service fee',
      sublabel: isMobile ? 'Includes travel' : 'Remote session',
      amount: serviceFee,
    },
  ].filter(Boolean);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  };

  console.log(booking, 'booking');

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggle}
        style={[styles.detailRow, !expanded && styles.lastDetailRow]}>
        <View style={styles.detailIcon}>
          <Feather name="dollar-sign" size={16} color={BookingColors.primary} />
        </View>
        <View style={styles.detailCopy}>
          <Text style={styles.detailLabel}>Estimated total</Text>
          <Text style={styles.detailValue}>${price.toFixed(2)}</Text>
        </View>
        <View style={styles.breakdownToggle}>
          <Text style={styles.breakdownToggleLabel}>
            {expanded ? 'Hide' : 'Details'}
          </Text>
          <Feather
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={13}
            color={BookingColors.primary}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.breakdownPanel}>
          <Text style={styles.breakdownHeading}>Cost breakdown</Text>
          {lineItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.breakdownRow,
                index < lineItems.length - 1 && styles.breakdownRowBorder,
              ]}>
              <View style={styles.breakdownIconWrap}>
                <Feather
                  name={item.icon}
                  size={12}
                  color={BookingColors.textSecondary}
                />
              </View>
              <View style={styles.breakdownCopy}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                {item.sublabel ? (
                  <Text style={styles.breakdownSublabel}>{item.sublabel}</Text>
                ) : null}
              </View>
              <Text style={styles.breakdownAmount}>
                ${item.amount.toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.breakdownTotalRow}>
            <Text style={styles.breakdownTotalLabel}>Estimated total</Text>
            <Text style={styles.breakdownTotalAmount}>${price.toFixed(2)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function DocumentDownloadRow({url, index, isLast, downloading, onDownload}) {
  const rawName = String(url).split('/').pop().split('?')[0];
  const fileName = decodeURIComponent(rawName) || `Document ${index + 1}`;
  return (
    <View style={[styles.docRow, isLast && styles.lastDetailRow]}>
      <View style={styles.detailIcon}>
        <Feather name="file-text" size={16} color={BookingColors.primary} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>Document {index + 1}</Text>
        <Text style={styles.detailValue} numberOfLines={1}>
          {fileName}
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={downloading}
        onPress={() => onDownload(url, fileName)}
        style={styles.downloadBtn}>
        {downloading ? (
          <ActivityIndicator size="small" color={BookingColors.primary} />
        ) : (
          <Feather name="download" size={17} color={BookingColors.primary} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const requestStoragePermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }
  try {
    const permissions =
      Platform.Version >= 33
        ? [
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          ]
        : [PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE];

    const granted = await PermissionsAndroid.requestMultiple(permissions);
    return permissions.every(
      p => granted[p] === PermissionsAndroid.RESULTS.GRANTED,
    );
  } catch {
    return false;
  }
};

export default function AgentBookingOverviewScreen({navigation, route}) {
  const storedBooking = useSelector(state => state.booking.booking);
  const authenticatedAgent = useSelector(state => state.user.user);
  const booking = route.params?.clientDetail || storedBooking;

  const normalized = useMemo(() => normalizeAgentBooking(booking), [booking]);
  const client = getBookingClient(booking);
  const initialStatus =
    booking?.agentResquesStatus || booking?.status || 'pending';
  const [status, setStatus] = useState(String(initialStatus).toLowerCase());
  const [activeAction, setActiveAction] = useState(null);
  const [downloadingDocs, setDownloadingDocs] = useState({});
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS);
  const [updateSessionStatus] = useMutation(UPDATE_SESSION_STATUS);
  const [acceptAllocation] = useMutation(ACCEPT_ALLOCATION_REQUEST);
  const [rejectAllocation] = useMutation(REJECT_ALLOCATION_REQUEST);
  const {handleCallSupport} = useCustomerSuport();

  const isAllocation = booking?.__typename === 'Allocation';
  const isSession = booking?.__typename === 'Session';
  const pending = status === 'pending';
  const isRemoteBooking = normalized.service_type === 'remote_online_notary';
  const canJoinRemoteSession =
    isRemoteBooking &&
    ['accepted', 'paid', 'payment_confirmed', 'ongoing'].includes(status);
  const sessionAvailability = useMemo(
    () =>
      getSessionAvailability({
        date: booking?.date_of_booking,
        time: booking?.time_of_booking,
      }),
    [booking?.date_of_booking, booking?.time_of_booking],
  );
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

  const hasPrintFee = useMemo(() => {
    const docTypes = Array.isArray(booking?.document_type)
      ? booking.document_type
      : booking?.document_type
      ? [booking.document_type]
      : [];
    const isMobile =
      (booking?.service_type || booking?.service?.service_type) ===
      'mobile_notary';
    return isMobile && docTypes.length > 0;
  }, [
    booking?.document_type,
    booking?.service_type,
    booking?.service?.service_type,
  ]);

  const allDocumentUrls = useMemo(() => {
    // `documents`/`proof_documents` are untyped JSON on the backend, so
    // they've shown up in the wild as a plain array of URL strings, an
    // array of `{id, name, url}` upload objects (what the current booking
    // flow actually saves), and a `{key: url}` map from older code paths.
    // Normalize all three rather than assuming one shape.
    const toEntries = value => {
      if (Array.isArray(value)) {
        return value;
      }
      if (value && typeof value === 'object') {
        return Object.values(value);
      }
      return [];
    };
    const toUrl = item => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object') {
        return item.url || item.value || item.link || '';
      }
      return '';
    };
    return [
      ...toEntries(booking?.documents),
      ...toEntries(booking?.proof_documents),
    ]
      .map(toUrl)
      .filter(url => typeof url === 'string' && url.startsWith('http'));
  }, [booking?.documents, booking?.proof_documents]);

  const isDownloadingDocs = allDocumentUrls.some(u => downloadingDocs[u]);

  const downloadDocument = async (url, fileName) => {
    setDownloadingDocs(prev => ({...prev, [url]: true}));
    Toast.show({
      type: 'info',
      text1: 'Download starting',
      text2: fileName,
    });
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Toast.show({
          type: 'error',
          text1: 'Permission denied',
          text2: 'Storage permission is required to save files.',
        });
        return;
      }
      const dirs = ReactNativeBlobUtil.fs.dirs;
      const destDir =
        Platform.OS === 'android' ? dirs.DownloadDir : dirs.DocumentDir;
      const destPath = `${destDir}/${fileName}`;
      const result = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: destPath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'Notarizr document',
          mime: 'application/pdf',
          mediaScannable: true,
        },
      }).fetch('GET', url);
      if (result.info().status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Download complete',
          text2: `${fileName} saved to your device.`,
        });
      } else {
        throw new Error(`Status ${result.info().status}`);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Download failed',
        text2: 'Please check your connection and try again.',
      });
    } finally {
      setDownloadingDocs(prev => ({...prev, [url]: false}));
    }
  };

  const downloadAllDocuments = async () => {
    if (allDocumentUrls.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No files attached',
        text2: 'No downloadable documents are attached to this booking yet.',
      });
      return;
    }
    for (const url of allDocumentUrls) {
      const rawName = String(url).split('/').pop().split('?')[0];
      const fileName = decodeURIComponent(rawName) || 'document.pdf';
      await downloadDocument(url, fileName);
    }
  };

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
      console.log(error, 'error');
      Toast.show({
        type: 'error',
        text1: 'Booking not updated',
        text2: 'Please try again in a moment.',
      });
    } finally {
      setActiveAction(null);
    }
  };

  console.log(booking, 'booking');
  console.log(client, 'client');

  const openWorkspace = () =>
    navigation.navigate('AgentBookingWorkspace', {clientDetail: booking});

  const openRemoteSession = () =>
    navigation.navigate('WaitingRoomScreen', {
      uid: booking?._id,
      channel: booking?.agora_channel_name,
      token: booking?.agora_channel_token,
      time: booking?.time_of_booking,
      date: booking?.date_of_booking,
    });

  const handlePrimary = () => {
    if (canJoinRemoteSession) {
      if (!sessionAvailability.canJoin) {
        Toast.show({
          type: 'info',
          text1: 'Session not open yet',
          text2: sessionAvailability.message,
        });
        return;
      }
      openRemoteSession();
      return;
    }
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
    : canJoinRemoteSession
    ? sessionAvailability.canJoin
      ? 'Join session'
      : `Join on ${
          sessionAvailability.sessionDate?.format('MMM D') || 'appointment day'
        }`
    : status === 'completed'
    ? 'View completed record'
    : 'Manage booking';
  const progressIndex = [
    'pending',
    'to_be_paid',
    'paid',
    'payment_confirmed',
    'accepted',
    'travelling',
    'ongoing',
    'completed',
  ].indexOf(status);

  if (!booking?._id) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ProfileScreenHeader
          onBack={() => navigation.goBack()}
          title="Booking details"
        />
        <View style={styles.missingState}>
          <Feather name="alert-circle" size={26} color={BookingColors.error} />
          <Text style={styles.missingTitle}>Booking unavailable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
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
          <View style={styles.progressTrack}>
            {['Request', 'Payment', 'Service', 'Complete'].map(
              (label, index) => {
                const active = progressIndex >= index * 2;
                return (
                  <View key={label} style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressDot,
                        active && styles.activeProgressDot,
                      ]}>
                      {active && (
                        <Feather
                          name="check"
                          size={10}
                          color={BookingColors.white}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.progressLabel,
                        active && styles.activeProgressLabel,
                      ]}>
                      {label}
                    </Text>
                    {index < 3 && (
                      <View
                        style={[
                          styles.progressLine,
                          progressIndex >= (index + 1) * 2 &&
                            styles.activeProgressLine,
                        ]}
                      />
                    )}
                  </View>
                );
              },
            )}
          </View>
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
            <View style={styles.clientActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('ChatScreen', {
                    sender: authenticatedAgent || booking?.agent,
                    receiver: client,
                    chat: booking?._id,
                    channel: booking?.agora_channel_name,
                    voiceToken: booking?.agora_channel_token,
                  })
                }
                style={styles.messageButton}>
                <Feather
                  name="message-circle"
                  size={19}
                  color={BookingColors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={async () => {
                  if (booking?.agora_channel_name) {
                    navigation.navigate('VoiceCallScreen', {
                      sender: authenticatedAgent || booking?.agent,
                      receiver: client,
                      channelName: booking?.agora_channel_name,
                      token: booking?.agora_channel_token,
                    });
                    return;
                  }
                  const phone = client?.phone_number;
                  if (phone) {
                    const url = `tel:${phone}`;
                    try {
                      const canOpen = await Linking.canOpenURL(url);
                      if (!canOpen) {
                        throw new Error('Cannot open phone dialer');
                      }
                      await Linking.openURL(url);
                    } catch {
                      Toast.show({
                        type: 'error',
                        text1: 'Unable to open dialer',
                        text2: 'Please try again or use a different device.',
                      });
                    }
                    return;
                  }
                  Toast.show({
                    type: 'info',
                    text1: 'No contact method available',
                    text2: 'This client has no phone number on file.',
                  });
                }}
                style={styles.callButton}>
                <Feather name="phone" size={19} color={BookingColors.success} />
              </TouchableOpacity>
            </View>
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
            onPress={
              normalized.service_type === 'mobile_notary'
                ? () =>
                    navigation.navigate('BookingLocationPreviewScreen', {
                      address: normalized.location,
                    })
                : undefined
            }
          />
        </Section>

        {/* <AvailabilitySchedule
          schedule={booking?.service?.availability?.schedule}
        /> */}

        <Section title="Notary Request">
          <DetailRow
            icon="file-text"
            label="Documents"
            value={documentLabel}
            onPress={
              hasPrintFee
                ? isDownloadingDocs
                  ? undefined
                  : downloadAllDocuments
                : undefined
            }
            rightIcon={hasPrintFee ? 'download' : undefined}
            rightLoading={hasPrintFee && isDownloadingDocs}
          />
          <DetailRow
            icon="align-left"
            label="Instructions"
            value={booking?.notes || 'No additional instructions provided.'}
          />
          <PricingBreakdown booking={booking} price={price} />
        </Section>
      </ScrollView>

      <View style={styles.actionBar}>
        {pending && (
          <BookingActionButton
            disabled={Boolean(activeAction)}
            label="Decline"
            loading={activeAction === 'rejected'}
            onPress={() => updateStatus('rejected')}
            style={styles.secondaryButton}
            variant="danger"
          />
        )}
        <BookingActionButton
          disabled={Boolean(activeAction)}
          icon="arrow-right"
          label={primaryLabel}
          loading={Boolean(activeAction && activeAction !== 'rejected')}
          onPress={handlePrimary}
          style={styles.primaryButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  content: {paddingBottom: 24, backgroundColor: BookingColors.background},
  summary: {
    margin: 16,
    padding: 20,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: BookingColors.textPrimary,
  },
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
  reference: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
  },
  serviceTitle: {
    marginTop: 16,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 21,
  },
  serviceText: {
    marginTop: 4,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  progressTrack: {
    flexDirection: 'row',
    marginTop: 22,
  },
  progressStep: {
    flex: 1,
    position: 'relative',
    alignItems: 'flex-start',
  },
  progressDot: {
    width: 20,
    height: 20,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BookingColors.textSecondary,
    borderRadius: 10,
    backgroundColor: BookingColors.textPrimary,
  },
  activeProgressDot: {
    borderColor: BookingColors.primary,
    backgroundColor: BookingColors.primary,
  },
  progressLine: {
    position: 'absolute',
    top: 9,
    left: 20,
    right: 0,
    height: 2,
    backgroundColor: BookingColors.textSecondary,
  },
  activeProgressLine: {
    backgroundColor: BookingColors.primary,
  },
  progressLabel: {
    marginTop: 6,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
  },
  activeProgressLabel: {
    color: BookingColors.white,
    fontFamily: 'Manrope-SemiBold',
  },
  section: {marginTop: 18, paddingHorizontal: 20},
  sectionTitle: {
    marginBottom: 9,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  sectionBody: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
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
    backgroundColor: BookingColors.primarySoft,
  },
  avatarText: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  clientCopy: {flex: 1, minWidth: 0, marginLeft: 11},
  clientName: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  clientMeta: {
    marginTop: 3,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  clientActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  callButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.successSoft,
    borderRadius: 8,
    backgroundColor: BookingColors.successSoft,
  },
  detailRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    paddingVertical: 11,
    paddingRight: 14,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  lastDetailRow: {borderBottomWidth: 0},
  docRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    paddingVertical: 11,
    paddingRight: 14,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  downloadBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  detailIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  detailCopy: {flex: 1, minWidth: 0, marginLeft: 11},
  detailLabel: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  detailValue: {
    marginTop: 2,
    color: BookingColors.textPrimary,
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
    borderTopColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  secondaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: BookingColors.errorSoft,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  primaryButton: {
    height: 52,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  missingState: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  missingTitle: {
    marginTop: 12,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  breakdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: BookingColors.primarySoft,
  },
  breakdownToggleLabel: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  breakdownPanel: {
    marginHorizontal: 14,
    marginBottom: 14,
    overflow: 'hidden',
  },
  breakdownHeading: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  breakdownRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  breakdownIconWrap: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: BookingColors.surface,
    borderWidth: 1,
    borderColor: BookingColors.border,
  },
  breakdownCopy: {flex: 1, marginLeft: 10},
  breakdownLabel: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  breakdownSublabel: {
    marginTop: 1,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  breakdownRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownDownloadIcon: {marginRight: 6},
  breakdownAmount: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  breakdownTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
    backgroundColor: BookingColors.primarySoft,
  },
  breakdownTotalLabel: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  breakdownTotalAmount: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
});
