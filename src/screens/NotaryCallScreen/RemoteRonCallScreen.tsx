import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useApolloClient, gql} from '@apollo/client';
import {useSelector} from 'react-redux';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import LiveKitSessionVideo from '../../components/LiveKitSessionVideo/LiveKitSessionVideo';
import {GET_SESSION_BY_ID} from '../../../request/queries/getSessionByID.query';
import {GET_BOOKING_BY_ID} from '../../../request/queries/getBookingByID.query';
import {getRonDocuments} from '../../utils/ronDocuments';
import useRegister from '../../hooks/useRegister';

const SAVE_SESSION_DOC = gql`
  mutation RonAdditionalSessionDocument(
    $id: String!
    $docs: [ClientDocsType!]!
  ) {
    createOrUpdateClientDocs(sessionId: $id, clientDocuments: $docs) {
      status
      message
    }
  }
`;
const SAVE_BOOKING_DOC = gql`
  mutation RonAdditionalBookingDocument(
    $id: String!
    $docs: [ClientDocsType!]!
  ) {
    bookingCreateOrUpdateClientDocs(bookingId: $id, clientDocuments: $docs) {
      status
      message
    }
  }
`;

export default function RemoteRonCallScreen({route, navigation}: any) {
  const booking = useSelector((state: any) => state.booking.booking) || {};
  const user = useSelector((state: any) => state.user.user);
  const isAgent = String(user?.account_type || '').includes('agent');
  const recordId = String(route.params?.uid || booking._id || '');
  const isSession =
    booking.__typename === 'Session' || Boolean(booking.date_time_session);
  const client = useApolloClient();
  const insets = useSafeAreaInsets();
  const {pickDocumentDetails, uploadDocumentToStorage} = useRegister();
  const [documents, setDocuments] = useState<any[]>(() =>
    getRonDocuments(booking),
  );
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [documentError, setDocumentError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [openedDocument, setOpenedDocument] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const uploadingRef = useRef(false);
  const allowLeave = useRef(false);
  const confirmingLeave = useRef(false);

  const refreshDocuments = useCallback(async () => {
    setLoadingDocuments(true);
    setDocumentError('');
    try {
      const response = await client.query({
        query: isSession ? GET_SESSION_BY_ID : GET_BOOKING_BY_ID,
        variables: isSession ? {sessionId: recordId} : {bookingId: recordId},
        fetchPolicy: 'network-only',
      });
      const result = isSession
        ? response.data?.getSession
        : response.data?.getBookingById;
      const record = result?.session || result?.booking;
      if (!record)
        throw new Error(result?.message || 'Could not load session documents.');
      setDocuments(getRonDocuments(record));
    } catch (error: any) {
      setDocumentError(error?.message || 'Could not load session documents.');
    } finally {
      setLoadingDocuments(false);
    }
  }, [client, isSession, recordId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);
  useEffect(() => {
    navigation.setOptions({gestureEnabled: false});
  }, [navigation]);

  const confirmLeave = useCallback(
    (action?: any) => {
      if (confirmingLeave.current) return;
      confirmingLeave.current = true;
      Alert.alert(
        'Leave the call?',
        'Are you sure you want to leave the call?',
        [
          {
            text: 'Stay',
            style: 'cancel',
            onPress: () => {
              confirmingLeave.current = false;
            },
          },
          {
            text: 'Leave call',
            style: 'destructive',
            onPress: () => {
              confirmingLeave.current = false;
              allowLeave.current = true;
              if (action) navigation.dispatch(action);
              else navigation.goBack();
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {
            confirmingLeave.current = false;
          },
        },
      );
    },
    [navigation],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (allowLeave.current) return;
      event.preventDefault();
      confirmLeave(event.data.action);
    });
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmLeave();
      return true;
    });
    return () => {
      unsubscribe();
      back.remove();
    };
  }, [confirmLeave, navigation]);

  const uploadAdditionalDocument = async () => {
    if (uploadingRef.current) return;
    uploadingRef.current = true;
    setUploading(true);
    try {
      const [document] = await pickDocumentDetails(false);
      if (!document) return;
      const uri = await uploadDocumentToStorage(
        document.uri,
        document.name,
        document.type,
      );
      if (!uri) throw new Error('The document could not be uploaded.');
      const response = await client.mutate({
        mutation: isSession ? SAVE_SESSION_DOC : SAVE_BOOKING_DOC,
        variables: {
          id: recordId,
          docs: [{key: `additional-${Date.now()}`, value: uri}],
        },
      });
      const result =
        response.data?.createOrUpdateClientDocs ||
        response.data?.bookingCreateOrUpdateClientDocs;
      if (String(result?.status) !== '200')
        throw new Error(result?.message || 'Could not save the document.');
      setDocuments(current => [
        ...current,
        {uri, name: document.name, type: document.type, additional: true},
      ]);
    } catch (error: any) {
      Alert.alert('Upload failed', error?.message || 'Please try again.');
    } finally {
      uploadingRef.current = false;
      setUploading(false);
    }
  };

  const availableDocuments = documents.filter(
    document => !isAgent || !document.additional,
  );
  return (
    <View
      style={[
        styles.screen,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Leave call"
          onPress={() => confirmLeave()}
          style={styles.iconButton}>
          <Feather name="arrow-left" size={23} color="#171C28" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          Notary session
        </Text>
        <TouchableOpacity
          accessibilityLabel={isAgent ? 'Select document' : 'Session documents'}
          onPress={() => setPickerOpen(true)}
          style={styles.docButton}>
          <Feather name="file-text" size={18} color="#FF6B18" />
          <Text style={styles.docButtonText}>
            {isAgent ? 'Select Doc' : 'Documents'}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Keep this room mounted while opening documents and changing camera state. */}
      <View style={openedDocument ? styles.compactMedia : styles.fullMedia}>
        <LiveKitSessionVideo
          recordId={recordId}
          canJoin={Boolean(recordId)}
          compact={Boolean(openedDocument)}
          isClient={!isAgent}
          onLeave={() => confirmLeave()}
        />
      </View>
      {openedDocument && (
        <DocumentViewer
          document={openedDocument}
          onClose={() => setOpenedDocument(null)}
        />
      )}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.backdrop}>
          <View
            style={[
              styles.sheet,
              {paddingBottom: Math.max(insets.bottom, 20)},
            ]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.title}>Session documents</Text>
              <TouchableOpacity
                accessibilityLabel="Close documents"
                onPress={() => setPickerOpen(false)}
                style={styles.iconButton}>
                <Feather name="x" size={22} color="#171C28" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.documentList}>
              {availableDocuments.map((document, index) => (
                <TouchableOpacity
                  key={document.uri}
                  accessibilityLabel={`Open ${document.name}`}
                  onPress={() => {
                    setOpenedDocument(document);
                    setPickerOpen(false);
                  }}
                  style={styles.documentRow}>
                  <Feather name="file-text" size={23} color="#FF6B18" />
                  <View style={styles.documentName}>
                    <Text style={styles.rowTitle}>{document.name}</Text>
                    <Text style={styles.rowDetail}>
                      {document.additional
                        ? 'Additional document'
                        : index === 0
                        ? 'Main document'
                        : 'Uploaded before the call'}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={19} color="#697386" />
                </TouchableOpacity>
              ))}
              {loadingDocuments && (
                <ActivityIndicator style={styles.busy} color="#FF6B18" />
              )}
              {!loadingDocuments && !availableDocuments.length && (
                <Text style={styles.empty}>
                  No uploaded documents are available.
                </Text>
              )}
              {documentError ? (
                <TouchableOpacity
                  onPress={refreshDocuments}
                  style={styles.retry}>
                  <Text style={styles.error}>{documentError}</Text>
                  <Text style={styles.docButtonText}>Retry</Text>
                </TouchableOpacity>
              ) : null}
            </ScrollView>
            {!isAgent && (
              <TouchableOpacity
                disabled={uploading}
                onPress={uploadAdditionalDocument}
                style={styles.uploadButton}>
                {uploading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Feather name="upload" size={18} color="#FFFFFF" />
                )}
                <Text style={styles.uploadText}>
                  {uploading ? 'Uploading...' : 'Upload additional document'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DocumentViewer({document, onClose}: any) {
  const [path, setPath] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const pdf = useRef<any>(null);
  const isImage = document.type?.startsWith('image');
  useEffect(() => {
    let active = true;
    let download: any;
    const target = `${
      RNFS.CachesDirectoryPath
    }/ron-preview-${Date.now()}-${Math.random().toString(36).slice(2)}.${
      isImage ? 'png' : 'pdf'
    }`;
    setPath('');
    setError('');
    setPage(1);
    setPages(1);
    (async () => {
      try {
        if (!/^https?:\/\//i.test(document.uri)) {
          if (active) setPath(document.uri);
          return;
        }
        download = RNFS.downloadFile({
          fromUrl: document.uri,
          toFile: target,
          connectionTimeout: 15000,
          readTimeout: 30000,
        });
        const result = await download.promise;
        if (
          result.statusCode < 200 ||
          result.statusCode >= 300 ||
          !result.bytesWritten
        )
          throw new Error('The document could not be downloaded.');
        if (active) setPath(`file://${target}`);
      } catch (failure: any) {
        if (active)
          setError(failure?.message || 'Could not open this document.');
      }
    })();
    return () => {
      active = false;
      if (download) RNFS.stopDownload(download.jobId);
      RNFS.unlink(target).catch(() => undefined);
    };
  }, [document.uri, attempt, isImage]);
  return (
    <View style={styles.viewer}>
      <View style={styles.header}>
        <Text style={styles.documentName} numberOfLines={1}>
          {document.name}
        </Text>
        <TouchableOpacity
          accessibilityLabel="Close document"
          onPress={onClose}
          style={styles.iconButton}>
          <Feather name="x" size={22} color="#171C28" />
        </TouchableOpacity>
      </View>
      {error ? (
        <View style={styles.viewerState}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity
            style={styles.retry}
            onPress={() => setAttempt(value => value + 1)}>
            <Text style={styles.docButtonText}>Retry document</Text>
          </TouchableOpacity>
        </View>
      ) : !path ? (
        <View style={styles.viewerState}>
          <ActivityIndicator color="#FF6B18" />
          <Text style={styles.rowDetail}>Opening document...</Text>
        </View>
      ) : isImage ? (
        <Image
          source={{uri: path}}
          style={styles.fullMedia}
          resizeMode="contain"
          onError={() => setError('Could not display this image.')}
        />
      ) : (
        <Pdf
          ref={pdf}
          source={{uri: path}}
          style={styles.fullMedia}
          trustAllCerts={false}
          enablePaging
          horizontal
          onLoadComplete={(count: number) => setPages(count)}
          onPageChanged={(next: number) => setPage(next)}
          onError={() => setError('Could not display this PDF. Please retry.')}
        />
      )}
      {!isImage && path && !error && (
        <View style={styles.pages}>
          <TouchableOpacity
            accessibilityLabel="Previous page"
            disabled={page <= 1}
            style={styles.iconButton}
            onPress={() => pdf.current?.setPage(page - 1)}>
            <Feather
              name="chevron-left"
              size={22}
              color={page <= 1 ? '#BFC4CC' : '#171C28'}
            />
          </TouchableOpacity>
          <Text>
            {page} / {pages}
          </Text>
          <TouchableOpacity
            accessibilityLabel="Next page"
            disabled={page >= pages}
            style={styles.iconButton}
            onPress={() => pdf.current?.setPage(page + 1)}>
            <Feather
              name="chevron-right"
              size={22}
              color={page >= pages ? '#BFC4CC' : '#171C28'}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EC',
  },
  title: {flex: 1, fontSize: 17, fontWeight: '700', color: '#171C28'},
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 8,
  },
  docButtonText: {fontSize: 14, fontWeight: '600', color: '#FF6B18'},
  fullMedia: {flex: 1},
  compactMedia: {minHeight: 80},
  viewer: {flex: 1, backgroundColor: '#F4F5F7'},
  viewerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  sheetHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  documentList: {flexGrow: 0},
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EC',
  },
  documentName: {flex: 1, fontSize: 15, fontWeight: '600', color: '#171C28'},
  rowTitle: {fontSize: 15, fontWeight: '600', color: '#171C28'},
  rowDetail: {fontSize: 12, color: '#697386', marginTop: 5},
  busy: {padding: 16},
  empty: {paddingVertical: 24, color: '#697386'},
  error: {color: '#B73646', textAlign: 'center'},
  retry: {paddingVertical: 16, alignItems: 'center', gap: 8},
  uploadButton: {
    minHeight: 48,
    backgroundColor: '#FF6B18',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  uploadText: {color: '#FFFFFF', fontWeight: '600', fontSize: 14},
  pages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    backgroundColor: '#FFFFFF',
  },
});
