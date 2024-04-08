import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import { formatDateTime, heightToDp, widthToDp } from '../../../utils/Responsive';
import DocumentComponent from '../../../components/DocumentComponent/DocumentComponent';
import MainButton from '../../../components/MainGradientButton/MainButton';
import NavigationHeader from '../../../components/Navigation Header/NavigationHeader';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import useBookingStatus from '../../../hooks/useBookingStatus';
import { useDispatch, useSelector } from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../../features/booking/bookingSlice';
import DocumentScanner from 'react-native-document-scanner-plugin';

import moment from 'moment';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import useRegister from '../../../hooks/useRegister';
import useFetchBooking from '../../../hooks/useFetchBooking';
import useCustomerSuport from '../../../hooks/useCustomerSupport';
import Toast from 'react-native-toast-message';
// import {BottomSheet} from '@rneui/base';
import UploadDocsSheet from '../../../components/UploadDocsSheet/UploadDocsSheet';
import { useSession } from '../../../hooks/useSession';
import { useLiveblocks } from '../../../store/liveblocks';
import Loading from '../../../components/LiveBlocksComponents/loading';
import RequestPayment from '../../../components/RequestPayment/RequestPayment';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CheckCircle, CheckCircleSolid, Xmark } from 'iconoir-react-native';
import useFetchUser from '../../../hooks/useFetchUser';

export default function AgentMobileNotaryStartScreen({ route, navigation }: any) {
  const clientDetail = useSelector((state: any) => state?.booking?.booking);
  const {
    handlegetBookingStatus,
    handleSessionStatus,
    handleUpdateBookingStatus,
  } = useBookingStatus();
  const { handleupdateBookingInfo, setSessionPrice, setBookingPrice } =
    useFetchBooking();
  const { uploadAllDocuments } = useRegister();
  const { handleCallSupport } = useCustomerSuport();
  const { updateSession } = useSession();
  const { searchUserByEmail } = useFetchUser();

  let { documents: documentArray } = clientDetail;
  const { booked_for } = clientDetail;
  const { proof_documents } = clientDetail;
  const dispatch = useDispatch();
  const [status, setStatus] = useState();
  const [isVisible, setIsVisible] = useState(false);
  const enterRoom = useLiveblocks(state => state.liveblocks.enterRoom);
  const leaveRoom = useLiveblocks(state => state.liveblocks.leaveRoom);
  const [notary, setNotary] = useState();
  const [showNotes, setShowNotes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [signaturePage, setSignaturePage] = useState();
  const [notaryBlock, setNotaryBlock] = useState();
  const [AmountEntered, setAmountEntered] = useState<number>(0);
  const [searchFor, setSearchFor] = useState('');
  const [showObserverSearchView, setShowObserverSearchView] = useState(false);
  const [searchedUser, setSearchedUser] = useState([]);
  const [observers, setObservers] = useState([]);
  const [isLoading, setisLoading] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getBookingStatus();
      setRefreshing(false);
      console.log('Refreshing.....');
    }, 2000);
  }, []);
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['25%', '40%'], []);
  const handleClientData = () => {
    setLoading(true);
    if (
      clientDetail?.service_type === 'mobile_notary' &&
      status === 'Accepted'
    ) {
      handleUpdateBookingStatus('accepted', clientDetail._id);

      dispatch(setBookingInfoState(clientDetail));
      dispatch(
        setCoordinates(
          clientDetail?.booked_by?.current_location?.coordinates
            ? clientDetail?.booked_by?.current_location?.coordinates
            : clientDetail?.client?.current_location?.coordinates,
        ),
      );
      dispatch(
        setUser(
          clientDetail?.booked_by
            ? clientDetail?.booked_by
            : clientDetail?.client,
        ),
      );
      navigation.navigate('MapArrivalScreen');
    } else {
      handleUpdateBookingStatus('To_be_paid', clientDetail._id);
      getBookingStatus();
    }
    setLoading(false);
  };
  const getBookingStatus = async () => {
    let statusUpdate;
    try {
      if (clientDetail?.__typename === 'Session') {
        statusUpdate = await handleSessionStatus(clientDetail?._id);
      } else {
        statusUpdate = await handlegetBookingStatus(clientDetail?._id);
      }
      setStatus(capitalizeFirstLetter(statusUpdate));
    } catch (error) {
      console.error('Error retrieving booking status:', error);
    }
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getBookingStatus();
    });
    return unsubscribe;
  }, [status]);
  const handleNext = () => {
    if (!signaturePage || !notaryBlock) {
      Toast.show({
        type: 'error',
        text1: 'Please upload documents',
      });
    } else {
      setNotary(null);
      setShowNotes(true);
    }
  };
  const handleStatusChange = async (string: string) => {
    setLoading(true);
    try {
      if (clientDetail?.__typename !== 'Session') {
        await handleUpdateBookingStatus(string, clientDetail?._id);
      } else {
        await updateSession(string, clientDetail?._id);
      }
      await getBookingStatus();
    } catch (error) {
      console.error('Error updating and fetching booking status:', error);
    }
    setLoading(false);
  };
  const handleComplete = async () => {
    setLoading(true);
    const signatureURL = await uploadAllDocuments(signaturePage);
    const notaryURL = await uploadAllDocuments(notaryBlock);
    const documents = {
      Signature_Page: signatureURL,
      Notary_Block: notaryURL,
    };
    await handleStatusChange('completed', clientDetail._id);
    const response = await handleupdateBookingInfo(
      clientDetail._id,
      notes,
      documents,
    );
    if (!response) {
      Toast.show({
        type: 'error',
        text1: 'Problem occured while uploading documents',
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Your payout will be received in 48 hours',
      });
    }
    setShowNotes(false);
    setLoading(false);
  };
  const scanDocument = async () => {
    const { scannedImages } = await DocumentScanner.scanDocument();
    return scannedImages;
  };
  const handleSignaturePage = async () => {
    const signatureResponse = await scanDocument();
    setSignaturePage(signatureResponse);
    setIsVisible(false);
  };
  const handleNotaryBlock = async () => {
    const NotaryResponse = await scanDocument();
    setNotaryBlock(NotaryResponse);
    setIsVisible(false);
  };
  const handleCancel = async () => {
    setIsVisible(false);
  };
  function displayNamesWithCommas(arr: any[]) {
    const names = arr.map((obj: { name: any }) => obj.name);
    const namesString = names.join(', ');
    return namesString;
  }
  const setBookingAmount = async () => {
    try {
      let response;

      if (clientDetail?.__typename === 'Session') {
        response = await setSessionPrice(
          clientDetail?._id,
          AmountEntered,
          clientDetail?.documents,
        );
        console.log(response);
      } else {
        response = await setBookingPrice(
          clientDetail?._id,
          AmountEntered,
          clientDetail?.review,
          clientDetail?.rating,
          clientDetail?.notes,
          clientDetail?.documents,
        );
        console.log(response);
      }
      handleCloseModalPress();
      if (response == 200) {
        Toast.show({
          type: 'success',
          text1: 'Amount requested successfully',
        });
      }
    } catch (error) {
      console.error('Error setting booking price:', error);
    }
  };
  const isStorageLoading = useLiveblocks(
    state => state.liveblocks.isStorageLoading,
  );
  const handlePresentModalPress = () => {
    if (clientDetail.payment_type == 'on_notarizr') {
      bottomSheetModalRef.current?.present();
    } else {
      navigation.navigate('NotaryCallScreen', {
        uid: clientDetail?._id,
        channel: clientDetail?.agora_channel_name,
        token: clientDetail?.agora_channel_token,
      });
    }
  };

  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);
  React.useEffect(() => {
    enterRoom('test-room');

    return () => {
      leaveRoom();
    };
  }, [enterRoom, leaveRoom]);

  // console.log('lietder', clientDetail);
  const SearchUser = async query => {
    setisLoading(true);
    const response = await searchUserByEmail(query);
    setSearchedUser(response);
    setisLoading(false);
  };
  console.log("clientdetails", clientDetail)
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        lastImg={require('../../../../assets/chatIcon.png')}
        lastImgPress={() =>
          navigation.navigate('ChatScreen', {
            sender: clientDetail?.agent,
            receiver: clientDetail?.booked_by || clientDetail?.client,
            chat: clientDetail?._id,
          })
        }
        midImg={require('../../../../assets/supportIcon.png')}
        midImgPress={() => handleCallSupport()}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
        <View style={styles.headingContainer}>
          <Text style={styles.lightHeading}>Selected Service</Text>
          {clientDetail?.service_type === 'mobile_notary' && (
            <Text style={styles.Heading}>Mobile Notary</Text>
          )}
          {clientDetail?.service_type !== 'mobile_notary' && (
            <Text style={styles.Heading}>Remote Online Notary</Text>
          )}
        </View>
      </View>

      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.insideContainer}>
            <Text style={[styles.insideHeading, { fontSize: widthToDp(6) }]}>
              {' '}
            </Text>
            <View style={[styles.iconContainer]}>
              {status === 'Pending' || (status === 'to_be_paid' && clientDetail.payment_type === 'on_agent') && (
                <Image
                  source={require('../../../../assets/pending.png')}
                  style={styles.greenIcon}
                />
              )}
              {(status === 'Completed' ||
                status === 'Accepted' ||
                status === 'Ongoing') ||
                (status === 'to_be_paid' && clientDetail.payment_type === 'on_agent') && (
                  <Image
                    source={require('../../../../assets/greenIcon.png')}
                    style={styles.greenIcon}
                  />
                )}
              {status === 'To_be_paid' ? (
                <>
                  <Image
                    source={require('../../../../assets/greenIcon.png')}
                    style={styles.greenIcon}
                  />
                  {clientDetail.payment_type === 'on_agent' ? (
                    <Text style={styles.insideText}>Accepted</Text>
                  ) : (
                    <Text style={styles.insideText}>To Be Paid</Text>
                  )}
                </>
              ) : (
                <Text style={styles.insideText}>{status}</Text>
              )}
            </View>
          </View>
          {/* <ClientServiceCard
            image={require('../../../../assets/agentLocation.png')}
            source={{
              uri: clientDetail?.booked_by?.profile_picture
                ? `${clientDetail?.booked_by?.profile_picture}`
                : `${clientDetail?.client?.profile_picture}`,
            }}
            bottomRightText={clientDetail?.document_type}
            bottomLeftText="Total"
            agentName={
              clientDetail?.booked_by?.first_name &&
              clientDetail?.booked_by?.last_name
                ? `${clientDetail?.booked_by?.first_name} ${clientDetail?.booked_by?.last_name}`
                : `${clientDetail?.client?.first_name} ${clientDetail?.client?.last_name}`
            }
            agentAddress={
              clientDetail?.booked_by?.location
                ? `${clientDetail?.booked_by?.location}`
                : `${clientDetail?.client.location}`
            }
            task={clientDetail?.status}
            OrangeText="At Home"
            onPress={() =>
              navigation.navigate('ClientDetailsScreen', {
                clientDetail: clientDetail,
              })
            }
            status={clientDetail?.status}
            dateofBooking={clientDetail?.date_of_booking}
            timeofBooking={clientDetail?.time_of_booking}
            createdAt={clientDetail?.createdAt}
          /> */}
          <View style={styles.sheetContainer}>
            {/* <Text style={[styles.insideHeading]}>Booking Preferences</Text>
            {clientDetail?.service_type === 'mobile_notary' && (
              <View>
                <Text
                  style={{
                    fontSize: widthToDp(4),
                    marginLeft: widthToDp(7),
                    fontFamily: 'Manrope-Bold',
                    color: Colors.TextColor,
                  }}>
                  Document Type:
                </Text>
                <Text style={[styles.detail, {marginLeft: widthToDp(7)}]}>
                  {displayNamesWithCommas(clientDetail?.document_type)}
                </Text>
              </View>
            )} */}
            {clientDetail.client ? (
              <View>
                <Text style={[styles.insideHeading]}>Client details</Text>
                <View
                  style={{
                    width: widthToDp(90),
                    marginTop: 10,
                    marginHorizontal: widthToDp(5),
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: widthToDp(3),
                    borderRadius: widthToDp(2),
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                  <View style={{ marginRight: 10 }}>
                    <Image
                      source={{
                        uri:
                          clientDetail.client.profile_picture ||
                          'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                      }}
                      style={{
                        width: widthToDp(14),
                        height: widthToDp(14),
                        borderRadius: widthToDp(7),
                      }}
                    />
                  </View>
                  <View>
                    <Text style={{ color: 'black', fontFamily: 'Poppins-Bold' }}>
                      {clientDetail.client.email}
                    </Text>
                    <Text
                      style={{ color: 'black', fontFamily: 'Poppins-Regular' }}>
                      {clientDetail.client.first_name}{' '}
                      {clientDetail.client.last_name}
                    </Text>
                    {/* Render other client details here if available */}
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <Text style={[styles.insideHeading]}>Client details</Text>
                <View
                  style={{
                    width: widthToDp(90),
                    marginTop: 10,
                    marginHorizontal: widthToDp(5),
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: widthToDp(3),
                    borderRadius: widthToDp(2),
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                  <View style={{ marginRight: 10 }}>
                    <Image
                      source={{
                        uri: 'https://notarizr-app-data.s3.us-east-2.amazonaws.com/images/Profile%20Pictures/aa1e15ff-46d1-4c5d-95fe-569e6f2239f8.JPEG',
                      }}
                      style={{
                        width: widthToDp(14),
                        height: widthToDp(14),
                        borderRadius: widthToDp(7),
                      }}
                    />
                  </View>
                  <View>
                    <Text style={{ color: 'black', fontFamily: 'Poppins-Bold' }}>
                      {clientDetail.booked_by.email}
                    </Text>
                    <Text
                      style={{ color: 'black', fontFamily: 'Poppins-Regular' }}>
                      {clientDetail.booked_by.first_name}{' '}
                      {clientDetail.booked_by.last_name}
                    </Text>
                    {/* Render other alternative client details here */}
                  </View>
                </View>
              </View>
            )}

            {clientDetail.agent && (
              <View>
                <Text style={[styles.insideHeading]}>
                  Allocated agent details
                </Text>

                <View
                  style={{
                    width: widthToDp(90),
                    marginTop: 10,
                    marginHorizontal: widthToDp(5),

                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: widthToDp(3),
                    borderRadius: widthToDp(2),
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,

                    elevation: 5,
                    // marginLeft: 3,
                  }}>
                  <View style={{ marginRight: 10 }}>
                    <Image
                      source={{
                        uri:
                          clientDetail.agent.profile_picture != 'none'
                            ? clientDetail.agent.profile_picture
                            : 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                      }}
                      style={{
                        width: widthToDp(14),
                        height: widthToDp(14),
                        borderRadius: widthToDp(7),
                      }}
                    />
                  </View>
                  <View>
                    <Text style={{ color: 'black', fontFamily: 'Poppins-Bold' }}>
                      {clientDetail.agent?.email}
                    </Text>
                    <Text
                      style={{
                        color: 'black',
                        fontFamily: 'Poppins-Regular',
                      }}>
                      {clientDetail.agent.first_name}{' '}
                      {clientDetail.agent.last_name}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {clientDetail.observers && clientDetail.observers.length > 0 && (
              <View>
                <Text style={[styles.insideHeading]}>Observers </Text>
                <View>
                  {clientDetail.observers.map(item => {
                    return (
                      <View
                        style={{
                          width: widthToDp(90),
                          marginTop: 10,
                          marginHorizontal: widthToDp(5),

                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: widthToDp(3),
                          borderRadius: widthToDp(2),
                          backgroundColor: 'white',
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,

                          elevation: 5,
                          // marginLeft: 3,
                        }}>
                        <View style={{ marginRight: 10 }}>
                          <Image
                            source={{
                              uri: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                            }}
                            style={{
                              width: widthToDp(14),
                              height: widthToDp(14),
                              borderRadius: widthToDp(7),
                            }}
                          />
                        </View>
                        <View>
                          <Text
                            style={{
                              color: 'black',
                              fontFamily: 'Poppins-Bold',
                            }}>
                            {item}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
            {!clientDetail.observers ||
              (clientDetail.observers.length === 0 && (
                <View>
                  <Text style={styles.insideHeading}>Observers</Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      color: 'black',
                      paddingHorizontal: 40,
                    }}>
                    An Observer is anyone with relevant information for all the
                    signing that may need to be on the notarization session.
                  </Text>

                  <LabelTextInput
                    placeholder="Search observer by email"
                    defaultValue={''}
                    onChangeText={text => {
                      SearchUser(text);
                      setSearchFor('Observer');
                      setShowObserverSearchView(true);
                    }}
                    InputStyles={{ padding: widthToDp(2) }}
                    AdjustWidth={{
                      width: widthToDp(92),
                      borderColor: Colors.Orange,
                    }}
                    rightImageSoucre={require('../../../../assets/close.png')}
                    rightImagePress={() => {
                      setSearchedUser([]);
                    }}
                  />

                  {observers.length > 0 && (
                    <View>
                      {observers.map(item => {
                        return (
                          <View
                            style={{
                              width: widthToDp(90),
                              marginTop: 10,

                              backgroundColor: 'red',
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: widthToDp(3),
                              borderRadius: widthToDp(2),
                              backgroundColor: 'white',
                              shadowColor: '#000',
                              shadowOffset: {
                                width: 0,
                                height: 2,
                              },
                              shadowOpacity: 0.25,
                              shadowRadius: 3.84,

                              elevation: 5,
                              marginLeft: widthToDp(6),
                            }}>
                            <View style={{ marginRight: 10 }}>
                              <Image
                                source={{
                                  uri:
                                    item?.profile_picture != 'none'
                                      ? item.profile_picture
                                      : 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3BmLWljb240LWppcjIwNjItcG9yLWwtam9iNzg4LnBuZw.png',
                                }}
                                style={{
                                  width: widthToDp(14),
                                  height: widthToDp(14),
                                  borderRadius: widthToDp(7),
                                }}
                              />
                            </View>
                            <View>
                              <Text
                                style={{
                                  color: 'black',
                                  fontFamily: 'Poppins-Bold',
                                }}>
                                {item?.email}
                              </Text>
                              <Text
                                style={{
                                  color: 'black',
                                  fontFamily: 'Poppins-Regular',
                                }}>
                                {item.first_name} {item.last_name}
                              </Text>
                            </View>

                            <TouchableOpacity
                              onPress={() => {
                                setObservers(
                                  observers.filter(i => i._id !== item._id),
                                );
                              }}
                              style={{ position: 'absolute', right: 5, top: 5 }}>
                              <Xmark
                                width={24}
                                height={24}
                                strokeWidth={2}
                                color={Colors.Orange}
                              />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {showObserverSearchView &&
                    searchFor == 'Observer' &&
                    searchedUser.length !== 0 ? (
                    isLoading ? (
                      <ActivityIndicator
                        size="large"
                        color={Colors.Orange}
                        style={{ height: heightToDp(40) }}
                      />
                    ) : (
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{
                          height: heightToDp(40),
                          marginBottom: widthToDp(3),
                        }}>
                        {searchedUser.map(item => (
                          <TouchableOpacity
                            key={item._id}
                            onPress={() => {
                              setObservers(prev => [...prev, item]);
                              setShowObserverSearchView(false);
                            }}
                            style={{
                              borderColor: Colors.Orange,
                              borderWidth: 1,
                              padding: widthToDp(1),
                              marginLeft: widthToDp(6),
                              marginBottom: widthToDp(3),
                              borderRadius: widthToDp(2),
                              width: widthToDp(88),
                              // backgroundColor: 'red'
                            }}>
                            <Text
                              style={{
                                color: Colors.TextColor,
                                fontSize: widthToDp(4),
                              }}>
                              {item.email}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )
                  ) : null}
                  {/* <View
              style={{
                marginTop: heightToDp(3),
                marginHorizontal: widthToDp(2),
                alignSelf: 'flex-start',
              }}>
              <MainButton
                Title="Add Observer"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => setVisible(true)}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: widthToDp(4),
                columnGap: widthToDp(2),
                rowGap: heightToDp(2),
                marginHorizontal: widthToDp(3),
              }}>
              {observerEmail.map((entry, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => props.removeItem(index)}
                  style={{
                    padding: widthToDp(1.5),
                    borderRadius: 5,
                    backgroundColor: Colors.Orange,
                  }}>
                  <Text style={{color: Colors.white, fontSize: widthToDp(4)}}>
                    {entry}
                  </Text>
                </TouchableOpacity>
              ))}
            </View> */}
                </View>
              ))}

            {/* {clientDetail.date_time_session && ( */}
            <View style={{ marginVertical: 10 }}>
              <Text style={[styles.insideHeading]}>Preferred date and time</Text>
              <View style={{ paddingHorizontal: widthToDp(7) }}>
                {clientDetail.date_time_session && (
                  <Text style={{ fontFamily: 'Poppins-Regular', color: 'black' }}>
                    {moment(clientDetail.date_time_session).format('MM/DD/YYYY')} at{' '}
                    {moment(clientDetail.date_time_session).format('h:mm a')}
                  </Text>
                )}
                {clientDetail?.date_of_booking && (
                  <Text style={{ fontFamily: 'Poppins-Regular', color: 'black' }}>
                    {moment(clientDetail?.date_of_booking).format('MM/DD/YYYY')} at{' '}
                    {clientDetail.time_of_booking}
                  </Text>
                )}
              </View>
            </View>
            {/* )} */}

            {clientDetail.payment_type && (
              <View>
                <Text style={[styles.insideHeading]}>Payment Info </Text>
                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <CheckCircleSolid
                    width={24}
                    height={24}
                    strokeWidth={2}
                    color={Colors.Orange}
                  />
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      color: 'black',
                      marginLeft: 10,
                    }}>
                    {clientDetail.payment_type == 'on_notarizr'
                      ? ' Invoice the client on Notarizr'
                      : 'Invoice the client on your own'}
                  </Text>
                </View>
              </View>
            )}
            {!clientDetail.payment_type && (
              <View>
                <Text style={[styles.insideHeading]}>Payment Info </Text>
                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <CheckCircleSolid
                    width={24}
                    height={24}
                    strokeWidth={2}
                    color={Colors.Orange}
                  />
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      color: 'black',
                      marginLeft: 10,
                    }}>
                    {/* {clientDetail.payment_type == 'on_notarizr'
                      ? */}
                    Invoice the client on Notarizr
                    {/* :
                       'Invoice the client on your own'} */}
                  </Text>
                </View>
              </View>
            )}

            {clientDetail.identity_authentication && (
              <View>
                <Text style={[styles.insideHeading]}>ID options</Text>
                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    backgroundColor: Colors.OrangeGradientEnd,
                    marginLeft: widthToDp(5),
                    width: widthToDp(60),
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}>
                  <Text style={{ fontFamily: 'Poppins-Regular', color: 'white' }}>
                    {clientDetail.identity_authentication == 'user_id'
                      ? 'ID Card'
                      : clientDetail.identity_authentication == 'user_passport'
                        ? 'Passport'
                        : 'Allow user to choose'}
                  </Text>
                </View>
              </View>
            )}
            {!clientDetail.identity_authentication && (
              <View>
                <Text style={[styles.insideHeading]}>ID options</Text>
                <View
                  style={{
                    paddingHorizontal: widthToDp(7),
                    backgroundColor: Colors.OrangeGradientEnd,
                    marginLeft: widthToDp(5),
                    width: widthToDp(60),
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}>
                  <Text style={{ fontFamily: 'Poppins-Regular', color: 'white' }}>
                    {clientDetail.identity_authentication == 'user_id'
                      ? 'ID Card'
                      : clientDetail.identity_authentication == 'user_passport'
                        ? 'Passport'
                        : 'Allow user to choose'}
                  </Text>
                </View>
              </View>
            )}
            {!clientDetail.agent_document &&
              clientDetail.documents &&
              clientDetail.documents.length > 0 && (
                <View style={{ marginVertical: 10 }}>
                  <Text style={[styles.insideHeading]}>
                    Client uploaded documents
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: widthToDp(5),
                      columnGap: widthToDp(3),
                    }}>
                    {clientDetail.documents.map((item, index) => (
                      <TouchableOpacity key={index}>
                        <Image
                          source={require('../../../../assets/docPic.png')}
                          style={{ width: widthToDp(10), height: heightToDp(10) }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

            {clientDetail.client_documents &&
              Object.values(clientDetail.client_documents)?.length > 0 && (
                <View style={{ marginVertical: 10 }}>
                  <Text style={[styles.insideHeading]}>
                    Client uploaded documents
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: widthToDp(5),
                      columnGap: widthToDp(3),
                    }}>
                    {Object.values(clientDetail.client_documents)?.map(
                      (item, index) => (
                        <TouchableOpacity key={index}>
                          <Image
                            source={require('../../../../assets/docPic.png')}
                            style={{
                              width: widthToDp(10),
                              height: heightToDp(10),
                            }}
                          />
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>
              )}
            {clientDetail.agent_document && (
              <View>
                <Text style={[styles.insideHeading]}>
                  Agent uploaded documents
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: widthToDp(5),
                    columnGap: widthToDp(3),
                  }}>
                  {clientDetail.agent_document?.map((item, index) => (
                    <TouchableOpacity key={index}>
                      <Image
                        source={require('../../../../assets/docPic.png')}
                        style={{ width: widthToDp(10), height: heightToDp(10) }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {clientDetail.notarized_docs &&
              clientDetail.notarized_docs.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.insideHeading]}>
                    Notarized documents
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: widthToDp(5),
                      columnGap: widthToDp(3),
                    }}>
                    {clientDetail.notarized_docs?.map((item, index) => (
                      <TouchableOpacity key={index}>
                        <Image
                          source={require('../../../../assets/docPic.png')}
                          style={{ width: widthToDp(10), height: heightToDp(10) }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

            {/* {clientDetail.agent_document && (
              <View style={{marginTop: 10}}>
                <Text style={[styles.insideHeading]}>Notarized documents</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: widthToDp(5),
                    columnGap: widthToDp(3),
                  }}>
                  {clientDetail.agent_document?.map((item, index) => (
                    <TouchableOpacity key={index}>
                      <Image
                        source={require('../../../../assets/docPic.png')}
                        style={{ width: widthToDp(10), height: heightToDp(10) }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )} */}

            {booked_for?.first_name && (
              <View>
                <View style={styles.addressView}>
                  <Text
                    style={{
                      fontSize: widthToDp(4),
                      marginLeft: widthToDp(1),
                      fontFamily: 'Manrope-Bold',
                      color: Colors.TextColor,
                    }}>
                    Booked For:
                  </Text>
                  <Text style={styles.detail}>
                    {booked_for?.first_name} {booked_for?.last_name}
                  </Text>
                </View>
                <View style={styles.addressView}>
                  <Text
                    style={{
                      fontSize: widthToDp(4),
                      marginLeft: widthToDp(1),
                      fontFamily: 'Manrope-Bold',
                      color: Colors.TextColor,
                    }}>
                    Phone Number:
                  </Text>
                  <Text style={styles.detail}>{booked_for?.phone_number}</Text>
                </View>
                <View style={styles.addressView}>
                  <Image
                    source={require('../../../../assets/locationIcon.png')}
                    style={styles.locationImage}
                  />
                  <Text style={styles.detail}>
                    {capitalizeFirstLetter(booked_for?.location)}
                  </Text>
                </View>
              </View>
            )}
            {/* {!booked_for?.location && (
              <View style={styles.addressView}>
                <Image
                  source={require('../../../../assets/locationIcon.png')}
                  style={styles.locationImage}
                />
                <Text style={styles.detail}>
                  {capitalizeFirstLetter(clientDetail?.agent?.location)}
                </Text>
              </View>
            )} */}
            {/* <View style={styles.addressView}>
              <Image
                source={require('../../../../assets/calenderIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                {moment(clientDetail?.date_of_booking).format('MM/DD/YYYY')}
                {'  '}
                {clientDetail?.time_of_booking}
              </Text>
            </View> */}
            {/* <View style={styles.addressView}>
              <Text
                style={{
                  fontSize: widthToDp(4),
                  marginLeft: widthToDp(1),
                  fontFamily: 'Manrope-Bold',
                  color: Colors.TextColor,
                }}>
                Client Documents
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: widthToDp(7),
                marginVertical: widthToDp(2),
                flexWrap: 'wrap',
                columnGap: widthToDp(2),
                rowGap: widthToDp(2),
              }}>
              {documentArray ? (
                Object.keys(documentArray).length !== 0 ? (
                  Object.keys(documentArray).map((key, index) => (
                    <TouchableOpacity
                      key={index}
                      // onPress={() => downloadFile(documentArray[key])}
                    >
                      <Image
                        source={require('../../../../assets/docPic.png')}
                        style={{width: widthToDp(10), height: heightToDp(10)}}
                      />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.preference}>No Documents</Text>
                )
              ) : (
                <Text style={styles.preference}>No Documents</Text>
              )}
            </View> */}
          </View>
          {/* <View style={styles.addressView}>
            <Text
              style={{
                fontSize: widthToDp(4),
                marginLeft: widthToDp(1),
                fontFamily: 'Manrope-Bold',
                color: Colors.TextColor,
              }}>
              Agent Documents
            </Text>
          </View>
          <View>
            {notaryBlock && signaturePage ? (
              <>
                <DocumentComponent
                  Title="Signature Page"
                  image={require('../../../../assets/Pdf.png')}
                  onPress={() => setSignaturePage(null)}
                />

                <DocumentComponent
                  Title="Notary Block"
                  image={require('../../../../assets/Pdf.png')}
                  onPress={() => setNotaryBlock(null)}
                />
              </>
            ) : notaryBlock ? (
              <DocumentComponent
                Title="Notary Block"
                image={require('../../../../assets/Pdf.png')}
                onPress={() => setNotaryBlock(null)}
              />
            ) : signaturePage ? (
              <DocumentComponent
                Title="Signature Page"
                image={require('../../../../assets/Pdf.png')}
                onPress={() => setSignaturePage(null)}
              />
            ) : (
              <Text style={[styles.preference, {marginLeft: widthToDp(10)}]}>
                No Documents
              </Text>
            )}
          </View> */}
          {showNotes && (
            <LabelTextInput
              LabelTextInput="Notes"
              placeholder="Write notes here"
              Label={true}
              onChangeText={(text: React.SetStateAction<string>) =>
                setNotes(text)
              }
            />
          )}
          <View style={[styles.buttonFlex, { marginTop: heightToDp(5) }]}>
            {status === 'Pending' && (
              <>
                <MainButton
                  Title="Update"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  // onPress={() => handleClientData()}
                  GradiStyles={{
                    width: widthToDp(30),
                    paddingHorizontal: widthToDp(0),
                    paddingVertical: heightToDp(3),
                  }}
                  loading={loading}
                  isDisabled={loading}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                />
                <MainButton
                  Title="Accept"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() => handleClientData()}
                  GradiStyles={{
                    width: widthToDp(30),
                    paddingHorizontal: widthToDp(0),
                    paddingVertical: heightToDp(3),
                  }}
                  loading={loading}
                  isDisabled={loading}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                />
                <MainButton
                  Title="Reject"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() =>
                    handleUpdateBookingStatus('rejected', clientDetail._id)
                  }
                  GradiStyles={{
                    width: widthToDp(30),
                    paddingHorizontal: widthToDp(0),
                    paddingVertical: heightToDp(3),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                />
              </>
            )}
          </View>
          <View style={[styles.buttonFlex, { marginTop: heightToDp(5) }]}>
            {clientDetail?.service_type !== 'mobile_notary' &&
              (status === 'Accepted' || status === 'Ongoing') &&
              !isStorageLoading ? (
              <>
                <MainButton
                  Title="Add Observers"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() =>
                    navigation.navigate('AddObserverScreen', {
                      bookingId: clientDetail?._id,
                    })
                  }
                  GradiStyles={{
                    width: widthToDp(40),
                    paddingHorizontal: widthToDp(0),
                    paddingVertical: heightToDp(3),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                />
                <MainButton
                  Title="Join Session"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() =>
                    navigation.navigate('NotaryCallScreen', {
                      uid: clientDetail?._id,
                      channel: clientDetail?.agora_channel_name,
                      token: clientDetail?.agora_channel_token,
                    })
                  }
                  GradiStyles={{
                    width: widthToDp(40),
                    paddingHorizontal: widthToDp(0),
                    paddingVertical: heightToDp(3),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                />
              </>
            ) : null}
          </View>
          {clientDetail?.service_type !== 'mobile_notary' &&
            status === 'To_be_paid' && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: widthToDp(2),
                }}>
                <GradientButton
                  Title={
                    clientDetail.payment_type == 'on_notarizr'
                      ? 'Request Payment'
                      : 'Join session'
                  }
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    width: widthToDp(41),
                    paddingVertical: widthToDp(4),
                    marginTop: widthToDp(10),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(4),
                  }}
                  onPress={() => {
                    if (clientDetail.payment_type == 'on_notarizr') {
                      handlePresentModalPress();
                    } else {
                      navigation.navigate('NotaryCallScreen', {
                        uid: clientDetail?._id,
                        channel: clientDetail?.agora_channel_name,
                        token: clientDetail?.agora_channel_token,
                      });
                    }
                  }}
                  fontSize={widthToDp(4)}
                />
                <GradientButton
                  Title={
                    // clientDetail.payment_type == 'on_notarizr'
                    //   ? 'Request Payment'
                    //   : 'Join session'
                    'Upload documents'
                  }
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    width: widthToDp(41),
                    paddingVertical: widthToDp(4),
                    marginTop: widthToDp(10),
                  }}
                  styles={{
                    padding: widthToDp(0),
                    fontSize: widthToDp(6),
                  }}
                  onPress={() => setIsVisible(true)}
                  fontSize={widthToDp(4)}
                />
              </View>
            )}
          <View style={styles.buttonBottom}>
            {notary === 'Ongoing' && (!notaryBlock || !signaturePage) && (
              <GradientButton
                Title="Upload Documents"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                GradiStyles={{ padding: widthToDp(4) }}
                styles={{ padding: 0, fontSize: widthToDp(5) }}
                onPress={() => setIsVisible(true)}
              />
            )}
            {signaturePage &&
              notaryBlock &&
              !showNotes &&
              status !== 'Completed' && (
                <GradientButton
                  Title="Next"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{ padding: widthToDp(4) }}
                  styles={{ padding: 0, fontSize: widthToDp(5) }}
                  onPress={() => handleNext()}
                />
              )}
            {showNotes && (
              <View style={{ marginBottom: widthToDp(5) }}>
                <GradientButton
                  Title="Complete Notary"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  onPress={() => handleComplete()}
                  loading={loading}
                />
              </View>
            )}
            {notary === 'Ongoing' && (
              <View style={styles.dashedContainer}>
                <Text
                  style={{
                    color: Colors.TextColor,
                    fontFamily: 'Manrope-Regular',
                    fontSize: widthToDp(4),
                  }}>
                  If you have any issues completing this Notary service, please
                  contact customer support.
                </Text>
                <TouchableOpacity onPress={() => handleCallSupport()}>
                  <Text
                    style={{
                      flex: 1,
                      marginTop: widthToDp(2),
                      color: Colors.Orange,
                      fontFamily: 'Manrope-Regular',
                      fontSize: widthToDp(4),
                      alignSelf: 'flex-end',
                    }}>
                    [Contact Support]
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
        {/* {isVisible ? (
            <BottomSheetModal
              ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}>
              <UploadDocsSheet
                SignaturePagePress={() => handleSignaturePage()}
                NotaryBlockPress={() => handleNotaryBlock()}
                CancelPress={() => handleCancel()}
              />
            </BottomSheetModal>
          ) : null} */}

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
        // onChange={handleSheetChanges}
        >
          <RequestPayment
            amount={AmountEntered}
            onChangeText={(text: number) => setAmountEntered(text)}
            onPress={() => setBookingAmount()}
          />
        </BottomSheetModal>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  lightHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    marginHorizontal: widthToDp(2),
  },
  insideText: {
    marginHorizontal: widthToDp(3),
    fontSize: widthToDp(4.5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginLeft: widthToDp(2),
  },
  dashedContainer: {
    marginVertical: widthToDp(3),
    marginHorizontal: widthToDp(5),
    borderWidth: 3,
    borderColor: Colors.DullTextColor,
    borderStyle: 'dashed',
    backgroundColor: Colors.PinkBackground,
    borderRadius: 10,
    padding: widthToDp(2),
  },
  headingContainer: {
    marginLeft: widthToDp(5),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(7),
  },
  insideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightToDp(2),
    // marginHorizontal: widthToDp(5),
  },
  flexContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightToDp(2),
    marginHorizontal: widthToDp(5),
  },
  iconContainer: {
    alignContent: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },

  greenIcon: {
    width: widthToDp(5),
    height: heightToDp(5),
  },
  preference: {
    marginLeft: widthToDp(4),
    marginVertical: widthToDp(1),
    fontSize: widthToDp(4),
    color: Colors.DullTextColor,
  },
  detail: {
    marginLeft: widthToDp(2),
    marginVertical: widthToDp(2),
    fontSize: widthToDp(4),
    color: Colors.DullTextColor,
  },
  sheetContainer: {},
  locationImage: {
    width: widthToDp(7),
    height: heightToDp(7),
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: widthToDp(6),
  },
  buttonBottom: {
    marginTop: heightToDp(3),
  },
  buttonFlex: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
});
