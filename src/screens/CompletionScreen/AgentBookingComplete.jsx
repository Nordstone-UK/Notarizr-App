import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LottieView from 'lottie-react-native';
import BookingActionButton from '../../components/Bookings/BookingActionButton';
import BookingColors from '../../themes/BookingColors';

export default function AgentBookingComplete({navigation}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <LottieView
        autoPlay
        loop={false}
        pointerEvents="none"
        resizeMode="cover"
        source={require('../../../assets/confetti.json')}
        style={styles.confetti}
      />
      <View style={styles.content}>
        <View style={styles.successMark}>
          <View style={styles.successInner}>
            <Feather name="check" size={34} color={BookingColors.white} />
          </View>
        </View>
        <Text style={styles.eyebrow}>BOOKING COMPLETE</Text>
        <Text style={styles.title}>Excellent work</Text>
        <Text style={styles.message}>
          The notarization has been completed and the booking record is ready
          for review.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Feather name="file-text" size={19} color={BookingColors.primary} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Record saved securely</Text>
            <Text style={styles.summaryText}>
              Documents and service details remain available in Completed.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <BookingActionButton
          icon="arrow-right"
          label="View completed bookings"
          onPress={() =>
            navigation.navigate('HomeScreen', {screen: 'BookScreen'})
          }
          style={styles.primaryButton}
        />
        <TouchableOpacity
          activeOpacity={0.72}
          onPress={() => navigation.navigate('HomeScreen', {screen: 'Home'})}
          style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Back to dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  confetti: {...StyleSheet.absoluteFillObject},
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  successMark: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 52,
    backgroundColor: BookingColors.successSoft,
  },
  successInner: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    backgroundColor: BookingColors.success,
  },
  eyebrow: {
    marginTop: 24,
    color: BookingColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 1,
  },
  title: {
    marginTop: 6,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 26,
  },
  message: {
    maxWidth: 310,
    marginTop: 8,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    padding: 14,
    borderWidth: 1,
    borderColor: BookingColors.textPrimary,
    borderRadius: 8,
    backgroundColor: BookingColors.textPrimary,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  summaryCopy: {flex: 1, minWidth: 0, marginLeft: 12},
  summaryTitle: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  summaryText: {
    marginTop: 3,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    lineHeight: 14,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
  },
  primaryButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  secondaryButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  secondaryText: {
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
});
