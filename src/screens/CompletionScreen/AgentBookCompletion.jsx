import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';

const formatAmount = value => {
  const amount = Number(value || 0);
  return amount > 0 ? `$${amount.toFixed(2)}` : 'Paid';
};

export default function AgentBookCompletion({navigation, route}) {
  const booking = route?.params?.bookingData;
  const paymentSuccessful = Boolean(route?.params?.paymentSuccessful);
  const [actionsReady, setActionsReady] = useState(!paymentSuccessful);
  const isMobile = booking?.service_type === 'mobile_notary';
  const reference = String(booking?._id || 'Booking')
    .slice(-8)
    .toUpperCase();
  const serviceName = isMobile ? 'Mobile notary' : 'Remote online notary';

  const viewBooking = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'MedicalBookingScreen'}],
    });
  };

  const joinSession = () => {
    navigation.replace('AuthenticationScreen', {
      uid: booking?._id,
      channel: booking?.agora_channel_name,
      token: booking?.agora_channel_token,
      time: booking?.time_of_booking,
      date: booking?.date_of_booking,
      routeFrom: 'client',
    });
  };

  useEffect(() => {
    if (paymentSuccessful) {
      return undefined;
    }

    const timer = setTimeout(viewBooking, 5000);
    return () => clearTimeout(timer);
    // This legacy state retains its original timed return behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentSuccessful]);

  useEffect(() => {
    if (!paymentSuccessful) {
      return undefined;
    }

    const timer = setTimeout(() => setActionsReady(true), 800);
    return () => clearTimeout(timer);
  }, [paymentSuccessful]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={BookingColors.surface}
        barStyle="dark-content"
      />
      <View style={styles.content}>
        <View style={styles.successIconOuter}>
          <View style={styles.successIconInner}>
            <Feather
              color={BookingColors.white}
              name="check"
              size={38}
            />
          </View>
        </View>

        <Text style={styles.eyebrow}>
          {paymentSuccessful ? 'PAYMENT CONFIRMED' : 'BOOKING CONFIRMED'}
        </Text>
        <Text style={styles.title}>
          {paymentSuccessful ? 'Payment successful' : 'Your notary is booked'}
        </Text>
        <Text style={styles.subtitle}>
          {paymentSuccessful
            ? `Your ${serviceName.toLowerCase()} appointment is confirmed and ready.`
            : 'Your appointment details are ready to review.'}
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Feather
                color={BookingColors.primary}
                name={isMobile ? 'map-pin' : 'video'}
                size={18}
              />
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryLabel}>Appointment</Text>
              <Text style={styles.summaryValue}>{serviceName}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Feather
                color={BookingColors.success}
                name="credit-card"
                size={18}
              />
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryLabel}>Amount paid</Text>
              <Text style={styles.summaryValue}>
                {formatAmount(booking?.totalPrice ?? booking?.price)}
              </Text>
            </View>
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>Paid</Text>
            </View>
          </View>
        </View>

        <View style={styles.referenceRow}>
          <Feather
            color={BookingColors.textMuted}
            name="shield"
            size={15}
          />
          <Text style={styles.referenceText}>Booking #{reference}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={actionsReady ? 0.78 : 1}
          disabled={!actionsReady}
          onPress={isMobile ? viewBooking : joinSession}
          style={[
            styles.primaryButton,
            !actionsReady && styles.primaryButtonLocked,
          ]}>
          <Text style={styles.primaryButtonText}>
            {isMobile ? 'View confirmed booking' : 'Join session'}
          </Text>
          <Feather
            color={BookingColors.white}
            name={isMobile ? 'arrow-right' : 'video'}
            size={18}
          />
        </TouchableOpacity>
        {!isMobile ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.72}
            onPress={viewBooking}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              View booking details
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  successIconOuter: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 52,
    backgroundColor: BookingColors.successSoft,
  },
  successIconInner: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    backgroundColor: BookingColors.success,
  },
  eyebrow: {
    marginTop: 28,
    color: BookingColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  title: {
    marginTop: 8,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 28,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 330,
    marginTop: 9,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    marginTop: 34,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  summaryRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  summaryCopy: {flex: 1, minWidth: 0, marginLeft: 12},
  summaryLabel: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  summaryValue: {
    marginTop: 3,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  divider: {height: 1, backgroundColor: BookingColors.border},
  paidBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: BookingColors.successSoft,
  },
  paidBadgeText: {
    color: BookingColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  referenceText: {
    marginLeft: 7,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
  },
  primaryButton: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primary,
  },
  primaryButtonText: {
    marginRight: 8,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  primaryButtonLocked: {opacity: 0.72},
  secondaryButton: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
});
