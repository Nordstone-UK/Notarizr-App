import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const VARIANTS = {
  success: {
    icon: 'check',
    iconStyle: 'successIcon',
    iconBoxStyle: 'successIconBox',
  },
  error: {
    icon: 'x',
    iconStyle: 'errorIcon',
    iconBoxStyle: 'errorIconBox',
  },
  warning: {
    icon: 'alert-triangle',
    iconStyle: 'warningIcon',
    iconBoxStyle: 'warningIconBox',
  },
  info: {
    icon: 'info',
    iconStyle: 'infoIcon',
    iconBoxStyle: 'infoIconBox',
  },
};

function AppToast({text1, text2, variant = 'info', onPress}) {
  const appearance = VARIANTS[variant] || VARIANTS.info;

  return (
    <TouchableOpacity
      accessibilityRole="alert"
      activeOpacity={onPress ? 0.76 : 1}
      onPress={onPress}
      style={styles.toast}>
      <View style={[styles.iconBox, styles[appearance.iconBoxStyle]]}>
        <Feather
          name={appearance.icon}
          size={18}
          style={styles[appearance.iconStyle]}
        />
      </View>

      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {text1 || 'Notification'}
        </Text>
        {text2 ? (
          <Text numberOfLines={2} style={styles.message}>
            {text2}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        accessibilityLabel="Dismiss notification"
        activeOpacity={0.65}
        onPress={() => Toast.hide()}
        style={styles.closeButton}>
        <Feather name="x" size={17} color="#858B96" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const toastConfig = {
  success: props => <AppToast {...props} variant="success" />,
  error: props => <AppToast {...props} variant="error" />,
  warning: props => <AppToast {...props} variant="warning" />,
  info: props => <AppToast {...props} variant="info" />,
};

export default function CustomToast() {
  const insets = useSafeAreaInsets();

  return (
    <Toast
      autoHide
      config={toastConfig}
      position="top"
      topOffset={insets.top + 10}
      visibilityTime={3600}
    />
  );
}

const styles = StyleSheet.create({
  toast: {
    width: '91%',
    maxWidth: 420,
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingLeft: 12,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#E6E8EC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#121826',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 7,
  },
  iconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  successIconBox: {
    backgroundColor: '#EAF8F0',
  },
  errorIconBox: {
    backgroundColor: '#FFF0F0',
  },
  warningIconBox: {
    backgroundColor: '#FFF5E8',
  },
  infoIconBox: {
    backgroundColor: '#EAF3FC',
  },
  successIcon: {
    color: '#14804A',
  },
  errorIcon: {
    color: '#D64545',
  },
  warningIcon: {
    color: '#D97706',
  },
  infoIcon: {
    color: '#2970B8',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  title: {
    color: '#171C26',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  message: {
    marginTop: 2,
    color: '#737A86',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
