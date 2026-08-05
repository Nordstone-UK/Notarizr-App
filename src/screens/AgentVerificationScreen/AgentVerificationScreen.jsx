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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
          <Text style={styles.eyebrow}>NOTARY VERIFICATION</Text>
          <Text style={styles.heading}>Verify your credentials</Text>
          <Text style={styles.subheading}>
            Upload the documents below so clients can book with confidence.
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Documents uploaded</Text>
          <Text style={styles.statusValue}>{uploadedCount} of 3</Text>
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
          <Text style={styles.securityTitle}>Secure document handling</Text>
          <Text style={styles.securityText}>
            Your files are encrypted and used only for account verification.
          </Text>
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },
  intro: {
    marginBottom: 22,
  },
  eyebrow: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  heading: {
    marginTop: 7,
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 28,
    lineHeight: 35,
  },
  subheading: {
    marginTop: 7,
    color: '#6C727F',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    color: '#596170',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
  },
  statusValue: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  documentStack: {
    width: '100%',
  },
  documentSpacer: {
    height: 12,
  },
  securityNote: {
    marginTop: 20,
    padding: 15,
    borderRadius: 14,
    backgroundColor: '#F7F8FA',
  },
  securityTitle: {
    color: '#252B36',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  securityText: {
    marginTop: 4,
    color: '#737A86',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  submitButton: {
    marginTop: 24,
  },
});
