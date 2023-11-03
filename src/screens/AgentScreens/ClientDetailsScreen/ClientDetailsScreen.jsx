import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import {formatDateTime, heightToDp, widthToDp} from '../../../utils/Responsive';
import DocumentComponent from '../../../components/DocumentComponent/DocumentComponent';
import MainButton from '../../../components/MainGradientButton/MainButton';
import NavigationHeader from '../../../components/Navigation Header/NavigationHeader';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import useBookingStatus from '../../../hooks/useBookingStatus';
import {useDispatch} from 'react-redux';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../../features/booking/bookingSlice';

export default function AgentMobileNotaryStartScreen({route, navigation}) {
  const {clientDetail} = route.params;
  const dispatch = useDispatch();
  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const {handleUpdateBookingStatus} = useBookingStatus();
  const handleClientData = item => {
    handleUpdateBookingStatus('accepted', clientDetail._id);
    dispatch(setBookingInfoState(clientDetail));
    dispatch(
      setCoordinates(clientDetail?.booked_by?.current_location?.coordinates),
    );
    dispatch(setUser(clientDetail?.booked_by));
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        lastImg={require('../../../../assets/chatIcon.png')}
        lastImgPress={() => navigation.navigate('ChatScreen')}
      />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>Medical documents</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView scrollEnabled={true}>
          <View style={styles.insideContainer}>
            <Text style={styles.insideHeading}>Client details</Text>
          </View>

          <ClientServiceCard
            image={require('../../../../assets/agentLocation.png')}
            source={{uri: clientDetail.booked_by.profile_picture}}
            bottomRightText={clientDetail.document_type.price}
            bottomLeftText="Total"
            agentName={
              clientDetail.booked_by.first_name +
              ' ' +
              clientDetail.booked_by.last_name
            }
            agentAddress={clientDetail.booked_by.location}
            task={clientDetail?.status}
            OrangeText="At Home"
            onPress={() =>
              navigation.navigate('ClientDetailsScreen', {
                clientDetail: clientDetail,
              })
            }
            status={clientDetail.status}
            dateofBooking={clientDetail.date_of_booking}
            timeofBooking={clientDetail.time_of_booking}
            createdAt={clientDetail.createdAt}
          />
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
                {capitalizeFirstLetter(clientDetail?.booked_by?.location)}
              </Text>
            </View>
            <View style={styles.addressView}>
              <Image
                source={require('../../../../assets/calenderIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                {formatDateTime(clientDetail?.createdAt)}
              </Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.buttonBottom}>
          {clientDetail.status === 'pending' && (
            <>
              <MainButton
                Title="Accept"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() => handleClientData()}
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
                Title="Reject"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() =>
                  handleUpdateBookingStatus('rejected', clientDetail._id)
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
          )}
        </View>
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
    marginLeft: widthToDp(5),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(2),
  },
  insideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightToDp(2),
    marginHorizontal: widthToDp(5),
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
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: heightToDp(5),
  },
});
