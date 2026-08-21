import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {CreditCardInput} from 'react-native-credit-card-input';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import ProfileScreenHeader from '../../components/Profile/ProfileScreenHeader';
import AppColors from '../../themes/AppColors';
import {
  isTestCardNumber,
  saveTestCard,
} from '../../utils/TestPayments';

export default function AddCardScreen({navigation}) {
  const [cardForm, setCardForm] = useState({valid: false});
  const [saving, setSaving] = useState(false);
  const values = cardForm?.values || {};
  const testCardReady =
    isTestCardNumber(values.number) &&
    Boolean(
      values.expiry?.trim() &&
        values.cvc?.trim() &&
        values.name?.trim() &&
        values.postalCode?.trim(),
    );

  const handleSaveCard = async () => {
    const cardNumber = cardForm?.values?.number;
    if (!isTestCardNumber(cardNumber)) {
      Toast.show({
        type: 'info',
        text1: 'Test card only',
        text2: 'Use 4242 4242 4242 4242 with a future expiry and any CVC.',
      });
      return;
    }

    setSaving(true);
    try {
      await saveTestCard();
      Toast.show({
        type: 'success',
        text1: 'Test card saved',
        text2: 'Visa ending in 4242 is ready for simulated payments.',
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Add payment card"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroIcon}>
            <Feather name="credit-card" size={22} color={AppColors.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>SECURE PAYMENT</Text>
            <Text style={styles.title}>Add a trusted card</Text>
            <Text style={styles.description}>
              Enter your card details to make future bookings faster.
            </Text>
          </View>
        </View>

        <View style={styles.formHeading}>
          <View style={styles.formHeadingIcon}>
            <Feather name="edit-3" size={17} color={AppColors.primary} />
          </View>
          <View style={styles.formHeadingCopy}>
            <Text style={styles.formTitle}>Card information</Text>
            <Text style={styles.formSubtitle}>
              All fields are required and encrypted.
            </Text>
          </View>
        </View>

        <View style={styles.cardForm}>
          <CreditCardInput
            allowScroll
            cardFontFamily="Manrope-Regular"
            cardScale={0.92}
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.input}
            invalidColor={AppColors.error}
            labelStyle={styles.label}
            onChange={setCardForm}
            placeholderColor={AppColors.textMuted}
            requiresCVC
            requiresName
            requiresPostalCode
            validColor={AppColors.textPrimary}
          />
        </View>

        <View style={styles.securityNote}>
          <View style={styles.securityIcon}>
            <Feather name="lock" size={16} color={AppColors.info} />
          </View>
          <Text style={styles.securityText}>
            Payment information is protected using secure, encrypted transfer.
          </Text>
        </View>

        <AuthPrimaryButton
          disabled={(!cardForm.valid && !testCardReady) || saving}
          icon="arrow-right"
          loading={saving}
          onPress={handleSaveCard}
          style={styles.saveButton}
          title="Save card"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardForm: {
    marginHorizontal: 16,
    paddingBottom: 22,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
    overflow: 'hidden',
  },
  content: {
    flexGrow: 1,
    paddingBottom: 34,
    backgroundColor: AppColors.background,
  },
  description: {
    marginTop: 4,
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 17,
  },
  eyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 0.9,
  },
  formHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  formHeadingCopy: {flex: 1, marginLeft: 11},
  formHeadingIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  formSubtitle: {
    marginTop: 2,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  formTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: AppColors.textPrimary,
    overflow: 'hidden',
  },
  heroCopy: {flex: 1, marginLeft: 14},
  heroGlow: {
    position: 'absolute',
    top: -70,
    right: -35,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(253,109,31,0.14)',
  },
  heroIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  input: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  inputContainer: {
    borderBottomColor: AppColors.borderStrong,
    borderBottomWidth: 1,
  },
  label: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  safeArea: {flex: 1, backgroundColor: AppColors.surface},
  saveButton: {marginHorizontal: 16, marginTop: 20},
  securityIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: AppColors.infoSoft,
  },
  securityText: {
    flex: 1,
    marginLeft: 10,
    color: AppColors.info,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  title: {
    marginTop: 4,
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
});
