import React, {useMemo} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';
import PricingBreakdown from '../BookingFlow/PricingBreakdown';

const STATUS_CONFIG = {
  accepted: {
    background: BookingColors.successSoft,
    color: BookingColors.success,
    icon: 'check-circle',
    label: 'Accepted',
  },
  pending: {
    background: BookingColors.warningSoft,
    color: BookingColors.warning,
    icon: 'clock',
    label: 'Pending',
  },
  completed: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'check-circle',
    label: 'Completed',
  },
  cancelled: {
    background: BookingColors.errorSoft,
    color: BookingColors.error,
    icon: 'x-circle',
    label: 'Cancelled',
  },
  travelling: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'navigation',
    label: 'On the way',
  },
  ongoing: {
    background: BookingColors.infoSoft,
    color: BookingColors.info,
    icon: 'video',
    label: 'In progress',
  },
  paid: {
    background: BookingColors.successSoft,
    color: BookingColors.success,
    icon: 'credit-card',
    label: 'Paid',
  },
  payment_confirmed: {
    background: BookingColors.successSoft,
    color: BookingColors.success,
    icon: 'check-circle',
    label: 'Payment confirmed',
  },
  to_be_paid: {
    background: BookingColors.warningSoft,
    color: BookingColors.warning,
    icon: 'credit-card',
    label: 'Payment due',
  },
};

const normalizeStatus = value => {
  const normalized = String(value || 'pending')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (normalized === 'rejected' || normalized === 'canceled') {
    return 'cancelled';
  }
  return normalized;
};

const getName = person => {
  if (!person) {
    return '';
  }
  return (
    [person.first_name, person.last_name].filter(Boolean).join(' ') ||
    person.name ||
    ''
  );
};

const getInitials = name =>
  String(name || 'N')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

const getUploadedFiles = booking => {
  const fromDocuments = Array.isArray(booking?.documents)
    ? booking.documents
    : booking?.documents && typeof booking.documents === 'object'
    ? Object.values(booking.documents)
    : [];
  const fromClientDocuments =
    booking?.client_documents && typeof booking.client_documents === 'object'
      ? Object.values(booking.client_documents)
      : [];

  return [...fromDocuments, ...fromClientDocuments]
    .map(item => (typeof item === 'string' ? {url: item} : item))
    .filter(item => item?.url || item?.uri);
};

const getDocumentList = (booking, isMobile) => {
  const value = booking?.document_type;
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === 'object') {
    return [value];
  }
  if (typeof value === 'string' && value.trim()) {
    return [{name: value}];
  }
  return [
    {
      name: isMobile ? 'Bring to appointment' : 'Document not provided',
      price: 0,
    },
  ];
};

const formatDate = booking => {
  const value = booking?.date_time_session || booking?.date_of_booking;
  if (!value) {
    return 'Date to be confirmed';
  }
  const parsed = moment(value);
  return parsed.isValid() ? parsed.format('ddd, MMM D, YYYY') : String(value);
};

const formatTime = booking => {
  if (booking?.time_of_booking) {
    const timestamp = moment(booking.time_of_booking);
    if (timestamp.isValid() && String(booking.time_of_booking).includes('T')) {
      return timestamp.format('h:mm A');
    }
    const parsed = moment(
      booking.time_of_booking,
      ['h:mm A', 'h:mm a', 'HH:mm'],
      true,
    );
    return parsed.isValid() ? parsed.format('h:mm A') : booking.time_of_booking;
  }
  const parsed = moment(booking?.date_time_session);
  return parsed.isValid() ? parsed.format('h:mm A') : 'Time to be confirmed';
};

function IconButton({accessibilityLabel, icon, onPress, primary}) {
  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.72}
      onPress={onPress}
      style={[styles.iconButton, primary && styles.primaryIconButton]}>
      <Feather
        name={icon}
        size={19}
        color={primary ? BookingColors.primary : BookingColors.textPrimary}
      />
    </TouchableOpacity>
  );
}

function InfoRow({icon, label, last, value}) {
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <View style={styles.infoIcon}>
        <Feather name={icon} size={17} color={BookingColors.primary} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
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

function ActionButton({disabled, icon, label, onPress, secondary}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={disabled ? 1 : 0.78}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        secondary && styles.secondaryActionButton,
        disabled && styles.disabledActionButton,
      ]}>
      <Text
        style={[
          styles.actionButtonText,
          secondary && styles.secondaryActionButtonText,
        ]}>
        {label}
      </Text>
      {icon ? (
        <Feather
          name={icon}
          size={18}
          color={secondary ? BookingColors.textPrimary : BookingColors.white}
        />
      ) : null}
    </TouchableOpacity>
  );
}

export default function ClientBookingDetailsView({
  booking,
  loading,
  onBack,
  onBookAgain,
  onCancel,
  onDownload,
  onHelp,
  onJoin,
  onMessage,
  onPay,
  onRefresh,
  onTrack,
  onUpload,
  status: statusValue,
}) {
  const statusKey = normalizeStatus(statusValue || booking?.status);
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const isMobile = booking?.service_type === 'mobile_notary';
  const serviceName = isMobile ? 'Mobile notary' : 'Remote online notary';
  const agent = booking?.agent;
  const agentName = getName(agent) || 'Notary assignment in progress';
  const avatarUri =
    agent?.profile_picture && agent.profile_picture !== 'none'
      ? agent.profile_picture
      : null;
  const documents = useMemo(
    () => getDocumentList(booking, isMobile),
    [booking, isMobile],
  );
  const uploadedFiles = useMemo(() => getUploadedFiles(booking), [booking]);
  const hasUploadedFiles = uploadedFiles.length > 0;
  const additionalSignatures = Math.max(
    0,
    Number(booking?.total_signatures_required || 0),
  );
  const additionalSignatureCharge = Number(
    booking?.additionalSignatureCharge ?? additionalSignatures * 10,
  );
  const printCopies = Number(
    booking?.printCopies ||
      booking?.notes?.match(/Print request:\s*(\d+)/i)?.[1] ||
      0,
  );
  const printingCharge = Number(
    booking?.printingCharge ?? (printCopies > 0 ? printCopies * 5 : 0),
  );
  const listedDocumentCharge = documents.reduce(
    (total, document) => total + Number(document?.price || 0),
    0,
  );
  const totalPrice = Number(booking?.totalPrice ?? booking?.price ?? 0);
  const documentCharge = Number(
    booking?.documentCharge ??
      (listedDocumentCharge ||
        Math.max(0, totalPrice - additionalSignatureCharge - printingCharge)),
  );
  const location =
    booking?.booked_for?.location ||
    booking?.location ||
    booking?.address?.formatted_address ||
    (isMobile ? 'Address will be confirmed' : 'Secure video appointment');
  const identity =
    booking?.identity_authentication === 'user_id'
      ? 'Government-issued ID card'
      : booking?.identity_authentication === 'user_passport'
      ? 'Passport'
      : 'You can choose during verification';
  const reference = String(booking?._id || booking?.reference || 'Booking')
    .slice(-8)
    .toUpperCase();
  const hasDownload = Boolean(
    booking?.notarized_docs?.length || booking?.agent_document?.length,
  );

  const renderActions = () => {
    if (statusKey === 'completed') {
      return (
        <>
          <ActionButton
            disabled={!hasDownload || loading}
            icon="download"
            label={hasDownload ? 'Download documents' : 'Documents processing'}
            onPress={onDownload}
          />
          <ActionButton
            icon="refresh-cw"
            label="Book another service"
            onPress={onBookAgain}
            secondary
          />
        </>
      );
    }

    if (statusKey === 'cancelled') {
      return (
        <ActionButton
          icon="arrow-right"
          label="Book another notary"
          onPress={onBookAgain}
        />
      );
    }

    if (statusKey === 'pending') {
      return (
        <>
          <ActionButton
            icon="message-circle"
            label="Message support"
            onPress={onMessage}
          />
          <ActionButton
            icon="x"
            label="Cancel request"
            onPress={onCancel}
            secondary
          />
        </>
      );
    }

    if (statusKey === 'to_be_paid') {
      return (
        <ActionButton
          disabled={loading}
          icon="credit-card"
          label="Review and pay"
          onPress={onPay}
        />
      );
    }

    return (
      <>
        <ActionButton
          disabled={loading}
          icon={isMobile ? 'message-circle' : 'video'}
          label={isMobile ? 'Message notary' : 'Join secure session'}
          onPress={isMobile ? onMessage : onJoin}
        />
        {isMobile ? (
          <ActionButton
            disabled={loading}
            icon="navigation"
            label="Track"
            onPress={onTrack}
            secondary
          />
        ) : (
          <ActionButton
            disabled={loading}
            icon="upload-cloud"
            label={hasUploadedFiles ? 'Add more documents' : 'Upload documents'}
            onPress={onUpload}
            secondary
          />
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <View style={styles.header}>
        <IconButton
          accessibilityLabel="Go back"
          icon="arrow-left"
          onPress={onBack}
        />
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Booking details</Text>
          <Text style={styles.headerSubtitle}>#{reference}</Text>
        </View>
        <IconButton
          accessibilityLabel="Get help"
          icon="help-circle"
          onPress={onHelp}
        />
        <View style={styles.headerActionGap} />
        <IconButton
          accessibilityLabel="Open messages"
          icon="message-circle"
          onPress={onMessage}
          primary
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onRefresh={onRefresh}
        refreshing={Boolean(loading)}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View
            style={[styles.statusBadge, {backgroundColor: status.background}]}>
            <Feather name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, {color: status.color}]}>
              {status.label}
            </Text>
          </View>
          <View style={styles.serviceIcon}>
            <Feather
              name={isMobile ? 'map-pin' : 'video'}
              size={21}
              color={BookingColors.primary}
            />
          </View>
          <Text style={styles.heroTitle}>{serviceName}</Text>
          <Text style={styles.heroSubtitle}>
            {statusKey === 'completed'
              ? 'This appointment has been completed.'
              : statusKey === 'cancelled'
              ? 'This booking is no longer active.'
              : statusKey === 'pending'
              ? 'We are confirming your notary and appointment.'
              : 'Your notary and appointment details are confirmed.'}
          </Text>
        </View>

        <Section title="Your notary">
          <View style={styles.notaryRow}>
            {avatarUri ? (
              <Image source={{uri: avatarUri}} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {getInitials(agentName)}
                </Text>
              </View>
            )}
            <View style={styles.notaryCopy}>
              <Text style={styles.notaryName}>{agentName}</Text>
              <Text style={styles.notaryRole}>
                {agent
                  ? 'Verified Notarizr professional'
                  : 'We will notify you once matched'}
              </Text>
            </View>
            {agent ? (
              <TouchableOpacity
                accessibilityLabel="Message notary"
                activeOpacity={0.72}
                onPress={onMessage}
                style={styles.messageButton}>
                <Feather
                  name="message-circle"
                  size={18}
                  color={BookingColors.primary}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </Section>

        <Section title="Appointment">
          <InfoRow icon="calendar" label="Date" value={formatDate(booking)} />
          <InfoRow icon="clock" label="Time" value={formatTime(booking)} />
          <InfoRow
            icon={isMobile ? 'map-pin' : 'video'}
            label={isMobile ? 'Meeting address' : 'Appointment type'}
            last
            value={location}
          />
        </Section>

        <Section title="Notary Request">
          {documents.map((document, index) => (
            <InfoRow
              icon="file-text"
              key={`${document?.name || 'document'}-${index}`}
              label={index === 0 ? 'Document type' : `Document ${index + 1}`}
              value={document?.name || 'Notary document'}
            />
          ))}
          <InfoRow
            icon={hasUploadedFiles ? 'check-circle' : 'upload-cloud'}
            label="Uploaded files"
            value={
              hasUploadedFiles
                ? `${uploadedFiles.length} file${
                    uploadedFiles.length === 1 ? '' : 's'
                  } attached`
                : isMobile
                ? 'None yet — bring it or upload before your appointment'
                : 'None yet — upload before your session'
            }
          />
          <InfoRow
            icon="edit-3"
            label="Additional signatures"
            value={`${additionalSignatures} ($${additionalSignatureCharge.toFixed(
              2,
            )})`}
          />
          {isMobile ? (
            <InfoRow
              icon="printer"
              label="Printouts"
              value={
                printCopies
                  ? `${printCopies} ${printCopies === 1 ? 'copy' : 'copies'}`
                  : 'Not requested'
              }
            />
          ) : null}
          {booking?.notes ? (
            <InfoRow
              icon="align-left"
              label="Instructions"
              last
              value={booking.notes}
            />
          ) : null}
        </Section>

        <Section title="Verification">
          <InfoRow
            icon="shield"
            label="Identity method"
            last
            value={identity}
          />
        </Section>

        <PricingBreakdown
          additionalSignatureCount={additionalSignatures}
          additionalSignatures={additionalSignatureCharge}
          documentCharge={documentCharge}
          documentCount={documents.length}
          documentLabel={documents.length > 1 ? 'Notarized documents' : documents[0]?.name}
          printingCharge={printingCharge}
          printingCopies={printCopies}
          serviceLabel={serviceName}
          style={styles.pricingSection}
          total={totalPrice}
        />
      </ScrollView>

      <View style={styles.actionBar}>{renderActions()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  header: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  primaryIconButton: {
    borderColor: '#F6D7C6',
    backgroundColor: BookingColors.primarySoft,
  },
  headerCopy: {flex: 1, minWidth: 0, marginLeft: 12},
  headerTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
  },
  headerSubtitle: {
    marginTop: 1,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  headerActionGap: {width: 8},
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: BookingColors.background,
  },
  hero: {
    minHeight: 180,
    padding: 20,
    borderRadius: 8,
    backgroundColor: BookingColors.textPrimary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
  },
  statusText: {marginLeft: 6, fontFamily: 'Manrope-Bold', fontSize: 11},
  serviceIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  heroTitle: {
    marginTop: 34,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 25,
  },
  heroSubtitle: {
    marginTop: 7,
    maxWidth: '88%',
    color: '#AEB5C2',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  section: {marginTop: 14},
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 2,
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
  notaryRow: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BookingColors.background,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: BookingColors.primarySoft,
  },
  avatarInitials: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  notaryCopy: {flex: 1, minWidth: 0, marginLeft: 12},
  notaryName: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  notaryRole: {
    marginTop: 3,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  messageButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  infoRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  infoRowLast: {borderBottomWidth: 0},
  infoIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  infoCopy: {flex: 1, minWidth: 0, marginLeft: 11, paddingVertical: 10},
  infoLabel: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  infoValue: {
    marginTop: 2,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    lineHeight: 17,
  },
  pricingSection: {
    marginTop: 14,
    marginHorizontal: 0,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  actionButton: {
    minHeight: 50,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BookingColors.primary,
    borderRadius: 8,
    backgroundColor: BookingColors.primary,
  },
  secondaryActionButton: {
    borderColor: BookingColors.borderStrong,
    backgroundColor: BookingColors.surface,
  },
  disabledActionButton: {opacity: 0.5},
  actionButtonText: {
    marginRight: 7,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    textAlign: 'center',
  },
  secondaryActionButtonText: {color: BookingColors.textPrimary},
});
