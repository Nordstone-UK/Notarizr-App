import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import ProfileScreenHeader from '../../../components/Profile/ProfileScreenHeader';
import {useSession} from '../../../hooks/useSession';
import BookingColors from '../../../themes/BookingColors';

const ID_OPTIONS = [
  {
    value: 'client_choose',
    icon: 'sliders',
    label: 'Let client choose',
    description: 'The client selects an accepted ID before the session.',
  },
  {
    value: 'user_id',
    icon: 'credit-card',
    label: 'Government ID',
    description: "Driver's licence or government identity card.",
  },
  {
    value: 'user_passport',
    icon: 'book-open',
    label: 'Passport',
    description: 'Photo and personal details page.',
  },
];

const observerEmail = observer => {
  if (typeof observer === 'string') {
    return observer;
  }
  return observer?.email || observer?.value || '';
};

const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function AgentManageBookingScreen({navigation, route}) {
  const booking = route?.params?.clientDetail;
  const {handleAddObservers, handleSessionUpdation} = useSession();
  const initialObservers = useMemo(
    () =>
      (Array.isArray(booking?.observers) ? booking.observers : [])
        .map(observerEmail)
        .filter(Boolean),
    [booking?.observers],
  );
  const [observers, setObservers] = useState(initialObservers);
  const [email, setEmail] = useState('');
  const [identity, setIdentity] = useState(
    booking?.identity_authentication || 'client_choose',
  );
  const [saving, setSaving] = useState(false);

  const addObserver = () => {
    const normalized = email.trim().toLowerCase();
    if (!isEmail(normalized)) {
      Toast.show({
        type: 'error',
        text1: 'Enter a valid email address',
      });
      return;
    }
    if (observers.includes(normalized)) {
      Toast.show({type: 'info', text1: 'Observer already added'});
      return;
    }
    setObservers(current => [...current, normalized]);
    setEmail('');
  };

  const save = async () => {
    if (!booking?._id) {
      Toast.show({type: 'error', text1: 'Booking is unavailable'});
      return;
    }

    setSaving(true);
    try {
      if (booking?.__typename === 'Session') {
        const result = await handleSessionUpdation({
          sessionId: booking._id,
          identityAuthentication: identity,
          observers,
          paymentType: booking?.payment_type || 'on_notarizr',
        });
        const status = String(result?.status || '').toLowerCase();
        if (!result?.session && status !== '200' && status !== 'success') {
          throw new Error(result?.message || 'Session update failed');
        }
      } else {
        const addedObservers = observers.filter(
          observer => !initialObservers.includes(observer),
        );
        if (addedObservers.length) {
          const result = await handleAddObservers(booking._id, addedObservers);
          const status = String(result?.status || '').toLowerCase();
          if (status && status !== '200' && status !== 'success') {
            throw new Error(result?.message || 'Observer update failed');
          }
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Booking preferences saved',
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Preferences not saved',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Manage booking"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>SESSION SETUP</Text>
          <Text style={styles.title}>Prepare the appointment</Text>
          <Text style={styles.subtitle}>
            Invite observers and choose how the client will verify their
            identity.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <Feather name="users" size={18} color={BookingColors.primary} />
            </View>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Add observers</Text>
              <Text style={styles.sectionSubtitle}>
                Observers receive an invitation to attend the session.
              </Text>
            </View>
          </View>
          <View style={styles.emailRow}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              onSubmitEditing={addObserver}
              placeholder="observer@example.com"
              placeholderTextColor={BookingColors.textMuted}
              returnKeyType="done"
              style={styles.input}
              value={email}
            />
            <TouchableOpacity
              accessibilityLabel="Add observer"
              activeOpacity={0.75}
              onPress={addObserver}
              style={styles.addButton}>
              <Feather name="plus" size={20} color={BookingColors.white} />
            </TouchableOpacity>
          </View>
          {observers.length ? (
            <View style={styles.chips}>
              {observers.map(observer => (
                <View key={observer} style={styles.chip}>
                  <Text numberOfLines={1} style={styles.chipText}>
                    {observer}
                  </Text>
                  <TouchableOpacity
                    accessibilityLabel={`Remove ${observer}`}
                    onPress={() =>
                      setObservers(current =>
                        current.filter(item => item !== observer),
                      )
                    }>
                    <Feather
                      name="x"
                      size={15}
                      color={BookingColors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No observers added</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <Feather name="shield" size={18} color={BookingColors.primary} />
            </View>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Preferred ID</Text>
              <Text style={styles.sectionSubtitle}>
                Select the identity document required for verification.
              </Text>
            </View>
          </View>
          <View style={styles.options}>
            {ID_OPTIONS.map(option => {
              const selected = identity === option.value;
              return (
                <TouchableOpacity
                  activeOpacity={0.75}
                  key={option.value}
                  onPress={() => setIdentity(option.value)}
                  style={[styles.option, selected && styles.selectedOption]}>
                  <View
                    style={[
                      styles.optionIcon,
                      selected && styles.selectedOptionIcon,
                    ]}>
                    <Feather
                      name={option.icon}
                      size={18}
                      color={
                        selected
                          ? BookingColors.primary
                          : BookingColors.textSecondary
                      }
                    />
                  </View>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>{option.label}</Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>
                  <View
                    style={[styles.radio, selected && styles.selectedRadio]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={saving}
          onPress={save}
          style={[styles.saveButton, saving && styles.disabledButton]}>
          {saving ? (
            <ActivityIndicator color={BookingColors.white} />
          ) : (
            <>
              <Text style={styles.saveText}>Save preferences</Text>
              <Feather
                name="arrow-right"
                size={19}
                color={BookingColors.white}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  content: {
    padding: 16,
    paddingBottom: 30,
    backgroundColor: BookingColors.background,
  },
  intro: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: BookingColors.textPrimary,
  },
  eyebrow: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  title: {
    marginTop: 6,
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 23,
  },
  subtitle: {
    marginTop: 7,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 19,
  },
  section: {
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  sectionHeading: {flexDirection: 'row', alignItems: 'flex-start'},
  sectionIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  sectionCopy: {flex: 1, marginLeft: 12},
  sectionTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  sectionSubtitle: {
    marginTop: 3,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 16,
  },
  emailRow: {flexDirection: 'row', marginTop: 16},
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: BookingColors.borderStrong,
    borderRadius: 8,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  addButton: {
    width: 48,
    height: 48,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primary,
  },
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12},
  chip: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  chipText: {
    maxWidth: 210,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  emptyText: {
    marginTop: 12,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  options: {marginTop: 14, gap: 9},
  option: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  selectedOption: {
    borderColor: BookingColors.primary,
    backgroundColor: BookingColors.primarySoft,
  },
  optionIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  selectedOptionIcon: {backgroundColor: BookingColors.surface},
  optionCopy: {flex: 1, minWidth: 0, marginHorizontal: 11},
  optionTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  optionDescription: {
    marginTop: 2,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    lineHeight: 14,
  },
  radio: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BookingColors.borderStrong,
    borderRadius: 10,
  },
  selectedRadio: {borderColor: BookingColors.primary},
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BookingColors.primary,
  },
  actionBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  saveButton: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 8,
    backgroundColor: BookingColors.primary,
  },
  disabledButton: {opacity: 0.55},
  saveText: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
});
