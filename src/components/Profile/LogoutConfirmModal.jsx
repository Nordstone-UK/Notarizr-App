import React from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ORANGE = '#FD6D1F';

export default function LogoutConfirmModal({
  visible,
  loading,
  onCancel,
  onLogout,
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <View style={styles.iconBox}>
            <Feather name="log-out" size={24} color={ORANGE} />
          </View>
          <Text style={styles.title}>Log out of Notarizr?</Text>
          <Text style={styles.message}>
            You will need to verify your phone number again to access your
            account.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.72}
              disabled={loading}
              onPress={onCancel}
              style={styles.cancelButton}>
              <Text style={styles.cancelLabel}>Stay signed in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.72}
              disabled={loading}
              onPress={onLogout}
              style={styles.logoutButton}>
              <Text style={styles.logoutLabel}>
                {loading ? 'Logging out...' : 'Log out'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(18, 24, 38, 0.48)',
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    padding: 22,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  iconBox: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  title: {
    marginTop: 18,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
  },
  message: {
    marginTop: 8,
    color: '#737A86',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D9DCE1',
    borderRadius: 8,
  },
  cancelLabel: {
    color: '#343A45',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  logoutButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: ORANGE,
  },
  logoutLabel: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
});
