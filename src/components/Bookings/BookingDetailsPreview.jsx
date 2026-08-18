import React from 'react';
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
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';
import PricingBreakdown from '../BookingFlow/PricingBreakdown';
import BookingActionButton from './BookingActionButton';
import AvailabilitySchedule from './AvailabilitySchedule';

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
  rejected: {
    background: BookingColors.errorSoft,
    color: BookingColors.error,
    icon: 'x-circle',
    label: 'Cancelled',
  },
};

function DetailRow({icon, label, value, last}) {
  return (
    <View style={[styles.detailRow, last && styles.lastDetailRow]}>
      <View style={styles.detailIcon}>
        <Feather name={icon} size={17} color={BookingColors.primary} />
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

export default function BookingDetailsPreview({booking, navigation}) {
  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const agent = booking.agent || {};
  const agentName =
    booking.agentName ||
    [agent.first_name, agent.last_name].filter(Boolean).join(' ') ||
    'Notary being matched';
  const avatar = booking.avatar || require('../../../assets/agentPic.png');
  const service =
    booking.service_type === 'mobile_notary'
      ? 'Mobile notary'
      : 'Remote online notary';
  const totalPrice = Number(booking.price || booking.totalPrice || 0);
  const additionalSignatures = Number(
    booking.total_signatures_required || booking.totalSignaturesRequired || 0,
  );
  const additionalSignatureCharge = Number(
    booking.additionalSignatureCharge ?? additionalSignatures * 10,
  );
  const printCopies = Number(
    booking.printCopies || booking.notes?.match(/Print request:\s*(\d+)/i)?.[1],
  );
  const printingCharge = Number(
    booking.printingCharge ?? (printCopies ? printCopies * 5 : 0),
  );
  const listedDocumentCharge = Array.isArray(booking.document_type)
    ? booking.document_type.reduce(
        (total, document) => total + Number(document?.price || 0),
        0,
      )
    : 0;
  const documentCharge = Number(
    booking.documentCharge ??
      (totalPrice
        ? Math.max(0, totalPrice - additionalSignatureCharge - printingCharge)
        : listedDocumentCharge),
  );
  const paymentLabel =
    booking.status === 'rejected'
      ? 'No charge'
      : booking.status === 'pending'
      ? 'Due after confirmation'
      : 'Paid securely';
  const primaryLabel =
    booking.status === 'accepted'
      ? 'Message notary'
      : booking.status === 'pending'
      ? 'Back to bookings'
      : booking.status === 'completed'
      ? 'Book another service'
      : 'Find another notary';
  const agentRole = booking.unassigned
    ? 'Notary assignment in progress'
    : 'Verified Notarizr professional';
  const documentLabel = Array.isArray(booking.document_type)
    ? booking.document_type[0]?.name
    : booking.document_type?.name || booking.document_type;

  const handlePrimaryAction = () => {
    if (booking.status === 'accepted') {
      navigation.navigate('HomeScreen', {screen: 'ChatContactScreen'});
      return;
    }
    if (booking.status === 'pending') {
      navigation.goBack();
      return;
    }
    navigation.navigate('HomeScreen', {screen: 'Home'});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Feather
            name="arrow-left"
            size={21}
            color={BookingColors.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Booking details</Text>
          <Text style={styles.headerSubtitle}>#{booking.reference}</Text>
        </View>
        <View
          style={[styles.statusBadge, {backgroundColor: status.background}]}>
          <Feather name={status.icon} size={13} color={status.color} />
          <Text style={[styles.statusText, {color: status.color}]}>
            {status.label}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.providerSection}>
          {booking.unassigned ? (
            <View style={styles.avatarPlaceholder}>
              <Feather name="user" size={27} color={BookingColors.warning} />
            </View>
          ) : (
            <Image source={avatar} style={styles.avatar} />
          )}
          <View style={styles.providerCopy}>
            <Text style={styles.service}>{service}</Text>
            <Text style={styles.agentName}>{agentName}</Text>
            <Text style={styles.agentRole}>{agentRole}</Text>
          </View>
          <View
            style={[
              styles.verifiedIcon,
              booking.unassigned && styles.pendingIcon,
            ]}>
            <Feather
              name={booking.unassigned ? 'clock' : 'check'}
              size={14}
              color={
                booking.unassigned
                  ? BookingColors.warning
                  : BookingColors.success
              }
            />
          </View>
        </View>

        <Section title="Appointment">
          <DetailRow
            icon="calendar"
            label="Date"
            value={booking.displayDate || booking.date_of_booking}
          />
          <DetailRow
            icon="clock"
            label="Time"
            value={booking.displayTime || booking.time_of_booking}
          />
          <DetailRow
            icon={
              booking.service_type === 'mobile_notary' ? 'map-pin' : 'video'
            }
            label={
              booking.service_type === 'mobile_notary' ? 'Location' : 'Meeting'
            }
            last
            value={booking.location}
          />
        </Section>

        <AvailabilitySchedule
          schedule={booking?.service?.availability?.schedule}
        />

        <Section title="Request details">
          <DetailRow
            icon="file-text"
            label="Document"
            value={documentLabel || 'Bring to appointment'}
          />
          <DetailRow
            icon="edit-3"
            label="Additional signatures"
            value={`${additionalSignatures} ($${additionalSignatureCharge.toFixed(
              2,
            )})`}
          />
          {booking.service_type === 'mobile_notary' ? (
            <DetailRow
              icon="printer"
              label="Printouts"
              value={
                printCopies
                  ? `${printCopies} ${printCopies === 1 ? 'copy' : 'copies'}`
                  : 'Not requested'
              }
            />
          ) : null}
          <DetailRow
            icon="info"
            label="Instructions"
            last
            value={booking.notes || 'No additional instructions provided.'}
          />
        </Section>

        <Section title="Payment summary">
          <Text style={styles.paymentLabel}>{paymentLabel}</Text>
          <Text style={styles.paymentMethod}>Notarizr secure payment</Text>
          <PricingBreakdown
            additionalSignatureCount={additionalSignatures}
            additionalSignatures={additionalSignatureCharge}
            documentCharge={documentCharge}
            documentCount={
              Array.isArray(booking.document_type)
                ? booking.document_type.length
                : 0
            }
            documentLabel={documentLabel}
            printingCharge={printingCharge}
            printingCopies={printCopies}
            serviceLabel={service}
            style={styles.detailsPricing}
            total={totalPrice}
          />
        </Section>
      </ScrollView>

      <View style={styles.actionBar}>
        <BookingActionButton
          icon="arrow-right"
          label={primaryLabel}
          onPress={handlePrimaryAction}
          style={styles.primaryButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BookingColors.surface,
  },
  header: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
  },
  statusText: {
    marginLeft: 5,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  scrollContent: {
    paddingBottom: 24,
    backgroundColor: BookingColors.background,
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
    backgroundColor: BookingColors.textPrimary,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: BookingColors.warningSoft,
  },
  providerCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  service: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  agentName: {
    marginTop: 2,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  agentRole: {
    marginTop: 2,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  verifiedIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: BookingColors.successSoft,
  },
  pendingIcon: {
    backgroundColor: BookingColors.warningSoft,
  },
  section: {
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 8,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  sectionBody: {
    paddingHorizontal: 20,
  },
  detailRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    paddingVertical: 10,
  },
  detailLabel: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  detailValue: {
    marginTop: 2,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    lineHeight: 17,
  },
  detailsPricing: {marginHorizontal: 0, marginBottom: 16, marginTop: 10},
  paymentLabel: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
  },
  paymentMethod: {
    marginTop: 3,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  actionBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  primaryButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
