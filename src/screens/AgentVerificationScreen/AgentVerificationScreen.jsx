import React, {useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useMutation} from '@apollo/client';
import Feather from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import AuthProgressHeader from '../../components/AuthFlow/AuthProgressHeader';
import AuthUploadCard from '../../components/AuthFlow/AuthUploadCard';
import {
  setFilledCount,
  setProgress,
} from '../../features/register/registerSlice';
import useLogin from '../../hooks/useLogin';
import useRegister from '../../hooks/useRegister';
import {uriToBlob} from '../../utils/ImagePicker';
import {goBackOrNavigate} from '../../utils/navigationHelpers';
import {UPDATE_VERIFICATION} from '../../../request/mutations/updateVerification.mutation';
import AppColors from '../../themes/AppColors';

const DOCUMENTS = {
  photoID: {
    title: 'Government-issued photo ID',
    description: 'Upload a clear PDF or image of your valid ID.',
    icon: 'credit-card',
  },
  certificate: {
    title: 'Notary certificate',
    description: 'Upload your current commission certificate.',
    icon: 'award',
  },
  seal: {
    title: 'Notary seal',
    description: 'Upload a clear sample of your official seal.',
    icon: 'hexagon',
  },
};

export default function AgentVerificationScreen({navigation, route}) {
  const {user, onComplete} = route.params || {};
  const [photoID, setPhotoID] = useState(user?.photoId || null);
  const [certificate, setCertificate] = useState(user?.certificate_url || null);
  const [seal, setSeal] = useState(user?.notarySeal || null);
  const [loading, setLoading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState(() =>
    [
      user?.photoId && 'photoID',
      user?.certificate_url && 'certificate',
      user?.notarySeal && 'seal',
    ].filter(Boolean),
  );
  const [updateVerification] = useMutation(UPDATE_VERIFICATION);
  const registerData = useSelector(state => state.register);
  const dispatch = useDispatch();
  const {resetStack} = useLogin();
  const {
    uploadFiles,
    uploadFilestoS3,
    handleRegister,
    handleUpdateSeal,
    handleUpdatecertificate,
  } = useRegister();
  const totalFields = 12;
  const uploadedCount = [photoID, certificate, seal].filter(Boolean).length;

  const markUploaded = documentType => {
    if (uploadedDocuments.includes(documentType)) {
      return;
    }
    setUploadedDocuments(current => [...current, documentType]);
    if (!user) {
      const filledCount = Math.min(registerData.filledCount + 1, totalFields);
      dispatch(setFilledCount(filledCount));
      dispatch(setProgress(filledCount / totalFields));
    }
  };

  const markRemoved = documentType => {
    if (!uploadedDocuments.includes(documentType)) {
      return;
    }
    setUploadedDocuments(current =>
      current.filter(document => document !== documentType),
    );
    if (!user) {
      const filledCount = Math.max(registerData.filledCount - 1, 0);
      dispatch(setFilledCount(filledCount));
      dispatch(setProgress(filledCount / totalFields));
    }
  };

  const selectDocument = async (documentType, setter) => {
    const uri = await uploadFiles();
    if (!uri) {
      return;
    }
    setter(uri);
    markUploaded(documentType);
  };

  const confirmDelete = (title, documentType, setter) => {
    Alert.alert(`Remove ${title}`, 'You can upload another file afterward.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setter(null);
          markRemoved(documentType);
        },
      },
    ]);
  };

  const uploadDocument = async uri => {
    if (uri.startsWith('https://')) {
      return uri;
    }
    const blob = await uriToBlob(uri);
    return uploadFilestoS3(blob, registerData.firstName);
  };

  const submitVerification = async () => {
    if (!photoID || !certificate || !seal) {
      Toast.show({
        type: 'warning',
        text1: 'Documents required',
        text2: 'Upload all three documents to continue.',
      });
      return;
    }

    setLoading(true);
    try {
      const [photoUrl, certificateUrl, sealUrl] = await Promise.all([
        uploadDocument(photoID),
        uploadDocument(certificate),
        uploadDocument(seal),
      ]);

      if (user) {
        await handleUpdateSeal({notarySeal: sealUrl});
        await handleUpdatecertificate({
          photoId: photoUrl,
          certificate_url: certificateUrl,
        });
        if (typeof onComplete === 'function') {
          await onComplete();
        }
        await updateVerification({
          variables: {_id: user?._id, isVerified: false},
        });
        Toast.show({
          type: 'success',
          text1: 'Documents updated',
          text2: 'Your verification details were saved.',
        });
        navigation.goBack();
        return;
      }

      const isRegistered = await handleRegister({
        ...registerData,
        certificateUrl,
        photoId: photoUrl,
        notarySeal: sealUrl,
      });
      if (!isRegistered) {
        throw new Error('Registration failed');
      }
      resetStack('signup');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to submit documents',
        text2: 'Check your files and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />
      <AuthProgressHeader
        title={user ? 'Edit verification' : 'Identity verification'}
        progress={user ? undefined : registerData.progress}
        onBack={() =>
          goBackOrNavigate(
            navigation,
            user ? 'ProfileInfoScreen' : 'ProfilePictureScreen',
          )
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <View style={styles.introGlow} />
          <View style={styles.introTop}>
            <View style={styles.introIcon}>
              <Feather name="shield" size={21} color={AppColors.primary} />
            </View>
            <View style={styles.reviewPill}>
              <View style={styles.reviewDot} />
              <Text style={styles.reviewText}>SECURE REVIEW</Text>
            </View>
          </View>
          <Text style={styles.eyebrow}>NOTARY VERIFICATION</Text>
          <Text style={styles.heading}>Verify your credentials</Text>
          <Text style={styles.subheading}>
            Upload the documents below so clients can book with confidence.
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusIcon}>
            <Feather name="file-text" size={17} color={AppColors.primary} />
          </View>
          <View style={styles.statusCopy}>
            <Text style={styles.statusLabel}>Documents uploaded</Text>
            <Text style={styles.statusHint}>
              Complete all items before submitting
            </Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.statusValue}>{uploadedCount} / 3</Text>
          </View>
        </View>

        <View style={styles.documentStack}>
          <AuthUploadCard
            {...DOCUMENTS.photoID}
            uploaded={Boolean(photoID)}
            onPress={() => selectDocument('photoID', setPhotoID)}
            onRemove={() => confirmDelete('photo ID', 'photoID', setPhotoID)}
          />
          <View style={styles.documentSpacer} />
          <AuthUploadCard
            {...DOCUMENTS.certificate}
            uploaded={Boolean(certificate)}
            onPress={() => selectDocument('certificate', setCertificate)}
            onRemove={() =>
              confirmDelete('certificate', 'certificate', setCertificate)
            }
          />
          <View style={styles.documentSpacer} />
          <AuthUploadCard
            {...DOCUMENTS.seal}
            uploaded={Boolean(seal)}
            onPress={() => selectDocument('seal', setSeal)}
            onRemove={() => confirmDelete('notary seal', 'seal', setSeal)}
          />
        </View>

        <View style={styles.securityNote}>
          <View style={styles.securityIcon}>
            <Feather name="lock" size={16} color={AppColors.info} />
          </View>
          <View style={styles.securityCopy}>
            <Text style={styles.securityTitle}>Secure document handling</Text>
            <Text style={styles.securityText}>
              Your files are encrypted and used only for account verification.
            </Text>
          </View>
        </View>

        <AuthPrimaryButton
          title={user ? 'Save documents' : 'Complete registration'}
          icon="arrow-right"
          loading={loading}
          onPress={submitVerification}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    backgroundColor: AppColors.background,
  },
  intro: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 8,
    backgroundColor: AppColors.textPrimary,
    overflow: 'hidden',
  },
  introGlow: {
    position: 'absolute',
    top: -65,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(253,109,31,0.14)',
  },
  introTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  introIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  reviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  reviewDot: {
    width: 6,
    height: 6,
    marginRight: 6,
    borderRadius: 3,
    backgroundColor: AppColors.success,
  },
  reviewText: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 8,
    letterSpacing: 0.7,
  },
  eyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 0.9,
  },
  heading: {
    marginTop: 7,
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
    lineHeight: 29,
  },
  subheading: {
    marginTop: 7,
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.white,
  },
  statusIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  statusCopy: {
    flex: 1,
    marginHorizontal: 11,
  },
  statusLabel: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  statusHint: {
    marginTop: 2,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  countPill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  statusValue: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  documentStack: {
    width: '100%',
  },
  documentSpacer: {
    height: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 13,
    borderRadius: 8,
    backgroundColor: AppColors.infoSoft,
  },
  securityIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.white,
  },
  securityCopy: {
    flex: 1,
    marginLeft: 11,
  },
  securityTitle: {
    color: AppColors.info,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  securityText: {
    marginTop: 4,
    color: AppColors.info,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  submitButton: {
    marginTop: 24,
  },
});
