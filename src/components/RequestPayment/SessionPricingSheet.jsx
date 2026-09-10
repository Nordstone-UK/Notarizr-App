import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AppColors from '../../themes/AppColors';
import PricingBreakdown from '../BookingFlow/PricingBreakdown';

// Client-side-only replacement for the old flat "type an amount" request-payment sheet.
// "Notarizr pricing" computes a live itemized quote via calculatePriceR (seal/signer/witness
// rates); "Set my own price" is a plain manual entry. Either way, only the final numeric total
// gets submitted — through the existing, unmodified updateSessionR(price: Float) mutation, same
// as before. No backend changes; the itemized breakdown is purely a client-side aid for landing
// on that number.
function Stepper({label, value, onChange, hint}) {
  const clamp = n => Math.max(0, Math.min(20, n));
  return (
    <View style={styles.stepperRow}>
      <View style={styles.stepperCopy}>
        <Text style={styles.stepperLabel}>{label}</Text>
        {hint ? <Text style={styles.stepperHint}>{hint}</Text> : null}
      </View>
      <View style={styles.stepperControl}>
        <TouchableOpacity
          accessibilityLabel={`Decrease ${label}`}
          onPress={() => onChange(clamp(value - 1))}
          style={styles.stepperButton}>
          <Feather name="minus" size={14} color={AppColors.primary} />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}</Text>
        <TouchableOpacity
          accessibilityLabel={`Increase ${label}`}
          onPress={() => onChange(clamp(value + 1))}
          style={styles.stepperButton}>
          <Feather name="plus" size={14} color={AppColors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SessionPricingSheet({
  additionalSeals = 0,
  additionalSigners = 0,
  customPrice = '',
  isCustom = false,
  onChangeAdditionalSeals,
  onChangeAdditionalSigners,
  onChangeCustomPrice,
  onChangeIsCustom,
  onChangePlatformWitnesses,
  onSubmit,
  platformWitnesses = 0,
  quote,
  quoteLoading = false,
  submitting = false,
}) {
  const canSubmit = isCustom
    ? Number(customPrice) > 0
    : !quoteLoading && Boolean(quote);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set the price for this session</Text>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => onChangeIsCustom(false)}
          style={[styles.toggleButton, !isCustom && styles.toggleButtonActive]}>
          <Text
            style={[styles.toggleText, !isCustom && styles.toggleTextActive]}>
            Notarizr pricing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChangeIsCustom(true)}
          style={[styles.toggleButton, isCustom && styles.toggleButtonActive]}>
          <Text
            style={[styles.toggleText, isCustom && styles.toggleTextActive]}>
            Set my own price
          </Text>
        </TouchableOpacity>
      </View>

      {isCustom ? (
        <View style={styles.customInputWrap}>
          <Text style={styles.customInputPrefix}>$</Text>
          <TextInput
            keyboardType="numeric"
            onChangeText={onChangeCustomPrice}
            placeholder="Enter amount"
            placeholderTextColor={AppColors.textMuted}
            style={styles.customInput}
            value={customPrice != null ? String(customPrice) : ''}
          />
        </View>
      ) : (
        <>
          <Stepper
            label="Additional seals"
            onChange={onChangeAdditionalSeals}
            value={additionalSeals}
          />
          <Stepper
            label="Additional signers"
            onChange={onChangeAdditionalSigners}
            value={additionalSigners}
          />
          <Stepper
            hint="Notarizr provides one for the client"
            label="Notarizr-provided witnesses"
            onChange={onChangePlatformWitnesses}
            value={platformWitnesses}
          />
          <PricingBreakdown
            breakdown={quote}
            initiallyExpanded
            style={styles.breakdown}
          />
          {quoteLoading ? (
            <Text style={styles.quoteStatus}>Updating price…</Text>
          ) : null}
        </>
      )}

      <TouchableOpacity
        disabled={!canSubmit || submitting}
        onPress={onSubmit}
        style={[
          styles.submitButton,
          (!canSubmit || submitting) && styles.submitButtonDisabled,
        ]}>
        <Text style={styles.submitText}>
          {submitting ? 'Sending…' : 'Send Request'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  breakdown: {marginHorizontal: 0, marginTop: 12},
  container: {flex: 1, paddingHorizontal: 20, paddingTop: 4},
  customInput: {
    flex: 1,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 18,
  },
  customInputPrefix: {
    marginRight: 4,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 18,
  },
  customInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 10,
  },
  quoteStatus: {
    marginTop: 6,
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  stepperButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 6,
    backgroundColor: AppColors.surface,
  },
  stepperControl: {flexDirection: 'row', alignItems: 'center', gap: 10},
  stepperCopy: {flex: 1, minWidth: 0, marginRight: 10},
  stepperHint: {
    marginTop: 1,
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  stepperLabel: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  stepperValue: {
    minWidth: 18,
    textAlign: 'center',
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  submitButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: AppColors.primary,
  },
  submitButtonDisabled: {opacity: 0.5},
  submitText: {
    color: '#fff',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  title: {
    marginTop: 6,
    marginBottom: 14,
    textAlign: 'center',
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 8,
  },
  toggleButtonActive: {backgroundColor: AppColors.surface},
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 3,
    borderRadius: 10,
    backgroundColor: AppColors.primarySoft,
  },
  toggleText: {
    color: AppColors.primary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
  },
  toggleTextActive: {color: AppColors.textPrimary},
});
