import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const DEFAULT_TABS = [
  {label: 'Accepted', value: 'accepted'},
  {label: 'Pending', value: 'pending'},
  {label: 'Completed', value: 'completed'},
  {label: 'Cancelled', value: 'rejected'},
];

export default function BookingStatusTabs({
  activeStatus,
  onChange,
  tabs = DEFAULT_TABS,
}) {
  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const active = tab.value === activeStatus;

        return (
          <TouchableOpacity
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{selected: active}}
            activeOpacity={0.72}
            onPress={() => onChange(tab.value)}
            style={[styles.tab, active && styles.activeTab]}>
            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 42,
    flexDirection: 'row',
    padding: 3,
    borderRadius: 8,
    backgroundColor: '#F0F2F4',
  },
  tab: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FD6D1F',
  },
  label: {
    color: '#737B87',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
  },
});
