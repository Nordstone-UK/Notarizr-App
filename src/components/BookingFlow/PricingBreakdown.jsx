import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const formatPrice = value => `$${Number(value || 0).toFixed(2)}`;

function CostRow({label, value}) {
  return (
    <View style={styles.costRow}>
      <Text style={styles.costLabel}>{label}</Text>
      <Text style={styles.costValue}>{formatPrice(value)}</Text>
    </View>
  );
}

export default function PricingBreakdown({
  additionalSignatures = 0,
  documentCharge = 0,
  printingCharge = 0,
  style,
  total = 0,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        accessibilityHint="Shows or hides the itemized booking costs"
        accessibilityLabel="Estimated price breakdown"
        accessibilityRole="button"
        activeOpacity={0.72}
        onPress={() => setExpanded(current => !current)}
        style={styles.summary}>
        <View>
          <Text style={styles.eyebrow}>TOTAL ESTIMATED PRICE</Text>
          <Text style={styles.total}>{formatPrice(total)}</Text>
        </View>
        <View style={styles.expandButton}>
          <Feather
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#D65322"
          />
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.breakdown}>
          <CostRow label="Document charge" value={documentCharge} />
          <CostRow label="Additional signatures" value={additionalSignatures} />
          <CostRow label="Document printing" value={printingCharge} />
          <View style={styles.divider} />
          <CostRow label="Estimated total" value={total} />
        </View>
      ) : (
        <Text style={styles.prompt}>Tap the arrow for the full breakdown</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  breakdown: {
    borderTopColor: '#E8EAED',
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E3E7',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  costLabel: {
    color: '#737B87',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  costRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 31,
  },
  costValue: {
    color: '#202632',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  divider: {backgroundColor: '#E8EAED', height: 1, marginVertical: 5},
  expandButton: {
    alignItems: 'center',
    backgroundColor: '#FFF0E7',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  eyebrow: {
    color: '#8A919C',
    fontFamily: 'Manrope-Bold',
    fontSize: 8,
    letterSpacing: 0.7,
  },
  prompt: {
    color: '#9298A2',
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
    paddingBottom: 12,
    paddingHorizontal: 14,
  },
  summary: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 82,
    paddingHorizontal: 14,
  },
  total: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
    marginTop: 3,
  },
});
