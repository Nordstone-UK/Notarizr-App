import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AppColors from '../../themes/AppColors';

// UI only for now — mirrors the "Agent payouts" table from the Notarizr pricing doc.
// Payouts are set by Notarizr (state, document and session type all factor in), so this is a
// reference screen rather than an editable one. Swap in a live query once payouts move server-side.
const PAYOUTS = [
  {
    id: 'standard_call',
    title: 'Notarizer-generated standard call',
    description: 'Open Call session matched to you by Notarizr',
    icon: 'phone-call',
    payout: '$10',
  },
  {
    id: 'invited_session',
    title: 'Agent-invited standard session',
    description: 'You invite the client directly',
    icon: 'user-plus',
    payout: '$18–$20',
  },
  {
    id: 'additional_seal',
    title: 'Additional seal',
    description: 'Per extra notarial act on a document',
    icon: 'award',
    payout: '$4',
  },
  {
    id: 'provided_witness',
    title: 'Notarizer-provided witness',
    description: 'Per witness Notarizr supplies for a signing',
    icon: 'users',
    payout: '$5',
  },
  {
    id: 'generated_closing',
    title: 'Notarizer-generated closing',
    description: 'Open Call loan signing matched to you by Notarizr',
    icon: 'file-text',
    payout: '$30–$50',
  },
  {
    id: 'invited_closing',
    title: 'Agent-invited $150 closing',
    description: 'You invite the client for a $150 closing package',
    icon: 'briefcase',
    payout: '$120–$125',
  },
];

function PayoutRow({description, icon, last, payout, title}) {
  return (
    <View style={[styles.payoutRow, last && styles.lastPayoutRow]}>
      <View style={styles.payoutIcon}>
        <Feather name={icon} size={16} color={AppColors.primary} />
      </View>
      <View style={styles.payoutCopy}>
        <Text style={styles.payoutTitle}>{title}</Text>
        <Text style={styles.payoutDescription}>{description}</Text>
      </View>
      <View style={styles.payoutPill}>
        <Text style={styles.payoutPillText}>{payout}</Text>
      </View>
    </View>
  );
}

export default function AgentPricingScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={AppColors.textPrimary}
      />
      <View style={styles.header}>
        <View style={styles.headerGlow} />
        <View style={styles.headerToolbar}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            activeOpacity={0.72}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={AppColors.white} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>EARNINGS</Text>
            <Text style={styles.title}>Payouts</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          What you earn across every payment type — Open Calls, invited
          sessions, add-ons and closings.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionEyebrow}>AGENT PAYOUTS</Text>
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeaderLabel}>Session / item</Text>
            <Text style={styles.tableHeaderValue}>Suggested payout</Text>
          </View>
          {PAYOUTS.map((row, index) => (
            <PayoutRow
              description={row.description}
              icon={row.icon}
              key={row.id}
              last={index === PAYOUTS.length - 1}
              payout={row.payout}
              title={row.title}
            />
          ))}
        </View>

        <View style={styles.infoNote}>
          <Feather name="info" size={16} color={AppColors.info} />
          <Text style={styles.infoNoteText}>
            These are starting figures, not a guaranteed payout schedule. Actual
            payouts can vary by state, document and customer source.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  content: {
    backgroundColor: AppColors.background,
    flexGrow: 1,
    padding: 16,
    paddingBottom: 30,
  },
  eyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 1,
  },
  header: {
    backgroundColor: AppColors.textPrimary,
    overflow: 'hidden',
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerCopy: {alignItems: 'center', flex: 1, marginHorizontal: 10},
  headerGlow: {
    backgroundColor: 'rgba(253,109,31,0.15)',
    borderRadius: 70,
    height: 140,
    position: 'absolute',
    right: -35,
    top: -75,
    width: 140,
  },
  headerSpacer: {height: 40, width: 40},
  headerSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 14,
    textAlign: 'center',
  },
  headerToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoNote: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: '#CFE0F3',
    borderRadius: 8,
    backgroundColor: AppColors.infoSoft,
  },
  infoNoteText: {
    flex: 1,
    marginLeft: 10,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  lastPayoutRow: {borderBottomWidth: 0},
  payoutCopy: {flex: 1, marginHorizontal: 10, minWidth: 0},
  payoutDescription: {
    marginTop: 2,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    lineHeight: 13,
  },
  payoutIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  payoutPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: AppColors.successSoft,
  },
  payoutPillText: {
    color: AppColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  payoutRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  payoutTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11.5,
  },
  safeArea: {backgroundColor: AppColors.textPrimary, flex: 1},
  sectionEyebrow: {
    marginBottom: 9,
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  tableCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.white,
  },
  tableHeaderLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: AppColors.textPrimary,
  },
  tableHeaderValue: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  title: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    marginTop: 1,
  },
});
