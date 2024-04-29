import {
  Button,
  Image,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useLiveblocks} from '../../store/liveblocks';
import moment from 'moment';
import {useSelector} from 'react-redux';

export default function WaitingRoomScreen({route, navigation}) {
  const {uid, channel, token, time, date} = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const bookingDetail = useSelector(state => state.booking.booking);
  console.log('boookingdeta', bookingDetail);
  const user = useSelector(state => state.user.user);
  const [selected, setSelected] = useState('waiting room');
  const [screen, setscreen] = useState(true);
  const isStorageLoading = useLiveblocks(
    state => state.liveblocks.isStorageLoading,
  );
  const [BookDate, setBookDate] = useState(date);
  const [BookTime, setBookTime] = useState(time);
  const checkDateTimePassed = (targetDateStr, targetTimeStr) => {
    const targetDateTime = moment.utc(targetDateStr);
    targetDateTime.set({
      hour: moment.utc(targetTimeStr, 'HH:mm').hour(),
      minute: moment.utc(targetTimeStr, 'HH:mm').minute(),
    });
    const currentDateTime = moment();
    setscreen(targetDateTime.isBefore(currentDateTime));
    console.log(targetDateTime.isBefore(currentDateTime));
  };
  useEffect(() => {
    checkDateTimePassed(BookDate, BookTime);
  }, []);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    checkDateTimePassed(BookDate, BookTime);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  // console.log('navigegoback', navigation.goBack());
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.NavbarContainer}>
        <View style={styles.NavContainer}>
          <Image
            source={require('../../../assets/waitingNav.png')}
            style={styles.waitingNav}
          />
          <View style={styles.NavTextContainer}>
            <Text style={styles.textHead}>Waiting Room</Text>
            <Text style={styles.textSubHead}>Next: Notary Room</Text>
          </View>
        </View>
        <Image
          source={{uri: user?.profile_picture}}
          style={styles.profilePic}
        />
      </View>
      <View style={styles.buttonContainer}>
        <MainButton
          Title="Waiting Room"
          onPress={() => setSelected('waiting room')}
          colors={
            selected === 'waiting room'
              ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
              : [Colors.PinkBackground, Colors.PinkBackground]
          }
          styles={
            selected === 'waiting room'
              ? {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                }
              : {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                  color: Colors.TextColor,
                }
          }
          GradiStyles={{
            borderRadius: 0,
          }}
        />
        <MainButton
          Title="Participants"
          onPress={() => setSelected('participants')}
          colors={
            selected === 'participants'
              ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
              : [Colors.PinkBackground, Colors.PinkBackground]
          }
          styles={
            selected === 'participants'
              ? {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                }
              : {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                  color: Colors.TextColor,
                }
          }
          GradiStyles={{
            borderRadius: 0,
          }}
        />
      </View>
      <ScrollView
        contentContainerStyle={{flex: 1}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {selected === 'waiting room' ? (
          !screen ? (
            <View style={styles.SecondContainer}>
              <Image
                source={require('../../../assets/hourGlass.png')}
                style={styles.HourGlass}
              />
              <Text style={styles.textSession}>Session Starting soon...</Text>
              <Text
                style={[
                  styles.sessionDesc,
                  {textAlign: 'center', marginHorizontal: heightToDp(8)},
                ]}>
                Thanks for completing the verification precess, please wait for
                the notary to start the session or return at your scheduled date
                & time to start your session. please have PIN written down and
                readily available priore to joining session.
              </Text>
              <View style={styles.btnContainer}>
                <GradientButton
                  Title="Back to add a participant page"
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  styles={{fontSize: widthToDp(5)}}
                  // onPress={() => navigation.goBack()}
                />
              </View>
            </View>
          ) : (
            <View style={styles.SecondContainer}>
              <Text style={styles.textSession}>Notary Session has started</Text>
              <Image
                source={require('../../../assets/Support.png')}
                style={styles.HourGlass}
              />
              <MainButton
                colors={['#fff', '#fff']}
                Title="Notary Officer"
                GradiStyles={{
                  borderWidth: 2,
                  borderColor: Colors.OrangeGradientEnd,
                  borderRadius: 5,
                  marginTop: heightToDp(5),
                }}
                styles={{
                  color: Colors.Orange,
                  fontSize: widthToDp(5),
                  paddingHorizontal: widthToDp(2),
                  paddingVertical: widthToDp(2),
                }}
              />
              <View style={styles.btnContainer}>
                {!isStorageLoading && (
                  <GradientButton
                    Title="Join your session now"
                    colors={[
                      Colors.OrangeGradientStart,
                      Colors.OrangeGradientEnd,
                    ]}
                    onPress={() =>
                      navigation.navigate('AuthenticationScreen', {
                        uid: uid,
                        channel: channel,
                        token: token,
                      })
                    }
                  />
                )}
              </View>
            </View>
          )
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.white,
              height: heightToDp(200),
            }}>
            <View style={styles.FlexContainer}>
              <View>
                <Image
                  source={{uri: user?.profile_picture}}
                  style={styles.hourGlass}
                />
                <Text
                  style={[
                    styles.sessionDesc,
                    {color: Colors.TextColor, fontSize: widthToDp(4)},
                  ]}>
                  {user?.first_name} {user?.last_name}
                </Text>
              </View>
              <View>
                <Image
                  source={{uri: bookingDetail?.agent?.profile_picture}}
                  style={styles.hourGlass}
                />
                <Text
                  style={[
                    styles.sessionDesc,
                    {color: Colors.TextColor, fontSize: widthToDp(4)},
                  ]}>
                  {bookingDetail?.agent?.first_name}{' '}
                  {bookingDetail?.agent?.last_name}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  NavbarContainer: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(6),
    justifyContent: 'space-between',
  },
  NavContainer: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(2),
    marginVertical: widthToDp(2),
  },
  FlexContainer: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(5),
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  waitingNav: {
    width: widthToDp(6),
    height: heightToDp(6),
    marginVertical: widthToDp(2),
  },
  profilePic: {
    width: widthToDp(10),
    height: heightToDp(10),
    borderRadius: widthToDp(5),
    marginVertical: widthToDp(2),
  },
  NavTextContainer: {
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
    justifyContent: 'center',
  },
  SecondContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  hourGlass: {
    width: widthToDp(20),
    height: widthToDp(20),
    marginTop: heightToDp(10),
  },
  HourGlass: {
    alignSelf: 'center',
    width: widthToDp(30),
    height: widthToDp(30),
    marginTop: heightToDp(10),
  },
  textSession: {
    color: Colors.Orange,
    alignSelf: 'center',
    marginTop: heightToDp(10),
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  sessionDesc: {
    color: Colors.DullTextColor,
    marginTop: heightToDp(2),
    fontSize: widthToDp(3.5),
    fontFamily: 'Manrope-Regular',
  },
  btnContainer: {
    marginVertical: widthToDp(30),
  },
});
