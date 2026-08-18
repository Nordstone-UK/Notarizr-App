import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import useAuthenticate from '../../hooks/useAuthenticate';
import useCustomerSuport from '../../hooks/useCustomerSupport';
import useRegister from '../../hooks/useRegister';
import AppColors from '../../themes/AppColors';
import {convertURIToBase64} from '../../utils/ImagePicker';
import {goBackOrNavigate} from '../../utils/navigationHelpers';

const DOCUMENT_TYPE = {
  ID: 'ID Card',
  PASSPORT: 'Passport',
};

const TEST_ID_FILE_MARKER = 'notarizr-test-id-';

const isTestIdentityFile = value => {
  try {
    return decodeURIComponent(String(value || ''))
      .toLowerCase()
      .includes(TEST_ID_FILE_MARKER);
  } catch (_) {
    return false;
  }
};

function DocumentTypeOption({active, icon, title, subtitle, onPress}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{selected: active}}
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.typeOption, active && styles.typeOptionActive]}>
      <View style={[styles.typeIcon, active && styles.typeIconActive]}>
        <Feather
          name={icon}
          size={20}
          color={active ? AppColors.white : AppColors.textSecondary}
        />
      </View>
      <View style={styles.typeCopy}>
        <Text style={styles.typeTitle}>{title}</Text>
        <Text style={styles.typeSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, active && styles.radioActive]}>
        {active && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

function UploadSlot({label, description, uri, onSelect, onRemove}) {
  const confirmRemoval = () => {
    Alert.alert(`Remove ${label.toLowerCase()}?`, 'You can upload it again.', [
      {text: 'Keep', style: 'cancel'},
      {text: 'Remove', style: 'destructive', onPress: onRemove},
    ]);
  };

  if (uri) {
    return (
      <View style={styles.previewCard}>
        <Image source={{uri}} resizeMode="cover" style={styles.previewImage} />
        <View style={styles.previewOverlay} />
        <View style={styles.previewTopRow}>
          <View style={styles.readyBadge}>
            <Feather name="check" size={13} color={AppColors.success} />
            <Text style={styles.readyText}>Ready</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel={`Remove ${label}`}
            onPress={confirmRemoval}
            style={styles.removeButton}>
            <Feather name="trash-2" size={17} color={AppColors.error} />
          </TouchableOpacity>
        </View>
        <View style={styles.previewBottomRow}>
          <View style={styles.previewCopy}>
            <Text style={styles.previewLabel}>{label}</Text>
            <Text style={styles.previewDescription}>Image selected</Text>
          </View>
          <TouchableOpacity onPress={onSelect} style={styles.replaceButton}>
            <Feather name="refresh-cw" size={14} color={AppColors.primary} />
            <Text style={styles.replaceText}>Replace</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.76}
      onPress={onSelect}
      style={styles.uploadSlot}>
      <View style={styles.uploadIcon}>
        <Feather name="camera" size={22} color={AppColors.primary} />
      </View>
      <View style={styles.uploadCopy}>
        <Text style={styles.uploadLabel}>{label}</Text>
        <Text style={styles.uploadDescription}>{description}</Text>
      </View>
      <View style={styles.addButton}>
        <Feather name="plus" size={19} color={AppColors.primary} />
      </View>
    </TouchableOpacity>
  );
}

export default function AuthenticationScreen({route, navigation}) {
  const {uid, channel, token, time, date, routeFrom} = route?.params || {};
  const bookingDetail = useSelector(state => state.booking.booking);
  const userData = useSelector(state => state.user.user);
  const authenticationMethod =
    bookingDetail?.identity_authentication || 'client_choose';
  const canChooseType = authenticationMethod === 'client_choose';
  const initialType =
    authenticationMethod === 'user_passport'
      ? DOCUMENT_TYPE.PASSPORT
      : DOCUMENT_TYPE.ID;

  const [documentType, setDocumentType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [passport, setPassport] = useState(null);
  // Authenticating.com's legacy document scan endpoint uses 0 for US.
  const country = 0;
  const {uploadUserPassport, uploadUserID, testAuth} = useAuthenticate();
  const {uploadFiles} = useRegister();
  const {handleCallSupport} = useCustomerSuport();

  useEffect(() => {
    setDocumentType(initialType);
  }, [initialType]);

  const requiredDocuments = documentType === DOCUMENT_TYPE.ID ? 2 : 1;
  const uploadedDocuments =
    documentType === DOCUMENT_TYPE.ID
      ? [idFront, idBack].filter(Boolean).length
      : passport
      ? 1
      : 0;
  const isReady = uploadedDocuments === requiredDocuments;
  const progressLabel = `${uploadedDocuments} of ${requiredDocuments} uploaded`;

  const privacyCopy = useMemo(
    () =>
      documentType === DOCUMENT_TYPE.ID
        ? 'Use a valid government-issued ID. Make sure all four corners and every detail are visible.'
        : 'Open the passport to the photo page and make sure every detail is readable.',
    [documentType],
  );

  const selectDocument = async setter => {
    try {
      const response = await uploadFiles();
      if (response) {
        setter(response);
      }
    } catch (error) {
      const message = String(error?.message || error || '').toLowerCase();
      if (!message.includes('cancel')) {
        Toast.show({
          type: 'error',
          text1: 'Unable to open this file',
          text2: 'Choose a clear image and try again.',
        });
      }
    }
  };

  const continueToCall = () => {
    navigation.navigate('WaitingRoomScreen', {
      uid,
      channel,
      token,
      time,
      date,
      routeFrom: routeFrom || 'client',
    });
  };

  const verifyIdentity = async () => {
    if (!isReady || loading) {
      Toast.show({
        type: 'warning',
        text1: 'Documents required',
        text2:
          documentType === DOCUMENT_TYPE.ID
            ? 'Upload the front and back of your ID.'
            : 'Upload your passport photo page.',
      });
      return;
    }

    setLoading(true);
    try {
      const usesSimulatorTestId =
        __DEV__ &&
        documentType === DOCUMENT_TYPE.ID &&
        isTestIdentityFile(idFront) &&
        isTestIdentityFile(idBack);

      if (usesSimulatorTestId) {
        Toast.show({
          type: 'success',
          text1: 'Test identity accepted',
          text2: 'Opening the secure simulator session.',
        });
        continueToCall();
        return;
      }

      if (documentType === DOCUMENT_TYPE.ID) {
        const [front, back] = await Promise.all([
          convertURIToBase64(idFront),
          convertURIToBase64(idBack),
        ]);
        const uploadStatus = await uploadUserID(
          userData?.userAccessCode,
          front,
          back,
          country,
        );
        if (String(uploadStatus) !== '204') {
          throw new Error('The identity provider could not scan this ID.');
        }
      } else {
        const passportBase64 = await convertURIToBase64(passport);
        const uploadStatus = await uploadUserPassport(
          userData?.userAccessCode,
          passportBase64,
          country,
        );
        if (String(uploadStatus) !== '204') {
          throw new Error(
            'The identity provider could not scan this passport.',
          );
        }
      }

      const response = await testAuth();
      if (String(response) !== '204') {
        throw new Error('Identity verification was not completed');
      }

      Toast.show({
        type: 'success',
        text1: 'Identity verified',
        text2: 'You can now join the secure notary session.',
      });
      continueToCall();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification unsuccessful',
        text2:
          error?.message ||
          'Check that your document is clear, then try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />

      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          onPress={() => goBackOrNavigate(navigation, 'HomeScreen')}
          style={styles.headerButton}>
          <Feather name="arrow-left" size={22} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Identity verification</Text>
          <Text style={styles.headerSubtitle}>Secure notary session</Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="Contact support"
          onPress={handleCallSupport}
          style={styles.headerButton}>
          <Feather name="help-circle" size={21} color={AppColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Feather name="shield" size={28} color={AppColors.white} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>ONE-TIME CHECK</Text>
            <Text style={styles.heroTitle}>Verify your identity</Text>
            <Text style={styles.heroDescription}>
              Required before entering the online notary room.
            </Text>
          </View>
        </View>

        {canChooseType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose a document</Text>
            <Text style={styles.sectionDescription}>
              Select the document you have available.
            </Text>
            <View style={styles.typeList}>
              <DocumentTypeOption
                active={documentType === DOCUMENT_TYPE.ID}
                icon="credit-card"
                title="Government ID"
                subtitle="Driver's licence or identity card"
                onPress={() => setDocumentType(DOCUMENT_TYPE.ID)}
              />
              <DocumentTypeOption
                active={documentType === DOCUMENT_TYPE.PASSPORT}
                icon="book-open"
                title="Passport"
                subtitle="Photo and personal details page"
                onPress={() => setDocumentType(DOCUMENT_TYPE.PASSPORT)}
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionHeadingCopy}>
              <Text style={styles.sectionTitle}>
                {documentType === DOCUMENT_TYPE.ID
                  ? 'Upload both sides'
                  : 'Upload your passport'}
              </Text>
              <Text style={styles.sectionDescription}>{privacyCopy}</Text>
            </View>
            <View
              style={[styles.countBadge, isReady && styles.countBadgeReady]}>
              <Text
                style={[styles.countText, isReady && styles.countTextReady]}>
                {progressLabel}
              </Text>
            </View>
          </View>

          <View style={styles.uploadList}>
            {documentType === DOCUMENT_TYPE.ID ? (
              <>
                <UploadSlot
                  label="Front of ID"
                  description="Upload the side with your photo"
                  uri={idFront}
                  onSelect={() => selectDocument(setIdFront)}
                  onRemove={() => setIdFront(null)}
                />
                <UploadSlot
                  label="Back of ID"
                  description="Upload the reverse side of the card"
                  uri={idBack}
                  onSelect={() => selectDocument(setIdBack)}
                  onRemove={() => setIdBack(null)}
                />
              </>
            ) : (
              <UploadSlot
                label="Passport photo page"
                description="Upload the page with your portrait"
                uri={passport}
                onSelect={() => selectDocument(setPassport)}
                onRemove={() => setPassport(null)}
              />
            )}
          </View>
        </View>

        <View style={styles.securityNote}>
          <View style={styles.securityIcon}>
            <Feather name="lock" size={17} color={AppColors.success} />
          </View>
          <View style={styles.securityCopy}>
            <Text style={styles.securityTitle}>Your document is protected</Text>
            <Text style={styles.securityDescription}>
              It is transmitted securely and used only for this verification.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerStatus}>
          <Feather
            name={isReady ? 'check-circle' : 'info'}
            size={16}
            color={isReady ? AppColors.success : AppColors.textSecondary}
          />
          <Text
            style={[
              styles.footerStatusText,
              isReady && styles.footerStatusTextReady,
            ]}>
            {isReady ? 'Ready to verify' : progressLabel}
          </Text>
        </View>
        <AuthPrimaryButton
          disabled={!isReady}
          icon="arrow-right"
          loading={loading}
          onPress={verifyIdentity}
          style={styles.verifyButton}
          title="Verify identity"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: AppColors.background},
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    backgroundColor: AppColors.surface,
  },
  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.backgroundSubtle,
  },
  headerCopy: {flex: 1, marginHorizontal: 13},
  headerTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
  },
  headerSubtitle: {
    marginTop: 2,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  scrollContent: {padding: 16, paddingBottom: 28},
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#121826',
  },
  heroIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primary,
  },
  heroCopy: {flex: 1, marginLeft: 15},
  heroEyebrow: {
    color: '#FFB184',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  heroTitle: {
    marginTop: 3,
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
  },
  heroDescription: {
    marginTop: 4,
    color: '#B7BECA',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  section: {
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
  },
  sectionDescription: {
    marginTop: 4,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  typeList: {marginTop: 14, gap: 10},
  typeOption: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  typeOptionActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primarySoft,
  },
  typeIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.backgroundSubtle,
  },
  typeIconActive: {backgroundColor: AppColors.primary},
  typeCopy: {flex: 1, marginHorizontal: 12},
  typeTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  typeSubtitle: {
    marginTop: 3,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  radio: {
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.borderStrong,
    borderRadius: 11,
  },
  radioActive: {borderColor: AppColors.primary},
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: AppColors.primary,
  },
  sectionHeadingRow: {flexDirection: 'row', alignItems: 'flex-start'},
  sectionHeadingCopy: {flex: 1, paddingRight: 8},
  countBadge: {
    marginTop: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: AppColors.backgroundSubtle,
  },
  countBadgeReady: {backgroundColor: AppColors.successSoft},
  countText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  countTextReady: {color: AppColors.success},
  uploadList: {marginTop: 15, gap: 10},
  uploadSlot: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#F1A276',
    borderRadius: 8,
    backgroundColor: '#FFFAF6',
  },
  uploadIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  uploadCopy: {flex: 1, marginHorizontal: 12},
  uploadLabel: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  uploadDescription: {
    marginTop: 3,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  addButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: AppColors.primarySoft,
  },
  previewCard: {
    height: 142,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#A8DDBF',
    borderRadius: 8,
    backgroundColor: AppColors.textPrimary,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18,24,38,0.36)',
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: AppColors.successSoft,
  },
  readyText: {
    marginLeft: 4,
    color: AppColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  removeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: AppColors.errorSoft,
  },
  previewBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 'auto',
    padding: 10,
  },
  previewCopy: {flex: 1},
  previewLabel: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  previewDescription: {
    marginTop: 2,
    color: '#E1E5EB',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: AppColors.white,
  },
  replaceText: {
    marginLeft: 5,
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    padding: 14,
    borderRadius: 8,
    backgroundColor: AppColors.successSoft,
  },
  securityIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: AppColors.white,
  },
  securityCopy: {flex: 1, marginLeft: 11},
  securityTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  securityDescription: {
    marginTop: 3,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    backgroundColor: AppColors.surface,
  },
  footerStatus: {flexDirection: 'row', alignItems: 'center'},
  footerStatusText: {
    marginLeft: 7,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  footerStatusTextReady: {color: AppColors.success},
  verifyButton: {height: 52, marginTop: 9},
});
