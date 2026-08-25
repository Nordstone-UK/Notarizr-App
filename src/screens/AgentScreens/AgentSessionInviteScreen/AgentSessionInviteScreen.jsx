import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment-timezone';
import DatePicker from 'react-native-date-picker';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';

import NavigationHeader from '../../../components/Navigation Header/NavigationHeader';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import AppColors from '../../../themes/AppColors';
import useFetchUser from '../../../hooks/useFetchUser';
import useRegister from '../../../hooks/useRegister';
import {useSession} from '../../../hooks/useSession';

const IDENTITY_OPTIONS = [
  {label: 'Let client choose', value: 'client_choose'},
  {label: 'ID card', value: 'user_id'},
  {label: 'Passport', value: 'user_passport'},
];

const getName = person =>
  [person?.first_name, person?.last_name].filter(Boolean).join(' ') ||
  'Notarizr client';

const getInitials = person => {
  const initials = [person?.first_name, person?.last_name]
    .filter(Boolean)
    .map(value => value.charAt(0))
    .join('');
  return (initials || person?.email?.charAt(0) || 'N').toUpperCase();
};

function SectionHeader({eyebrow, title, description}) {
  return (
    <View style={styles.sectionHeader}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? (
        <Text style={styles.sectionDescription}>{description}</Text>
      ) : null}
    </View>
  );
}

function SearchField({value, onChangeText, onClear, placeholder, loading}) {
  return (
    <View style={styles.searchField}>
      <Feather name="phone" size={19} color={AppColors.textSecondary} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="phone-pad"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppColors.textMuted}
        style={styles.searchInput}
        value={value}
      />
      {loading ? (
        <ActivityIndicator color={AppColors.primary} size="small" />
      ) : value ? (
        <TouchableOpacity
          accessibilityLabel="Clear search"
          onPress={onClear}
          style={styles.smallIconButton}>
          <Feather name="x" size={18} color={AppColors.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function PersonAvatar({person, size = 44}) {
  const hasPicture =
    person?.profile_picture && person.profile_picture !== 'none';

  return (
    <View
      style={[
        styles.avatar,
        {width: size, height: size, borderRadius: size / 2},
      ]}>
      {hasPicture ? (
        <Image
          source={{uri: person.profile_picture}}
          style={{width: size, height: size, borderRadius: size / 2}}
        />
      ) : (
        <Text style={styles.avatarText}>{getInitials(person)}</Text>
      )}
    </View>
  );
}

function PersonRow({person, onPress, onRemove, caption}) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.72 : 1}
      disabled={!onPress}
      onPress={onPress}
      style={styles.personRow}>
      <PersonAvatar person={person} />
      <View style={styles.personCopy}>
        <Text numberOfLines={1} style={styles.personName}>
          {getName(person)}
        </Text>
        <Text numberOfLines={1} style={styles.personEmail}>
          {caption || person?.phone_number || person?.email}
        </Text>
      </View>
      {onRemove ? (
        <TouchableOpacity
          accessibilityLabel={`Remove ${getName(person)}`}
          onPress={onRemove}
          style={styles.removeButton}>
          <Feather name="x" size={19} color={AppColors.textSecondary} />
        </TouchableOpacity>
      ) : (
        <Feather name="plus" size={20} color={AppColors.primary} />
      )}
    </TouchableOpacity>
  );
}

function SearchResults({results, onSelect}) {
  if (!results.length) {
    return null;
  }

  return (
    <View style={styles.resultsPanel}>
      {results.map((person, index) => (
        <View key={person?._id || person?.email}>
          <PersonRow person={person} onPress={() => onSelect(person)} />
          {index < results.length - 1 ? <View style={styles.divider} /> : null}
        </View>
      ))}
    </View>
  );
}

function SelectCard({selected, title, description, onPress, icon}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.selectCard, selected && styles.selectCardActive]}>
      <View style={[styles.selectIcon, selected && styles.selectIconActive]}>
        <Feather
          name={icon}
          size={19}
          color={selected ? AppColors.primary : AppColors.textSecondary}
        />
      </View>
      <View style={styles.selectCopy}>
        <Text style={styles.selectTitle}>{title}</Text>
        <Text style={styles.selectDescription}>{description}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioActive]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </TouchableOpacity>
  );
}

export default function AgentSessionInviteScreen({navigation}) {
  const {uploadDocArray, uploadMultipleFiles} = useRegister();
  const {handleSessionCreation} = useSession();
  const {searchUserByEmail} = useFetchUser();
  const searchUserByEmailRef = useRef(searchUserByEmail);

  const SESSION_PRICE = 99;

  const [selectedIdentity, setSelectedIdentity] = useState('client_choose');
  const [fileResponse, setFileResponse] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClientData, setSelectedClientData] = useState(null);
  const [observers, setObservers] = useState([]);
  const [clientQuery, setClientQuery] = useState('');
  const [observerQuery, setObserverQuery] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [observerResults, setObserverResults] = useState([]);
  const [clientSearching, setClientSearching] = useState(false);
  const [observerSearching, setObserverSearching] = useState(false);
  const [date, setDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('on_notarizr');

  const INVITE_MESSAGE =
    'You are invited to your next session. Download the Notarizer app to proceed.';

  const sendSmsInvite = async phone => {
    const cleaned = phone.replace(/\s/g, '');
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = `sms:${cleaned}${separator}body=${encodeURIComponent(INVITE_MESSAGE)}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(
          'SMS not available',
          'Your device cannot send SMS messages.',
        );
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Could not open the SMS app.');
    }
  };

  const [clientNoResults, setClientNoResults] = useState(false);
  const [observerNoResults, setObserverNoResults] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  useEffect(() => {
    if (clientQuery.trim().length < 2 || selectedClientData) {
      setClientResults([]);
      setClientSearching(false);
      setClientNoResults(false);
      return undefined;
    }

    setClientNoResults(false);
    let active = true;
    setClientSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await searchUserByEmailRef.current(clientQuery.trim());
        if (active) {
          const results = Array.isArray(response) ? response : [];
          setClientResults(results);
          setClientNoResults(results.length === 0);
        }
      } catch (error) {
        if (active) {
          setClientResults([]);
          setClientNoResults(false);
        }
      } finally {
        if (active) {
          setClientSearching(false);
        }
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [clientQuery, selectedClientData]);

  useEffect(() => {
    if (observerQuery.trim().length < 2) {
      setObserverResults([]);
      setObserverSearching(false);
      setObserverNoResults(false);
      return undefined;
    }

    setObserverNoResults(false);
    let active = true;
    setObserverSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await searchUserByEmailRef.current(
          observerQuery.trim(),
        );
        if (active) {
          const selectedIds = new Set(observers.map(item => item._id));
          const filtered = (Array.isArray(response) ? response : []).filter(
            person =>
              !selectedIds.has(person._id) &&
              person._id !== selectedClientData?._id,
          );
          setObserverResults(filtered);
          setObserverNoResults(filtered.length === 0);
        }
      } catch (error) {
        if (active) {
          setObserverResults([]);
          setObserverNoResults(false);
        }
      } finally {
        if (active) {
          setObserverSearching(false);
        }
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [observerQuery, observers, selectedClientData]);

  const handleDocumentSelection = async () => {
    const response = await uploadMultipleFiles();
    const selectedFiles = Array.isArray(response)
      ? response
      : response
      ? [response]
      : [];
    const pdfFiles = selectedFiles.filter(file => {
      const name = String(
        file?.name || file?.fileName || file?.uri || '',
      ).toLowerCase();
      const type = String(file?.type || file?.mimeType || '').toLowerCase();

      return type === 'application/pdf' || name.endsWith('.pdf');
    });

    if (selectedFiles.length !== pdfFiles.length) {
      Toast.show({
        type: 'error',
        text1: 'PDF files only',
        text2: 'Please upload PDF only.',
      });
    }

    if (pdfFiles.length) {
      setFileResponse(pdfFiles);
    }
  };

  const clearClient = () => {
    setSelectedClient(null);
    setSelectedClientData(null);
    setClientQuery('');
    setClientResults([]);
  };

  const submitInvitation = async () => {
    if (!fileResponse.length || !selectedClient || !observers.length) {
      Toast.show({
        type: 'error',
        text1: 'Complete the invitation',
        text2: 'Add a client, observer and document before continuing.',
      });
      return;
    }

    setLoading(true);
    try {
      const uploadedUrls = await uploadDocArray(fileResponse);
      const response = await handleSessionCreation(
        uploadedUrls,
        selectedClient,
        'schedule_later',
        date,
        selectedIdentity,
        observers.map(item => item.email),
        SESSION_PRICE,
        [],
        paymentMethod,
      );

      if (response === '200') {
        navigation.navigate('SessionCreation');
      } else {
        Toast.show({type: 'error', text1: 'Something went wrong'});
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Invitation could not be sent',
        text2: 'Please check the details and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Invite signer" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Feather name="send" size={23} color={AppColors.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Create a remote session</Text>
            <Text style={styles.heroDescription}>
              Add everyone involved, choose verification and schedule the call.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="PARTICIPANTS"
            title="Client"
            description="Search for the person who will sign the documents."
          />
          {selectedClientData ? (
            <PersonRow person={selectedClientData} onRemove={clearClient} />
          ) : (
            <>
              <SearchField
                loading={clientSearching}
                onChangeText={setClientQuery}
                onClear={() => {
                  setClientQuery('');
                  setClientResults([]);
                  setClientNoResults(false);
                }}
                placeholder="Client phone number"
                value={clientQuery}
              />
              <SearchResults
                onSelect={person => {
                  setSelectedClient(person.email);
                  setSelectedClientData(person);
                  setClientQuery('');
                  setClientResults([]);
                  setClientNoResults(false);
                }}
                results={clientResults}
              />
              {clientNoResults && !clientSearching && clientQuery.trim().length >= 2 && (
                <View style={styles.inviteBanner}>
                  <View style={styles.inviteBannerIcon}>
                    <Feather name="user-x" size={16} color={AppColors.primary} />
                  </View>
                  <View style={styles.inviteBannerCopy}>
                    <Text style={styles.inviteBannerTitle}>
                      No account found
                    </Text>
                    <Text style={styles.inviteBannerText}>
                      Send an SMS inviting them to download the Notarizer app.
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => sendSmsInvite(clientQuery.trim())}
                    style={styles.inviteButton}>
                    <Feather name="send" size={13} color={AppColors.white} />
                    <Text style={styles.inviteButtonText}>Invite</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          <View style={styles.subsectionDivider} />

          <Text style={styles.fieldTitle}>Observers</Text>
          <Text style={styles.fieldDescription}>
            Add anyone who needs to attend or provide information during the
            session.
          </Text>
          <SearchField
            loading={observerSearching}
            onChangeText={setObserverQuery}
            onClear={() => {
              setObserverQuery('');
              setObserverResults([]);
              setObserverNoResults(false);
            }}
                placeholder="Observer phone number"
            value={observerQuery}
          />
          <SearchResults
            onSelect={person => {
              setObservers(current => [...current, person]);
              setObserverQuery('');
              setObserverResults([]);
              setObserverNoResults(false);
            }}
            results={observerResults}
          />
          {observerNoResults && !observerSearching && observerQuery.trim().length >= 2 && (
            <View style={styles.inviteBanner}>
              <View style={styles.inviteBannerIcon}>
                <Feather name="user-x" size={16} color={AppColors.primary} />
              </View>
              <View style={styles.inviteBannerCopy}>
                <Text style={styles.inviteBannerTitle}>No account found</Text>
                <Text style={styles.inviteBannerText}>
                  Send an SMS inviting them to download the Notarizer app.
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => sendSmsInvite(observerQuery.trim())}
                style={styles.inviteButton}>
                <Feather name="send" size={13} color={AppColors.white} />
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            </View>
          )}
          {observers.map(observer => (
            <View key={observer._id || observer.email} style={styles.personGap}>
              <PersonRow
                person={observer}
                onRemove={() =>
                  setObservers(current =>
                    current.filter(item => item._id !== observer._id),
                  )
                }
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="DOCUMENTS"
            title="Notarization request"
            description="Attach the documents for the session."
          />
          <View style={styles.uploadHint}>
            <Feather name="info" size={13} color={AppColors.textSecondary} />
            <Text style={styles.uploadHintText}>PDF files only</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleDocumentSelection}
            style={[
              styles.uploadArea,
              fileResponse.length && styles.uploadAreaComplete,
            ]}>
            <View
              style={[
                styles.uploadIcon,
                fileResponse.length && styles.uploadIconComplete,
              ]}>
              <Feather
                name={fileResponse.length ? 'check' : 'upload-cloud'}
                size={22}
                color={
                  fileResponse.length ? AppColors.success : AppColors.primary
                }
              />
            </View>
            <View style={styles.uploadCopy}>
              <Text style={styles.uploadTitle}>
                {fileResponse.length
                  ? `${fileResponse.length} document${
                      fileResponse.length === 1 ? '' : 's'
                    } attached`
                  : 'Upload session documents'}
              </Text>
              <Text style={styles.uploadDescription}>
                {fileResponse.length
                  ? 'Tap to replace the selected files'
                  : 'Please upload PDF only'}
              </Text>
            </View>
            <Text style={styles.uploadAction}>
              {fileResponse.length ? 'Replace' : 'Browse'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="SESSION"
            title="Identity verification"
            description="Choose which identity document the client must present."
          />
          <View style={styles.segmentedControl}>
            {IDENTITY_OPTIONS.map(option => {
              const isSelected = selectedIdentity === option.value;
              return (
                <TouchableOpacity
                  activeOpacity={0.75}
                  key={option.value}
                  onPress={() => setSelectedIdentity(option.value)}
                  style={[styles.segment, isSelected && styles.segmentActive]}>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.segmentText,
                      isSelected && styles.segmentTextActive,
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldTitle}>Date and time</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setDatePickerOpen(true)}
            style={styles.scheduleRow}>
            <View style={styles.fieldIcon}>
              <Feather name="calendar" size={20} color={AppColors.primary} />
            </View>
            <View style={styles.scheduleCopy}>
              <Text style={styles.scheduleDate}>
                {moment(date).format('dddd, MMM D')}
              </Text>
              <Text style={styles.scheduleTime}>
                {moment(date).format('YYYY [at] h:mm A')}
              </Text>
            </View>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
          <DatePicker
            date={date}
            minimumDate={new Date()}
            modal
            mode="datetime"
            onCancel={() => setDatePickerOpen(false)}
            onConfirm={newDate => {
              setDatePickerOpen(false);
              setDate(newDate);
            }}
            open={datePickerOpen}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="PAYMENT"
            title="How will the client pay?"
            description="Select who will collect payment for this session."
          />
          <SelectCard
            description="You collect payment directly from the client."
            icon="briefcase"
            onPress={() => setPaymentMethod('on_agent')}
            selected={paymentMethod === 'on_agent'}
            title="Invoice independently"
          />
          <View style={styles.cardGap} />
          <SelectCard
            description="Notarizr sends the invoice and records payment."
            icon="credit-card"
            onPress={() => setPaymentMethod('on_notarizr')}
            selected={paymentMethod === 'on_notarizr'}
            title="Invoice through Notarizr"
          />
        </View>

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Session total</Text>
            <Text style={styles.summaryHint}>Fixed session fee</Text>
          </View>
          <Text style={styles.summaryPrice}>${SESSION_PRICE}</Text>
        </View>

        <GradientButton
          Title="Send invitation"
          loading={loading}
          onPress={submitInvitation}
          viewStyle={styles.submitButton}
        />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    justifyContent: 'center',
  },
  avatarText: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  cardGap: {height: 10},
  changeText: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: AppColors.borderStrong,
    borderRadius: 6,
    borderWidth: 1.5,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 6,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipText: {
    color: AppColors.primaryPressed,
    flexShrink: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10},
  container: {backgroundColor: AppColors.background, flex: 1},
  content: {paddingBottom: 28},
  divider: {
    backgroundColor: AppColors.border,
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
  documentLoading: {marginVertical: 50},
  documentOption: {
    alignItems: 'center',
    borderBottomColor: AppColors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 64,
    paddingVertical: 10,
  },
  documentOptionCopy: {flex: 1, paddingRight: 12},
  documentOptionPrice: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  documentOptionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
  },
  documentOptions: {paddingBottom: 12, paddingHorizontal: 20},
  documentPickerButton: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 72,
    padding: 12,
  },
  documentPickerCopy: {flex: 1, marginHorizontal: 12},
  documentPickerLabel: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  documentPickerValue: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 3,
  },
  emptyDocuments: {alignItems: 'center', paddingHorizontal: 24, paddingTop: 50},
  emptyDocumentsText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  emptyDocumentsTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    marginTop: 12,
  },
  eyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    marginBottom: 5,
  },
  fieldDescription: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  fieldIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 7,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  fieldTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    marginBottom: 4,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: '#121826',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  heroCopy: {flex: 1, marginLeft: 14},
  heroDescription: {
    color: '#AEB4BF',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  heroTitle: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  modalBackdrop: {backgroundColor: 'rgba(18, 24, 38, 0.45)', flex: 1},
  modalClose: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  modalDescription: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 3,
  },
  modalDoneButton: {marginHorizontal: 8},
  modalHandle: {
    alignSelf: 'center',
    backgroundColor: AppColors.borderStrong,
    borderRadius: 2,
    height: 4,
    marginBottom: 12,
    width: 40,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  modalRoot: {flex: 1, justifyContent: 'flex-end'},
  modalSheet: {
    backgroundColor: AppColors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '78%',
    paddingBottom: 10,
    paddingTop: 10,
  },
  modalTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  personCopy: {flex: 1, marginHorizontal: 12, minWidth: 0},
  personEmail: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  personGap: {marginTop: 8},
  personName: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  personRow: {
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  radio: {
    alignItems: 'center',
    borderColor: AppColors.borderStrong,
    borderRadius: 10,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioActive: {borderColor: AppColors.primary},
  radioDot: {
    backgroundColor: AppColors.primary,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 7,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  resultsPanel: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  scheduleCopy: {flex: 1, marginHorizontal: 12},
  scheduleDate: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  scheduleRow: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 10,
    minHeight: 72,
    padding: 12,
  },
  scheduleTime: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 3,
  },
  searchField: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderColor: AppColors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: AppColors.textPrimary,
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    height: 50,
    marginLeft: 10,
    paddingVertical: 0,
  },
  section: {
    backgroundColor: AppColors.surface,
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  sectionDescription: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  sectionHeader: {marginBottom: 16},
  sectionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 7,
    paddingVertical: 8,
  },
  segmentActive: {backgroundColor: AppColors.surface},
  segmentText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    textAlign: 'center',
  },
  segmentTextActive: {color: AppColors.primary},
  segmentedControl: {
    backgroundColor: '#EFF1F4',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 22,
    padding: 4,
  },
  selectCard: {
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 78,
    padding: 12,
  },
  selectCardActive: {
    backgroundColor: '#FFF9F4',
    borderColor: '#FFC9A8',
  },
  selectCopy: {flex: 1, marginHorizontal: 12},
  selectDescription: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  selectIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 7,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  selectIconActive: {backgroundColor: AppColors.primarySoft},
  selectTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  smallIconButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  subsectionDivider: {
    backgroundColor: AppColors.border,
    height: 1,
    marginVertical: 22,
  },
  submitButton: {marginHorizontal: 8, marginTop: 2},
  summaryHint: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 3,
  },
  summaryLabel: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  summaryPrice: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
  },
  summaryRow: {
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
    padding: 16,
  },
  uploadAction: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  uploadHint: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  uploadHintText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  uploadArea: {
    alignItems: 'center',
    backgroundColor: '#FFF9F4',
    borderColor: '#FFB98D',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 14,
    minHeight: 82,
    padding: 12,
  },
  uploadAreaComplete: {
    backgroundColor: AppColors.successSoft,
    borderColor: '#A9DDBF',
    borderStyle: 'solid',
  },
  uploadCopy: {flex: 1, marginHorizontal: 12},
  uploadDescription: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 3,
  },
  uploadIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  uploadIconComplete: {backgroundColor: '#DFF3E7'},
  uploadTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  inviteBanner: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderColor: '#FFB98D',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    padding: 12,
  },
  inviteBannerIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 7,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  inviteBannerCopy: {flex: 1, minWidth: 0},
  inviteBannerTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
  },
  inviteBannerText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  inviteButton: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 7,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inviteButtonText: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
});
