import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CreditCardInput} from 'react-native-credit-card-input';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import ProfileScreenHeader from '../../components/Profile/ProfileScreenHeader';
import AppColors from '../../themes/AppColors';
import {
  getSavedTestCard,
  isTestCardNumber,
  saveTestCard,
} from '../../utils/TestPayments';

export default function AddCardScreen({navigation}) {
  const [cardForm, setCardForm] = useState({valid: false});
  const [cards, setCards] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
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

  const loadCards = useCallback(async () => {
    const savedCard = await getSavedTestCard();
    setCards(savedCard ? [savedCard] : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards]),
  );

  const openAddCard = () => {
    setCardForm({valid: false});
    setFormVisible(true);
  };

  const closeAddCard = () => {
    if (!saving) {
      setFormVisible(false);
    }
  };

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
      await saveTestCard({
        expiry: values.expiry,
        name: values.name,
      });
      await loadCards();
      Toast.show({
        type: 'success',
        text1: 'Test card saved',
        text2: 'Visa ending in 4242 is ready for simulated payments.',
      });
      setFormVisible(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Payment cards"
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
            <Text style={styles.title}>Your saved cards</Text>
            <Text style={styles.description}>
              Manage the cards used for booking payments.
            </Text>
          </View>
        </View>

        <View style={styles.cardsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved cards</Text>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={openAddCard}
              style={styles.addCardButton}>
              <Feather name="plus" size={15} color={AppColors.white} />
              <Text style={styles.addCardButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {cards.length > 0 ? (
            cards.map(card => (
              <View key={`${card.brand}-${card.last4}`} style={styles.cardRow}>
                <View style={styles.cardBrandIcon}>
                  <Feather
                    name="credit-card"
                    size={20}
                    color={AppColors.primary}
                  />
                </View>
                <View style={styles.cardRowCopy}>
                  <Text style={styles.cardRowTitle}>
                    {card.brand || 'Card'} ending in {card.last4}
                  </Text>
                  <Text style={styles.cardRowText}>
                    {card.expiry
                      ? `Expires ${card.expiry}`
                      : 'Ready for payments'}
                  </Text>
                </View>
                {card.isDefault ? (
                  <View style={styles.defaultPill}>
                    <Text style={styles.defaultPillText}>Default</Text>
                  </View>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyCards}>
              <View style={styles.emptyIcon}>
                <Feather
                  name="credit-card"
                  size={22}
                  color={AppColors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>No cards yet</Text>
              <Text style={styles.emptyText}>
                Add a card once and it will appear here for future bookings.
              </Text>
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={openAddCard}
                style={styles.emptyAddButton}>
                <Text style={styles.emptyAddButtonText}>Add payment card</Text>
                <Feather
                  name="arrow-right"
                  size={15}
                  color={AppColors.primary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={closeAddCard}
        transparent
        visible={formVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.formHeadingIcon}>
                <Feather name="edit-3" size={17} color={AppColors.primary} />
              </View>
              <View style={styles.formHeadingCopy}>
                <Text style={styles.formTitle}>Card information</Text>
                <Text style={styles.formSubtitle}>
                  All fields are required and encrypted.
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.75}
                disabled={saving}
                onPress={closeAddCard}
                style={styles.closeButton}>
                <Feather name="x" size={21} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
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
                  Payment information is protected using secure, encrypted
                  transfer.
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardForm: {
    marginHorizontal: 0,
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
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: AppColors.primary,
  },
  addCardButtonText: {
    marginLeft: 6,
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  cardBrandIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  cardRowCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  cardRowText: {
    marginTop: 3,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  cardRowTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  cardsSection: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.background,
  },
  defaultPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: AppColors.successSoft,
  },
  defaultPillText: {
    color: AppColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
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
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  emptyAddButtonText: {
    marginRight: 6,
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  emptyCards: {
    alignItems: 'center',
    marginTop: 12,
    padding: 22,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  emptyIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  emptyText: {
    marginTop: 5,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  emptyTitle: {
    marginTop: 13,
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17,23,35,0.5)',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    marginTop: 10,
    borderRadius: 2,
    backgroundColor: AppColors.borderStrong,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 16,
  },
  modalSheet: {
    maxHeight: '88%',
    paddingBottom: 24,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: AppColors.background,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  title: {
    marginTop: 4,
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
});
