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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import AuthProgressHeader from '../../components/AuthFlow/AuthProgressHeader';
import AuthSelectField from '../../components/AuthFlow/AuthSelectField';
import AuthTextField from '../../components/AuthFlow/AuthTextField';
import AuthUploadCard from '../../components/AuthFlow/AuthUploadCard';
import {
  setFilledCount,
  setProgress,
} from '../../features/register/registerSlice';
import useLogin from '../../hooks/useLogin';
import useRegister from '../../hooks/useRegister';
import useFetchUser from '../../hooks/useFetchUser';
import {goBackOrNavigate} from '../../utils/navigationHelpers';
import {UPDATE_VERIFICATION} from '../../../request/mutations/updateVerification.mutation';
import AppColors from '../../themes/AppColors';
import {UPDATE_PROFILE_PICTURE} from '../../../request/mutations/update.mutation';
import {statesData} from '../../data/statesData';

const DOCUMENTS = {
  photoID: {
    title: 'Government-issued photo ID',
    description: 'Upload a clear PDF or image of your valid ID.',
    icon: 'credit-card',
  },
  commissionCertificate: {
    title: 'Commission certificate',
    description: 'Upload your current commission certificate.',
    icon: 'award',
  },
  ronApproval: {
    title: 'RON approval',
    description: 'Upload state approval for remote online notarization.',
    icon: 'video',
  },
  bond: {
    title: 'Bond document',
    description: 'Upload proof of your active notary bond.',
    icon: 'shield',
  },
  insurance: {
    title: 'Insurance evidence',
    description: 'Upload E&O or required insurance evidence.',
    icon: 'umbrella',
  },
  training: {
    title: 'Training evidence',
    description: 'Upload required RON or notary training proof.',
    icon: 'book-open',
  },
};

const DOCUMENT_ORDER = [
  'photoID',
  'commissionCertificate',
  'ronApproval',
  'bond',
  'insurance',
  'training',
];

const RON_STATUS_OPTIONS = [
  {label: 'Approved for RON', value: 'approved'},
  {label: 'Pending RON approval', value: 'pending'},
  {label: 'Not approved yet', value: 'not_approved'},
];

const APPROVAL_STATES = [
  {label: 'Submitted', value: 'submitted', icon: 'send'},
  {label: 'Under review', value: 'under_review', icon: 'clock'},
  {label: 'Approved', value: 'approved', icon: 'check-circle'},
  {label: 'Rejected', value: 'rejected', icon: 'x-circle'},
  {label: 'Suspended', value: 'suspended', icon: 'pause-circle'},
  {label: 'Expired', value: 'expired', icon: 'alert-triangle'},
];

const getApprovalState = user => {
  if (user?.isBlocked) {
    return 'suspended';
  }
  if (user?.notaryOnboarding?.approvalStatus) {
    return user.notaryOnboarding.approvalStatus;
  }
  if (user?.isVerified) {
    return 'approved';
  }
  if (user?._id) {
    return 'under_review';
  }
  return 'submitted';
};

function SectionHeader({title, description}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? (
        <Text style={styles.sectionDescription}>{description}</Text>
      ) : null}
    </View>
  );
}

function ApprovalStateTracker({currentState}) {
  return (
    <View style={styles.approvalCard}>
      <View style={styles.approvalHeader}>
        <View style={styles.statusIcon}>
          <Feather name="activity" size={17} color={AppColors.primary} />
        </View>
        <View style={styles.statusCopy}>
          <Text style={styles.statusLabel}>Approval status</Text>
          <Text style={styles.statusHint}>
            Administrative review controls live-session access
          </Text>
        </View>
      </View>
      <View style={styles.approvalGrid}>
        {APPROVAL_STATES.map(state => {
          const active = state.value === currentState;
          return (
            <View
              key={state.value}
              style={[
                styles.approvalPill,
                active && styles.approvalPillActive,
              ]}>
              <Feather
                name={state.icon}
                size={14}
                color={active ? AppColors.primary : AppColors.textSecondary}
              />
              <Text
                style={[
                  styles.approvalPillText,
                  active && styles.approvalPillTextActive,
                ]}>
                {state.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function RonStatusSegment({value, onChange}) {
  return (
    <View style={styles.segmentWrap}>
      <Text style={styles.segmentLabel}>RON approval status</Text>
      <View style={styles.segmentRow}>
        {RON_STATUS_OPTIONS.map(option => {
          const selected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.78}
              onPress={() => onChange(option.value)}
              style={[styles.segment, selected && styles.segmentSelected]}>
              <Text
                style={[
                  styles.segmentText,
                  selected && styles.segmentTextSelected,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function AgentVerificationScreen({navigation, route}) {
  const {user, onComplete} = route.params || {};
  const onboarding = user?.notaryOnboarding || {};
  const onboardingCommission = onboarding?.commission || {};
  const onboardingCredentials = onboarding?.credentials || {};
  const [photoID, setPhotoID] = useState(
    onboardingCredentials?.photoId || user?.photoId || null,
  );
  const [certificate, setCertificate] = useState(
    onboardingCredentials?.commissionCertificate ||
      user?.certificate_url ||
      null,
  );
  const [ronApproval, setRonApproval] = useState(
    onboardingCredentials?.ronApproval || null,
  );
  const [bond, setBond] = useState(onboardingCredentials?.bond || null);
  const [insurance, setInsurance] = useState(
    onboardingCredentials?.insurance || null,
  );
  const [training, setTraining] = useState(
    onboardingCredentials?.training || null,
  );
  const [commissionState, setCommissionState] = useState(
    onboardingCommission?.state || user?.state || '',
  );
  const [commissionCounty, setCommissionCounty] = useState(
    onboardingCommission?.county || '',
  );
  const [commissionCity, setCommissionCity] = useState(
    onboardingCommission?.city || user?.location || '',
  );
  const [commissionNumber, setCommissionNumber] = useState(
    onboardingCommission?.number || '',
  );
  const [commissionIssueDate, setCommissionIssueDate] = useState(
    onboardingCommission?.issueDate || '',
  );
  const [commissionExpirationDate, setCommissionExpirationDate] = useState(
    onboardingCommission?.expirationDate || '',
  );
  const [ronStatus, setRonStatus] = useState(
    onboardingCommission?.ronStatus || 'approved',
  );
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState(() =>
    [
      user?.photoId && 'photoID',
      user?.certificate_url && 'commissionCertificate',
      onboardingCredentials?.photoId && 'photoID',
      onboardingCredentials?.commissionCertificate && 'commissionCertificate',
      onboardingCredentials?.ronApproval && 'ronApproval',
      onboardingCredentials?.bond && 'bond',
      onboardingCredentials?.insurance && 'insurance',
      onboardingCredentials?.training && 'training',
    ].filter(Boolean),
  );
  const [updateVerification] = useMutation(UPDATE_VERIFICATION);
  const [updateProfilePicture] = useMutation(UPDATE_PROFILE_PICTURE);
  const registerData = useSelector(state => state.register);
  const dispatch = useDispatch();
  const {resetStack} = useLogin();
  const {fetchUserInfo} = useFetchUser();
  const {
    pickDocumentDetails,
    uploadDocumentToStorage,
    uploadMedia,
    handleCompression,
    handleRegister,
    handleUpdatecertificate,
  } = useRegister();
  const totalFields = 8;
  const documentValues = {
    photoID,
    commissionCertificate: certificate,
    ronApproval,
    bond,
    insurance,
    training,
  };
  const uploadedCount = DOCUMENT_ORDER.filter(key =>
    Boolean(documentValues[key]),
  ).length;
  const approvalState = getApprovalState(user);

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
    const [document] = await pickDocumentDetails(false);
    if (!document?.uri) {
      return;
    }
    setter(document);
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

  const uploadDocument = async document => {
    const uri = typeof document === 'string' ? document : document?.uri;
    if (!uri) {
      throw new Error('The selected document is no longer available.');
    }
    if (/^https?:\/\//i.test(uri)) {
      return uri;
    }
    return uploadDocumentToStorage(uri, document?.name, document?.type);
  };

  const hasMatchingRegisteredAccount = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const registeredUser = await fetchUserInfo();
      return (
        registeredUser?.email?.trim().toLowerCase() ===
          registerData.email?.trim().toLowerCase() &&
        registeredUser?.phone_number?.trim() ===
          registerData.phoneNumber?.trim()
      );
    } catch (error) {
      console.error('Unable to resume notary registration:', error);
      return false;
    }
  };

  const buildOnboardingPayload = documentUrlMap => ({
    approvalStatus: 'submitted',
    commission: {
      state: commissionState,
      county: commissionCounty.trim(),
      city: commissionCity.trim(),
      number: commissionNumber.trim(),
      issueDate: commissionIssueDate.trim(),
      expirationDate: commissionExpirationDate.trim(),
      ronStatus,
    },
    credentials: {
      photoId: documentUrlMap.photoID,
      commissionCertificate: documentUrlMap.commissionCertificate,
      ronApproval: documentUrlMap.ronApproval,
      bond: documentUrlMap.bond,
      insurance: documentUrlMap.insurance,
      training: documentUrlMap.training,
    },
    assets: {},
  });

  const submitVerification = async () => {
    setSubmitted(true);
    const missingCommission =
      !commissionState ||
      !commissionCounty.trim() ||
      !commissionCity.trim() ||
      !commissionNumber.trim() ||
      !commissionIssueDate.trim() ||
      !commissionExpirationDate.trim() ||
      !ronStatus;
    const missingDocuments = DOCUMENT_ORDER.some(key => !documentValues[key]);

    if (missingCommission || missingDocuments) {
      Toast.show({
        type: 'warning',
        text1: 'Onboarding incomplete',
        text2: 'Complete commission details and all credential uploads.',
      });
      return;
    }

    setLoading(true);
    try {
      if (user) {
        const uploadedUrls = await Promise.all(
          DOCUMENT_ORDER.map(key => uploadDocument(documentValues[key])),
        );
        const documentUrlMap = DOCUMENT_ORDER.reduce((acc, key, index) => {
          acc[key] = uploadedUrls[index];
          return acc;
        }, {});
        await handleUpdatecertificate({
          photoId: documentUrlMap.photoID,
          certificate_url: documentUrlMap.commissionCertificate,
          notaryOnboarding: buildOnboardingPayload(documentUrlMap),
        });
        await AsyncStorage.setItem(
          `agentOnboarding:${user?._id}`,
          JSON.stringify(buildOnboardingPayload(documentUrlMap)),
        );
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

      const canResumeRegistration = await hasMatchingRegisteredAccount();
      const isRegistered =
        canResumeRegistration ||
        (await handleRegister({
          ...registerData,
          profilePicture: '',
          certificateUrl: '',
          photoId: '',
          notarySeal: '',
        }));
      if (!isRegistered) {
        throw new Error('Registration failed');
      }
      if (
        registerData.profilePicture &&
        registerData.profilePicture !== 'none' &&
        !registerData.profilePicture.startsWith('https://')
      ) {
        const imageBlob = await handleCompression(registerData.profilePicture);
        const profilePicture = await uploadMedia(imageBlob, 'profile');
        await updateProfilePicture({variables: {profilePicture}});
      }
      const uploadedUrls = await Promise.all(
        DOCUMENT_ORDER.map(key => uploadDocument(documentValues[key])),
      );
      const documentUrlMap = DOCUMENT_ORDER.reduce((acc, key, index) => {
        acc[key] = uploadedUrls[index];
        return acc;
      }, {});
      await handleUpdatecertificate({
        photoId: documentUrlMap.photoID,
        certificate_url: documentUrlMap.commissionCertificate,
        notaryOnboarding: buildOnboardingPayload(documentUrlMap),
      });
      await AsyncStorage.setItem(
        `agentOnboarding:${registerData.email}`,
        JSON.stringify(buildOnboardingPayload(documentUrlMap)),
      );
      resetStack('signup');
    } catch (error) {
      console.log(error, 'error');
      Toast.show({
        type: 'error',
        text1: 'Unable to submit documents',
        text2: error?.message || 'Check your files and try again.',
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
            Complete your commission details and required credential review.
          </Text>
        </View>

        <ApprovalStateTracker currentState={approvalState} />

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
            <Text style={styles.statusValue}>
              {uploadedCount} / {DOCUMENT_ORDER.length}
            </Text>
          </View>
        </View>

        <SectionHeader
          title="Commission details"
          description="Used to determine state eligibility and review status."
        />
        <View style={styles.formCard}>
          <AuthSelectField
            label="Commission state"
            placeholder="Select state"
            data={statesData}
            value={commissionState}
            onSelect={item => setCommissionState(item.value)}
            error={submitted && !commissionState ? 'Select a state' : ''}
          />
          <AuthTextField
            label="County"
            icon="map-pin"
            placeholder="County"
            value={commissionCounty}
            onChangeText={setCommissionCounty}
            error={submitted && !commissionCounty.trim() ? 'Enter county' : ''}
          />
          <AuthTextField
            label="City"
            icon="home"
            placeholder="City"
            value={commissionCity}
            onChangeText={setCommissionCity}
            error={submitted && !commissionCity.trim() ? 'Enter city' : ''}
          />
          <AuthTextField
            label="Commission number"
            icon="hash"
            placeholder="Commission number"
            value={commissionNumber}
            onChangeText={setCommissionNumber}
            error={
              submitted && !commissionNumber.trim()
                ? 'Enter commission number'
                : ''
            }
          />
          <View style={styles.twoColumnRow}>
            <View style={styles.twoColumnItem}>
              <AuthTextField
                label="Issue date"
                icon="calendar"
                placeholder="MM/DD/YYYY"
                value={commissionIssueDate}
                onChangeText={setCommissionIssueDate}
                error={
                  submitted && !commissionIssueDate.trim()
                    ? 'Enter issue date'
                    : ''
                }
              />
            </View>
            <View style={styles.twoColumnItem}>
              <AuthTextField
                label="Expiration"
                icon="calendar"
                placeholder="MM/DD/YYYY"
                value={commissionExpirationDate}
                onChangeText={setCommissionExpirationDate}
                error={
                  submitted && !commissionExpirationDate.trim()
                    ? 'Enter expiration'
                    : ''
                }
              />
            </View>
          </View>
          <RonStatusSegment value={ronStatus} onChange={setRonStatus} />
        </View>

        <SectionHeader
          title="Credentials"
          description="Upload the documents required for notary approval."
        />
        <View style={styles.documentStack}>
          <AuthUploadCard
            {...DOCUMENTS.photoID}
            uploaded={Boolean(photoID)}
            onPress={() => selectDocument('photoID', setPhotoID)}
            onRemove={() => confirmDelete('photo ID', 'photoID', setPhotoID)}
          />
          <View style={styles.documentSpacer} />
          <AuthUploadCard
            {...DOCUMENTS.commissionCertificate}
            uploaded={Boolean(certificate)}
            onPress={() =>
              selectDocument('commissionCertificate', setCertificate)
            }
            onRemove={() =>
              confirmDelete(
                'commission certificate',
                'commissionCertificate',
                setCertificate,
              )
            }
          />
          <View style={styles.documentSpacer} />
          <AuthUploadCard
            {...DOCUMENTS.ronApproval}
            uploaded={Boolean(ronApproval)}
            onPress={() => selectDocument('ronApproval', setRonApproval)}
            onRemove={() =>
              confirmDelete('RON approval', 'ronApproval', setRonApproval)
            }
          />
          <View style={styles.documentSpacer} />
          <AuthUploadCard
            {...DOCUMENTS.bond}
            uploaded={Boolean(bond)}
            onPress={() => selectDocument('bond', setBond)}
            onRemove={() => confirmDelete('bond', 'bond', setBond)}
          />
          <View style={styles.documentSpacer} />
          <AuthUploadCard
            {...DOCUMENTS.insurance}
            uploaded={Boolean(insurance)}
            onPress={() => selectDocument('insurance', setInsurance)}
            onRemove={() =>
              confirmDelete('insurance evidence', 'insurance', setInsurance)
            }
          />
          <View style={styles.documentSpacer} />
          <AuthUploadCard
            {...DOCUMENTS.training}
            uploaded={Boolean(training)}
            onPress={() => selectDocument('training', setTraining)}
            onRemove={() =>
              confirmDelete('training evidence', 'training', setTraining)
            }
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
  approvalCard: {
    marginBottom: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.white,
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  approvalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: -8,
  },
  approvalPill: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.backgroundSubtle,
  },
  approvalPillActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primarySoft,
  },
  approvalPillText: {
    marginLeft: 6,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  approvalPillTextActive: {
    color: AppColors.primary,
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
  sectionHeader: {
    marginTop: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  sectionDescription: {
    marginTop: 4,
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  formCard: {
    marginBottom: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.white,
  },
  twoColumnRow: {
    flexDirection: 'row',
    columnGap: 10,
  },
  twoColumnItem: {
    flex: 1,
  },
  segmentWrap: {
    marginBottom: 4,
  },
  segmentLabel: {
    marginBottom: 8,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segment: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.backgroundSubtle,
  },
  segmentSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primarySoft,
  },
  segmentText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  segmentTextSelected: {
    color: AppColors.primary,
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
