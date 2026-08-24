import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Signature from 'react-native-signature-canvas';
import Feather from 'react-native-vector-icons/Feather';
import ViewShot from 'react-native-view-shot';
import { launchImageLibrary } from 'react-native-image-picker';

import BookingColors from '../../../themes/BookingColors';
import useFetchUser from '../../../hooks/useFetchUser';
import useUpdate from '../../../hooks/useUpdate';
import { useLiveblocks } from '../../../store/liveblocks';
import {
  uploadDocumentToSpaces,
  uploadSignatureToSpaces,
} from '../../../utils/spacesHelper';

type SignatureOption = 'saved' | 'draw' | 'type' | 'upload';

type SavedSignature = {
  id?: string;
  _id?: string;
  signUrl: string;
};

interface DrawSignComponentProps {
  isVisible: boolean;
  onClose: () => void;
  signs?: {
    account_type?: string;
    notarysigns?: SavedSignature[];
  };
  onStampChanges: (stampImage: string) => void;
  page?: number;
}

type SigningActivity = {
  status: 'idle' | 'choosing' | 'signing' | 'placing';
  label: string;
  page: number;
  x?: number;
  y?: number;
};

interface ActiveSignerPresenceProps {
  currentActivity?: SigningActivity;
  currentParticipant?: { name?: string; role?: string } | null;
  others?: ReadonlyArray<{
    connectionId?: number;
    presence?: {
      sessionParticipant?: { name?: string; role?: string } | null;
      signingActivity?: SigningActivity;
    };
  }>;
}

export const ActiveSignerPresence: React.FC<ActiveSignerPresenceProps> = ({
  currentActivity,
  currentParticipant,
  others = [],
}) => {
  const activeSigners = [
    ...(currentActivity && currentActivity.status !== 'idle'
      ? [{
        id: 'local',
        participant: currentParticipant,
        activity: currentActivity,
        isLocal: true,
      }]
      : []),
    ...others
      .filter(
        other =>
          Boolean(other.presence?.signingActivity?.status) &&
          other.presence?.signingActivity?.status !== 'idle',
      )
      .map(other => ({
        id: `remote-${other.connectionId}`,
        participant: other.presence?.sessionParticipant,
        activity: other.presence?.signingActivity as SigningActivity,
        isLocal: false,
      })),
  ];

  if (!activeSigners.length) {
    return null;
  }

  const pointerSigners = activeSigners.filter(
    signer =>
      typeof signer.activity.x === 'number' &&
      typeof signer.activity.y === 'number',
  );

  return (
    <View pointerEvents="none" style={styles.signerPresenceLayer}>
      <View style={styles.signerPresenceStack}>
        {activeSigners.map(signer => (
          <View
            key={signer.id}
            style={[
              styles.signerPresenceBadge,
              signer.isLocal && styles.signerPresenceBadgeLocal,
            ]}>
            <View style={styles.signerPresenceDot} />
            <View style={styles.signerPresenceCopy}>
              <Text numberOfLines={1} style={styles.signerPresenceName}>
                {signer.isLocal
                  ? 'You'
                  : signer.participant?.name || 'Participant'}
              </Text>
              <Text numberOfLines={1} style={styles.signerPresenceAction}>
                {signer.activity.label || 'Signing'} · page{' '}
                {signer.activity.page || 1}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {pointerSigners.map(signer => (
        <View
          key={`cursor-${signer.id}`}
          style={[
            styles.signerCursor,
            {
              left: Math.max(8, signer.activity.x || 8),
              top: Math.max(8, signer.activity.y || 8),
            },
          ]}>
          <View style={styles.signerCursorPointer} />
          <Text style={styles.signerCursorLabel}>
            {signer.isLocal
              ? 'You'
              : signer.participant?.name || 'Participant'}
          </Text>
        </View>
      ))}
    </View>
  );
};

const options: Array<{
  key: SignatureOption;
  label: string;
  icon: string;
}> = [
    { key: 'saved', label: 'Saved', icon: 'bookmark' },
    { key: 'draw', label: 'Draw', icon: 'edit-3' },
    { key: 'type', label: 'Type', icon: 'type' },
    { key: 'upload', label: 'Upload', icon: 'upload' },
  ];

const fontStyles = [
  { label: 'Script', value: 'DancingScript-VariableFont_wght' },
  { label: 'Classic', value: 'JacquesFrancoisShadow-Regular' },
  { label: 'Clean', value: 'Manrope-Bold' },
];

const DrawSignTypeModal: React.FC<DrawSignComponentProps> = ({
  isVisible,
  onClose,
  signs,
  onStampChanges,
  page = 1,
}) => {
  const { fetchUserInfo, handleDeleteSign } = useFetchUser();
  const { handleNotarysignUpdate } = useUpdate();
  const insertObject = useLiveblocks(state => state.insertObject);
  const setSigningActivity = useLiveblocks(state => state.setSigningActivity);

  const [selectedOption, setSelectedOption] =
    useState<SignatureOption>('saved');
  const [inputText, setInputText] = useState('');
  const [selectedFontStyle, setSelectedFontStyle] = useState(
    fontStyles[0].value,
  );
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);
  const [uploadedImageMime, setUploadedImageMime] = useState('image/jpeg');
  const [uploadedImageName, setUploadedImageName] = useState('signature.jpg');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const viewShotRef = useRef<ViewShot>(null);
  const signatureCanvasRef = useRef<any>(null);

  useEffect(() => {
    if (isVisible) {
      setSelectedOption(signs?.notarysigns?.length ? 'saved' : 'draw');
      setErrorMessage('');
      setUploadedImageUri(null);
      setUploadedImageMime('image/jpeg');
      setUploadedImageName('signature.jpg');
      setSigningActivity({
        status: 'choosing',
        label: 'Choosing a signature',
        page,
      });
    }
  }, [isVisible, page, setSigningActivity, signs?.notarysigns?.length]);

  const dismissModal = useCallback(() => {
    setSigningActivity({status: 'idle', label: '', page});
    onClose();
  }, [onClose, page, setSigningActivity]);

  const addSignatureToDocument = useCallback(
    (sourceUrl: string) => {
      insertObject(new Date().toISOString(), {
        type: 'image',
        sourceUrl,
        page,
        position: { x: 100, y: 100 },
      });
    },
    [insertObject, page],
  );

  const saveSignature = useCallback(
    async (sourceUrl: string) => {
      setSigningActivity({
        status: 'signing',
        label: 'Adding a signature',
        page,
      });
      addSignatureToDocument(sourceUrl);

      // Saved signatures are useful for both account types and are handled by
      // the same backend mutation. The document is still updated if saving the
      // reusable copy is unavailable.
      try {
        const updated = await handleNotarysignUpdate(sourceUrl);
        if (updated) {
          await fetchUserInfo();
        }
      } catch (error) {
        console.warn('Reusable signature could not be saved', error);
      }

      setSigningActivity({status: 'idle', label: '', page});
      onClose();
    },
    [
      addSignatureToDocument,
      fetchUserInfo,
      handleNotarysignUpdate,
      onClose,
      page,
      setSigningActivity,
    ],
  );

  const runSave = useCallback(
    async (uploader: () => Promise<string>) => {
      setSaving(true);
      setErrorMessage('');
      try {
        const sourceUrl = await uploader();
        if (!sourceUrl) {
          throw new Error('The signature upload returned no file.');
        }
        await saveSignature(sourceUrl);
      } catch (error: any) {
        setErrorMessage(
          error?.message || 'The signature could not be added. Please retry.',
        );
      } finally {
        setSaving(false);
      }
    },
    [saveSignature],
  );

  const handleDrawnSignature = useCallback(
    (signature: string) => {
      // `signature` is a full data:image/png;base64,... string from the
      // canvas. Upload it to Spaces so the result is a real, shareable URL
      // (the other party's device can't render a base64 blob that only
      // ever lived in this device's memory).
      runSave(() => uploadSignatureToSpaces(signature));
    },
    [runSave],
  );

  const chooseSignatureImage = useCallback(async () => {
    setErrorMessage('');
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Unable to open that image.');
      }
      const asset = result.assets?.[0];
      if (!asset?.uri) {
        throw new Error('No image was selected.');
      }
      setUploadedImageUri(asset.uri);
      setUploadedImageMime(asset.type || 'image/jpeg');
      setUploadedImageName(asset.fileName || `signature-${Date.now()}.jpg`);
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'The image could not be selected. Please retry.',
      );
    }
  }, []);

  const useUploadedSignature = useCallback(() => {
    if (!uploadedImageUri) {
      setErrorMessage('Choose a signature image first.');
      return;
    }
    runSave(() =>
      uploadDocumentToSpaces({
        file: uploadedImageUri,
        fileName: uploadedImageName,
        contentType: uploadedImageMime,
      }),
    );
  }, [runSave, uploadedImageUri, uploadedImageMime, uploadedImageName]);

  const useTypedSignature = useCallback(() => {
    if (!inputText.trim()) {
      setErrorMessage('Type your name first.');
      return;
    }
    runSave(async () => {
      // react-native-view-shot writes the capture to a local temp file;
      // upload that file so the typed signature is a real, shareable URL.
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) {
        throw new Error('The typed signature preview could not be captured.');
      }
      return uploadDocumentToSpaces({
        file: uri,
        fileName: `typed-signature-${Date.now()}.png`,
        contentType: 'image/png',
      });
    });
  }, [inputText, runSave]);

  const selectSavedSignature = useCallback(
    (sourceUrl: string) => {
      setSigningActivity({
        status: 'placing',
        label: 'Placing a signature',
        page,
      });
      onStampChanges(sourceUrl);
      onClose();
    },
    [onClose, onStampChanges, page, setSigningActivity],
  );

  const deleteSavedSignature = useCallback(
    async (signature: SavedSignature) => {
      const id = signature.id || signature._id;
      if (!id) {
        return;
      }
      setSaving(true);
      setErrorMessage('');
      try {
        await handleDeleteSign(id);
        await fetchUserInfo();
      } catch (error: any) {
        setErrorMessage(
          error?.message || 'The saved signature could not be removed.',
        );
      } finally {
        setSaving(false);
      }
    },
    [fetchUserInfo, handleDeleteSign],
  );

  const renderSavedSignature = ({ item }: { item: SavedSignature }) => (
    <TouchableOpacity
      style={styles.savedCard}
      activeOpacity={0.8}
      onPress={() => selectSavedSignature(item.signUrl)}>
      <Image source={{ uri: item.signUrl }} style={styles.savedImage} />
      <View style={styles.savedCardFooter}>
        <Text style={styles.savedUseText}>Use signature</Text>
        <TouchableOpacity
          hitSlop={10}
          onPress={() => deleteSavedSignature(item)}>
          <Feather name="trash-2" size={17} color={BookingColors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      statusBarTranslucent
      onRequestClose={dismissModal}>
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={dismissModal} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.heading}>Add your signature</Text>
              <Text style={styles.subheading}>
                Choose a method, preview it, then add it to the document.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={dismissModal}>
              <Feather name="x" size={21} color={BookingColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {options.map(option => {
              const selected = selectedOption === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.optionButton, selected && styles.optionActive]}
                  onPress={() => {
                    setSelectedOption(option.key);
                    setErrorMessage('');
                  }}>
                  <Feather
                    name={option.icon}
                    size={17}
                    color={
                      selected
                        ? BookingColors.primary
                        : BookingColors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextActive,
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {selectedOption === 'saved' && (
              <View>
                <Text style={styles.sectionTitle}>Saved signatures</Text>
                <Text style={styles.sectionDescription}>
                  Tap a signature to place it on the current page.
                </Text>
                {signs?.notarysigns?.length ? (
                  <FlatList
                    data={signs.notarysigns}
                    renderItem={renderSavedSignature}
                    keyExtractor={(item, index) =>
                      item.id || item._id || `${item.signUrl}-${index}`
                    }
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={styles.savedRow}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <Feather
                        name="edit-3"
                        size={24}
                        color={BookingColors.primary}
                      />
                    </View>
                    <Text style={styles.emptyTitle}>No saved signatures</Text>
                    <Text style={styles.emptyDescription}>
                      Draw, type, or upload one to use it here later.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {selectedOption === 'draw' && (
              <View>
                <Text style={styles.sectionTitle}>Draw signature</Text>
                <Text style={styles.sectionDescription}>
                  Sign inside the box, then tap Use signature to add it.
                </Text>
                <View style={styles.signatureCanvas}>
                  <Signature
                    ref={signatureCanvasRef}
                    onOK={handleDrawnSignature}
                    onEmpty={() =>
                      setErrorMessage('Draw your signature first.')
                    }
                    descriptionText=""
                    clearText="Clear"
                    confirmText="Save signature"
                    webStyle={signatureWebStyle}
                  />
                </View>
                <View style={styles.drawActionsRow}>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => signatureCanvasRef.current?.clearSignature()}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryButton, styles.drawUseButton]}
                    onPress={() => signatureCanvasRef.current?.readSignature()}
                    disabled={saving}>
                    {saving ? (
                      <ActivityIndicator color={BookingColors.white} />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>
                          Use signature
                        </Text>
                        <Feather
                          name="arrow-right"
                          size={19}
                          color={BookingColors.white}
                        />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {selectedOption === 'type' && (
              <View>
                <Text style={styles.sectionTitle}>Type signature</Text>
                <Text style={styles.sectionDescription}>
                  Enter your name and choose the style you prefer.
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type your full name"
                  placeholderTextColor={BookingColors.textMuted}
                  onChangeText={setInputText}
                  value={inputText}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.fontRow}>
                  {fontStyles.map(font => {
                    const selected = selectedFontStyle === font.value;
                    return (
                      <TouchableOpacity
                        key={font.value}
                        style={[
                          styles.fontChip,
                          selected && styles.fontChipActive,
                        ]}
                        onPress={() => setSelectedFontStyle(font.value)}>
                        <Text
                          style={[
                            styles.fontChipText,
                            selected && styles.fontChipTextActive,
                          ]}>
                          {font.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <ViewShot
                  ref={viewShotRef}
                  options={{ format: 'png', quality: 1 }}
                  style={styles.typedPreview}>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[
                      styles.typedSignature,
                      { fontFamily: selectedFontStyle },
                    ]}>
                    {inputText || 'Your signature'}
                  </Text>
                </ViewShot>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={useTypedSignature}
                  disabled={saving}>
                  {saving ? (
                    <ActivityIndicator color={BookingColors.white} />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>
                        Use signature
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={19}
                        color={BookingColors.white}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {selectedOption === 'upload' && (
              <View>
                <Text style={styles.sectionTitle}>Upload signature</Text>
                <Text style={styles.sectionDescription}>
                  Use a clear PNG or JPG with the signature centered.
                </Text>
                <TouchableOpacity
                  style={styles.uploadArea}
                  onPress={chooseSignatureImage}>
                  {uploadedImageUri ? (
                    <Image
                      source={{ uri: uploadedImageUri }}
                      style={styles.uploadedImage}
                    />
                  ) : (
                    <>
                      <View style={styles.uploadIcon}>
                        <Feather
                          name="image"
                          size={24}
                          color={BookingColors.primary}
                        />
                      </View>
                      <Text style={styles.uploadTitle}>Choose an image</Text>
                      <Text style={styles.uploadDescription}>
                        PNG or JPG from your photo library
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                {uploadedImageUri && (
                  <TouchableOpacity
                    style={styles.replaceButton}
                    onPress={chooseSignatureImage}>
                    <Feather
                      name="refresh-cw"
                      size={15}
                      color={BookingColors.primary}
                    />
                    <Text style={styles.replaceButtonText}>Choose another</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !uploadedImageUri && styles.primaryButtonDisabled,
                  ]}
                  onPress={useUploadedSignature}
                  disabled={!uploadedImageUri || saving}>
                  {saving ? (
                    <ActivityIndicator color={BookingColors.white} />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>
                        Use signature
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={19}
                        color={BookingColors.white}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <Feather
                  name="alert-circle"
                  size={17}
                  color={BookingColors.error}
                />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
          </ScrollView>

          {saving &&
            selectedOption !== 'type' &&
            selectedOption !== 'upload' && (
              <View style={styles.savingOverlay}>
                <ActivityIndicator color={BookingColors.primary} />
                <Text style={styles.savingText}>Adding signature…</Text>
              </View>
            )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const signatureWebStyle = `
  .m-signature-pad {
    border: 0 !important;
    box-shadow: none !important;
    background: #fff !important;
  }
  .m-signature-pad--body {
    border: 0 !important;
  }
  /* The in-canvas Clear/Save footer sits inside a fixed-height, clipped
     container and reliably gets cut off, so it's replaced with the native
     Clear/Use signature buttons below the canvas instead. */
  .m-signature-pad--footer {
    display: none !important;
  }
`;

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 24, 38, 0.56)',
  },
  sheet: {
    maxHeight: '88%',
    minHeight: '55%',
    backgroundColor: BookingColors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 10,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: BookingColors.borderStrong,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerCopy: { flex: 1, paddingRight: 12 },
  heading: {
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
    color: BookingColors.textPrimary,
  },
  subheading: {
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 19,
    color: BookingColors.textSecondary,
    marginTop: 4,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BookingColors.background,
    borderWidth: 1,
    borderColor: BookingColors.border,
  },
  optionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 12,
    backgroundColor: BookingColors.background,
  },
  optionButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  optionActive: {
    backgroundColor: BookingColors.surface,
    borderWidth: 1,
    borderColor: BookingColors.border,
  },
  optionText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: BookingColors.textSecondary,
  },
  optionTextActive: { color: BookingColors.primary },
  contentScroll: { marginTop: 6 },
  content: { padding: 20, paddingBottom: 30 },
  sectionTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    color: BookingColors.textPrimary,
  },
  sectionDescription: {
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 19,
    color: BookingColors.textSecondary,
    marginTop: 3,
    marginBottom: 16,
  },
  savedRow: { gap: 10 },
  savedCard: {
    flex: 1,
    minHeight: 132,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
    padding: 10,
    marginBottom: 10,
  },
  savedImage: {
    width: '100%',
    height: 76,
    resizeMode: 'contain',
    backgroundColor: BookingColors.backgroundSubtle,
    borderRadius: 8,
  },
  savedCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  savedUseText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: BookingColors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 26,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BookingColors.primarySoft,
  },
  emptyTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: BookingColors.textPrimary,
    marginTop: 12,
  },
  emptyDescription: {
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    color: BookingColors.textSecondary,
    marginTop: 3,
  },
  signatureCanvas: {
    height: 285,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BookingColors.borderStrong,
    overflow: 'hidden',
    backgroundColor: BookingColors.surface,
  },
  textInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BookingColors.borderStrong,
    paddingHorizontal: 14,
    fontFamily: 'Manrope-Regular',
    fontSize: 15,
    color: BookingColors.textPrimary,
    backgroundColor: BookingColors.surface,
  },
  fontRow: { gap: 8, paddingVertical: 12 },
  fontChip: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: BookingColors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  fontChipActive: {
    borderColor: BookingColors.primary,
    backgroundColor: BookingColors.primarySoft,
  },
  fontChipText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    color: BookingColors.textSecondary,
  },
  fontChipTextActive: { color: BookingColors.primary },
  typedPreview: {
    height: 110,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: BookingColors.backgroundSubtle,
    borderWidth: 1,
    borderColor: BookingColors.border,
  },
  typedSignature: { fontSize: 30, color: BookingColors.textPrimary },
  uploadArea: {
    minHeight: 160,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: BookingColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: BookingColors.primarySoft,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BookingColors.surface,
  },
  uploadTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: BookingColors.textPrimary,
    marginTop: 10,
  },
  uploadDescription: {
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    color: BookingColors.textSecondary,
    marginTop: 3,
  },
  uploadedImage: { width: '100%', height: 130, resizeMode: 'contain' },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
  },
  replaceButtonText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: BookingColors.primary,
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: BookingColors.primary,
    marginTop: 14,
  },
  primaryButtonDisabled: { backgroundColor: BookingColors.borderStrong },
  primaryButtonText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: BookingColors.white,
  },
  drawActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  drawUseButton: { flex: 1, marginTop: 0 },
  clearButton: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BookingColors.borderStrong,
  },
  clearButtonText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: BookingColors.textPrimary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 10,
    padding: 12,
    backgroundColor: BookingColors.errorSoft,
    marginTop: 14,
  },
  errorText: {
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 17,
    color: BookingColors.error,
  },
  savingOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: BookingColors.primarySoft,
    borderWidth: 1,
    borderColor: BookingColors.primary,
  },
  savingText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: BookingColors.primary,
  },
  signerPresenceLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 24,
    elevation: 24,
  },
  signerPresenceStack: {
    position: 'absolute',
    top: 12,
    left: 12,
    gap: 7,
  },
  signerPresenceBadge: {
    maxWidth: 210,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 5,
  },
  signerPresenceBadgeLocal: {
    borderColor: BookingColors.primary,
    backgroundColor: BookingColors.primarySoft,
  },
  signerPresenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#7C3AED',
  },
  signerPresenceCopy: { flexShrink: 1 },
  signerPresenceName: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  signerPresenceAction: {
    marginTop: 1,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  signerCursor: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  signerCursorPointer: {
    width: 0,
    height: 0,
    borderTopWidth: 0,
    borderBottomWidth: 14,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopColor: 'transparent',
    borderBottomColor: '#7C3AED',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-38deg' }],
  },
  signerCursorLabel: {
    marginLeft: -2,
    marginTop: 11,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    overflow: 'hidden',
    color: BookingColors.white,
    backgroundColor: '#7C3AED',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
});

export default DrawSignTypeModal;
