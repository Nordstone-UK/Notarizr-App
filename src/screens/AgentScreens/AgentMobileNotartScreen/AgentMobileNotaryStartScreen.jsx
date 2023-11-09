import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import {
  formatDateTime,
  heightToDp,
  width,
  widthToDp,
} from '../../../utils/Responsive';
import DocumentComponent from '../../../components/DocumentComponent/DocumentComponent';
import MainButton from '../../../components/MainGradientButton/MainButton';
import NavigationHeader from '../../../components/Navigation Header/NavigationHeader';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import {useDispatch, useSelector} from 'react-redux';
import useBookingStatus from '../../../hooks/useBookingStatus';
import useRegister from '../../../hooks/useRegister';
import {WorkDocs} from 'aws-sdk';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import {BottomSheet} from '@rneui/base';
import ReviewPopup from '../../../components/ReviewPopup/ReviewPopup';
import {useFocusEffect} from '@react-navigation/native';

export default function AgentMobileNotaryStartScreen({navigation}) {
  const {handlegetBookingStatus, handleUpdateBookingStatus} =
    useBookingStatus();
  const payment = useSelector(state => state.payment.payment);

  const {uploadMultipleFiles} = useRegister();
  const booking = useSelector(state => state.booking.booking);
  const {documents: docArray} = booking;
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState();
  const {booked_by} = booking;
  const [notary, setNotary] = useState();
  const [documents, setDocuments] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const getBookingStatus = async () => {
    try {
      const status = await handlegetBookingStatus(booking._id);
      setNotary(capitalizeFirstLetter(status));
      setStatus(capitalizeFirstLetter(status));
      // console.log('status', booking._id, status);
    } catch (error) {
      console.error('Error retrieving booking status:', error);
    }
  };
  useEffect(() => {
    getBookingStatus();
    // console.log('====================================');
    // console.log('status', booking);
    // console.log('====================================');
  }, [status]);

  const handleStatusChange = async string => {
    setLoading(true);
    try {
      await handleUpdateBookingStatus(string, booking?._id);
      await getBookingStatus();
    } catch (error) {
      console.error('Error updating and fetching booking status:', error);
    }
    setLoading(false);
  };
  const selectDocuments = async () => {
    const response = await uploadMultipleFiles();
    setDocuments(response);
    // console.log('Uploaded Files', response);
  };
  const deleteDocument = index => {
    const updatedUris = [...documents];
    updatedUris.splice(index, 1);
    setDocuments(updatedUris);
  };
  const handleNext = () => {
    setNotary(null);
    setShowNotes(true);
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getBookingStatus();
      setRefreshing(false);
      console.log('Refreshing.....');
    }, 2000);
  }, []);
  const handleRequestPayment = () => {
    navigation.navigate('PaymentCompletionScreen');
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        payment={payment}
        lastImg={require('../../../../assets/chatIcon.png')}
        lastImgPress={() => navigation.navigate('ChatScreen')}
      />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>Medical documents</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.insideContainer}>
            <Text style={styles.insideHeading}>Client details</Text>
            <View
              style={[
                styles.iconContainer,

                status !== 'Completed'
                  ? {width: widthToDp(30)}
                  : {width: widthToDp(35)},
              ]}>
              <Image
                source={require('../../../../assets/greenIcon.png')}
                style={{resizeMode: 'contain'}}
              />
              {status && <Text style={styles.lightHeading}>{status}</Text>}
            </View>
          </View>
          <View style={styles.flexContainer}>
            <Image
              source={{uri: booked_by?.profile_picture}}
              style={styles.iconProfile}
            />
            <Text
              style={[
                styles.Heading,
                {marginHorizontal: widthToDp(5), fontSize: widthToDp(4.5)},
              ]}>
              {booked_by?.first_name} {booked_by?.last_name}
            </Text>
          </View>
          <View style={styles.sheetContainer}>
            <Text
              style={[styles.insideHeading, {marginHorizontal: widthToDp(5)}]}>
              Booking Preferences
            </Text>
            <View style={styles.addressView}>
              <Image
                source={require('../../../../assets/locationIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                {capitalizeFirstLetter(booked_by?.location)}
              </Text>
            </View>
            <View style={styles.addressView}>
              <Image
                source={require('../../../../assets/calenderIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                {formatDateTime(booking?.createdAt)}
              </Text>
            </View>
            {documents &&
              documents.map(index => (
                <DocumentComponent
                  Title="Picture ID"
                  image={require('../../../../assets/Pdf.png')}
                  onPress={() => deleteDocument(index)}
                  key={index}
                />
              ))}
          </View>
          <Text style={styles.insideHeading}>Uploaded Documents</Text>
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: widthToDp(5),
              marginVertical: widthToDp(2),
              flexWrap: 'wrap',
              columnGap: widthToDp(2),
              rowGap: widthToDp(2),
            }}>
            {Object.keys(docArray).length !== 0 ? (
              Object.keys(docArray).map((key, index) => (
                <Image
                  key={index}
                  source={require('../../../../assets/docPic.png')}
                  style={{width: widthToDp(10), height: heightToDp(10)}}
                />
              ))
            ) : (
              <Text style={styles.preference}>No Documents</Text>
            )}
          </View>
          {showNotes && (
            <LabelTextInput
              LabelTextInput="Notes"
              placeholder="Write notes here"
              Label={true}
            />
          )}

          <View style={styles.buttonBottom}>
            {/* {notary === 'Accepted' && (
              <GradientButton
                Title="Start Notary"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() => handleStatusChange('ongoing')}
                loading={loading}
                GradiStyles={{marginTop: widthToDp(5)}}
              />
            )} */}
            {notary === 'Ongoing' && (
              <GradientButton
                Title="Complete Notary"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() => handleStatusChange('completed')}
                loading={loading}
                GradiStyles={{marginTop: widthToDp(5)}}
              />
            )}
            {notary === 'Completed' && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: widthToDp(1),
                }}>
                <GradientButton
                  Title="Upload Documents"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{paddingHorizontal: widthToDp(3)}}
                  styles={{padding: 0}}
                  onPress={() => selectDocuments()}
                />
                <GradientButton
                  Title="Next"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  GradiStyles={{
                    marginHorizontal: widthToDp(3),
                    paddingVertical: heightToDp(1),
                  }}
                  styles={{
                    padding: widthToDp(3),
                  }}
                  onPress={() => handleNext()}
                />
              </View>
            )}
            {notary === null && showNotes ? (
              <GradientButton
                Title="Request Payment"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() => handleRequestPayment()}
                loading={loading}
                GradiStyles={{marginVertical: widthToDp(5)}}
              />
            ) : null}
          </View>
        </ScrollView>
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
    fontFamily: 'Manrope-SemiBold',
  },
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  headingContainer: {
    marginLeft: widthToDp(4),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(5),
  },
  insideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightToDp(2),
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
    marginRight: widthToDp(3),
  },
  insideText: {
    marginHorizontal: widthToDp(3),
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
  },
  greenIcon: {
    width: widthToDp(5),
    height: heightToDp(5),
  },
  iconProfile: {
    width: widthToDp(15),
    height: heightToDp(15),
    marginRight: widthToDp(5),
    borderRadius: 50,
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
    marginLeft: widthToDp(4),
  },
  buttonBottom: {
    marginTop: heightToDp(10),
  },
});
