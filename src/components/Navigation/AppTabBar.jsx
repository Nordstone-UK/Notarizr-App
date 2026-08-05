import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

const TAB_CONFIG = {
  Home: {label: 'Home', icon: 'home'},
  AllBookingScreen: {label: 'Bookings', icon: 'calendar'},
  BookScreen: {label: 'Completed', icon: 'check-circle'},
  ChatContactScreen: {label: 'Messages', icon: 'message-circle'},
  ProfileInfoScreen: {label: 'Profile', icon: 'user'},
};

export default function AppTabBar({state, descriptors, navigation}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, {paddingBottom: Math.max(insets.bottom, 8)}]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const config = TAB_CONFIG[route.name] || {
          label: route.name,
          icon: 'circle',
        };
        const options = descriptors[route.key].options;

        const handlePress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            activeOpacity={0.72}
            onPress={handlePress}
            style={styles.tab}>
            <View style={[styles.iconBox, focused && styles.focusedIconBox]}>
              <Feather
                name={config.icon}
                size={20}
                color={focused ? '#FD6D1F' : '#7A818D'}
              />
            </View>
            <Text style={[styles.label, focused && styles.focusedLabel]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 36,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  focusedIconBox: {
    backgroundColor: '#FFF0E7',
  },
  label: {
    marginTop: 3,
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  focusedLabel: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
  },
});
