import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  RefreshControl,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {
  formatDateTime,
  heightToDp,
  width,
  widthToDp,
} from '../../utils/Responsive';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';
import AgentCard from '../../components/AgentCard/AgentCard';
import MainButton from '../../components/MainGradientButton/MainButton';
import AgentReviewCard from '../../components/AgentReviewCard/AgentReviewCard';
import {useDispatch, useSelector} from 'react-redux';
import {BottomSheet} from '@rneui/themed';
import ReviewPopup from '../../components/ReviewPopup/ReviewPopup';
import {useFocusEffect} from '@react-navigation/native';
import {paymentCheck} from '../../features/review/reviewSlice';
import useBookingStatus from '../../hooks/useBookingStatus';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import moment from 'moment';
import useFetchBooking from '../../hooks/useFetchBooking';
import useCustomerSuport from '../../hooks/useCustomerSupport';
import ModalCheck from '../../components/ModalComponent/ModalCheck';
import {useSession} from '../../hooks/useSession';
import {useLiveblocks} from '../../store/liveblocks';
import Loading from '../../components/LiveBlocksComponents/loading';
import useRegister from '../../hooks/useRegister';
import {setBookingInfoState} from '../../features/booking/bookingSlice';
import {CheckCircle, CheckCircleSolid, Xmark} from 'iconoir-react-native';
import {useLazyQuery, useMutation} from '@apollo/client';
import {
  UPDATE_OR_CREATE_SESSION_CLIENT_DOCS,
  UPDATE_SESSION_CLIENT_DOCS,
} from '../../../request/mutations/updateSessionClientDocs';
import {GET_SESSION_BY_ID} from '../../../request/queries/getSessionByID.query';

export default function MedicalBookingScreen({route, navigation}) {
  const {
    handlegetBookingStatus,
    handleSessionStatus,
    handleUpdateBookingStatus,
  } = useBookingStatus();
  const {updateSession} = useSession();
  const {handleReviewSubmit, setBookingPrice, fetchBookingByID} =
    useFetchBooking();
  const payment = useSelector(state => state.payment.payment);
  const dispatch = useDispatch();
  const {handleCallSupport} = useCustomerSuport();
  const bookingDetail = useSelector(state => state.booking.booking);

  const [getSession] = useLazyQuery(GET_SESSION_BY_ID);

  const {uploadMultipleFiles, uploadAllDocuments} = useRegister();
  const [feedback, setFeedback] = useState();
  const documents = bookingDetail?.documents;
  //const {booked_for} = bookingDetail;
  const [modalShow, setModalShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [status, setStatus] = useState();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [uploadingDocs, setUploadingDocs] = useState();
  const [updatedDocs, setUpdatedDocs] = useState();
  let statusUpdate;
  const enterRoom = useLiveblocks(state => state.liveblocks.enterRoom);
  const leaveRoom = useLiveblocks(state => state.liveblocks.leaveRoom);
  const [uploadShow, setUploadShow] = useState(true);
  const [showIcon, setShowIcon] = useState(true);

  /////// update client docs /////

  const [updateSessionClientDocs] = useMutation(
    UPDATE_OR_CREATE_SESSION_CLIENT_DOCS,
  );

  function isEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }

    return true;
  }
  const documentCheck = isEmpty(bookingDetail?.documents);

  const selectDocuments = async () => {
    setShowIcon(false);
    let urlResponse;
    const response = await uploadMultipleFiles();
    // setUploadingDocs(response);
    if (response) {
      urlResponse = await uploadAllDocuments(response);

      urlResponse = urlResponse.map(item => ({
        key: item.name,
        value: item.url,
      }));
      console.log(urlResponse);

      const request = {
        variables: {
          sessionId: bookingDetail?._id,
          clientDocuments: urlResponse,
        },
      };

      console.log('######', request);

      const res = await updateSessionClientDocs(request);

      var reponse;

      if (bookingDetail.__typename == 'Session') {
        console.log('heeeetre');
        const request = {
          variables: {
            sessionId: bookingDetail?._id,
          },
        };

        reponse = await getSession(request);
        console.log('ressss', reponse.data.getSession.session);
        dispatch(setBookingInfoState(reponse.data.getSession.session));
      } else {
        reponse = await fetchBookingByID(bookingDetail?._id);
        dispatch(setBookingInfoState(reponse?.getBookingById?.booking));
      }

      setUploadShow(false);
      setShowIcon(true);

      // console.log(res);

      //  const request = {
      //    variables: {
      //       sessionId: bookingDetail?._id,
      //       key: urlResponse[0].id,
      //      // value:

      //    },
      //  };
      //  const response = await createSession(request);

      //  const re

      // if (urlResponse) {
      //   const response = await setBookingPrice(
      //     bookingDetail?._id,
      //     bookingDetail?.totalPrice,
      //     bookingDetail?.review,
      //     bookingDetail?.rating,
      //     bookingDetail?.notes,
      //     bookingDetail?.proof_documents,
      //     urlResponse,
      //   );
      //   // console.log(response);
      //   const reponse = await fetchBookingByID(bookingDetail?._id);
      //   // console.log(reponse);
      //   // dispatch(setBookingInfoState(reponse?.getBookingById?.booking));
      //   setUploadShow(false);
      //   setShowIcon(true);
      // }
    }
    setShowIcon(true);
  };
  console.log(documentCheck);
  React.useEffect(() => {
    enterRoom('test-room');

    return () => {
      leaveRoom();
    };
  }, [enterRoom, leaveRoom]);
  const handleStarPress = selectedRating => {
    setRating(selectedRating);
  };
  const handleReview = reviewGiven => {
    setReview(reviewGiven);
  };
  function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const handleStatusChange = async StatusPassed => {
    setLoading(true);
    try {
      if (bookingDetail?.__typename !== 'Session') {
        await handleUpdateBookingStatus(StatusPassed, bookingDetail?._id);
      } else {
        await updateSession(StatusPassed, bookingDetail?._id);
      }
      await getBookingStatus();
    } catch (error) {
      console.error('Error updating and fetching booking status:', error);
    }
    setLoading(false);
  };
  const getBookingStatus = async () => {
    try {
      if (bookingDetail?.__typename === 'Session') {
        statusUpdate = await handleSessionStatus(bookingDetail?._id);
      } else {
        statusUpdate = await handlegetBookingStatus(bookingDetail?._id);
      }
      setStatus(capitalizeFirstLetter(statusUpdate));
    } catch (error) {
      console.error('Error retrieving booking status:', error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      if (
        status === 'Completed' &&
        !bookingDetail.review &&
        !bookingDetail.rating
      ) {
        setIsVisible(true);
      }
    }, [status]),
  );
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getBookingStatus();
    });
    return unsubscribe;
  }, [status]);
  const handleReduxPayment = async () => {
    setIsVisible(false);
    dispatch(paymentCheck());
    const response = await handleReviewSubmit(
      bookingDetail._id,
      review,
      rating,
    );
    if (response === '200') {
      setModalShow(true);
    }
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getBookingStatus();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  const showConfirmation = () => {
    Alert.alert('Is the agent at the location?', '', [
      {
        text: 'No',
        onPress: () => {},
      },
      {
        text: 'Yes',
        onPress: () => {
          handleStatusChange('ongoing');
        },
        style: 'cancel',
      },
    ]);
  };
  const closeModal = () => {
    setModalShow(false);
    navigation.navigate('HomeScreen');
  };
  function displayNamesWithCommas(arr) {
    const names = arr?.map(obj => obj.name);

    const namesString = names.join(', ');

    return namesString;
  }

  if (!bookingDetail) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={Colors.Orange} />
      </View>
    );
  }
  console.log("bookin gde",bookingDetail)
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        payment={true}
        reset={true}
        lastImg={require('../../../assets/chatIcon.png')}
        lastImgPress={() =>
          navigation.navigate('ChatScreen', {
            sender: bookingDetail?.booked_by,
            receiver: bookingDetail?.agent,
            chat: bookingDetail?._id,
          })
        }
        midImg={require('../../../assets/supportIcon.png')}
        midImgPress={() => handleCallSupport()}
      />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        {bookingDetail?.service_type === 'mobile_notary' && (
          <Text style={styles.Heading}>Mobile Notary</Text>
        )}
        {bookingDetail?.service_type !== 'mobile_notary' && (
          <Text style={styles.Heading}>Remote Online Notary</Text>
        )}
      </View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.insideContainer}>
            <Text style={styles.insideHeading}> </Text>
            <View style={styles.iconContainer}>
              {(status === 'Pending' || status === 'Cancelled') && (
                <Image
                  source={require('../../../assets/pending.png')}
                  style={styles.greenIcon}
                />
              )}
              {(status === 'Completed' ||
                status === 'Accepted' ||
                status === 'Ongoing') && (
                <Image
                  source={require('../../../assets/greenIcon.png')}
                  style={styles.greenIcon}
                />
              )}
              {status === 'To_be_paid' ? (
                <>
                  <Image
                    source={require('../../../assets/greenIcon.png')}
                    style={styles.greenIcon}
                  />
                  <Text style={styles.insideText}>To Be Paid</Text>
                </>
              ) : (
                <Text style={styles.insideText}>{status}</Text>
              )}
            </View>
          </View>

          {bookingDetail.client && (
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
                  // marginLeft: 3,
                }}>
                <View style={{marginRight: 10}}>
                  <Image
                    source={{
                      uri:
                        bookingDetail.client.profile_picture != 'none'
                          ? bookingDetail.client.profile_picture
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
                  <Text style={{color: 'black', fontFamily: 'Poppins-Bold'}}>
                    {bookingDetail.client?.email}
                  </Text>
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: 'Poppins-Regular',
                    }}>
                    {bookingDetail.client.first_name}{' '}
                    {bookingDetail.client.last_name}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {bookingDetail.agent && (
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
                <View style={{marginRight: 10}}>
                  <Image
                    source={{
                      uri:
                        bookingDetail.agent.profile_picture != 'none'
                          ? bookingDetail.agent.profile_picture
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
                  <Text style={{color: 'black', fontFamily: 'Poppins-Bold'}}>
                    {bookingDetail.agent?.email}
                  </Text>
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: 'Poppins-Regular',
                    }}>
                    {bookingDetail.agent.first_name}{' '}
                    {bookingDetail.agent.last_name}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {bookingDetail.observers && bookingDetail.observers.length > 0 && (
            <View>
              <Text style={[styles.insideHeading]}>Observers </Text>
              <View>
                {bookingDetail.observers.map(item => {
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
                      <View style={{marginRight: 10}}>
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
          <View style={{marginVertical: 10}}>
            <Text style={[styles.insideHeading]}>Preferred date and time</Text>
            <View style={{paddingHorizontal: widthToDp(7)}}>
              <Text style={{fontFamily: 'Poppins-Regular', color: 'black'}}>
                {moment(bookingDetail?.date_of_booking).format('MM/DD/YYYY')}  at {bookingDetail.time_of_booking}
              </Text>
            </View>
          </View>

          {bookingDetail.payment_type && (
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
                  {bookingDetail.payment_type == 'on_notarizr'
                    ? 'Invoice the client on Notarizr'
                    : 'Invoice the client on your own'}
                </Text>
              </View>
            </View>
          )}
          {bookingDetail.identity_authentication && (
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
                <Text style={{fontFamily: 'Poppins-Regular', color: 'white'}}>
                  {bookingDetail.identity_authentication == 'user_id'
                    ? 'ID Card'
                    : bookingDetail.identity_authentication == 'user_passport'
                    ? 'Passport'
                    : 'Allow user to choose'}
                </Text>
              </View>
            </View>
          )}

          {bookingDetail.client_documents &&
            Object.values(bookingDetail.client_documents)?.length > 0 && (
              <View style={{marginVertical: 10}}>
                <Text style={[styles.insideHeading]}>
                  Client uploaded documents
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: widthToDp(5),
                    columnGap: widthToDp(3),
                  }}>
                  {Object.values(bookingDetail.client_documents)?.map(
                    (item, index) => (
                      <TouchableOpacity key={index}>
                        <Image
                          source={require('../../../assets/docPic.png')}
                          style={{width: widthToDp(10), height: heightToDp(10)}}
                        />
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </View>
            )}
          {bookingDetail.agent_document && (
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
                {bookingDetail.agent_document?.map((item, index) => (
                  <TouchableOpacity key={index}>
                    <Image
                      source={require('../../../assets/docPic.png')}
                      style={{width: widthToDp(10), height: heightToDp(10)}}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {bookingDetail.notarized_docs &&
            bookingDetail.notarized_docs.length > 0 && (
              <View style={{marginTop: 10}}>
                <Text style={[styles.insideHeading]}>Notarized documents</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: widthToDp(5),
                    columnGap: widthToDp(3),
                  }}>
                  {bookingDetail.notarized_docs?.map((item, index) => (
                    <TouchableOpacity key={index}>
                      <Image
                        source={require('../../../assets/docPic.png')}
                        style={{width: widthToDp(10), height: heightToDp(10)}}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

          {/* )} */}

          {/*  */}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent:'space-around',
              paddingHorizontal: widthToDp(2),
              paddingBottom: 20,
            }}>
            <GradientButton
              Title={'Join session'}
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                width: widthToDp(30),
                paddingVertical: widthToDp(4),
                marginTop: widthToDp(10),
              }}
              styles={{
                padding: widthToDp(0),
                fontSize: widthToDp(4),
              }}
              onPress={() => {
                navigation.navigate('WaitingRoomScreen', {
                  uid: bookingDetail?._id,
                  channel: bookingDetail?.agora_channel_name,
                  token: bookingDetail?.agora_channel_token,
                  time: bookingDetail?.time_of_booking,
                  date: bookingDetail?.date_of_booking,
                });
              }}
              fontSize={widthToDp(4)}
            />
            <GradientButton
              Title={'Upload documents'}
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                width: widthToDp(30),
                paddingVertical: widthToDp(4),
                marginTop: widthToDp(10),
              }}
              styles={{
                padding: widthToDp(0),
                fontSize: widthToDp(4),
              }}
              onPress={() => {
                selectDocuments();
              }}
              fontSize={widthToDp(3)}
            />
            {bookingDetail.payment_type == 'on_notarizr' && (
              <GradientButton
                Title={'Make payment'}
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                GradiStyles={{
                  width: widthToDp(30),
                  paddingVertical: widthToDp(4),
                  marginTop: widthToDp(10),
                }}
                styles={{
                  padding: widthToDp(0),
                  fontSize: widthToDp(4),
                }}
                onPress={() => {
                  navigation.navigate('ToBePaidScreen', {
                    bookingData: bookingDetail,
                  });
                }}
                fontSize={widthToDp(3.5)}
              />
            )}
          </View>
        </ScrollView>
        {isVisible ? (
          <BottomSheet modalProps={{}} isVisible={isVisible}>
            <ReviewPopup
              onPress={() => handleReduxPayment()}
              rating={rating}
              handleStarPress={handleStarPress}
              handleReviewSubmit={handleReview}
            />
          </BottomSheet>
        ) : null}
      </BottomSheetStyle>
      <ModalCheck
        modalVisible={modalShow}
        onSubmit={() => closeModal()}
        onChangeText={text => setFeedback(text)}
        defaultValue={feedback}
      />
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
  },
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
  },
  headingContainer: {
    marginLeft: widthToDp(6),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(6),
  },
  insideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightToDp(2),
  },
  iconContainer: {
    alignContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  insideText: {
    marginHorizontal: widthToDp(3),
    fontSize: widthToDp(4.5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  greenIcon: {
    width: widthToDp(5),
    height: heightToDp(5),
  },
  nameContainer: {
    marginVertical: heightToDp(2),
    alignSelf: 'center',
  },

  preference: {
    marginLeft: widthToDp(2),
    fontSize: widthToDp(4.5),
    color: Colors.TextColor,
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
  buttonFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: heightToDp(2),
  },
  dottedContianer: {
    alignItems: 'center',
    alignSelf: 'center',
    borderStyle: 'dotted',
    borderWidth: 2,
    borderColor: Colors.DisableColor,
    borderRadius: 5,
    marginTop: heightToDp(5),
    paddingVertical: heightToDp(2),
    width: widthToDp(80),
  },
});
{
  /* <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: widthToDp(8),
                  marginVertical: widthToDp(2),
                  flexWrap: 'wrap',
                  columnGap: widthToDp(2),
                  rowGap: widthToDp(2),
                }}>
                {/* {updatedDocs &&
                  updatedDocs.map((image, index) => (
                    <Image
                      key={index}
                      source={require('../../../assets/docPic.png')}
                      style={{width: widthToDp(10), height: heightToDp(10)}}
                    />
                  ))} 
              </View> */
}
