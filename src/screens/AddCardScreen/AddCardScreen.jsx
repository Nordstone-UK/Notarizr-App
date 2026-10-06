import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useMutation, useQuery} from '@apollo/client';
import {CardField, useStripe} from '@stripe/stripe-react-native';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import {
  CREATE_CARD_SETUP_INTENT,
  REMOVE_PAYMENT_CARD,
} from '../../../request/mutations/cardSetup.mutation';
import {GET_PAYMENT_CARDS} from '../../../request/queries/getPaymentCards.query';
import ProfileScreenHeader from '../../components/Profile/ProfileScreenHeader';
import AppColors from '../../themes/AppColors';

const brandLabels = {
  amex: 'Amex',
  diners: 'Diners Club',
  discover: 'Discover',
  jcb: 'JCB',
  mastercard: 'Mastercard',
  unionpay: 'UnionPay',
  visa: 'Visa',
};

const brandIcons = {
  amex: 'credit-card',
  diners: 'credit-card',
  discover: 'credit-card',
  jcb: 'credit-card',
  mastercard: 'credit-card',
  unionpay: 'credit-card',
  visa: 'credit-card',
};

function formatBrand(brand) {
  return brandLabels[String(brand || '').toLowerCase()] || 'Card';
}

function formatExpiry(card) {
  if (!card?.exp_month || !card?.exp_year) {
    return 'Expiry not available';
  }
  return `Expires ${String(card.exp_month).padStart(2, '0')}/${String(
    card.exp_year,
  ).slice(-2)}`;
}

export default function AddCardScreen({navigation}) {
  const {confirmSetupIntent} = useStripe();
  const [busy, setBusy] = useState(false);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const {data, loading, refetch} = useQuery(GET_PAYMENT_CARDS, {
    fetchPolicy: 'cache-and-network',
  });
  const [createCardSetupIntent] = useMutation(CREATE_CARD_SETUP_INTENT);
  const [removePaymentCard] = useMutation(REMOVE_PAYMENT_CARD);

  const cards = useMemo(
    () => (data?.getPaymentCardsR?.cards || []).filter(Boolean),
    [data],
  );

  const addCard = async () => {
    setCardComplete(false);
    setCardModalVisible(true);
  };

  const closeCardModal = () => {
    if (busy) {
      return;
    }
    setCardModalVisible(false);
    setCardComplete(false);
  };

  const saveCard = async () => {
    if (!cardComplete) {
      Toast.show({
        type: 'error',
        text1: 'Card details incomplete',
        text2: 'Please enter the full card number, expiry and CVC.',
      });
      return;
    }
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const response = await createCardSetupIntent();
      const payload = response?.data?.createCardSetupIntentR;
      if (!payload?.setupIntent) {
        throw new Error(payload?.message || 'Could not start card setup.');
      }

      const {error: setupError} = await confirmSetupIntent(
        payload.setupIntent,
        {
          paymentMethodType: 'Card',
        },
        {
          setupFutureUsage: 'OffSession',
        },
      );

      if (setupError) {
        throw new Error(setupError.message);
      }

      setCardModalVisible(false);
      setCardComplete(false);
      await refetch();
      Toast.show({
        type: 'success',
        text1: 'Card added',
        text2: 'Your card is ready for booking payments.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Card could not be added',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setBusy(false);
    }
  };

  const confirmRemove = card => {
    Alert.alert(
      'Remove card?',
      `${formatBrand(card.brand)} ending in ${
        card.last4 || '••••'
      } will be removed from your account.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeCard(card),
        },
      ],
    );
  };

  const removeCard = async card => {
    if (!card?.id || busy) {
      return;
    }
    setBusy(true);
    try {
      const response = await removePaymentCard({
        variables: {paymentMethodId: card.id},
      });
      const result = response?.data?.removePaymentCardR;
      if (
        result?.status &&
        !['200', '201', 'SUCCESS'].includes(result.status)
      ) {
        throw new Error(result.message || 'Could not remove card.');
      }
      await refetch();
      Toast.show({type: 'success', text1: 'Card removed'});
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Card could not be removed',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setBusy(false);
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
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroIcon}>
            <Feather name="credit-card" size={22} color={AppColors.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>SECURE PAYMENT</Text>
            <Text style={styles.title}>Payment cards</Text>
            <Text style={styles.description}>
              Add and manage cards used for booking payments.
            </Text>
          </View>
        </View>

        <View style={styles.cardsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Saved cards</Text>
              <Text style={styles.sectionSubtitle}>
                Choose from these when paying for a booking.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.82}
              disabled={busy}
              onPress={addCard}
              style={[styles.addCardButton, busy && styles.disabledButton]}>
              {busy ? (
                <ActivityIndicator color={AppColors.white} size="small" />
              ) : (
                <Feather name="plus" size={15} color={AppColors.white} />
              )}
              <Text style={styles.addCardButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {loading && !cards.length ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={AppColors.primary} />
              <Text style={styles.loadingText}>Loading cards...</Text>
            </View>
          ) : cards.length ? (
            <View style={styles.cardList}>
              {cards.map((card, index) => {
                const brand = String(card?.brand || '').toLowerCase();
                return (
                  <View
                    key={card.id || `${card.last4}-${index}`}
                    style={styles.cardRow}>
                    <View style={styles.cardBrandIcon}>
                      <Feather
                        name={brandIcons[brand] || 'credit-card'}
                        size={22}
                        color={AppColors.primary}
                      />
                    </View>
                    <View style={styles.cardRowCopy}>
                      <Text style={styles.cardRowTitle}>
                        {formatBrand(card.brand)} ending in{' '}
                        {card.last4 || '••••'}
                      </Text>
                      <Text style={styles.cardRowText}>
                        {formatExpiry(card)}
                        {card.funding ? ` · ${card.funding}` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.76}
                      disabled={busy}
                      onPress={() => confirmRemove(card)}
                      style={styles.removeButton}>
                      <Feather
                        name="trash-2"
                        size={16}
                        color={AppColors.error}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCards}>
              <View style={styles.emptyIcon}>
                <Feather
                  name="credit-card"
                  size={22}
                  color={AppColors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>No cards added yet</Text>
              <Text style={styles.emptyText}>
                Add a payment card once, then use it faster during future
                bookings.
              </Text>
              <TouchableOpacity
                activeOpacity={0.82}
                disabled={busy}
                onPress={addCard}
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

          <View style={styles.securityNote}>
            <View style={styles.securityIcon}>
              <Feather name="lock" size={16} color={AppColors.info} />
            </View>
            <Text style={styles.securityText}>
              Card details are encrypted and used only for secure booking
              payments.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={closeCardModal}
        transparent
        visible={cardModalVisible}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeCardModal}
            style={styles.modalBackdrop}
          />
          <View style={styles.cardModal}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add payment card</Text>
                <Text style={styles.modalSubtitle}>
                  Enter the card you want to use for bookings.
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.76}
                disabled={busy}
                onPress={closeCardModal}
                style={styles.modalClose}>
                <Feather name="x" size={18} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardInputShell}>
              <View style={styles.cardPreview}>
                <View>
                  <Text style={styles.cardPreviewLabel}>NOTARIZR CARD</Text>
                  <Text style={styles.cardPreviewNumber}>
                    •••• •••• •••• ••••
                  </Text>
                </View>
                <Feather name="credit-card" size={24} color={AppColors.white} />
              </View>
              <CardField
                autofocus
                cardStyle={styles.cardFieldStyle}
                onCardChange={card => setCardComplete(Boolean(card?.complete))}
                placeholders={{
                  number: '4242 4242 4242 4242',
                  expiration: 'MM/YY',
                  cvc: 'CVC',
                  postalCode: 'ZIP',
                }}
                postalCodeEnabled
                style={styles.cardField}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.84}
              disabled={busy || !cardComplete}
              onPress={saveCard}
              style={[
                styles.saveCardButton,
                (!cardComplete || busy) && styles.disabledButton,
              ]}>
              {busy ? (
                <ActivityIndicator color={AppColors.white} size="small" />
              ) : (
                <Text style={styles.saveCardButtonText}>Save card</Text>
              )}
              {!busy && (
                <Feather name="arrow-right" size={18} color={AppColors.white} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: AppColors.surface},
  content: {
    flexGrow: 1,
    paddingBottom: 34,
    backgroundColor: AppColors.background,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: AppColors.textPrimary,
    overflow: 'hidden',
  },
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
  heroCopy: {flex: 1, marginLeft: 14},
  eyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 0.9,
  },
  title: {
    marginTop: 4,
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  description: {
    marginTop: 4,
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 17,
  },
  cardsSection: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  sectionSubtitle: {
    marginTop: 4,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 82,
    justifyContent: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: AppColors.primary,
  },
  disabledButton: {opacity: 0.7},
  addCardButtonText: {
    marginLeft: 6,
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
    minHeight: 138,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  loadingText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  cardList: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 82,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    backgroundColor: AppColors.surface,
  },
  cardBrandIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  cardRowCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  cardRowTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  cardRowText: {
    marginTop: 3,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  removeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.errorSoft,
  },
  emptyCards: {
    alignItems: 'center',
    marginTop: 12,
    padding: 24,
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
  emptyTitle: {
    marginTop: 13,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  emptyText: {
    marginTop: 5,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: AppColors.infoSoft,
  },
  securityIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  securityText: {
    flex: 1,
    marginLeft: 10,
    color: AppColors.info,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  cardModal: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: AppColors.surface,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  modalSubtitle: {
    marginTop: 4,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
  },
  modalClose: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.background,
  },
  cardInputShell: {
    marginTop: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.background,
  },
  cardPreview: {
    minHeight: 124,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 8,
    backgroundColor: AppColors.textPrimary,
  },
  cardPreviewLabel: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  cardPreviewNumber: {
    marginTop: 18,
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  cardField: {
    height: 52,
    marginTop: 14,
  },
  cardFieldStyle: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    cursorColor: AppColors.primary,
    fontSize: 16,
    placeholderColor: AppColors.textMuted,
    textColor: AppColors.textPrimary,
    textErrorColor: AppColors.error,
  },
  saveCardButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: AppColors.primary,
  },
  saveCardButtonText: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
});
