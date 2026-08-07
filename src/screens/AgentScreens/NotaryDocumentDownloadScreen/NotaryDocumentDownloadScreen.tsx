import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import Feather from 'react-native-vector-icons/Feather';
import ProfileScreenHeader from '../../../components/Profile/ProfileScreenHeader';
import BookingActionButton from '../../../components/Bookings/BookingActionButton';
import BookingColors from '../../../themes/BookingColors';

export default function NotaryDocumentDownloadScreen({route, navigation}) {
  const {document} = route.params;
  const [filePath, setFilePath] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!document) {
      setError(true);
      return;
    }

    const fileUri = `${RNFS.DocumentDirectoryPath}/notarizr-document.pdf`;
    RNFS.downloadFile({fromUrl: document, toFile: fileUri})
      .promise.then(() => setFilePath(fileUri))
      .catch(downloadError => {
        console.error('Error downloading file:', downloadError);
        setError(true);
      });
  }, [document]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Review document"
      />

      <View style={styles.documentMeta}>
        <View style={styles.fileIcon}>
          <Feather name="file-text" size={20} color={BookingColors.primary} />
        </View>
        <View style={styles.metaCopy}>
          <Text style={styles.fileName}>Notary document</Text>
          <Text style={styles.fileHint}>Secure PDF • Ready for review</Text>
        </View>
        <View style={styles.secureBadge}>
          <Feather name="shield" size={12} color={BookingColors.success} />
          <Text style={styles.secureText}>Protected</Text>
        </View>
      </View>

      <View style={styles.viewerShell}>
        {filePath ? (
          <Pdf
            onError={pdfError => {
              console.error('PDF error:', pdfError);
              setError(true);
            }}
            source={{uri: filePath}}
            style={styles.pdf}
          />
        ) : error ? (
          <View style={styles.state}>
            <View style={styles.errorIcon}>
              <Feather
                name="alert-circle"
                size={25}
                color={BookingColors.error}
              />
            </View>
            <Text style={styles.stateTitle}>Document unavailable</Text>
            <Text style={styles.stateText}>
              The file could not be downloaded. Return to the booking and try
              again.
            </Text>
          </View>
        ) : (
          <View style={styles.state}>
            <ActivityIndicator color={BookingColors.primary} size="small" />
            <Text style={styles.stateTitle}>Preparing document</Text>
            <Text style={styles.stateText}>
              Downloading the secure copy for review.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionBar}>
        <BookingActionButton
          icon="arrow-right"
          label="Return to workspace"
          onPress={() => navigation.goBack()}
          style={styles.primaryButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  documentMeta: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.textPrimary,
    backgroundColor: BookingColors.textPrimary,
  },
  fileIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
  },
  metaCopy: {flex: 1, minWidth: 0, marginLeft: 11},
  fileName: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  fileHint: {
    marginTop: 3,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: BookingColors.successSoft,
  },
  secureText: {
    marginLeft: 5,
    color: BookingColors.success,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  viewerShell: {
    flex: 1,
    padding: 12,
    backgroundColor: BookingColors.background,
  },
  pdf: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: BookingColors.surface,
  },
  state: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  errorIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.errorSoft,
  },
  stateTitle: {
    marginTop: 14,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
  },
  stateText: {
    maxWidth: 280,
    marginTop: 5,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  actionBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  primaryButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
