import React, {useEffect, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import ScreenHeader from '../../components/Navigation/ScreenHeader';
import SavedAddressRow from '../../components/Profile/SavedAddressRow';
import {saveUserInfo} from '../../features/user/userSlice';
import useFetchUser from '../../hooks/useFetchUser';
import AppColors from '../../themes/AppColors';

export default function AddressDetails({navigation}) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const {fetchUserInfo, handleDeleteAddress} = useFetchUser();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const previewMode = Boolean(user?.isHomePreview);

  useEffect(() => {
    setAddresses(user?.addresses || []);
  }, [user?.addresses]);

  useEffect(() => {
    if (previewMode) {
      return undefined;
    }
    return navigation.addListener('focus', fetchUserInfo);
  }, [fetchUserInfo, navigation, previewMode]);

  const openAddress = address => {
    navigation.navigate('CurrentLocationScreen', {
      address,
      directSave: true,
    });
  };

  const addAddress = () => {
    navigation.navigate('CurrentLocationScreen', {directSave: true});
  };

  const deleteAddress = async address => {
    if (previewMode) {
      const next = addresses.filter(item => item._id !== address._id);
      setAddresses(next);
      dispatch(saveUserInfo({...user, addresses: next}));
      Toast.show({type: 'success', text1: 'Address removed'});
      return;
    }

    const updated = await handleDeleteAddress(address._id);
    if (updated?.deleteUserAddressR?.status === '200') {
      await fetchUserInfo();
      Toast.show({type: 'success', text1: 'Address removed'});
    } else {
      Toast.show({type: 'error', text1: 'Unable to remove address'});
    }
  };

  const confirmDelete = address => {
    Alert.alert(
      'Remove saved address?',
      `Delete ${address.label || 'this address'} from your account?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteAddress(address),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />
      <ScreenHeader
        fallback="HomeScreen"
        fallbackParams={{screen: 'ProfileInfoScreen'}}
        navigation={navigation}
        subtitle={`${addresses.length} saved location${
          addresses.length === 1 ? '' : 's'
        }`}
        title="Saved addresses"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.introGlow} />
          <View style={styles.introIcon}>
            <Feather name="map" size={22} color={AppColors.white} />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.introEyebrow}>YOUR PLACES</Text>
            <Text style={styles.introTitle}>Book faster next time</Text>
            <Text style={styles.introText}>
              Keep your most-used service locations ready to select.
            </Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countValue}>{addresses.length}</Text>
            <Text style={styles.countLabel}>SAVED</Text>
          </View>
        </View>
        {addresses.length ? (
          <View style={styles.list}>
            {addresses.map((address, index) => (
              <SavedAddressRow
                address={{
                  ...address,
                  label:
                    address.label ||
                    `${address.tag || 'Saved address'}`.replace(/^./, value =>
                      value.toUpperCase(),
                    ),
                  primary: address.primary ?? index === 0,
                }}
                key={address._id || index}
                last={index === addresses.length - 1}
                onDelete={() => confirmDelete(address)}
                onEdit={() => openAddress(address)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="navigation" size={25} color={AppColors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyText}>
              Add a home or work address to book mobile services faster.
            </Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <AuthPrimaryButton
          icon="arrow-right"
          onPress={addAddress}
          style={styles.addButton}
          title="Add new address"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    height: 54,
    marginTop: 0,
  },
  content: {
    flexGrow: 1,
    backgroundColor: AppColors.background,
    paddingBottom: 24,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 42,
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 35,
    paddingBottom: 40,
    paddingTop: 40,
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    textAlign: 'center',
  },
  emptyTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    marginTop: 15,
  },
  footer: {
    backgroundColor: AppColors.white,
    borderTopColor: AppColors.border,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  intro: {
    alignItems: 'center',
    backgroundColor: AppColors.textPrimary,
    flexDirection: 'row',
    margin: 16,
    overflow: 'hidden',
    padding: 16,
    borderRadius: 8,
  },
  introCopy: {flex: 1, marginHorizontal: 12},
  introEyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 8,
    letterSpacing: 0.9,
  },
  introGlow: {
    backgroundColor: 'rgba(253,109,31,0.15)',
    borderRadius: 60,
    height: 120,
    position: 'absolute',
    right: -45,
    top: -50,
    width: 120,
  },
  introIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  introText: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  introTitle: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  countLabel: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Bold',
    fontSize: 7,
    marginTop: 1,
  },
  countPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  countValue: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  list: {
    marginHorizontal: 16,
  },
  safeArea: {
    backgroundColor: AppColors.white,
    flex: 1,
  },
});
