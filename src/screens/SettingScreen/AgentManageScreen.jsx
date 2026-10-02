import React, {useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';
import AppColors from '../../themes/AppColors';
import useFetchUser from '../../hooks/useFetchUser';
import useRegister from '../../hooks/useRegister';

const PRO_FEATURES = [
  {
    title: 'Whitelabel',
    description: 'Brand invited-user flows for Pro sessions.',
    icon: 'layout',
  },
  {
    title: 'Branded emails',
    description: 'Customize invite and reminder messages.',
    icon: 'mail',
  },
  {
    title: 'In-session checklist',
    description: 'Keep your call steps consistent while notarizing.',
    icon: 'check-square',
  },
  {
    title: 'Call script',
    description: 'Save opening, ID, oath and completion prompts.',
    icon: 'file-text',
  },
  {
    title: 'Loan signing program',
    description: 'Track title and closing-style workflows.',
    icon: 'briefcase',
  },
];

const statusCopy = (ready, loading) =>
  loading ? 'Uploading' : ready ? 'Ready' : 'Needs setup';

const titleize = value =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, letter => letter.toUpperCase());

const formatDate = value => {
  if (!value) {
    return 'Not provided';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

function Section({children, subtitle, title}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function AssetRow({description, icon, loading, onPress, ready, title}) {
  const status = statusCopy(ready, loading);
  return (
    <TouchableOpacity
      activeOpacity={0.76}
      disabled={loading}
      onPress={onPress}
      style={styles.assetRow}>
      <View style={styles.assetIcon}>
        <Feather name={icon} size={18} color={AppColors.primary} />
      </View>
      <View style={styles.assetCopy}>
        <Text style={styles.assetTitle}>{title}</Text>
        <Text style={styles.assetDescription}>{description}</Text>
      </View>
      <View style={[styles.statusPill, ready && styles.statusPillReady]}>
        {loading ? (
          <ActivityIndicator color={AppColors.primary} size="small" />
        ) : (
          <Text style={[styles.statusText, ready && styles.statusTextReady]}>
            {status}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ProFeature({description, icon, title}) {
  return (
    <View style={styles.proFeature}>
      <View style={styles.proIcon}>
        <Feather name={icon} size={16} color={AppColors.info} />
      </View>
      <View style={styles.proCopy}>
        <Text style={styles.proTitle}>{title}</Text>
        <Text style={styles.proDescription}>{description}</Text>
      </View>
      <View style={styles.proBadge}>
        <Text style={styles.proBadgeText}>PRO</Text>
      </View>
    </View>
  );
}

function DetailRow({label, value, last}) {
  return (
    <View style={[styles.detailRow, last && styles.lastDetailRow]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Not provided'}</Text>
    </View>
  );
}

function VerificationSummary({onboarding, user}) {
  const commission = onboarding?.commission || {};
  const credentials = onboarding?.credentials || {};
  const agentName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.full_name ||
    'This notary';
  const credentialCount = [
    credentials.photoId,
    credentials.commissionCertificate,
    credentials.ronApproval,
    credentials.bond,
    credentials.insurance,
    credentials.training,
  ].filter(Boolean).length;
  const approved =
    onboarding?.approvalStatus === 'approved' || user?.isVerified;
  const status = approved
    ? 'Approved'
    : titleize(onboarding?.approvalStatus || 'Under review');

  return (
    <Section
      subtitle="Your commission, RON approval and credential status used by admin review."
      title="Verification">
      <View style={styles.verificationBanner}>
        <View style={styles.verificationIcon}>
          <Feather
            name={approved ? 'check-circle' : 'clock'}
            size={19}
            color={approved ? AppColors.success : AppColors.warning}
          />
        </View>
        <View style={styles.verificationCopy}>
          <Text style={styles.verificationTitle}>
            {approved ? 'Verified notary' : 'Verification in review'}
          </Text>
          <Text style={styles.verificationText}>
            {approved
              ? `${agentName} is approved to receive eligible online sessions.`
              : 'Admin review is required before all agent tools are unlocked.'}
          </Text>
        </View>
        <View
          style={[
            styles.verificationPill,
            approved && styles.verificationPillReady,
          ]}>
          <Text
            style={[
              styles.verificationPillText,
              approved && styles.verificationPillTextReady,
            ]}>
            {status}
          </Text>
        </View>
      </View>
      <View style={styles.detailGrid}>
        <DetailRow
          label="Commission state"
          value={commission.state || user?.state}
        />
        <DetailRow
          label="RON approval"
          value={titleize(commission.ronStatus || (approved ? 'approved' : ''))}
        />
        <DetailRow label="Commission no." value={commission.number} />
        <DetailRow
          label="Expires"
          value={formatDate(commission.expirationDate)}
        />
        <DetailRow
          label="Credentials"
          value={`${credentialCount}/6 uploaded`}
        />
        <DetailRow
          label="Reviewed"
          last
          value={formatDate(onboarding?.reviewedAt)}
        />
      </View>
      {onboarding?.reviewNotes ? (
        <View style={styles.reviewNote}>
          <Text style={styles.reviewNoteLabel}>Admin note</Text>
          <Text style={styles.reviewNoteText}>{onboarding.reviewNotes}</Text>
        </View>
      ) : null}
    </Section>
  );
}

export default function AgentManageScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const onboarding = user?.notaryOnboarding || {};
  const assets = onboarding?.assets || {};
  const [uploadingAsset, setUploadingAsset] = useState('');
  const {
    handleUpdateSeal,
    handleUpdatecertificate,
    pickDocumentDetails,
    uploadDocumentToStorage,
  } = useRegister();
  const {fetchUserInfo} = useFetchUser();
  const signatureCount = Array.isArray(user?.notarysigns)
    ? user.notarysigns.length
    : 0;

  const openSignatures = () => navigation.navigate('StampAndSignatureScreen');
  const saveAsset = async (assetKey, label) => {
    try {
      const [document] = await pickDocumentDetails(false);
      if (!document?.uri) {
        return;
      }

      setUploadingAsset(assetKey);
      const publicUrl = await uploadDocumentToStorage(
        document.uri,
        document.name,
        document.type,
      );
      const saved = await handleUpdatecertificate({
        notaryOnboarding: {
          assets: {
            [assetKey]: publicUrl,
          },
        },
      });

      if (!saved) {
        throw new Error('Unable to save asset URL.');
      }

      if (assetKey === 'eSeal') {
        await handleUpdateSeal({notarySeal: publicUrl});
      }

      await fetchUserInfo();
      Toast.show({
        type: 'success',
        text1: `${label} saved`,
        text2: 'The file was uploaded and linked to your notary profile.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: `${label} not saved`,
        text2: error?.message || 'Try uploading the file again.',
      });
    } finally {
      setUploadingAsset('');
    }
  };
  const showComingSoon = title =>
    Toast.show({
      type: 'info',
      text1: `${title} is a Pro tool`,
      text2: 'Available for agents with Pro access.',
    });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={AppColors.textPrimary}
      />
      <View style={styles.header}>
        <View style={styles.headerGlow} />
        <View style={styles.headerToolbar}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            activeOpacity={0.72}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={AppColors.white} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>NOTARY MANAGE</Text>
            <Text style={styles.title}>Manage</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          Keep reusable notary assets and Pro tools ready before sessions start.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <VerificationSummary onboarding={onboarding} user={user} />

        <Section
          subtitle="These apply across sessions and should not be collected during signup."
          title="Notary assets">
          <AssetRow
            description={`${signatureCount}/2 saved signatures available for signing tools.`}
            icon="edit-3"
            onPress={openSignatures}
            ready={signatureCount > 0}
            title="Digital signature"
          />
          <AssetRow
            description="Upload or update the electronic seal used on final PDFs."
            icon="award"
            loading={uploadingAsset === 'eSeal'}
            onPress={() => saveAsset('eSeal', 'eSeal')}
            ready={Boolean(user?.notarySeal || assets?.eSeal)}
            title="eSeal"
          />
          <AssetRow
            description="Upload, manage or replace your digital signing certificate."
            icon="lock"
            loading={uploadingAsset === 'digitalCertificate'}
            onPress={() =>
              saveAsset('digitalCertificate', 'Digital certificate')
            }
            ready={Boolean(assets?.digitalCertificate)}
            title="Digital certificate"
          />
          <AssetRow
            description="Store reusable acknowledgment or jurat forms for completion."
            icon="file-text"
            loading={uploadingAsset === 'certificateForms'}
            onPress={() => saveAsset('certificateForms', 'Certificate forms')}
            ready={Boolean(assets?.certificateForms)}
            title="Certificate forms"
          />
        </Section>

        <Section
          subtitle="These are account-level notary tools, not booking fields."
          title="Pro features">
          {PRO_FEATURES.map(item => (
            <TouchableOpacity
              activeOpacity={0.76}
              key={item.title}
              onPress={() => showComingSoon(item.title)}>
              <ProFeature {...item} />
            </TouchableOpacity>
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  assetCopy: {flex: 1, marginHorizontal: 12},
  assetDescription: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  assetIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  assetRow: {
    alignItems: 'center',
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    paddingVertical: 12,
  },
  assetTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  content: {
    backgroundColor: AppColors.background,
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  eyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 1,
  },
  header: {
    backgroundColor: AppColors.textPrimary,
    overflow: 'hidden',
    paddingBottom: 18,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerCopy: {alignItems: 'center', flex: 1, marginHorizontal: 10},
  headerGlow: {
    backgroundColor: 'rgba(253,109,31,0.15)',
    borderRadius: 70,
    height: 140,
    position: 'absolute',
    right: -35,
    top: -75,
    width: 140,
  },
  headerSpacer: {height: 40, width: 40},
  headerSubtitle: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
    textAlign: 'center',
  },
  headerToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailGrid: {
    borderTopColor: AppColors.border,
    borderTopWidth: 1,
  },
  detailLabel: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  detailRow: {
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    paddingVertical: 11,
  },
  detailValue: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  lastDetailRow: {borderBottomWidth: 0},
  proBadge: {
    backgroundColor: AppColors.infoSoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  proBadgeText: {
    color: AppColors.info,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  proCopy: {flex: 1, marginHorizontal: 12},
  proDescription: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  proFeature: {
    alignItems: 'center',
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 70,
    paddingVertical: 11,
  },
  proIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.infoSoft,
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  proTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  safeArea: {backgroundColor: AppColors.textPrimary, flex: 1},
  section: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  sectionBody: {marginTop: 4},
  sectionSubtitle: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  reviewNote: {
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 8,
    marginBottom: 14,
    padding: 12,
  },
  reviewNoteLabel: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  reviewNoteText: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  statusPill: {
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusPillReady: {backgroundColor: AppColors.successSoft},
  statusText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  statusTextReady: {color: AppColors.success},
  title: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
    letterSpacing: 0,
  },
  verificationBanner: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 14,
    paddingTop: 8,
  },
  verificationCopy: {
    flex: 1,
    marginHorizontal: 12,
  },
  verificationIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.successSoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  verificationPill: {
    backgroundColor: AppColors.warningSoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  verificationPillReady: {backgroundColor: AppColors.successSoft},
  verificationPillText: {
    color: AppColors.warning,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  verificationPillTextReady: {color: AppColors.success},
  verificationText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  verificationTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
});
