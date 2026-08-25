import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';

import ProfileScreenHeader from '../../components/Profile/ProfileScreenHeader';
import useFetchUser from '../../hooks/useFetchUser';
import useUpdate from '../../hooks/useUpdate';
import BookingColors from '../../themes/BookingColors';
import { uploadDocumentToSpaces } from '../../utils/spacesHelper';
import {
  getSavedStamps,
  SavedStamp,
  saveSavedStamps,
} from '../../utils/savedSigningAssets';

type SavedSignature = { _id?: string; id?: string; signUrl: string };

export default function StampAndSignatureScreen({ navigation }: any) {
  const user = useSelector((state: any) => state?.user?.user);
  const { fetchUserInfo, handleDeleteSign } = useFetchUser();
  const { handleNotarysignUpdate } = useUpdate();
  const [stamps, setStamps] = useState<SavedStamp[]>([]);
  const [busyType, setBusyType] = useState<'signature' | 'stamp' | null>(null);

  const signatures: SavedSignature[] = Array.isArray(user?.notarysigns)
    ? user.notarysigns.slice(0, 2)
    : [];

  const loadStamps = useCallback(async () => {
    setStamps(await getSavedStamps(user?._id));
  }, [user?._id]);

  useEffect(() => {
    loadStamps();
  }, [loadStamps]);

  const chooseImage = async (kind: 'signature' | 'stamp') => {
    const currentCount = kind === 'signature' ? signatures.length : stamps.length;
    if (currentCount >= 2) {
      Toast.show({
        type: 'info',
        text1: `${kind === 'stamp' ? 'Stamp' : 'Signature'} limit reached`,
        text2: 'Remove one of the two saved images before adding another.',
      });
      return;
    }

    try {
      const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
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
      const mimeType = asset.type || '';
      const fileName = asset.fileName || `${kind}-${Date.now()}.png`;
      if (
        kind === 'stamp' &&
        mimeType !== 'image/png' &&
        !fileName.toLowerCase().endsWith('.png')
      ) {
        throw new Error('Notary stamps must be uploaded as PNG images.');
      }

      setBusyType(kind);
      const url = await uploadDocumentToSpaces({
        file: asset.uri,
        fileName,
        contentType: mimeType || 'image/png',
      });
      if (!url) {
        throw new Error('The image upload did not finish.');
      }

      if (kind === 'signature') {
        const saved = await handleNotarysignUpdate(url);
        if (!saved) {
          throw new Error('The signature could not be saved to your profile.');
        }
        await fetchUserInfo();
      } else {
        const nextStamps = await saveSavedStamps(user?._id, [
          ...stamps,
          { id: `${Date.now()}`, name: fileName, url },
        ]);
        setStamps(nextStamps);
      }

      Toast.show({ type: 'success', text1: `${kind === 'stamp' ? 'Stamp' : 'Signature'} saved` });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: error?.message || 'Please choose the image again.',
      });
    } finally {
      setBusyType(null);
    }
  };

  const removeSignature = async (signature: SavedSignature) => {
    const id = signature._id || signature.id;
    if (!id) {
      return;
    }
    setBusyType('signature');
    try {
      await handleDeleteSign(id);
      await fetchUserInfo();
    } finally {
      setBusyType(null);
    }
  };

  const removeStamp = async (id: string) => {
    const nextStamps = await saveSavedStamps(
      user?._id,
      stamps.filter(stamp => stamp.id !== id),
    );
    setStamps(nextStamps);
  };

  const renderAsset = (
    uri: string,
    label: string,
    onDelete: () => void,
  ) => (
    <View style={styles.assetCard} key={uri}>
      <Image source={{ uri }} style={styles.assetImage} />
      <View style={styles.assetFooter}>
        <Text numberOfLines={1} style={styles.assetLabel}>{label}</Text>
        <TouchableOpacity accessibilityLabel={`Delete ${label}`} onPress={onDelete}>
          <Feather name="trash-2" size={17} color={BookingColors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfileScreenHeader
        title="Stamp and Signature"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Save up to two signatures and two PNG stamp images for quick use during a session.
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Saved signatures</Text>
              <Text style={styles.sectionCount}>{signatures.length}/2 saved</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => chooseImage('signature')}
              disabled={busyType !== null || signatures.length >= 2}>
              {busyType === 'signature' ? (
                <ActivityIndicator size="small" color={BookingColors.white} />
              ) : (
                <Feather name="plus" size={17} color={BookingColors.white} />
              )}
              <Text style={styles.addButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.assetGrid}>
            {signatures.map((signature, index) =>
              renderAsset(signature.signUrl, `Signature ${index + 1}`, () => removeSignature(signature)),
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Notary stamps</Text>
              <Text style={styles.sectionCount}>{stamps.length}/2 PNG images saved</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => chooseImage('stamp')}
              disabled={busyType !== null || stamps.length >= 2}>
              {busyType === 'stamp' ? (
                <ActivityIndicator size="small" color={BookingColors.white} />
              ) : (
                <Feather name="plus" size={17} color={BookingColors.white} />
              )}
              <Text style={styles.addButtonText}>Upload PNG</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.assetGrid}>
            {stamps.map((stamp, index) =>
              renderAsset(stamp.url, `Stamp ${index + 1}`, () => removeStamp(stamp.id)),
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BookingColors.backgroundSubtle },
  content: { padding: 18, paddingBottom: 36 },
  intro: {
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  section: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'Manrope-Bold', fontSize: 16, color: BookingColors.textPrimary },
  sectionCount: { marginTop: 3, fontFamily: 'Manrope-Regular', fontSize: 11, color: BookingColors.textMuted },
  addButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: BookingColors.primary,
    gap: 6,
  },
  addButtonText: { fontFamily: 'Manrope-Bold', fontSize: 11, color: BookingColors.white },
  assetGrid: { flexDirection: 'row', gap: 10, marginTop: 14 },
  assetCard: {
    flex: 1,
    minHeight: 126,
    padding: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BookingColors.border,
    backgroundColor: BookingColors.backgroundSubtle,
  },
  assetImage: { width: '100%', height: 78, resizeMode: 'contain' },
  assetFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  assetLabel: { flex: 1, fontFamily: 'Manrope-SemiBold', fontSize: 11, color: BookingColors.textPrimary },
});
