import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AppColors from '../../themes/AppColors';

const formatPrice = value => `$${Number(value || 0).toFixed(2)}`;

function CostRow({icon, label, last, subtitle, value}) {
  return (
    <View style={[styles.costRow, last && styles.costRowLast]}>
      <View style={styles.costIcon}>
        <Feather name={icon} size={16} color={AppColors.textSecondary} />
      </View>
      <View style={styles.costCopy}>
        <Text style={styles.costLabel}>{label}</Text>
        <Text style={styles.costSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.costValue}>{formatPrice(value)}</Text>
    </View>
  );
}

export default function PricingBreakdown({
  additionalSignatureCount = 0,
  additionalSignatures = 0,
  documentCharge = 0,
  documentCount = 0,
  documentLabel = 'Notary document',
  initiallyExpanded = false,
  printingCharge = 0,
  printingCopies = 0,
  serviceLabel = 'Notary service',
  style,
  total = 0,
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const serviceCharge = Math.max(
    0,
    Number(total || 0) -
      Number(documentCharge || 0) -
      Number(additionalSignatures || 0) -
      Number(printingCharge || 0),
  );
  const rows = useMemo(() => {
    const costRows = [];
    if (Number(documentCharge) > 0) {
      const count = documentCount || Math.round(Number(documentCharge) / 99.99);
      costRows.push({
        icon: 'file-text',
        label: documentLabel || 'Notarized documents',
        subtitle:
          count > 0
            ? `${count} ${count === 1 ? 'document' : 'documents'} × $99.99`
            : 'Notarization fee',
        value: documentCharge,
      });
    }

    if (serviceCharge > 0) {
      costRows.push({
        icon: 'briefcase',
        label: serviceLabel,
        subtitle: 'Professional notary service',
        value: serviceCharge,
      });
    }
    if (Number(additionalSignatures) > 0) {
      costRows.push({
        icon: 'edit-3',
        label: 'Additional signatures',
        subtitle: `${
          additionalSignatureCount || Number(additionalSignatures) / 10
        } × $10.00`,
        value: additionalSignatures,
      });
    }
    if (Number(printingCharge) > 0) {
      costRows.push({
        icon: 'printer',
        label: 'Document printing',
        subtitle: printingCopies
          ? `${printingCopies} ${printingCopies === 1 ? 'copy' : 'copies'}`
          : 'Printed copies for your appointment',
        value: printingCharge,
      });
    }
    return costRows;
  }, [
    additionalSignatures,
    additionalSignatureCount,
    documentCharge,
    documentCount,
    documentLabel,
    printingCharge,
    printingCopies,
    serviceCharge,
    serviceLabel,
  ]);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        accessibilityHint="Shows or hides the itemized booking costs"
        accessibilityLabel="Estimated price breakdown"
        accessibilityRole="button"
        activeOpacity={0.72}
        onPress={() => setExpanded(current => !current)}
        style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Text style={styles.currencyIcon}>$</Text>
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.eyebrow}>Estimated total</Text>
          <Text style={styles.total}>{formatPrice(total)}</Text>
        </View>
        <View style={styles.expandButton}>
          <Text style={styles.expandText}>{expanded ? 'Hide' : 'Details'}</Text>
          <Feather
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={17}
            color={AppColors.primary}
          />
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Cost breakdown</Text>
          {rows.map((row, index) => (
            <CostRow
              {...row}
              key={`${row.label}-${index}`}
              last={index === rows.length - 1}
            />
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  breakdown: {
    borderTopColor: AppColors.border,
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  breakdownTitle: {
    marginBottom: 6,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  container: {
    overflow: 'hidden',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  costCopy: {flex: 1, minWidth: 0, marginLeft: 10},
  costIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 7,
    backgroundColor: AppColors.surface,
  },
  costLabel: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  costRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  costRowLast: {borderBottomWidth: 0},
  costSubtitle: {
    marginTop: 1,
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  costValue: {
    marginLeft: 10,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  currencyIcon: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Regular',
    fontSize: 25,
  },
  expandButton: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: AppColors.primarySoft,
  },
  expandText: {
    marginRight: 4,
    color: AppColors.primary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  eyebrow: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  summary: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  summaryCopy: {flex: 1, minWidth: 0, marginLeft: 11},
  summaryIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  total: {
    marginTop: 2,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  totalLabel: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  totalRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -14,
    paddingHorizontal: 14,
    backgroundColor: AppColors.primarySoft,
  },
  totalValue: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
});
