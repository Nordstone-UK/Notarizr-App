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

const CLIENT_JOIN_CHECKLIST = [
  'Accept the secure invitation and sign in or create an account.',
  'Confirm name, email and phone so invites and receipts are tied to the signer.',
  'Confirm physical location, document jurisdiction, language and service type.',
  'Review documents, participants, appointment time and price before payment.',
  'Complete identity verification, device check and recording consent before the call.',
];

const statusCopy = (ready, loading) =>
  loading ? 'Uploading' : ready ? 'Ready' : 'Needs setup';

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

function ChecklistItem({children, index}) {
  return (
    <View style={styles.checklistItem}>
      <View style={styles.checklistIndex}>
        <Text style={styles.checklistIndexText}>{index + 1}</Text>
      </View>
      <Text style={styles.checklistText}>{children}</Text>
    </View>
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
      text1: `${title} is coming soon`,
      text2: 'This belongs in the agent manage hub, not booking details.',
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

        <Section
          subtitle="When an invited signer opens Notarizr for the first time, ask only for what is needed to prepare the session."
          title="Client first-join checklist">
          {CLIENT_JOIN_CHECKLIST.map((item, index) => (
            <ChecklistItem index={index} key={item}>
              {item}
            </ChecklistItem>
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
  checklistIndex: {
    alignItems: 'center',
    backgroundColor: AppColors.successSoft,
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  checklistIndexText: {
    color: AppColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  checklistItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  checklistText: {
    color: AppColors.textPrimary,
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
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
});
