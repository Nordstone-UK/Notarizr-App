import React, {useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useMutation} from '@apollo/client';
import DocumentPicker from 'react-native-document-picker';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import useCustomerSuport from '../../hooks/useCustomerSupport';
import {SUBMIT_SESSION_IDENTITY_PROOF} from '../../../request/mutations/submitSessionIdentityProof.mutation';
import AppColors from '../../themes/AppColors';
import {goBackOrNavigate} from '../../utils/navigationHelpers';
import {uploadDocumentToSpaces} from '../../utils/spacesHelper';

function ProofFileCard({file, onPick, onRemove}) {
  if (!file) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.78}
        onPress={onPick}
        style={styles.uploadSlot}>
        <View style={styles.uploadIcon}>
          <Feather name="upload-cloud" size={22} color={AppColors.primary} />
        </View>
        <View style={styles.uploadCopy}>
          <Text style={styles.uploadLabel}>Choose identity proof</Text>
          <Text style={styles.uploadDescription}>
            Select a clear file from your device.
          </Text>
        </View>
        <View style={styles.addButton}>
          <Feather name="plus" size={19} color={AppColors.primary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.fileCard}>
      <View style={styles.fileIcon}>
        <Feather name="file-text" size={22} color={AppColors.primary} />
      </View>
      <View style={styles.fileCopy}>
        <Text numberOfLines={1} style={styles.fileName}>
          {file.name}
        </Text>
        <Text style={styles.fileReady}>Ready to share securely</Text>
      </View>
      <TouchableOpacity
        accessibilityLabel="Replace identity proof"
        onPress={onPick}
        style={styles.iconButton}>
        <Feather name="refresh-cw" size={17} color={AppColors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityLabel="Remove identity proof"
        onPress={() =>
          Alert.alert('Remove this file?', 'You can choose another one.', [
            {text: 'Keep', style: 'cancel'},
            {text: 'Remove', style: 'destructive', onPress: onRemove},
          ])
        }
        style={styles.iconButton}>
        <Feather name="trash-2" size={17} color={AppColors.error} />
      </TouchableOpacity>
    </View>
  );
}

export default function AuthenticationScreen({route, navigation}) {
  const {uid, channel, token, time, date, routeFrom, sessionMode} =
    route?.params || {};
  const {handleCallSupport} = useCustomerSuport();
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitIdentityProof] = useMutation(SUBMIT_SESSION_IDENTITY_PROOF);

  const chooseProofFile = async () => {
    try {
      const files = await DocumentPicker.pick({
        allowMultiSelection: false,
        copyTo: 'cachesDirectory',
        type: [DocumentPicker.types.allFiles],
      });
      const selected = files?.[0];
      if (!selected?.uri && !selected?.fileCopyUri) {
        throw new Error('The selected file could not be opened.');
      }
      setProofFile({
        name: selected.name || 'Identity proof',
        type: selected.type || 'application/octet-stream',
        uri: selected.fileCopyUri || selected.uri,
      });
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Toast.show({
          type: 'error',
          text1: 'Unable to select this file',
          text2: error?.message || 'Choose another file and try again.',
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
      sessionMode,
      routeFrom: routeFrom || 'client',
    });
  };

  const submitProofAndJoin = async () => {
    if (!proofFile || loading) {
      Toast.show({
        type: 'warning',
        text1: 'Identity proof required',
        text2: 'Choose a file before joining the secure session.',
      });
      return;
    }
    if (!uid) {
      Toast.show({
        type: 'error',
        text1: 'Session unavailable',
        text2: 'Return to your booking and try joining again.',
      });
      return;
    }

    setLoading(true);
    try {
      const url = await uploadDocumentToSpaces({
        file: proofFile.uri,
        fileName: proofFile.name,
        contentType: proofFile.type,
      });
      const {data} = await submitIdentityProof({
        variables: {
          recordId: uid,
          identityProof: {
            url,
            file_name: proofFile.name,
            content_type: proofFile.type,
          },
        },
      });
      const result = data?.submitSessionIdentityProofR;
      if (String(result?.status) !== '200') {
        throw new Error(result?.message || 'Unable to save identity proof.');
      }

      Toast.show({
        type: 'success',
        text1: 'Identity proof shared',
        text2: 'Your notary can review it in the secure session.',
      });
      continueToCall();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to join the session',
        text2:
          error?.message || 'Check your connection and upload the file again.',
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
          <Text style={styles.headerTitle}>Identity proof</Text>
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
            <Text style={styles.heroEyebrow}>BEFORE YOU JOIN</Text>
            <Text style={styles.heroTitle}>Share identity proof</Text>
            <Text style={styles.heroDescription}>
              Your notary will review this during the live session.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload a document</Text>
          <Text style={styles.sectionDescription}>
            You can select any clear identity-proof file. It is stored with this
            session only and is not added to the notarized document.
          </Text>
          <View style={styles.uploadList}>
            <ProofFileCard
              file={proofFile}
              onPick={chooseProofFile}
              onRemove={() => setProofFile(null)}
            />
          </View>
        </View>

        <View style={styles.securityNote}>
          <View style={styles.securityIcon}>
            <Feather name="lock" size={17} color={AppColors.success} />
          </View>
          <View style={styles.securityCopy}>
            <Text style={styles.securityTitle}>Private to this session</Text>
            <Text style={styles.securityDescription}>
              This proof is available to the session participants and is kept
              separate from your final notarized PDF.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerStatus}>
          <Feather
            name={proofFile ? 'check-circle' : 'info'}
            size={16}
            color={proofFile ? AppColors.success : AppColors.textSecondary}
          />
          <Text
            style={[
              styles.footerStatusText,
              proofFile && styles.footerStatusTextReady,
            ]}>
            {proofFile ? 'Ready to join' : 'Choose one proof file'}
          </Text>
        </View>
        <AuthPrimaryButton
          disabled={!proofFile}
          icon="arrow-right"
          loading={loading}
          onPress={submitProofAndJoin}
          style={styles.verifyButton}
          title="Submit and join"
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
  heroEyebrow: {color: '#FFB184', fontFamily: 'Manrope-Bold', fontSize: 9},
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
  uploadList: {marginTop: 15},
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
  fileCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderWidth: 1,
    borderColor: '#A8DDBF',
    borderRadius: 8,
    backgroundColor: AppColors.successSoft,
  },
  fileIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  fileCopy: {flex: 1, marginHorizontal: 11},
  fileName: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  fileReady: {
    marginTop: 3,
    color: AppColors.success,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: AppColors.surface,
    marginLeft: 6,
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
    backgroundColor: AppColors.surface,
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
