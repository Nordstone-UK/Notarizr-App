import React, {useMemo} from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import ProfileScreenHeader from '../../../components/Profile/ProfileScreenHeader';
import BookingColors from '../../../themes/BookingColors';
import {
  formatBookingDate,
  formatBookingTime,
  getBookingDisplayId,
  getBookingLocation,
} from '../../../utils/bookingPresentation';

const getName = person =>
  [person?.first_name, person?.last_name].filter(Boolean).join(' ') ||
  person?.name ||
  '';

const titleize = value =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, letter => letter.toUpperCase());

const displayValue = (value, fallback = 'Not available') => {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'string') {
    return value.trim() || fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map(item => displayValue(item, ''))
      .join(', ');
  }
  if (typeof value === 'object') {
    return (
      value.location ||
      value.formatted_address ||
      value.name ||
      value.label ||
      fallback
    );
  }
  return String(value);
};

const normalizeUrl = value => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return (
    value.url || value.uri || value.fileUrl || value.value || value.link || ''
  );
};

const getFinalDocs = booking => {
  const completionPackage = booking?.completion_package || {};
  const source = booking?.notarized_docs?.length
    ? booking.notarized_docs
    : completionPackage.final_pdf_urls?.length
    ? completionPackage.final_pdf_urls
    : completionPackage.final_pdf_url
    ? [completionPackage.final_pdf_url]
    : [];

  return Array.from(
    new Set(
      (Array.isArray(source) ? source : [])
        .map(normalizeUrl)
        .filter(url => /^https?:\/\//i.test(String(url || ''))),
    ),
  );
};

const openUrl = async url => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      throw new Error('Cannot open URL');
    }
    await Linking.openURL(url);
  } catch {
    Toast.show({
      type: 'error',
      text1: 'Could not open file',
      text2: 'Please try again in a moment.',
    });
  }
};

function Row({icon, label, value, url, last}) {
  const canOpen = /^https?:\/\//i.test(String(url || ''));

  return (
    <TouchableOpacity
      activeOpacity={canOpen ? 0.72 : 1}
      disabled={!canOpen}
      onPress={() => openUrl(url)}
      style={[styles.row, last && styles.lastRow]}>
      <View style={styles.iconBox}>
        <Feather name={icon} size={18} color={BookingColors.primary} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{displayValue(value)}</Text>
      </View>
      {canOpen ? (
        <View style={styles.openPill}>
          <Text style={styles.openText}>Open</Text>
          <Feather
            name="arrow-up-right"
            size={15}
            color={BookingColors.primary}
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function Section({title, children}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export default function AgentCompletedRecordScreen({navigation, route}) {
  const booking = useMemo(
    () => route?.params?.clientDetail || route?.params?.booking || {},
    [route?.params],
  );
  const completionPackage = booking?.completion_package || {};
  const journalEntry = booking?.journal_entry || {};
  const finalDocs = useMemo(() => getFinalDocs(booking), [booking]);
  const client = booking?.booked_by || booking?.booked_for || booking?.client;
  const agent = booking?.agent;
  const completedAt =
    completionPackage.completed_at ||
    journalEntry.completed_at ||
    booking?.updatedAt ||
    booking?.date_time_session;
  const completedDocumentCount =
    Number(journalEntry.document_count || finalDocs.length || 0) || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Completed record"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.badge}>
              <Feather
                name="check-circle"
                size={15}
                color={BookingColors.success}
              />
              <Text style={styles.badgeText}>Completed</Text>
            </View>
            <Text style={styles.reference}>
              #{getBookingDisplayId(booking)}
            </Text>
          </View>
          <Text style={styles.heroTitle}>
            {booking?.service_type === 'mobile_notary'
              ? 'Mobile notary'
              : 'Remote online notary'}
          </Text>
          <Text style={styles.heroMeta}>
            {completedAt
              ? `${formatBookingDate(completedAt)} at ${formatBookingTime(
                  completedAt,
                )}`
              : 'Completion time not available'}
          </Text>
        </View>

        <Section title="Documents">
          {finalDocs.length ? (
            finalDocs.map((url, index) => (
              <Row
                icon="file-text"
                key={url}
                label={
                  finalDocs.length > 1
                    ? `Final notarized PDF ${index + 1}`
                    : 'Final notarized PDF'
                }
                last={index === finalDocs.length - 1}
                url={url}
                value="Completed copy ready"
              />
            ))
          ) : (
            <Row
              icon="alert-circle"
              label="Final notarized PDF"
              last
              value="No final PDF has been saved yet."
            />
          )}
        </Section>

        <Section title="Seals and signing">
          <Row
            icon="pen-tool"
            label="eSign / digital signature"
            url={completionPackage.signature_url}
            value={
              completionPackage.signature_url
                ? 'Signature asset saved'
                : 'No signature asset saved'
            }
          />
          <Row
            icon="award"
            label="eSeal"
            url={completionPackage.eseal_url}
            value={
              completionPackage.eseal_url
                ? 'eSeal asset saved'
                : 'No eSeal asset saved'
            }
          />
          <Row
            icon="shield"
            label="Digital certificate"
            last
            url={completionPackage.digital_certificate_url}
            value={
              completionPackage.digital_certificate_url
                ? 'Certificate asset saved'
                : 'No digital certificate saved'
            }
          />
        </Section>

        <Section title="Audit">
          <Row
            icon="user"
            label="Client"
            value={getName(client) || client?.email || 'Notarizr client'}
          />
          <Row
            icon="briefcase"
            label="Notary"
            value={getName(agent) || 'Assigned notary'}
          />
          <Row
            icon="map-pin"
            label="Location"
            value={getBookingLocation(booking)}
          />
          <Row
            icon="book-open"
            label="Certificate wording"
            value={
              completionPackage.certificate_wording ||
              'Completed remote online notarization.'
            }
          />
          <Row
            icon="clipboard"
            label="Journal entry"
            value={`${completedDocumentCount} ${
              completedDocumentCount === 1 ? 'document' : 'documents'
            } • ${titleize(
              journalEntry.service_type || booking?.service_type || 'Service',
            )}`}
          />
          <Row
            icon="credit-card"
            label="Payment"
            last
            value={
              ['paid', 'succeeded', 'completed'].includes(
                String(booking?.payment_status || '').toLowerCase(),
              ) || booking?.is_paid
                ? 'Paid'
                : titleize(booking?.payment_status || 'Recorded')
            }
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  content: {paddingBottom: 28, backgroundColor: BookingColors.background},
  hero: {
    margin: 16,
    padding: 20,
    borderRadius: 8,
    backgroundColor: BookingColors.textPrimary,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: BookingColors.successSoft,
  },
  badgeText: {
    marginLeft: 6,
    color: BookingColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  reference: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  heroTitle: {
    marginTop: 18,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
  },
  heroMeta: {
    marginTop: 5,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  section: {marginTop: 18, paddingHorizontal: 20},
  sectionTitle: {
    marginBottom: 9,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  row: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    paddingVertical: 11,
    paddingRight: 14,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  lastRow: {borderBottomWidth: 0},
  iconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  rowCopy: {flex: 1, minWidth: 0, marginLeft: 11},
  rowLabel: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  rowValue: {
    marginTop: 2,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    lineHeight: 17,
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  openText: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
});
