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

const STATUS_CONFIG = {
  accepted: {
    background: '#EAF7EF',
    color: '#168A52',
    icon: 'check-circle',
    label: 'Accepted',
  },
  pending: {
    background: '#FFF5DC',
    color: '#A86900',
    icon: 'clock',
    label: 'Pending',
  },
  completed: {
    background: '#EAF2FC',
    color: '#2571B9',
    icon: 'check-circle',
    label: 'Completed',
  },
  rejected: {
    background: '#FCEEEE',
    color: '#C44242',
    icon: 'x-circle',
    label: 'Cancelled',
  },
};

function DetailRow({icon, label, value, last}) {
  return (
    <View style={[styles.detailRow, last && styles.lastDetailRow]}>
      <View style={styles.detailIcon}>
        <Feather name={icon} size={17} color="#FD6D1F" />
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
  const price = Number(booking.price || booking.totalPrice || 0).toFixed(2);
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Feather name="arrow-left" size={21} color="#171D29" />
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
              <Feather name="user" size={27} color="#A86900" />
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
              color={booking.unassigned ? '#A86900' : '#168A52'}
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

        <Section title="Request details">
          <DetailRow
            icon="file-text"
            label="Document"
            value={booking.document_type || 'Notary document'}
          />
          <DetailRow
            icon="info"
            label="Instructions"
            last
            value={booking.notes || 'No additional instructions provided.'}
          />
        </Section>

        <Section title="Payment summary">
          <View style={styles.paymentRow}>
            <View>
              <Text style={styles.paymentLabel}>{paymentLabel}</Text>
              <Text style={styles.paymentMethod}>Notarizr secure payment</Text>
            </View>
            <Text style={styles.price}>${price}</Text>
          </View>
        </Section>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handlePrimaryAction}
          style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          <Feather name="arrow-right" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  headerTitle: {
    color: '#151B27',
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
  },
  headerSubtitle: {
    marginTop: 1,
    color: '#8D939D',
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
    backgroundColor: '#F7F8FA',
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF0F3',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: '#FFF5DC',
  },
  providerCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  service: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  agentName: {
    marginTop: 2,
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  agentRole: {
    marginTop: 2,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  verifiedIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#EAF7EF',
  },
  pendingIcon: {
    backgroundColor: '#FFF5DC',
  },
  section: {
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 8,
    color: '#8A919C',
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
    borderBottomColor: '#EEF0F2',
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
    backgroundColor: '#FFF0E7',
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    paddingVertical: 10,
  },
  detailLabel: {
    color: '#969CA6',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  detailValue: {
    marginTop: 2,
    color: '#252B37',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    lineHeight: 17,
  },
  paymentRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentLabel: {
    color: '#252B37',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
  },
  paymentMethod: {
    marginTop: 3,
    color: '#969CA6',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  price: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
  },
  actionBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E4E7EB',
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    height: 50,
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
    fontSize: 14,
  },
});
