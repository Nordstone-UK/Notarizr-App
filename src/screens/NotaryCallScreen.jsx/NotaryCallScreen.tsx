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
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
  VideoContentHint,
} from 'react-native-agora';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import {PDFDocument} from 'pdf-lib';
import PdfView, {Source} from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import RNPickerSelect from 'react-native-picker-select';
import {
  Edit,
  NavArrowLeft,
  NavArrowRight,
  PageEdit,
  Text,
} from 'iconoir-react-native';
import {useLiveblocks} from '../../store/liveblocks';
const appId = 'abd7df71ee024625b2cc979e12aec405';
import PdfObject from '../../components/LiveBlocksComponents/pdf-object';
import HeaderRight from '../../components/LiveBlocksComponents/header-right';
import {useSelector} from 'react-redux';

export default function NotaryCallScreen({route, navigation}: any) {
  const User = useSelector(state => state?.user?.user);
  const bookingData = useSelector(state => state?.booking?.booking);
  // console.log(bookingData?.documents);
  const arrayOfDocs = bookingData?.documents;
  // const arrayOfDocs = [
  //   {
  //     id: 1,
  //     name: 'Document 1',
  //     url: 'https://images.template.net/wp-content/uploads/2015/12/29130015/Sample-Contract-Agreement-Template-PDF.pdf',
  //   },
  //   {
  //     id: 2,
  //     name: 'Document 2',
  //     url: 'https://sccrtc.org/wp-content/uploads/2010/09/SampleContract-Shuttle.pdf',
  //   },
  // ];
  const deleteAllObjects = useLiveblocks(state => state.deleteAllObjects);
  const [selectedLink, setSelectedLink] = useState(arrayOfDocs[0].id);
  const {channel, token: CutomToken} = route.params;
  const uid = 0;
  const channelName = channel;
  const token = CutomToken;
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUids, setRemoteUids] = useState<number[]>([]);
  const agoraEngineRef = useRef<IRtcEngine>();
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [selected, setSelected] = useState('notary room');
  const [value, setValue] = useState(50);
  const pdfRef = React.useRef<PdfView>(null);
  const objects = useLiveblocks(state => state.objects);
  const remoteCurrentPage = useLiveblocks(state => state.currentPage);
  const setRemoteCurrentPage = useLiveblocks(state => state.setCurrentPage);
  const insertObject = useLiveblocks(state => state.insertObject);
  const selectedObjectId = useLiveblocks(state => state.selectedObjectId);
  const [totalPages, setTotalPages] = React.useState<number>(0);

  const [currentPage, setCurrentPage] =
    React.useState<number>(remoteCurrentPage);
  const [pdfSource, setPdfSource] = React.useState<Source | null>(null);

  const onUpdatePdf = useCallback(async (link: string) => {
    console.log(link);
    const pdfFile = await ReactNativeBlobUtil.fetch('GET', link);
    const pdfDoc = await PDFDocument.load(pdfFile.base64(), {
      ignoreEncryption: true,
    });
    const base64Pdf = await pdfDoc.saveAsBase64({dataUri: true});
    setPdfSource({
      uri: base64Pdf,
    });
  }, []);
  const handleLinkChange = (linkId: string) => {
    // console.log('Something', selectedDoc);
    // const selectedDoc = arrayOfDocs.find(
    //   (doc: {id: number}) => doc.id === linkId,
    // );
    deleteAllObjects();
    onUpdatePdf(linkId);
  };
  React.useEffect(() => {
    onUpdatePdf(arrayOfDocs[0].url);
  }, []);
  const onLabelAdd = React.useCallback(() => {
    insertObject(new Date().toISOString(), {
      type: 'label',
      text: 'John Doe',
      page: currentPage,
      position: {
        x: 100,
        y: 100,
      },
    });
  }, [currentPage, insertObject]);

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
  }, [currentPage, insertObject]);

  const onStampAdd = React.useCallback(() => {
    insertObject(new Date().toISOString(), {
      type: 'image',
      sourceUrl: 'https://i.ibb.co/989TrsJ/free-stamp-png-24402.png',
      page: currentPage,
      position: {
        x: 200,
        y: 200,
      },
    });
  }, [currentPage, insertObject]);

  React.useEffect(() => {
    if (remoteCurrentPage !== currentPage) {
      pdfRef.current?.setPage(remoteCurrentPage);
    }
  }, [remoteCurrentPage, currentPage]);

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

  const displayValue = () => {
    return (
      <Text style={[styles.sessionDesc, {color: Colors.Orange}]}>
        {Math.floor(value)}%
      </Text>
    );
  };
  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };
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
          items={arrayOfDocs.map((doc: {name: any; url: any}) => ({
            label: doc.name,
            value: doc.url,
          }))}
        />
      </View>
      <View style={styles.container}>
        <View style={styles.pdfWrapper}>
          {pdfSource && (
            <PdfView
              ref={pdfRef}
              style={styles.pdfView}
              source={pdfSource}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              singlePage={true}
              onLoadComplete={numberOfPages => {
                console.log('Func', numberOfPages);
                setCurrentPage(1);
                setTotalPages(numberOfPages);
              }}
              onPageChanged={page => {
                setCurrentPage(page);
                setRemoteCurrentPage(page);
              }}
              onError={error => console.error(error)}
            />
          )}
          <View style={styles.objectsWrapper}>
            {Object.entries(objects).map(([objectId, object]) => {
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
          </View>
        </View>
        <View style={styles.actions}>
          <View style={styles.editActions}>
            <Pressable onPress={() => onSignatureAdd()}>
              <Edit width={30} height={30} color="#000000" />
            </Pressable>
            <Pressable onPress={() => onLabelAdd()}>
              <Text width={32} height={32} color="#000000" />
            </Pressable>
            <Pressable onPress={() => onStampAdd()}>
              <PageEdit width={26} height={26} color="#000000" />
            </Pressable>
            <HeaderRight />
          </View>
          <View style={styles.navigation}>
            <Pressable
              onPress={() => {
                if (currentPage !== 1) {
                  pdfRef.current?.setPage(currentPage - 1);
                }
              }}>
              <NavArrowLeft
                width={36}
                height={36}
                color={currentPage === 1 ? '#dddddd' : '#000000'}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                pdfRef.current?.setPage(currentPage + 1);
              }}>
              <NavArrowRight
                width={36}
                height={36}
                color={currentPage === totalPages ? '#dddddd' : '#000000'}
              />
            </Pressable>
          </View>
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
    backgroundColor: Colors.PinkBackground,
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
