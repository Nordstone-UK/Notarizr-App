import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
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
import BookingColors from '../../themes/BookingColors';
import {getSavedTestCard} from '../../utils/TestPayments';
import {
  formatBookingDate,
  formatBookingTime,
  getBookingDisplayId,
  getBookingLocation,
} from '../../utils/bookingPresentation';
import {getSessionAvailability} from '../../utils/sessionAvailability';
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
  expired: {
    background: BookingColors.errorSoft,
    color: BookingColors.error,
    icon: 'clock',
    label: 'Expired',
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
    label: 'Awaiting payment',
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
    .map(item => ({...item, url: item?.url || item?.uri}))
    .filter(item => item?.url);
};

// Uploaded files don't always carry a friendly name — fall back to the
// filename in the URL, then a generic label, so the row is never blank.
const getFileNameFromUrl = (url, index) => {
  try {
    const fileName = decodeURIComponent(String(url).split('/').pop() || '');
    return fileName || `Uploaded document ${index + 1}`;
  } catch {
    return `Uploaded document ${index + 1}`;
  }
};

// Once a session is completed the notary's finished, stamped copies (or the
// agent's uploaded copies as a fallback) become downloadable. Each entry
// gets its own view/download controls rather than one bulk action.
const getCompletedFiles = booking => {
  const source = booking?.notarized_docs?.length
    ? booking.notarized_docs
    : booking?.agent_document || [];

  return (Array.isArray(source) ? source : [])
    .map(item => (typeof item === 'string' ? {url: item} : item))
    .filter(item => item?.url);
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

function DocumentRow({downloading, label, last, name, onDownload, onView}) {
  return (
    <View style={[styles.documentRow, last && styles.infoRowLast]}>
      <View style={styles.infoIcon}>
        <Feather name="file-text" size={17} color={BookingColors.primary} />
      </View>
      <View style={styles.documentCopy}>
        {label ? <Text style={styles.infoLabel}>{label}</Text> : null}
        <Text numberOfLines={1} style={styles.documentName}>
          {name}
        </Text>
      </View>
      <TouchableOpacity
        accessibilityLabel={`View ${name}`}
        activeOpacity={0.72}
        onPress={onView}
        style={styles.documentActionButton}>
        <Feather name="eye" size={16} color={BookingColors.textPrimary} />
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityLabel={`Download ${name}`}
        activeOpacity={0.72}
        disabled={downloading}
        onPress={onDownload}
        style={[styles.documentActionButton, styles.documentDownloadButton]}>
        {downloading ? (
          <ActivityIndicator color={BookingColors.primary} size="small" />
        ) : (
          <Feather name="download" size={16} color={BookingColors.primary} />
        )}
      </TouchableOpacity>
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
  allowEarlySessionAccess = false,
  booking,
  documentDownloadState = {},
  loading,
  onBack,
  onBookAgain,
  onCancel,
  onDownload,
  onDownloadDocument,
  onHelp,
  onJoin,
  onMessage,
  onAddCard,
  onPay,
  onRefresh,
  onTrack,
  onViewDocument,
  refreshing = false,
  status: statusValue,
}) {
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [savedCard, setSavedCard] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
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
  // getDocumentList falls back to a "not provided" placeholder when there's
  // no real document_type data — that placeholder must never be paired with
  // an actual uploaded file below, or it'd wear a misleading label.
  const hasRealDocumentTypes = Boolean(booking?.document_type);
  const uploadedFiles = useMemo(() => getUploadedFiles(booking), [booking]);
  const hasUploadedFiles = uploadedFiles.length > 0;
  const completedFiles = useMemo(() => getCompletedFiles(booking), [booking]);
  const documentCount = Math.max(documents.length, uploadedFiles.length);
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
  const storedTotalPrice = Number(booking?.totalPrice ?? booking?.price ?? 0);
  const platformFee = Number(
    booking?.notarizer_platform_fee ?? booking?.platform_fee ?? 10,
  );
  const documentCharge = Number(
    booking?.documentCharge ??
      (documentCount > 0
        ? documentCount * 99.99
        : Math.max(
            0,
            storedTotalPrice -
              platformFee -
              additionalSignatureCharge -
              printingCharge,
          )),
  );
  const calculatedTotalPrice =
    documentCharge + platformFee + additionalSignatureCharge + printingCharge;
  const totalPrice =
    calculatedTotalPrice > 0 ? calculatedTotalPrice : storedTotalPrice;
  const bookingInstructions =
    booking?.notes ||
    booking?.instructions ||
    booking?.special_instructions ||
    booking?.booking_notes ||
    booking?.booked_for?.notes ||
    booking?.booked_for?.instructions ||
    'No additional instructions provided.';
  const location = getBookingLocation(booking);
  const sessionAvailability = useMemo(
    () =>
      getSessionAvailability({
        date: booking?.date_of_booking,
        time: booking?.time_of_booking,
      }),
    [booking?.date_of_booking, booking?.time_of_booking],
  );
  const canJoinSession =
    sessionAvailability.canJoin ||
    (allowEarlySessionAccess && sessionAvailability.reason === 'upcoming');
  const paymentConfirmed =
    ['paid', 'payment_confirmed', 'ongoing', 'completed'].includes(statusKey) ||
    ['paid', 'succeeded'].includes(
      String(booking?.payment_status || '').toLowerCase(),
    ) ||
    booking?.is_paid === true;
  const identity =
    booking?.identity_authentication === 'user_id'
      ? 'Government-issued ID card'
      : booking?.identity_authentication === 'user_passport'
      ? 'Passport'
      : 'You can choose during verification';
  const reference = getBookingDisplayId(booking);
  // "Documents processing" should only show while there's truly nothing to
  // download yet. The notarized/agent copies are the ideal source, but the
  // client's own uploaded files are just as downloadable in the meantime —
  // don't leave the button stuck disabled just because the notary hasn't
  // attached a stamped copy.
  const hasDownload = Boolean(
    booking?.notarized_docs?.length ||
      booking?.agent_document?.length ||
      hasUploadedFiles,
  );

  const openPaymentMethods = async () => {
    setPaymentModalVisible(true);
    setCardLoading(true);
    setSavedCard(await getSavedTestCard());
    setCardLoading(false);
  };

  const handleAddCard = () => {
    setPaymentModalVisible(false);
    onAddCard?.();
  };

  const handleContinuePayment = () => {
    setPaymentModalVisible(false);
    onPay?.();
  };

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

    if (statusKey === 'cancelled' || statusKey === 'expired') {
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
          label="Pay to confirm booking"
          onPress={openPaymentMethods}
        />
      );
    }

    if (!isMobile) {
      return (
        <ActionButton
          disabled={loading || !canJoinSession}
          icon="video"
          label={
            canJoinSession
              ? 'Join secure session'
              : sessionAvailability.actionLabel
          }
          onPress={onJoin}
        />
      );
    }

    return (
      <>
        <ActionButton
          disabled={loading}
          icon="message-circle"
          label="Message notary"
          onPress={onMessage}
        />
        <ActionButton
          disabled={loading}
          icon="navigation"
          label="Track"
          onPress={onTrack}
          secondary
        />
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
        refreshControl={
          <RefreshControl
            colors={[BookingColors.primary]}
            onRefresh={onRefresh}
            refreshing={Boolean(refreshing)}
            tintColor={BookingColors.primary}
          />
        }
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
              : statusKey === 'expired'
              ? 'This session window has expired.'
              : statusKey === 'pending'
              ? 'We are confirming your notary and appointment.'
              : statusKey === 'to_be_paid'
              ? 'Your notary accepted. Pay securely to confirm this appointment.'
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
          <InfoRow
            icon="calendar"
            label="Date"
            value={formatBookingDate(booking)}
          />
          <InfoRow
            icon="clock"
            label="Time"
            value={formatBookingTime(booking)}
          />
          <InfoRow
            icon={isMobile ? 'map-pin' : 'video'}
            label={isMobile ? 'Meeting address' : 'Appointment type'}
            last
            value={location}
          />
        </Section>

        <Section title="Notary Request">
          {documents.map((document, index) => {
            const file = hasRealDocumentTypes ? uploadedFiles[index] : null;
            const label =
              index === 0 ? 'Document type' : `Document ${index + 1}`;

            return file ? (
              <DocumentRow
                downloading={Boolean(documentDownloadState[file.url])}
                key={file.url}
                label={label}
                name={document?.name || getFileNameFromUrl(file.url, index)}
                onDownload={() => onDownloadDocument?.(file.url)}
                onView={() => onViewDocument?.(file.url)}
              />
            ) : (
              <InfoRow
                icon="file-text"
                key={`${document?.name || 'document'}-${index}`}
                label={label}
                value={document?.name || 'Notary document'}
              />
            );
          })}
          {/* Any uploaded file beyond the selected document types still
              needs its own view/download controls. */}
          {uploadedFiles
            .slice(hasRealDocumentTypes ? documents.length : 0)
            .map((file, index) => (
              <DocumentRow
                downloading={Boolean(documentDownloadState[file.url])}
                key={file.url}
                name={getFileNameFromUrl(file.url, index)}
                onDownload={() => onDownloadDocument?.(file.url)}
                onView={() => onViewDocument?.(file.url)}
              />
            ))}
          {!hasUploadedFiles ? (
            <InfoRow
              icon="upload-cloud"
              label="Uploaded files"
              value={
                isMobile
                  ? 'None yet — bring it or upload before your appointment'
                  : 'None yet — upload before your session'
              }
            />
          ) : null}
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
          <InfoRow
            icon="align-left"
            label="Instructions"
            last
            value={bookingInstructions}
          />
        </Section>

        <Section title="Verification">
          <InfoRow
            icon="shield"
            label="Identity method"
            last
            value={identity}
          />
        </Section>

        {statusKey === 'completed' && completedFiles.length > 0 ? (
          <Section title="Notarized documents">
            {completedFiles.map((file, index) => (
              <DocumentRow
                downloading={Boolean(documentDownloadState[file.url])}
                key={file.url}
                last={index === completedFiles.length - 1}
                name={file.name || `Notarized document ${index + 1}`}
                onDownload={() => onDownloadDocument?.(file.url)}
                onView={() => onViewDocument?.(file.url)}
              />
            ))}
          </Section>
        ) : null}

        <PricingBreakdown
          additionalSignatureCount={additionalSignatures}
          additionalSignatures={additionalSignatureCharge}
          documentCharge={documentCharge}
          documentCount={documentCount}
          documentLabel={
            documents.length > 1 ? 'Notarized documents' : documents[0]?.name
          }
          printingCharge={printingCharge}
          printingCopies={printCopies}
          paid={paymentConfirmed}
          platformFee={platformFee}
          serviceLabel="Notarizer Platform Fee"
          style={styles.pricingSection}
          total={totalPrice}
        />
      </ScrollView>

      <View style={styles.actionBar}>{renderActions()}</View>

      <Modal
        animationType="fade"
        onRequestClose={() => setPaymentModalVisible(false)}
        transparent
        visible={paymentModalVisible}>
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityLabel="Close payment methods"
            onPress={() => setPaymentModalVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.paymentSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleCopy}>
                <Text style={styles.sheetTitle}>Choose payment method</Text>
                <Text style={styles.sheetSubtitle}>
                  Select a saved card to confirm this booking.
                </Text>
              </View>
              <TouchableOpacity
                accessibilityLabel="Close"
                activeOpacity={0.72}
                onPress={() => setPaymentModalVisible(false)}
                style={styles.sheetCloseButton}>
                <Feather
                  color={BookingColors.textSecondary}
                  name="x"
                  size={20}
                />
              </TouchableOpacity>
            </View>

            {cardLoading ? (
              <View style={styles.cardLoadingState}>
                <ActivityIndicator color={BookingColors.primary} />
                <Text style={styles.cardLoadingText}>
                  Loading your cards...
                </Text>
              </View>
            ) : savedCard ? (
              <TouchableOpacity
                accessibilityLabel={`${savedCard.brand} ending in ${savedCard.last4}`}
                activeOpacity={0.78}
                style={styles.savedCardRow}>
                <View style={styles.savedCardIcon}>
                  <Feather
                    color={BookingColors.primary}
                    name="credit-card"
                    size={20}
                  />
                </View>
                <View style={styles.savedCardCopy}>
                  <Text style={styles.savedCardBrand}>{savedCard.brand}</Text>
                  <Text style={styles.savedCardNumber}>
                    •••• •••• •••• {savedCard.last4}
                  </Text>
                </View>
                <Feather
                  color={BookingColors.primary}
                  name="check-circle"
                  size={21}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyCardState}>
                <View style={styles.emptyCardIcon}>
                  <Feather
                    color={BookingColors.primary}
                    name="credit-card"
                    size={22}
                  />
                </View>
                <Text style={styles.emptyCardTitle}>No saved cards</Text>
                <Text style={styles.emptyCardText}>
                  Add a payment card to confirm your appointment.
                </Text>
              </View>
            )}

            {!cardLoading ? (
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.78}
                onPress={savedCard ? handleContinuePayment : handleAddCard}
                style={styles.sheetPrimaryButton}>
                <Text style={styles.sheetPrimaryButtonText}>
                  {savedCard
                    ? `Continue with •••• ${savedCard.last4}`
                    : 'Add a payment card'}
                </Text>
                <Feather
                  color={BookingColors.white}
                  name={savedCard ? 'arrow-right' : 'plus'}
                  size={18}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Modal>
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
    fontSize: 9,
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
  documentRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  documentCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    paddingVertical: 10,
  },
  documentName: {
    marginTop: 2,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
  },
  documentActionButton: {
    width: 34,
    height: 34,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  documentDownloadButton: {
    borderColor: '#F6D7C6',
    backgroundColor: BookingColors.primarySoft,
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  paymentSheet: {
    paddingHorizontal: 18,
    paddingTop: 7,
    paddingBottom: 8,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    alignSelf: 'center',
    marginBottom: 10,
    borderRadius: 2,
    backgroundColor: BookingColors.borderStrong,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sheetTitleCopy: {flex: 1, minWidth: 0, paddingRight: 12},
  sheetTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 19,
  },
  sheetSubtitle: {
    marginTop: 4,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 17,
  },
  sheetCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  cardLoadingState: {
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
  },
  cardLoadingText: {
    marginLeft: 10,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  savedCardRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: BookingColors.primary,
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  savedCardIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  savedCardCopy: {flex: 1, minWidth: 0, marginLeft: 12},
  savedCardBrand: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  savedCardNumber: {
    marginTop: 3,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  emptyCardState: {
    alignItems: 'center',
    marginBottom: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  emptyCardIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  emptyCardTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  emptyCardText: {
    marginTop: 4,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    textAlign: 'center',
  },
  sheetPrimaryButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primary,
  },
  sheetPrimaryButtonText: {
    marginRight: 8,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
});
