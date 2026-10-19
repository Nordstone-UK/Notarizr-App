import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';

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
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{selected: active}}
            onPress={() => onChange(tab.value)}
            style={({pressed}) => [
              styles.tab,
              active && styles.activeTab,
              active && pressed && styles.pressedTab,
            ]}>
            {tab.icon ? (
              <Feather
                name={tab.icon}
                size={13}
                color={
                  active ? BookingColors.white : BookingColors.textSecondary
                }
                style={styles.icon}
              />
            ) : null}
            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
            {tab.unreadCount > 0 ? (
              <View
                accessibilityLabel={`${
                  tab.unreadCount
                } new ${tab.label.toLowerCase()} bookings`}
                style={[
                  styles.unreadBadge,
                  active && styles.activeUnreadBadge,
                ]}>
                <Text
                  style={[
                    styles.unreadBadgeText,
                    active && styles.activeUnreadBadgeText,
                  ]}>
                  {tab.unreadCount > 99 ? '99+' : tab.unreadCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
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
    backgroundColor: BookingColors.backgroundSubtle,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: BookingColors.primary,
  },
  pressedTab: {backgroundColor: BookingColors.primaryPressed},
  label: {
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  activeLabel: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
  },
  unreadBadge: {
    minWidth: 16,
    height: 16,
    marginLeft: 4,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#D92D20',
  },
  activeUnreadBadge: {backgroundColor: BookingColors.white},
  unreadBadgeText: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  activeUnreadBadgeText: {color: BookingColors.primary},
  icon: {
    marginRight: 5,
  },
});
