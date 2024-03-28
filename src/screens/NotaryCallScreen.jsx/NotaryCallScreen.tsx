import {
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  View,
  ScrollView,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  Alert,
  BackHandler,
  Dimensions,
  ActivityIndicator,
  Text as RNText,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Colors from '../../themes/Colors';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
} from 'react-native-agora';

import Toast from 'react-native-toast-message';
import {PDFDocument} from 'pdf-lib';
import PdfView from 'react-native-pdf';

import RNPickerSelect from 'react-native-picker-select';
import {Edit, PageEdit, Text} from 'iconoir-react-native';
import {useLiveblocks} from '../../store/liveblocks';
const appId = 'abd7df71ee024625b2cc979e12aec405';

import {useSelector} from 'react-redux';
import Pdf from 'react-native-pdf';
import Signature from 'react-native-signature-canvas';
import {decode as atob, encode as btoa} from 'base-64';
import RNFS from 'react-native-fs';
import {uploadSignedDocumentsOnS3} from '../../utils/s3Helper';
import {useMutation} from '@apollo/client';
import {SIGN_DOCS} from '../../../request/mutations/signDocument';
import {launchImageLibrary} from 'react-native-image-picker';
import PdfObject from '../../components/LiveBlocksComponents/pdf-object';

export default function NotaryCallScreen({route, navigation}: any) {
  const [UpdateDocumentsByDocId] = useMutation(SIGN_DOCS);
  const User = useSelector(state => state?.user?.user);
  const bookingData = useSelector(state => state?.booking?.booking);

  console.log(bookingData);

  const [sourceUrl, setSourceUrl] = useState(
    bookingData.__typename == 'Session'
      ? bookingData.client_documents['Document 1']
      : bookingData?.documents[0].url,
  );
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [getSignaturePad, setSignaturePad] = useState(false);
  const [pdfEditMode, setPdfEditMode] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState(null);
  const [signatureArrayBuffer, setSignatureArrayBuffer] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState(null);
  const [newPdfSaved, setNewPdfSaved] = useState(false);
  const [newPdfPath, setNewPdfPath] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [filePath, setFilePath] = useState(
    `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
  );

  const [isSignatureImage, setIsSignatureImage] = useState(false);
  const [signatureImageMimeType, setSignatureImageMimeType] = useState(null);

  useEffect(() => {
    downloadFile();
    if (signatureBase64) {
      setSignatureArrayBuffer(_base64ToArrayBuffer(signatureBase64));
    }
    if (newPdfSaved) {
      setFilePath(newPdfPath);
      setPdfArrayBuffer(_base64ToArrayBuffer(pdfBase64));
    }
  }, [signatureBase64, filePath, newPdfSaved, sourceUrl]);

  const _base64ToArrayBuffer = base64 => {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const _uint8ToBase64 = u8Arr => {
    const CHUNK_SIZE = 0x8000; //arbitrary number
    let index = 0;
    const length = u8Arr.length;
    let result = '';
    let slice;
    while (index < length) {
      slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
      result += String.fromCharCode.apply(null, slice);
      index += CHUNK_SIZE;
    }
    return btoa(result);
  };

  const downloadFile = () => {
    if (!fileDownloaded) {
      RNFS.downloadFile({
        fromUrl: sourceUrl,
        toFile: newPdfPath ? newPdfPath : filePath,
      }).promise.then(res => {
        setFileDownloaded(true);
        readFile();
      });
    }
  };

  const readFile = () => {
    RNFS.readFile(
      `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
      'base64',
    ).then(contents => {
      setPdfBase64(contents);
      setPdfArrayBuffer(_base64ToArrayBuffer(contents));
    });
  };

  const getSignature = () => {
    setSignaturePad(!getSignaturePad);
    setIsSignatureImage(false);
    setSignatureImageMimeType(null);
  };

  const handleSignature = signature => {
    setSignatureBase64(signature.replace('data:image/png;base64,', ''));
    setSignaturePad(false);
    setPdfEditMode(true);
  };

  const onAddSignatureImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
      });
      if (result && result.assets && result.assets.length > 0) {
        setSignatureBase64(result.assets[0].base64);

        setSignatureImageMimeType(result.assets[0].type);
        setIsSignatureImage(true);

        setSignaturePad(false);
        setPdfEditMode(true);
        console.log('result', result);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  ////////////// live bolcks ////////////////
  const insertObject = useLiveblocks(state => state.insertObject);
  const objects = useLiveblocks(state => state.objects);
  const selectedObjectId = useLiveblocks(state => state.selectedObjectId);

  const onSignatureAdd = React.useCallback(() => {
    insertObject(new Date().toISOString(), {
      type: 'image',
      sourceUrl: 'https://i.ibb.co/0XxrCH9/signature-40121.png',
      page: currentPage,
      position: {
        x: 100,
        y: 100,
      },
    });
  }, []);
  //////////////////////////////////////////

  const handleSingleTap = async (page, x, y) => {
    console.log('page', page, x, y);
    // return;
    if (pdfEditMode) {
      setNewPdfSaved(false);
      setFilePath(null);
      setPdfEditMode(false);
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer, {
        ignoreEncryption: true,
      });
      const pages = pdfDoc.getPages();
      const firstPage = pages[page - 1];
      // The meat
      const signatureImage =
        signatureImageMimeType == 'image/png' || !signatureImageMimeType
          ? await pdfDoc.embedPng(signatureArrayBuffer)
          : await pdfDoc.embedJpg(signatureArrayBuffer);
      if (Platform.OS == 'ios') {
        firstPage.drawImage(signatureImage, {
          x: (pageWidth * (x - 12)) / Dimensions.get('window').width,
          y: pageHeight - (pageHeight * (y + 12)) / 540,
          width: 50,
          height: 50,
        });
      } else {
        firstPage.drawImage(signatureImage, {
          x: (firstPage.getWidth() * x) / pageWidth,
          y:
            firstPage.getHeight() -
            (firstPage.getHeight() * y) / pageHeight -
            25,
          width: 50,
          height: 50,
        });
      }
      // Play with these values as every project has different requirements
      const pdfBytes = await pdfDoc.save();
      const pdfBase64 = _uint8ToBase64(pdfBytes);
      const path = `${
        RNFS.DocumentDirectoryPath
      }/react-native_signed_${Date.now()}.pdf`;
      console.log('path', path);
      RNFS.writeFile(path, pdfBase64, 'base64')
        .then(async success => {
          setNewPdfPath(path);
          setNewPdfSaved(true);
          setPdfBase64(pdfBase64);
          const l = await uploadSignedDocumentsOnS3(pdfBase64);
          updateSignedDocumentToDb(l);
        })
        .catch(err => {
          console.log('eeee', err.message);
        });
    }
  };
  const handleLinkChange = (linkId: string) => {
    setSourceUrl(linkId);
    setNewPdfPath(linkId);
    setNewPdfSaved(true);
  };

  const updateSignedDocumentToDb = async url => {
    try {
      const request = {
        variables: {
          bookingId: bookingData?._id,
          documentId: '1',
          documents: JSON.stringify({
            name: bookingData?.documents[0].name,
            url: url,
            id: bookingData?.documents[0].id,
          }),
        },
      };
      const response = await UpdateDocumentsByDocId(request);
      console.log('response', response);
    } catch (error) {
      console.log('error', error);
    }
  };

  /////////////////////////////////////

  ///////////////////////////////

  const {channel, token: CutomToken} = route.params;
  const uid = 0;
  const channelName = channel;
  const token = CutomToken;
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUids, setRemoteUids] = useState<number[]>([]);
  const agoraEngineRef = useRef<IRtcEngine>();
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);

  const [value, setValue] = useState(50);

  const remoteCurrentPage = useLiveblocks(state => state.currentPage);

  const pdfRef = React.useRef<Pdf>(null);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const [newSource, setNewSource] = useState<object>();
  const [currentPage, setCurrentPage] =
    React.useState<number>(remoteCurrentPage);

  const handleBackButton = () => {
    navigation.navigate('WaitingRoomScreen', {
      uid: bookingData?._id,
      channel: bookingData?.agora_channel_name,
      token: bookingData?.agora_channel_token,
      time: bookingData?.time_of_booking,
      date: bookingData?.date_of_booking,
    });
    return true;
  };
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, []);
  useEffect(() => {
    const setupVideoSDKEngine = async () => {
      try {
        if (Platform.OS === 'android') {
          await getPermission();
        }
        agoraEngineRef.current = createAgoraRtcEngine();
        const agoraEngine = agoraEngineRef.current;
        agoraEngine.registerEventHandler({
          onJoinChannelSuccess: () => {
            showMessage('Successfully joined ' + channelName);
            setIsJoined(true);
          },
          onUserJoined: (_connection, uid) => {
            showMessage('Remote user joined with uid ' + uid);

            setRemoteUids(prevUids => [...prevUids, uid]);
          },
          onUserOffline: (_connection, uid) => {
            showMessage('Remote user left the channel. uid: ' + uid);

            setRemoteUids(prevUids => prevUids.filter(uid => uid !== uid));
          },
          onRequestToken(connection) {},
        });
        agoraEngine.initialize({
          appId: appId,
          channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
        });
        agoraEngine.enableVideo();
      } catch (e) {
        console.log(e);
      }
    };
    setupVideoSDKEngine().then(() => {
      join();
    });
    return () => {
      agoraEngineRef.current?.leaveChannel();
    };
  }, []);
  const join = async () => {
    console.log('====================================');
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngineRef.current?.startPreview();
      // console.log(token, channelName, uid);
      agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };
  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUids([]);

      setIsJoined(false);
      showMessage('You left the session');
    } catch (e) {
      console.log(e);
    }
  };
  function showMessage(msg: string) {
    console.log(msg);
    Toast.show({
      type: 'success',
      text1: msg,
    });
  }
  const mute = () => {
    setIsMuted(!isMuted);
    console.log('====================================');
    console.log(remoteUids, isMuted);
    console.log('====================================');
    agoraEngineRef.current?.muteRemoteAudioStream(remoteUid, isMuted);
  };

  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  /////

  return (
    <SafeAreaView style={styles.Maincontainer}>
      <View style={styles.SecondContainer}>
        <View style={styles.flexContainer}>
          <ScrollView
            style={styles.scroll}
            horizontal={true}
            contentContainerStyle={styles.scrollContainer}>
            {isJoined ? (
              <React.Fragment key={0}>
                <RtcSurfaceView canvas={{uid: 0}} style={styles.videoView} />
              </React.Fragment>
            ) : (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  source={{uri: User?.profile_picture}}
                  style={{
                    width: widthToDp(25),
                    height: widthToDp(25),
                    borderRadius: 100,
                  }}
                />
              </View>
            )}
            {remoteUids.map((uid, index) => (
              <View key={index}>
                <RtcSurfaceView canvas={{uid}} style={styles.videoView} />
              </View>
            ))}
          </ScrollView>
          <View style={{flex: 0.2, justifyContent: 'space-evenly'}}>
            {isJoined ? (
              <TouchableOpacity
                style={styles.hourGlass}
                onPress={() => setIsJoined(!isJoined)}>
                <Image
                  source={require('../../../assets/videoOff.png')}
                  style={{width: widthToDp(10), height: widthToDp(10)}}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.hourGlass}
                onPress={() => setIsJoined(!isJoined)}>
                <Image
                  source={require('../../../assets/video.png')}
                  style={{width: widthToDp(10), height: widthToDp(10)}}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.hourGlass} onPress={() => mute()}>
              <Image
                source={
                  isMuted
                    ? require('../../../assets/unmute.png')
                    : require('../../../assets/mute.png')
                }
                style={{width: widthToDp(10), height: widthToDp(10)}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{backgroundColor: Colors.white}}>
        <RNPickerSelect
          style={pickerSelectStyles}
          onValueChange={itemValue => handleLinkChange(itemValue)}
          items={
            bookingData.__typename == 'Session'
              ? Object.keys(bookingData.client_documents).map(doc => {
                  return {label: doc, value: bookingData.client_documents[doc]};
                })
              : bookingData.documents.map((doc: {name: any; url: any}) => ({
                  label: doc.name,
                  value: doc.url,
                }))
          }
        />
      </View>
      <View style={styles.container}>
        <View style={styles.pdfWrapper}>
          {/* <View style={styles.objectsWrapper}>
            {Object.entries(objects).map(([objectId, object]) => {
              console.log('object', currentPage, objectId);
              if (object.page !== currentPage) {
                return null;
              }

              return (
                <PdfObject
                  id={objectId}
                  key={objectId}
                  object={object}
                  selected={selectedObjectId === objectId}
                />
              );
            })}
          </View> */}

          {getSignaturePad ? (
            <Signature
              onOK={sig => handleSignature(sig)}
              onEmpty={() => console.log('___onEmpty')}
              descriptionText="Sign"
              clearText="Clear"
              confirmText="Save"
            />
          ) : (
            fileDownloaded && (
              <>
                {filePath ? (
                  <PdfView
                    // ref={pdfRef}
                    style={styles.pdfView}
                    source={{uri: filePath}}
                    trustAllCerts={false}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    // horizontal={true}

                    enablePaging={true}
                    minScale={1.0}
                    maxScale={1.0}
                    scale={1.0}
                    spacing={0}
                    fitPolicy={0}
                    onLoadComplete={(
                      numberOfPages,
                      filePath,
                      {width, height},
                    ) => {
                      setPageWidth(width);
                      setPageHeight(height);
                    }}
                    onPageChanged={(page, numberOfPages) => {}}
                    onPageSingleTap={(page, x, y) => {
                      handleSingleTap(page, x, y);
                    }}
                    onError={error => console.error(error)}
                  />
                ) : (
                  <View
                    style={{
                      width: widthToDp(100),
                      flex: 1,
                      height: height,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 999,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <ActivityIndicator
                      size="large"
                      color={Colors.Orange}
                      style={{marginTop: -200}}
                    />
                    <RNText
                      style={{
                        color: Colors.Orange,
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginTop: 20,
                      }}>
                      Saving the Pdf file
                    </RNText>
                  </View>
                )}
              </>
            )
          )}
        </View>
        <View style={styles.actions}>
          <View style={styles.editActions}>
            <MainButton
              Title="Sign"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              styles={{
                paddingHorizontal: widthToDp(3),
                paddingVertical: widthToDp(2),
              }}
              onPress={() => {
                //  onSignatureAdd();
                getSignature();
              }}
            />
            <MainButton
              Title="Upload sign"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              styles={{
                paddingHorizontal: widthToDp(1),
                paddingVertical: widthToDp(2),
              }}
              onPress={() => {
                onAddSignatureImage();
              }}
            />

            {User.account_type != 'client' && (
              <MainButton
                Title="Add stamp"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                styles={{
                  paddingHorizontal: widthToDp(1),
                  paddingVertical: widthToDp(2),
                }}
                onPress={() => {
                  onAddSignatureImage();
                }}
              />
            )}
          </View>
          {User.account_type != 'client' && (
            <View>
              <MainButton
                Title="Complete call"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                styles={{
                  paddingHorizontal: widthToDp(4),
                  paddingVertical: widthToDp(2),
                }}
                onPress={() => {
                  //leave();
                }}
              />
            </View>
          )}

          {/* <View style={styles.navigation}>
            <Pressable onPress={() => {}}>
              <NavArrowLeft width={36} height={36} />
            </Pressable>
            <Pressable onPress={() => {}}>
              <NavArrowRight width={36} height={36} />
            </Pressable>
          </View> */}
        </View>
      </View>
    </SafeAreaView>
  );
}
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdfWrapper: {
    flex: 1,
  },
  pdfView: {
    flex: 1,
    // height: height * 0.6,
  },
  objectsWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: '#e2e2e2',
    backgroundColor: '#ffffff',
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
  },
  Maincontainer: {
    flex: 1,
    //backgroundColor: Colors.PinkBackground,
  },
  NavbarContainer: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(2),
    justifyContent: 'space-between',
  },
  NavContainer: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(2),
    marginVertical: widthToDp(2),
    // borderWidth: 1,
  },
  waitingNav: {
    width: widthToDp(6),
    height: heightToDp(6),
    marginVertical: widthToDp(2),
  },
  profilePic: {
    marginVertical: widthToDp(2),
  },
  flexContainer: {
    flexDirection: 'row',
    height: heightToDp(40),
  },
  scrollBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthToDp(5),
  },
  picker: {
    borderWidth: 2,
    backgroundColor: Colors.white,
    borderColor: Colors.DisableColor,
  },
  NavTextContainer: {
    // borderWidth: 1,
    marginLeft: widthToDp(5),
  },
  textHead: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontWeight: '700',
    fontFamily: 'Manrope-Regular',
  },
  textSubHead: {
    color: Colors.TextColor,
    fontSize: widthToDp(3.5),
    fontWeight: '700',
    marginLeft: widthToDp(2),
    fontFamily: 'Manrope-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    // borderWidth: 1,
    justifyContent: 'center',
  },
  SecondContainer: {
    backgroundColor: Colors.white,
  },
  hourGlass: {
    alignSelf: 'center',
  },
  textSession: {
    color: Colors.TextColor,
    marginHorizontal: widthToDp(5),
    marginTop: heightToDp(10),
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  sessionDesc: {
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  btn: {
    marginVertical: heightToDp(2),
  },
  btncontain: {
    flex: 1,
    justifyContent: 'flex-end',
    marginVertical: heightToDp(5),
  },
  slideContainer: {
    flex: 1,
    marginHorizontal: widthToDp(5),
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 4,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#0055cc',
    margin: 5,
  },
  main: {
    flex: 1,
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    margin: widthToDp(3),
    columnGap: widthToDp(4),
  },
  videoView: {
    width: widthToDp(25),
    height: heightToDp(30),
    resizeMode: 'contain',
    borderRadius: 15,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  head: {
    fontSize: 20,
  },
  info: {
    backgroundColor: '#ffffe0',
    color: '#0000ff',
  },
});

///////////////////////////////

// const deleteAllObjects = useLiveblocks(state => state.deleteAllObjects);
// // const [selectedLink, setSelectedLink] = useState(arrayOfDocs[0].id);
// const {channel, token: CutomToken} = route.params;
// const uid = 0;
// const channelName = channel;
// const token = CutomToken;
// const [isMuted, setIsMuted] = useState(false);
// const [remoteUids, setRemoteUids] = useState<number[]>([]);
// const agoraEngineRef = useRef<IRtcEngine>();
// const [isJoined, setIsJoined] = useState(false);
// const [remoteUid, setRemoteUid] = useState(0);
// const [selected, setSelected] = useState('notary room');
// const [value, setValue] = useState(50);
// const pdfRef = React.useRef<Pdf>(null);
// const objects = useLiveblocks(state => state.objects);
// const remoteCurrentPage = useLiveblocks(state => state.currentPage);
// const setRemoteCurrentPage = useLiveblocks(state => state.setCurrentPage);
// const insertObject = useLiveblocks(state => state.insertObject);
// const selectedObjectId = useLiveblocks(state => state.selectedObjectId);
// const [totalPages, setTotalPages] = React.useState<number>(0);
// const [newSource, setNewSource] = useState<object>();
// const [currentPage, setCurrentPage] = React.useState<number>(remoteCurrentPage);

// const handleLinkChange = (linkId: string) => {
//   setFileDownloaded(true);
//   setSourceUrl(linkId);
//   setNewSource({
//     uri: linkId,
//     cache: true,
//   });
// };
// React.useEffect(() => {
//   setNewSource({uri: bookingData?.documents[0].url, cache: true});
// }, []);

// const handleBackButton = () => {
//   navigation.navigate('WaitingRoomScreen', {
//     uid: bookingData?._id,
//     channel: bookingData?.agora_channel_name,
//     token: bookingData?.agora_channel_token,
//     time: bookingData?.time_of_booking,
//     date: bookingData?.date_of_booking,
//   });
//   return true;
// };
// useEffect(() => {
//   BackHandler.addEventListener('hardwareBackPress', handleBackButton);
//   return () => {
//     BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
//   };
// }, []);
// useEffect(() => {
//   const setupVideoSDKEngine = async () => {
//     try {
//       if (Platform.OS === 'android') {
//         await getPermission();
//       }
//       agoraEngineRef.current = createAgoraRtcEngine();
//       const agoraEngine = agoraEngineRef.current;
//       agoraEngine.registerEventHandler({
//         onJoinChannelSuccess: () => {
//           showMessage('Successfully joined ' + channelName);
//           setIsJoined(true);
//         },
//         onUserJoined: (_connection, uid) => {
//           showMessage('Remote user joined with uid ' + uid);

//           setRemoteUids(prevUids => [...prevUids, uid]);
//         },
//         onUserOffline: (_connection, uid) => {
//           showMessage('Remote user left the channel. uid: ' + uid);

//           setRemoteUids(prevUids => prevUids.filter(uid => uid !== uid));
//         },
//         onRequestToken(connection) {},
//       });
//       agoraEngine.initialize({
//         appId: appId,
//         channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
//       });
//       agoraEngine.enableVideo();
//     } catch (e) {
//       console.log(e);
//     }
//   };
//   setupVideoSDKEngine().then(() => {
//     join();
//   });
//   return () => {
//     agoraEngineRef.current?.leaveChannel();
//   };
// }, []);
// const join = async () => {
//   console.log('====================================');
//   if (isJoined) {
//     return;
//   }
//   try {
//     agoraEngineRef.current?.setChannelProfile(
//       ChannelProfileType.ChannelProfileCommunication,
//     );
//     agoraEngineRef.current?.startPreview();
//     // console.log(token, channelName, uid);
//     agoraEngineRef.current?.joinChannel(token, channelName, uid, {
//       clientRoleType: ClientRoleType.ClientRoleBroadcaster,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };
// const leave = () => {
//   try {
//     agoraEngineRef.current?.leaveChannel();
//     setRemoteUids([]);

//     setIsJoined(false);
//     showMessage('You left the session');
//   } catch (e) {
//     console.log(e);
//   }
// };
// function showMessage(msg: string) {
//   console.log(msg);
//   Toast.show({
//     type: 'success',
//     text1: msg,
//   });
// }
// const mute = () => {
//   setIsMuted(!isMuted);
//   console.log('====================================');
//   console.log(remoteUids, isMuted);
//   console.log('====================================');
//   agoraEngineRef.current?.muteRemoteAudioStream(remoteUid, isMuted);
// };

// const displayValue = () => {
//   return (
//     <Text style={[styles.sessionDesc, {color: Colors.Orange}]}>
//       {Math.floor(value)}%
//     </Text>
//   );
// };
// const getPermission = async () => {
//   if (Platform.OS === 'android') {
//     await PermissionsAndroid.requestMultiple([
//       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//       PermissionsAndroid.PERMISSIONS.CAMERA,
//     ]);
//   }
// };
