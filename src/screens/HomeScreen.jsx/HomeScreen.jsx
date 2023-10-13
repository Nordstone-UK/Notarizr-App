import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';

import {heightToDp, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import {Linking} from 'react-native';
import {useSelector} from 'react-redux';
import {ScrollView} from 'react-native-virtualized-view';

export default function HomeScreen({navigation}) {
  const bookingDetail = useSelector(state => state.bookingInfo);
  console.log('Booking Detail from Redux:', bookingDetail);

  // useEffect(() => {}, [bookingDetail]);
  // const bookingDetail = [
  //   {
  //     __typename: 'Booking',
  //     _id: '65290a57f6a0f09b41c94e77',
  //     address: null,
  //     agent: {
  //       __typename: 'User',
  //       _id: '652682ad9f88da0431164e35',
  //       account_type: 'company-agent',
  //       chatPrivacy: false,
  //       email: 'emma@gmail.com',
  //       first_name: 'Emma',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: true,
  //       last_name: 'Jason ',
  //       location: 'London',
  //       phone_number: '+447893983330',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/66f38534-cd15-4569-ba82-eef973e85e13.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     booked_by: {
  //       __typename: 'User',
  //       _id: '652570209f88da0431164d67',
  //       account_type: 'client',
  //       chatPrivacy: false,
  //       email: 'hadi@gmail.com',
  //       first_name: 'Abdul',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: false,
  //       last_name: 'Hadi',
  //       location: 'London',
  //       phone_number: '+447893983305',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     createdAt: '2023-10-13T09:13:59.054Z',
  //     date_of_booking: '2023-10-16T00:00:00.000Z',
  //     documents: {},
  //     landmark: null,
  //     notes: null,
  //     preference_analysis: null,
  //     service: {
  //       __typename: 'Service',
  //       status: null,
  //     },
  //     service_type: 'local',
  //     status: 'pending',
  //     time_of_booking: '12:00 PM - 12:30 PM',
  //     updatedAt: '2023-10-13T09:13:59.054Z',
  //   },
  //   {
  //     __typename: 'Booking',
  //     _id: '6528227a9f88da0431165095',
  //     address: null,
  //     agent: {
  //       __typename: 'User',
  //       _id: '652682ad9f88da0431164e35',
  //       account_type: 'company-agent',
  //       chatPrivacy: false,
  //       email: 'emma@gmail.com',
  //       first_name: 'Emma',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: true,
  //       last_name: 'Jason ',
  //       location: 'London',
  //       phone_number: '+447893983330',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/66f38534-cd15-4569-ba82-eef973e85e13.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     booked_by: {
  //       __typename: 'User',
  //       _id: '652570209f88da0431164d67',
  //       account_type: 'client',
  //       chatPrivacy: false,
  //       email: 'hadi@gmail.com',
  //       first_name: 'Abdul',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: false,
  //       last_name: 'Hadi',
  //       location: 'London',
  //       phone_number: '+447893983305',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     createdAt: '2023-10-12T16:44:42.027Z',
  //     date_of_booking: '2023-10-17T00:00:00.000Z',
  //     documents: {},
  //     landmark: null,
  //     notes: null,
  //     preference_analysis: null,
  //     service: {
  //       __typename: 'Service',
  //       status: null,
  //     },
  //     service_type: 'local',
  //     status: 'pending',
  //     time_of_booking: '12:00 PM - 12:30 PM',
  //     updatedAt: '2023-10-12T16:44:42.027Z',
  //   },
  //   {
  //     __typename: 'Booking',
  //     _id: '65281f5b9f88da0431165073',
  //     address: null,
  //     agent: {
  //       __typename: 'User',
  //       _id: '6526870c9f88da0431164e3c',
  //       account_type: 'company-agent',
  //       chatPrivacy: false,
  //       email: 'nat@gmail.com',
  //       first_name: 'Nathan',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: true,
  //       last_name: 'Wright',
  //       location: 'London',
  //       phone_number: '+447893983330',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     booked_by: {
  //       __typename: 'User',
  //       _id: '652570209f88da0431164d67',
  //       account_type: 'client',
  //       chatPrivacy: false,
  //       email: 'hadi@gmail.com',
  //       first_name: 'Abdul',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: false,
  //       last_name: 'Hadi',
  //       location: 'London',
  //       phone_number: '+447893983305',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     createdAt: '2023-10-12T16:31:23.277Z',
  //     date_of_booking: '2023-10-18T00:00:00.000Z',
  //     documents: {},
  //     landmark: null,
  //     notes: null,
  //     preference_analysis: null,
  //     service: {
  //       __typename: 'Service',
  //       status: null,
  //     },
  //     service_type: 'local',
  //     status: 'pending',
  //     time_of_booking: '09:30 AM - 10:00 AM',
  //     updatedAt: '2023-10-12T16:31:23.277Z',
  //   },
  //   {
  //     __typename: 'Booking',
  //     _id: '6527cfb09f88da0431164fbd',
  //     address: null,
  //     agent: {
  //       __typename: 'User',
  //       _id: '6526870c9f88da0431164e3c',
  //       account_type: 'company-agent',
  //       chatPrivacy: false,
  //       email: 'nat@gmail.com',
  //       first_name: 'Nathan',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: true,
  //       last_name: 'Wright',
  //       location: 'London',
  //       phone_number: '+447893983330',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     booked_by: {
  //       __typename: 'User',
  //       _id: '652570209f88da0431164d67',
  //       account_type: 'client',
  //       chatPrivacy: false,
  //       email: 'hadi@gmail.com',
  //       first_name: 'Abdul',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: false,
  //       last_name: 'Hadi',
  //       location: 'London',
  //       phone_number: '+447893983305',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     createdAt: '2023-10-12T10:51:28.963Z',
  //     date_of_booking: '2023-10-20T00:00:00.000Z',
  //     documents: {},
  //     landmark: null,
  //     notes: null,
  //     preference_analysis: null,
  //     service: {
  //       __typename: 'Service',
  //       status: null,
  //     },
  //     service_type: 'local',
  //     status: 'pending',
  //     time_of_booking: '05:30 AM - 06:00 AM',
  //     updatedAt: '2023-10-12T10:51:28.963Z',
  //   },
  //   {
  //     __typename: 'Booking',
  //     _id: '6527cf649f88da0431164fb3',
  //     address: null,
  //     agent: {
  //       __typename: 'User',
  //       _id: '6526870c9f88da0431164e3c',
  //       account_type: 'company-agent',
  //       chatPrivacy: false,
  //       email: 'nat@gmail.com',
  //       first_name: 'Nathan',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: true,
  //       last_name: 'Wright',
  //       location: 'London',
  //       phone_number: '+447893983330',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     booked_by: {
  //       __typename: 'User',
  //       _id: '652570209f88da0431164d67',
  //       account_type: 'client',
  //       chatPrivacy: false,
  //       email: 'hadi@gmail.com',
  //       first_name: 'Abdul',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: false,
  //       last_name: 'Hadi',
  //       location: 'London',
  //       phone_number: '+447893983305',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     createdAt: '2023-10-12T10:50:12.275Z',
  //     date_of_booking: null,
  //     documents: {},
  //     landmark: null,
  //     notes: null,
  //     preference_analysis: null,
  //     service: {
  //       __typename: 'Service',
  //       status: null,
  //     },
  //     service_type: 'local',
  //     status: 'pending',
  //     time_of_booking: null,
  //     updatedAt: '2023-10-12T10:50:12.275Z',
  //   },
  //   {
  //     __typename: 'Booking',
  //     _id: '6526d5db9f88da0431164f71',
  //     address: null,
  //     agent: {
  //       __typename: 'User',
  //       _id: '65257a109f88da0431164d7a',
  //       account_type: 'individual-agent',
  //       chatPrivacy: false,
  //       email: 'jason@gmail.com',
  //       first_name: 'Jason',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: false,
  //       last_name: 'Edma',
  //       location: 'London',
  //       phone_number: '+447893983330',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/7bbc48b2-5336-4dff-8afe-15ac019f2429.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     booked_by: {
  //       __typename: 'User',
  //       _id: '652570209f88da0431164d67',
  //       account_type: 'client',
  //       chatPrivacy: false,
  //       email: 'hadi@gmail.com',
  //       first_name: 'Abdul',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: false,
  //       last_name: 'Hadi',
  //       location: 'London',
  //       phone_number: '+447893983305',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     createdAt: '2023-10-11T17:05:31.896Z',
  //     date_of_booking: null,
  //     documents: {},
  //     landmark: null,
  //     notes: null,
  //     preference_analysis: null,
  //     service: {
  //       __typename: 'Service',
  //       status: null,
  //     },
  //     service_type: 'mobile_notary',
  //     status: 'pending',
  //     time_of_booking: null,
  //     updatedAt: '2023-10-11T17:05:31.896Z',
  //   },
  //   {
  //     __typename: 'Booking',
  //     _id: '6526d4459f88da0431164f44',
  //     address: null,
  //     agent: {
  //       __typename: 'User',
  //       _id: '65257e139f88da0431164d8d',
  //       account_type: 'individual-agent',
  //       chatPrivacy: false,
  //       email: 'rose@gmail.com',
  //       first_name: 'Emily',
  //       gender: 'female',
  //       isBlocked: false,
  //       isVerified: true,
  //       last_name: 'Rose',
  //       location: 'London',
  //       phone_number: '+447893983330',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/f0c899e7-39ce-4ef9-9448-e4373de371ee.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     booked_by: {
  //       __typename: 'User',
  //       _id: '652570209f88da0431164d67',
  //       account_type: 'client',
  //       chatPrivacy: false,
  //       email: 'hadi@gmail.com',
  //       first_name: 'Abdul',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: false,
  //       last_name: 'Hadi',
  //       location: 'London',
  //       phone_number: '+447893983305',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     createdAt: '2023-10-11T16:58:45.519Z',
  //     date_of_booking: null,
  //     documents: {},
  //     landmark: null,
  //     notes: null,
  //     preference_analysis: null,
  //     service: {
  //       __typename: 'Service',
  //       status: null,
  //     },
  //     service_type: 'mobile_notary',
  //     status: 'pending',
  //     time_of_booking: null,
  //     updatedAt: '2023-10-11T16:58:45.519Z',
  //   },
  //   {
  //     __typename: 'Booking',
  //     _id: '652692529f88da0431164ec5',
  //     address: null,
  //     agent: {
  //       __typename: 'User',
  //       _id: '6526870c9f88da0431164e3c',
  //       account_type: 'company-agent',
  //       chatPrivacy: false,
  //       email: 'nat@gmail.com',
  //       first_name: 'Nathan',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: true,
  //       last_name: 'Wright',
  //       location: 'London',
  //       phone_number: '+447893983330',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     booked_by: {
  //       __typename: 'User',
  //       _id: '652570209f88da0431164d67',
  //       account_type: 'client',
  //       chatPrivacy: false,
  //       email: 'hadi@gmail.com',
  //       first_name: 'Abdul',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: false,
  //       last_name: 'Hadi',
  //       location: 'London',
  //       phone_number: '+447893983305',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     createdAt: '2023-10-11T12:17:22.691Z',
  //     date_of_booking: null,
  //     documents: {},
  //     landmark: null,
  //     notes: null,
  //     preference_analysis: null,
  //     service: {
  //       __typename: 'Service',
  //       status: null,
  //     },
  //     service_type: 'local',
  //     status: 'pending',
  //     time_of_booking: null,
  //     updatedAt: '2023-10-11T12:17:22.691Z',
  //   },
  //   {
  //     __typename: 'Booking',
  //     _id: '65257fce9f88da0431164dcb',
  //     address: null,
  //     agent: {
  //       __typename: 'User',
  //       _id: '65257a109f88da0431164d7a',
  //       account_type: 'individual-agent',
  //       chatPrivacy: false,
  //       email: 'jason@gmail.com',
  //       first_name: 'Jason',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: false,
  //       last_name: 'Edma',
  //       location: 'London',
  //       phone_number: '+447893983330',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/7bbc48b2-5336-4dff-8afe-15ac019f2429.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     booked_by: {
  //       __typename: 'User',
  //       _id: '652570209f88da0431164d67',
  //       account_type: 'client',
  //       chatPrivacy: false,
  //       email: 'hadi@gmail.com',
  //       first_name: 'Abdul',
  //       gender: 'male',
  //       isBlocked: false,
  //       isVerified: false,
  //       last_name: 'Hadi',
  //       location: 'London',
  //       phone_number: '+447893983305',
  //       profile_picture:
  //         'https://notarizr-app-data.s3.amazonaws.com/images/Profile%20Pictures/d0984283-9c01-4b3c-aefb-d9f6d5611fc4.JPEG',
  //       rating: null,
  //       subscriptionType: null,
  //     },
  //     createdAt: '2023-10-10T16:46:06.298Z',
  //     date_of_booking: null,
  //     documents: {},
  //     landmark: null,
  //     notes: null,
  //     preference_analysis: null,
  //     service: {
  //       __typename: 'Service',
  //       status: null,
  //     },
  //     service_type: 'mobile_notary',
  //     status: 'pending',
  //     time_of_booking: null,
  //     updatedAt: '2023-10-10T16:46:06.298Z',
  //   },
  // ];
  // console.log(bookingDetail);
  const openLinkInBrowser = () => {
    const url = 'https://www.youtube.com/watch?v=SgD7g0COp-I';
    Linking.openURL(url).catch(err =>
      console.error('An error occurred: ', err),
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <HomeScreenHeader Title="One Click and Select our services." />
      <BottomSheetStyle>
        <View
          style={{flex: 1}}
          // nestedScrollEnabled
          // scrollEnabled={true}
          // contentContainerStyle={styles.contentContainer}
        >
          {/* <Text style={styles.Heading}>
            Know how Notarizr helps you in notarizing your documents
          </Text>
          <TouchableOpacity onPress={openLinkInBrowser} style={{}}>
            <Image
              source={require('../../../assets/videoIcon.png')}
              style={{
                alignSelf: 'center',
                width: widthToDp(90),
                height: heightToDp(40),
                borderRadius: 15,
                marginTop: heightToDp(3),
              }}
            />
          </TouchableOpacity>
          <View style={styles.CategoryBar}>
            <Text style={styles.Heading}>Categories</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CategoryDetailScreen')}>
              <Text style={styles.subheading}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.CategoryPictures}>
            <View style={styles.PictureBar}>
              <TouchableOpacity
                onPress={() => navigation.navigate('LegalDocScreen')}>
                <Image
                  source={require('../../../assets/legalDocIcon.png')}
                  style={{
                    width: widthToDp(60),
                    height: heightToDp(30),
                    borderRadius: 10,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('RealEstateDocScreen')}>
                <Image
                  source={require('../../../assets/estateDocIcon.png')}
                  style={{
                    width: widthToDp(30),
                    height: heightToDp(30),
                    borderRadius: 10,
                  }}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.PictureBar}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('MainBookingScreen', {
                    name: 'Medical Documents',
                  })
                }>
                <Image
                  source={require('../../../assets/medicalDocIcon.png')}
                  style={{
                    width: widthToDp(30),
                    height: heightToDp(30),
                    borderRadius: 10,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('BusinessDocScreen')}>
                <Image
                  source={require('../../../assets/businessDocIcon.png')}
                  style={{
                    width: widthToDp(60),
                    height: heightToDp(30),
                    borderRadius: 10,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.CategoryBar}>
            <Text style={styles.Heading}>Active Services</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ActiveServicesScreen')}>
              <Text style={styles.subheading}>View all</Text>
            </TouchableOpacity>
          </View> */}
          {/* {bookingDetail === undefined || bookingDetail.length === 0 ? (
            <ActivityIndicator />
          ) : ( */}
          <View>
            <FlatList
              data={bookingDetail}
              keyExtractor={item => item._id}
              ListEmptyComponent={() => <Text>No Active Services</Text>}
              renderItem={({item}) => {
                return (
                  <Text>{item.agent.first_name}</Text>
                  // <AgentCard
                  //   source={{uri: item.agent.profile_picture}}
                  //   bottomRightText="$400"
                  //   bottomLeftText="Total"
                  //   image={require('../../../assets/agentLocation.png')}
                  //   agentName={
                  //     item.agent.first_name + ' ' + item.agent.last_name
                  //   }
                  //   agentAddress={item.agent.location}
                  //   task={item.status}
                  //   OrangeText={'At Office'}
                  //   dateofBooking={item.date_of_booking}
                  //   timeofBooking={item.time_of_booking}
                  // />
                );
              }}
            />
          </View>
          {/* )} */}
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
  Heading: {
    fontSize: widthToDp(6.5),
    fontWeight: '700',
    color: Colors.TextColor,
    paddingLeft: widthToDp(2),
  },
  contentContainer: {
    paddingVertical: heightToDp(5),
  },
  subheading: {
    fontSize: widthToDp(4),
    fontWeight: '700',
    color: Colors.TextColor,
    alignSelf: 'center',
    paddingRight: widthToDp(2),
  },
  CategoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: heightToDp(3),
  },
  PictureBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: heightToDp(1),
  },
  CategoryPictures: {
    marginVertical: heightToDp(2),
  },
});
